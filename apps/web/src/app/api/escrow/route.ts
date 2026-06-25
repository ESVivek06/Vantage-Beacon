import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json([]);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { title, counterpartyName, totalAmount, currency, paymentStructure, releaseConditions, milestones } = body;

  if (!title || !counterpartyName || !totalAmount || !currency || !paymentStructure || !releaseConditions) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const id = `esc_${Date.now()}`;
  const escrow = {
    id,
    ref: `ESC-${Math.floor(Math.random() * 90000) + 10000}`,
    title,
    status: 'INITIATED',
    currency,
    totalAmount,
    paymentStructure,
    releaseConditions,
    createdAt: new Date().toISOString(),
    founder: { id: 'founder_stub', name: (session.user as { name?: string })?.name ?? 'Founder', role: 'Founder' },
    counterparty: { id: 'cp_stub', name: counterpartyName, role: 'Supplier' },
    milestones: (milestones ?? []).map((m: { description: string; amount: number }, i: number) => ({
      id: `ms_${i}_${Date.now()}`,
      description: m.description,
      amount: m.amount,
      status: 'PENDING',
    })),
    timeline: [{ id: 't1', description: 'Escrow created', date: new Date().toISOString() }],
  };

  return NextResponse.json({ id, escrow }, { status: 201 });
}
