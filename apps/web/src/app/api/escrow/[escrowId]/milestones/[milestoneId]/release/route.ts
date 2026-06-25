import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(
  _req: Request,
  { params }: { params: { escrowId: string; milestoneId: string } },
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({
    escrowId: params.escrowId,
    milestoneId: params.milestoneId,
    status: 'RELEASED',
    releasedAt: new Date().toISOString(),
  });
}
