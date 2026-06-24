export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(
  _req: Request,
  { params }: { params: { escrowId: string } },
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { escrowId } = params;

  // Stub — production queries DB by ID with auth check.
  // Returns 404 if not found or user is not a party to this escrow.
  return NextResponse.json({ error: `Escrow ${escrowId} not found` }, { status: 404 });
}
