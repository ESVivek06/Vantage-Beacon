export const dynamic = 'force-dynamic';

import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { MOCK_NOTIFICATIONS } from '@/lib/messaging-mock-data';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const onlyUnread = req.nextUrl.searchParams.get('unread') === 'true';
  const notifications = onlyUnread
    ? MOCK_NOTIFICATIONS.filter((n) => !n.read)
    : MOCK_NOTIFICATIONS;

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  return NextResponse.json({ notifications, unreadCount });
}
