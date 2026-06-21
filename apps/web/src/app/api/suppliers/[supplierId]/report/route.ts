export const dynamic = 'force-dynamic';

import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

interface ReportBody {
  reason: string;
  details?: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { supplierId: string } },
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: ReportBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.reason || typeof body.reason !== 'string') {
    return NextResponse.json({ error: 'reason is required' }, { status: 400 });
  }

  const { supplierId } = params;
  const reportId = `report_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // Fire admin alert email (best-effort)
  void sendAdminAlert({
    supplierId,
    reporterId: session.user.id,
    reporterName: session.user.name ?? session.user.email ?? 'Unknown',
    reason: body.reason,
    details: body.details,
    reportId,
  }).catch(() => {});

  return NextResponse.json({ reportId });
}

async function sendAdminAlert(payload: {
  supplierId: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  details?: string;
  reportId: string;
}) {
  const adminEmail = process.env.ADMIN_ALERT_EMAIL;
  if (!adminEmail) return;

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;

  const body = [
    'A new supplier report has been submitted on V.B.',
    '',
    `Supplier:    (ID: ${payload.supplierId})`,
    `Reported by: ${payload.reporterName} (ID: ${payload.reporterId})`,
    `Reason:      ${payload.reason}`,
    `Details:     ${payload.details ?? '(none provided)'}`,
    `Submitted:   ${new Date().toISOString()}`,
    '',
    '—',
    'V.B Platform (automated alert)',
  ].join('\n');

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'noreply@vantage-beacon.app',
      to: adminEmail,
      subject: `[V.B] New supplier report (ID: ${payload.supplierId})`,
      text: body,
    }),
  });
}
