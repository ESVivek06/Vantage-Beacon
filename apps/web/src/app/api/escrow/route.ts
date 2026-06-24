export const dynamic = 'force-dynamic';

import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import type { Escrow } from '@/types/escrow';

export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Stub — production implementation queries the database filtered by user ID.
  const escrows: Escrow[] = [];
  return NextResponse.json(escrows);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    counterpartyId: string;
    title: string;
    currency: string;
    totalAmount: number;
    paymentStructure: 'single' | 'milestone';
    releaseConditions: string;
    milestones?: { description: string; amount: number }[];
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { counterpartyId, title, currency, totalAmount, paymentStructure, releaseConditions, milestones } = body;

  if (!counterpartyId || !title || !currency || !totalAmount || !releaseConditions) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (paymentStructure === 'milestone' && Array.isArray(milestones)) {
    const milestonesTotal = milestones.reduce((s, m) => s + m.amount, 0);
    if (Math.abs(milestonesTotal - totalAmount) > 0.01) {
      return NextResponse.json({ error: 'Milestone totals must equal the total amount' }, { status: 422 });
    }
  }

  const escrowId = `esc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const ref = `ESC-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;

  // Stub — production inserts into DB and sends notification email.
  const newEscrow: Partial<Escrow> = {
    id: escrowId,
    ref,
    title,
    status: 'INITIATED',
    currency,
    totalAmount,
    paymentStructure: paymentStructure ?? 'single',
    releaseConditions,
    createdAt: new Date().toISOString(),
    milestones: (milestones ?? []).map((m, i) => ({
      id: `ms_${i}_${Date.now()}`,
      description: m.description,
      amount: m.amount,
      status: 'PENDING',
    })),
    timeline: [
      {
        id: `evt_${Date.now()}`,
        description: `Escrow created by ${session.user.name ?? session.user.email}`,
        date: new Date().toISOString(),
        actor: session.user.name ?? session.user.email ?? '',
      },
    ],
  };

  return NextResponse.json({ id: escrowId, escrow: newEscrow }, { status: 201 });
}
