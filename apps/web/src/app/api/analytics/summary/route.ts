export const dynamic = 'force-dynamic';

import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getClient } from '@vb/database';

export interface MetricSummary {
  current: number;
  previous: number;
  deltaPercent: number | null;
  sparkline: { date: string; value: number }[];
}

export interface AnalyticsSummaryResponse {
  role: string;
  days: number;
  matches: MetricSummary;
  connections: MetricSummary;
  messages: MetricSummary;
  profileViews: MetricSummary;
  insufficientSample: boolean;
}

function deltaPercent(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const daysParam = parseInt(req.nextUrl.searchParams.get('days') ?? '30', 10);
  const days = Math.min(isNaN(daysParam) ? 30 : daysParam, 90);
  const role = (session.user as { role?: string }).role ?? 'freelancer';
  const db = getClient();

  const now = new Date();
  const windowStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const prevWindowStart = new Date(windowStart.getTime() - days * 24 * 60 * 60 * 1000);

  try {
    const [
      matchesCurrent, matchesPrev,
      connectionsCurrent, connectionsPrev,
      messagesCurrent, messagesPrev,
    ] = await Promise.all([
      db.match.findMany({
        where: { sourceId: session.user.id, matchedAt: { gte: windowStart }, deletedAt: null },
        select: { matchedAt: true },
      }),
      db.match.findMany({
        where: { sourceId: session.user.id, matchedAt: { gte: prevWindowStart, lt: windowStart }, deletedAt: null },
        select: { matchedAt: true },
      }),
      db.connection.findMany({
        where: {
          OR: [{ requesterId: session.user.id }, { receiverId: session.user.id }],
          createdAt: { gte: windowStart },
          deletedAt: null,
        },
        select: { createdAt: true },
      }),
      db.connection.findMany({
        where: {
          OR: [{ requesterId: session.user.id }, { receiverId: session.user.id }],
          createdAt: { gte: prevWindowStart, lt: windowStart },
          deletedAt: null,
        },
        select: { createdAt: true },
      }),
      db.message.findMany({
        where: {
          OR: [{ senderId: session.user.id }, { receiverId: session.user.id }],
          sentAt: { gte: windowStart },
          deletedAt: null,
        },
        select: { sentAt: true },
      }),
      db.message.findMany({
        where: {
          OR: [{ senderId: session.user.id }, { receiverId: session.user.id }],
          sentAt: { gte: prevWindowStart, lt: windowStart },
          deletedAt: null,
        },
        select: { sentAt: true },
      }),
    ]);

    // Build day buckets for sparklines
    function buildBuckets(events: { date: Date }[]): { date: string; value: number }[] {
      const buckets = new Map<string, number>();
      for (let i = 0; i < days; i++) {
        const d = new Date(now.getTime() - (days - 1 - i) * 24 * 60 * 60 * 1000);
        buckets.set(d.toISOString().slice(0, 10), 0);
      }
      for (const { date } of events) {
        const key = date.toISOString().slice(0, 10);
        if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
      }
      return Array.from(buckets.entries()).map(([date, value]) => ({ date, value }));
    }

    const matchSparkline = buildBuckets(matchesCurrent.map((m: { matchedAt: Date }) => ({ date: m.matchedAt })));
    const connSparkline = buildBuckets(connectionsCurrent.map((c: { createdAt: Date }) => ({ date: c.createdAt })));
    const msgSparkline = buildBuckets(messagesCurrent.map((m: { sentAt: Date }) => ({ date: m.sentAt })));

    const totalEvents = matchesCurrent.length + connectionsCurrent.length + messagesCurrent.length;

    return NextResponse.json({
      role,
      days,
      matches: {
        current: matchesCurrent.length,
        previous: matchesPrev.length,
        deltaPercent: deltaPercent(matchesCurrent.length, matchesPrev.length),
        sparkline: matchSparkline,
      },
      connections: {
        current: connectionsCurrent.length,
        previous: connectionsPrev.length,
        deltaPercent: deltaPercent(connectionsCurrent.length, connectionsPrev.length),
        sparkline: connSparkline,
      },
      messages: {
        current: messagesCurrent.length,
        previous: messagesPrev.length,
        deltaPercent: deltaPercent(messagesCurrent.length, messagesPrev.length),
        sparkline: msgSparkline,
      },
      profileViews: {
        current: 0,
        previous: 0,
        deltaPercent: null,
        sparkline: [],
      },
      insufficientSample: totalEvents < 3,
    } satisfies AnalyticsSummaryResponse);
  } catch (err) {
    console.error('[GET /api/analytics/summary]', err);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
