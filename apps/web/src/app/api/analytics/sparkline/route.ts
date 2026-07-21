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
  totals: { matches: number; connections: number; messages: number };
  deltas: { matches: number; connections: number; messages: number };
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

    // Compute deltas: current half of window vs prior half (positive = growth)
    const half = Math.floor(data.length / 2);
    const pctDelta = (val: number, base: number) =>
      base === 0 ? (val > 0 ? 100 : 0) : Math.round(((val - base) / base) * 100);

    // Separate per-source sparklines for computing individual deltas
    const matchBuckets = new Map<string, number>(Array.from(buckets.keys()).map(k => [k, 0]));
    const connBuckets = new Map<string, number>(Array.from(buckets.keys()).map(k => [k, 0]));
    const msgBuckets = new Map<string, number>(Array.from(buckets.keys()).map(k => [k, 0]));

    matches.forEach((m: { matchedAt: Date }) => {
      const k = m.matchedAt.toISOString().slice(0, 10);
      if (matchBuckets.has(k)) matchBuckets.set(k, (matchBuckets.get(k) ?? 0) + 1);
    });
    connections.forEach((c: { createdAt: Date }) => {
      const k = c.createdAt.toISOString().slice(0, 10);
      if (connBuckets.has(k)) connBuckets.set(k, (connBuckets.get(k) ?? 0) + 1);
    });
    messages.forEach((m: { sentAt: Date }) => {
      const k = m.sentAt.toISOString().slice(0, 10);
      if (msgBuckets.has(k)) msgBuckets.set(k, (msgBuckets.get(k) ?? 0) + 1);
    });

    const matchVals = Array.from(matchBuckets.values());
    const connVals = Array.from(connBuckets.values());
    const msgVals = Array.from(msgBuckets.values());

    const matchTotal = matchVals.reduce((s, v) => s + v, 0);
    const connTotal = connVals.reduce((s, v) => s + v, 0);
    const msgTotal = msgVals.reduce((s, v) => s + v, 0);

    return NextResponse.json({
      role,
      days,
      data,
      insufficientSample,
      totals: { matches: matchTotal, connections: connTotal, messages: msgTotal },
      deltas: {
        matches: pctDelta(
          matchVals.slice(half).reduce((s, v) => s + v, 0),
          matchVals.slice(0, half).reduce((s, v) => s + v, 0),
        ),
        connections: pctDelta(
          connVals.slice(half).reduce((s, v) => s + v, 0),
          connVals.slice(0, half).reduce((s, v) => s + v, 0),
        ),
        messages: pctDelta(
          msgVals.slice(half).reduce((s, v) => s + v, 0),
          msgVals.slice(0, half).reduce((s, v) => s + v, 0),
        ),
      },
    } satisfies SparklineResponse);
  } catch (err) {
    console.error('[GET /api/analytics/sparkline]', err);
    return NextResponse.json({ error: 'Failed to fetch sparkline data' }, { status: 500 });
  }
}
