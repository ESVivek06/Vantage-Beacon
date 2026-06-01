import { type NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

const WAITLIST_MODE = process.env.WAITLIST_MODE !== 'false';

function generateUserCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'VB-';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: {
    name?: string;
    email?: string;
    location?: string;
    attribution?: string;
    role?: string;
    referralCode?: string | null;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { name, email, location, attribution, role, referralCode } = body;

  if (!name || !email || !location || !role) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 422 });
  }

  // Check for duplicate email
  const existing = await redis.hget('vb:waitlist:entries', email).catch(() => null);
  if (existing) {
    // Return existing entry's data rather than erroring
    const entry = typeof existing === 'string' ? JSON.parse(existing) : existing as Record<string, unknown>;
    return NextResponse.json({
      userCode: entry.userCode as string,
      waitlisted: WAITLIST_MODE,
      queuePosition: entry.queuePosition as number | undefined,
    });
  }

  const userCode = generateUserCode();
  const registeredAt = Date.now();

  // Queue position: FIFO counter
  const rawCounter = await redis.incr('vb:waitlist:counter').catch(() => 1);
  const queuePosition = typeof rawCounter === 'number' ? rawCounter : 1;

  const entry = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    location,
    attribution: attribution ?? '',
    role,
    referralCode: referralCode ?? null,
    userCode,
    queuePosition,
    registeredAt,
    waitlisted: WAITLIST_MODE,
  };

  // Persist entry and add to sorted queue (score = registeredAt for FIFO)
  await Promise.all([
    redis.hset('vb:waitlist:entries', { [email]: JSON.stringify(entry) }),
    redis.zadd('vb:waitlist:queue', { score: registeredAt, member: email }),
  ]).catch((err) => {
    console.error('Redis write error:', err);
  });

  // Credit referrer: +5 positions up (lower score = higher up)
  if (referralCode) {
    const referrerEmail = await redis.hget('vb:referral:codes', referralCode).catch(() => null);
    if (referrerEmail && typeof referrerEmail === 'string') {
      // Move referrer up 5 positions by decrementing their score
      await redis.zincrby('vb:waitlist:queue', -5, referrerEmail).catch(() => null);
    }
    // Track this code → email mapping for future referrals
    await redis.hset('vb:referral:codes', { [userCode]: email.trim().toLowerCase() }).catch(() => null);
  } else {
    // Always register this user's code for future referrals
    await redis.hset('vb:referral:codes', { [userCode]: email.trim().toLowerCase() }).catch(() => null);
  }

  return NextResponse.json({
    userCode,
    waitlisted: WAITLIST_MODE,
    queuePosition,
  });
}
