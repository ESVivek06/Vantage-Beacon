export const dynamic = 'force-dynamic';

import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getClient } from '@vb/database';

export interface SparklinePoint {
  date: string;
  value: number;
}

export interface SparklineResponse {
  role: string;
  days: number;
  data: SparklinePoint[];
  insufficientSample: boolean;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const daysParam = parseInt(req.nextUrl.searchParams.get('days') ?? '14', 10);
  const days = Math.min(isNaN(daysParam) ? 14 : daysParam, 90);
  const role = (session.user as { role?: string }).role ?? 'freelancer';

  const db = getClient();
  const now = new Date();
  const windowStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  try {
    // Aggregate platform events from multiple sources (matches, connections, messages)
    // since we don't have a dedicated platform_events table.
    const [matches, connections, messages] = await Promise.all([
      db.match.findMany({
        where: {
          sourceId: session.user.id,
          matchedAt: { gte: windowStart },
          deletedAt: null,
        },
        select: { matchedAt: true },
      }),
      db.connection.findMany({
        where: {
          OR: [
            { requesterId: session.user.id },
            { receiverId: session.user.id },
          ],
          createdAt: { gte: windowStart },
          deletedAt: null,
        },
        select: { createdAt: true },
      }),
      db.message.findMany({
        where: {
          OR: [
            { senderId: session.user.id },
            { receiverId: session.user.id },
          ],
          sentAt: { gte: windowStart },
          deletedAt: null,
        },
        select: { sentAt: true },
      }),
    ]);

    // Build a day-bucket map for the rolling window
    const buckets = new Map<string, number>();
    for (let i = 0; i < days; i++) {
      const d = new Date(now.getTime() - (days - 1 - i) * 24 * 60 * 60 * 1000);
      buckets.set(d.toISOString().slice(0, 10), 0);
    }

    const addToBucket = (ts: Date) => {
      const key = ts.toISOString().slice(0, 10);
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
    };

    matches.forEach((m: { matchedAt: Date }) => addToBucket(m.matchedAt));
    connections.forEach((c: { createdAt: Date }) => addToBucket(c.createdAt));
    messages.forEach((m: { sentAt: Date }) => addToBucket(m.sentAt));

    const data: SparklinePoint[] = Array.from(buckets.entries()).map(([date, value]) => ({
      date,
      value,
    }));

    const totalEvents = data.reduce((sum, p) => sum + p.value, 0);
    const insufficientSample = totalEvents < 3;

    return NextResponse.json({
      role,
      days,
      data,
      insufficientSample,
    } satisfies SparklineResponse);
  } catch (err) {
    console.error('[GET /api/analytics/sparkline]', err);
    return NextResponse.json({ error: 'Failed to fetch sparkline data' }, { status: 500 });
  }
}
