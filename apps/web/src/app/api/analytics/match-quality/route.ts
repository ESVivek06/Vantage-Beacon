import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

function makeTrend(days: number, base: number, variance: number) {
  return Array.from({ length: days }, (_, i) => ({
    date: new Date(Date.now() - (days - 1 - i) * 86400000)
      .toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
    acceptanceRate: Math.max(0, Math.min(100, base + (Math.random() - 0.5) * variance)),
    avgScore: Math.max(0, Math.min(10, 7.8 + (Math.random() - 0.5) * 2)),
  }));
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  return NextResponse.json({
    kpis: {
      matchRate: 68,
      matchRateTrend: 4.2,
      accepted: 41,
      acceptedTrend: 8,
      declined: 19,
      declinedTrend: -3,
      avgScore: 7.8,
      avgScoreTrend: 0.3,
    },
    scoreDistribution: [
      { label: '1–2', value: 2 },
      { label: '3–4', value: 5 },
      { label: '5–6', value: 12 },
      { label: '7', value: 18 },
      { label: '8', value: 22 },
      { label: '9', value: 15 },
      { label: '10', value: 6 },
    ],
    declineReasons: [
      { label: 'Not relevant', value: 38 },
      { label: 'Already hired', value: 22 },
      { label: 'Rate too high', value: 18 },
      { label: 'Other', value: 22 },
    ],
    trend: makeTrend(30, 68, 20),
    topMatches: [
      { id: '1', name: 'Alex Chen', score: 9.2, status: 'Accepted', matchDate: '14 Jun' },
      { id: '2', name: 'SupplyCo', score: 8.7, status: 'Pending', matchDate: '18 Jun' },
      { id: '3', name: 'BuildFast Ltd', score: 8.1, status: 'Accepted', matchDate: '20 Jun' },
      { id: '4', name: 'Maria Santos', score: 7.4, status: 'Declined', matchDate: '21 Jun' },
      { id: '5', name: 'TechCorp', score: 6.9, status: 'Pending', matchDate: '22 Jun' },
    ],
  });
}
