import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

function makeTrend(days: number) {
  return Array.from({ length: days }, (_, i) => ({
    date: new Date(Date.now() - (days - 1 - i) * 86400000)
      .toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
    profileViews: Math.floor(30 + Math.random() * 20),
    messages: Math.floor(10 + Math.random() * 10),
    conversions: Math.floor(1 + Math.random() * 4),
  }));
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  return NextResponse.json({
    funnel: [
      { label: 'Profile views', value: 1240, conversionFromPrev: undefined },
      { label: 'Matched', value: 620, conversionFromPrev: 50 },
      { label: 'Message received', value: 310, conversionFromPrev: 50 },
      { label: 'Meeting booked', value: 62, conversionFromPrev: 20 },
      { label: 'Deal / hire', value: 24, conversionFromPrev: 39 },
    ],
    trend: makeTrend(30),
    byMatchType: [
      {
        type: 'Freelancers',
        matched: 241,
        responded: 182,
        converted: 38,
        responseRate: 76,
      },
      {
        type: 'Investors',
        matched: 89,
        responded: 52,
        converted: 9,
        responseRate: 58,
      },
      {
        type: 'Suppliers',
        matched: 48,
        responded: 41,
        converted: 19,
        responseRate: 85,
      },
    ],
  });
}
