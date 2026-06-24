import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  return NextResponse.json({
    kpis: {
      activeSuppliers: 4,
      avgFulfilmentScore: 8.4,
      avgFulfilmentTrend: 0.2,
      disputeRate: 3,
      disputeRateTrend: -1,
      avgResponseHours: 4.2,
      avgResponseTrend: -0.8,
    },
    suppliers: [
      {
        id: 's1',
        name: 'SupplyCo Ltd',
        fulfilmentScore: 9.1,
        responseHours: 1.2,
        disputeRate: 0,
        escrows: 3,
        status: 'Active',
        activities: [{ date: '22 Jun', text: 'Escrow #3 released successfully' }],
      },
      {
        id: 's2',
        name: 'BuildFast Ltd',
        fulfilmentScore: 7.3,
        responseHours: 6.8,
        disputeRate: 5,
        escrows: 1,
        status: 'Active',
        activities: [{ date: '19 Jun', text: 'Dispute raised — under review' }],
      },
      {
        id: 's3',
        name: 'CloudOps Ltd',
        fulfilmentScore: 8.5,
        responseHours: 2.4,
        disputeRate: 2,
        escrows: 2,
        status: 'Active',
        activities: [{ date: '20 Jun', text: 'Monthly SLA review completed' }],
      },
    ],
  });
}
