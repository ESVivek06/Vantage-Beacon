import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

function makeTrend(days: number) {
  return Array.from({ length: days }, (_, i) => ({
    date: new Date(Date.now() - (days - 1 - i) * 86400000)
      .toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
    initiated: Math.floor(1200 + Math.random() * 400),
    released: Math.floor(800 + Math.random() * 300),
  }));
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = session.user as { role?: string };
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({
    kpis: [
      { label: 'Active users', value: '2,841', trend: 12 },
      { label: 'New signups', value: '148', trend: 22 },
      { label: 'Escrow volume', value: '£48K', trend: 18 },
      { label: 'Dispute rate', value: '2.1%', trend: -0.4 },
      { label: 'Match rate', value: '64%', trend: 3 },
      { label: 'Moderation flags', value: '23', trend: -8 },
      { label: 'Appeal rate', value: '0.8%', trend: -0.2 },
      { label: 'Avg match score', value: '7.6', trend: 0.2 },
    ],
    crossRoleFunnel: {
      freelancer: [
        { label: 'Profile views', value: 4200 },
        { label: 'Matched', value: 1890 },
        { label: 'Messaged', value: 840 },
        { label: 'Converted', value: 210 },
      ],
      founder: [
        { label: 'Profile views', value: 1800 },
        { label: 'Matched', value: 720 },
        { label: 'Messaged', value: 288 },
        { label: 'Converted', value: 64 },
      ],
      investor: [
        { label: 'Profile views', value: 960 },
        { label: 'Matched', value: 288 },
        { label: 'Messaged', value: 96 },
        { label: 'Converted', value: 24 },
      ],
      supplier: [
        { label: 'Profile views', value: 1200 },
        { label: 'Matched', value: 600 },
        { label: 'Messaged', value: 240 },
        { label: 'Converted', value: 72 },
      ],
    },
    escrowTrend: makeTrend(30),
    moderation: {
      autoApproved: 94,
      autoRejected: 4,
      humanReviewed: 2,
      appealRate: 0.8,
      appealOverturn: 12,
    },
  });
}
