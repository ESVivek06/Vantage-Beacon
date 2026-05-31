import { type NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getClient, UserRole, Region } from '@vb/database';

const BCRYPT_ROUNDS = 12;

const VALID_ROLES = new Set<string>(Object.values(UserRole));
const VALID_REGIONS = new Set<string>(Object.values(Region));

/**
 * POST /api/auth/signup
 * Body: { email, password, role, region, name? }
 *
 * Creates a new credentials-based user. OAuth users are auto-provisioned by NextAuth.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { email, password, role, region, name } = body as Record<string, string>;

  if (!email || !password || !role || !region) {
    return NextResponse.json({ error: 'email, password, role, and region are required' }, { status: 400 });
  }

  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  if (typeof password !== 'string' || password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  if (!VALID_ROLES.has(role)) {
    return NextResponse.json({ error: `role must be one of: ${[...VALID_ROLES].join(', ')}` }, { status: 400 });
  }

  if (!VALID_REGIONS.has(region)) {
    return NextResponse.json({ error: `region must be one of: ${[...VALID_REGIONS].join(', ')}` }, { status: 400 });
  }

  const db = getClient();

  const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return NextResponse.json({ error: 'An account with that email already exists' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await db.user.create({
    data: {
      email,
      passwordHash,
      role: role as UserRole,
      region: region as Region,
      name: typeof name === 'string' && name.trim() ? name.trim() : null,
    },
    select: { id: true, email: true, role: true, region: true },
  });

  return NextResponse.json({ id: user.id, email: user.email, role: user.role, region: user.region }, { status: 201 });
}
