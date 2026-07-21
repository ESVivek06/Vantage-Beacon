export const dynamic = 'force-dynamic';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getClient, UserRole } from '@vb/database';

const VALID_ROLES = new Set<string>(Object.values(UserRole));
const AVAILABILITY_TAGS = new Set<string>(['open', 'busy']);

export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getClient();
  const [profile, user] = await Promise.all([
    db.profile.findUnique({
      where: { userId: session.user.id },
      select: { tags: true, bio: true, skills: true },
    }),
    db.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, image: true },
    }),
  ]);

  const tags: string[] = profile?.tags ?? [];

  const fields = [
    !!user?.name,
    !!user?.image,
    !!(profile?.bio),
    Array.isArray(profile?.skills) && (profile.skills as unknown[]).length > 0,
    tags.length > 0,
  ];
  const profileCompletion = Math.round((fields.filter(Boolean).length / fields.length) * 100);

  return NextResponse.json({ available: tags.includes('open'), profileCompletion });
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const db = getClient();
  const userId = session.user.id;
  const { role, availabilityTag } = body as { role?: string; availabilityTag?: string };

  if (role !== undefined) {
    if (!VALID_ROLES.has(role)) {
      return NextResponse.json(
        { error: `role must be one of: ${[...VALID_ROLES].join(', ')}` },
        { status: 400 },
      );
    }
    await db.user.update({ where: { id: userId }, data: { role: role as UserRole } });
  }

  if (availabilityTag !== undefined) {
    if (!AVAILABILITY_TAGS.has(availabilityTag)) {
      return NextResponse.json(
        { error: 'availabilityTag must be "open" or "busy"' },
        { status: 400 },
      );
    }
    const profile = await db.profile.findUnique({
      where: { userId },
      select: { tags: true },
    });
    const currentTags: string[] = profile?.tags ?? [];
    const newTags = [
      ...currentTags.filter((t: string) => t !== 'open' && t !== 'busy'),
      availabilityTag,
    ];
    await db.profile.upsert({
      where: { userId },
      update: { tags: newTags },
      create: {
        userId,
        displayName: session.user.name ?? session.user.email ?? '',
        tags: newTags,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
