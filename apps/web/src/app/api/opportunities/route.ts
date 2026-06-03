export const dynamic = 'force-dynamic';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getClient } from '@vb/database';
import type { Region } from '@vb/database';

function mapLocation(location: string, userRegion: Region): Region {
  if (location === 'UK') return 'UK';
  if (location === 'India') return 'IN';
  if (location === 'North America') return 'NA';
  return userRegion;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = (session.user as { role?: string }).role;
  if (role !== 'founder' && role !== 'investor') {
    return NextResponse.json({ error: 'Only founders and investors can post opportunities' }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { title, description, skills, location, compensation, budgetMin, budgetMax, type, domain, experience, timeline, niceToHave } = body as Record<string, unknown>;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }

  const userRegion = ((session.user as { region?: string }).region ?? 'UK') as Region;
  const region = mapLocation(typeof location === 'string' ? location : '', userRegion);

  const budget = {
    compensation: compensation ?? null,
    min: budgetMin ?? null,
    max: budgetMax ?? null,
    type: type ?? null,
    domain: domain ?? null,
    experience: experience ?? null,
    timeline: timeline ?? null,
    niceToHave: niceToHave ?? [],
  };

  try {
    const db = getClient();
    const project = await db.project.create({
      data: {
        ownerId: session.user.id,
        title: title.trim(),
        description: typeof description === 'string' && description.trim() ? description.trim() : undefined,
        status: 'open',
        requiredSkills: Array.isArray(skills) ? (skills as string[]) : [],
        budget,
        region,
      },
      select: { id: true, title: true, status: true, region: true },
    });
    return NextResponse.json(project, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create opportunity' }, { status: 500 });
  }
}
