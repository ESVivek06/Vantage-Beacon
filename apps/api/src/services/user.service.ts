import bcrypt from 'bcryptjs';
import { getClientForRegion, UserRole, Region } from '@vb/database';
import { signToken } from '../lib/auth';
import { badInput, conflict, notFound } from '../lib/errors';
import { enqueueWelcomeEmail } from '../email/queue';

interface RegisterInput {
  email: string;
  password: string;
  role: UserRole;
  region: Region;
  displayName: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export async function registerUser(input: RegisterInput) {
  const db = getClientForRegion(input.region);

  const existing = await db.user.findUnique({ where: { email: input.email } });
  if (existing) throw conflict('Email already registered');

  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await db.user.create({
    data: {
      email: input.email,
      passwordHash,
      role: input.role,
      region: input.region,
      profile: {
        create: { displayName: input.displayName },
      },
    },
    include: { profile: true },
  });

  const token = signToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    region: user.region,
  });

  // Fire-and-forget: enqueue welcome email; failure must not block registration
  enqueueWelcomeEmail({
    to: user.email,
    userId: user.id,
    displayName: input.displayName,
  }).catch((err: Error) => {
    console.error('[user.service] Failed to enqueue welcome email:', err.message);
  });

  return { token, user };
}

// Tries all regional DBs in sequence — MVP trade-off; production would use a global email→region index.
export async function loginUser(input: LoginInput) {
  const regions: Region[] = [Region.UK, Region.IN, Region.NA];

  for (const region of regions) {
    const db = getClientForRegion(region);
    const user = await db.user.findUnique({
      where: { email: input.email },
      include: { profile: true },
    });

    if (user?.passwordHash) {
      const valid = await bcrypt.compare(input.password, user.passwordHash);
      if (!valid) break; // email found, wrong password — stop searching
      const token = signToken({
        sub: user.id,
        email: user.email,
        role: user.role,
        region: user.region,
      });
      return { token, user };
    }
  }

  throw badInput('Invalid credentials');
}

export async function getUserById(id: string, region: Region) {
  const db = getClientForRegion(region);
  const user = await db.user.findFirst({
    where: { id, deletedAt: null },
    include: { profile: true },
  });
  if (!user) throw notFound('User');
  return user;
}

export async function listUsers(
  region: Region,
  opts: { role?: UserRole; limit?: number; offset?: number },
) {
  const db = getClientForRegion(region);
  return db.user.findMany({
    where: {
      ...(opts.role ? { role: opts.role } : {}),
      deletedAt: null,
    },
    include: { profile: true },
    take: Math.min(opts.limit ?? 20, 100),
    skip: opts.offset ?? 0,
    orderBy: { createdAt: 'desc' },
  });
}
