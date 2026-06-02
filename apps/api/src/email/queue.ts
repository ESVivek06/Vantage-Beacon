import { Queue } from 'bullmq';
import { redisConnection } from '../workers/queues';

export const EMAIL_QUEUE_NAME = 'email';

export interface WelcomeJobData {
  type: 'welcome';
  to: string;
  userId: string;
  displayName: string;
}

export interface MatchAlertJobData {
  type: 'match-alert';
  to: string;
  userId: string;
  displayName: string;
  matchName: string;
  matchScore: number;
  topReasons: string[];
  matchProfileUrl: string;
}

export interface ConnectionAcceptedJobData {
  type: 'connection-accepted';
  to: string;
  userId: string;
  displayName: string;
  connectionName: string;
  messagesUrl: string;
}

export type EmailJobData =
  | WelcomeJobData
  | MatchAlertJobData
  | ConnectionAcceptedJobData;

let _emailQueue: Queue<EmailJobData> | null = null;

export function getEmailQueue(): Queue<EmailJobData> {
  if (!_emailQueue) {
    _emailQueue = new Queue<EmailJobData>(EMAIL_QUEUE_NAME, {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return _emailQueue!;
}

export async function enqueueWelcomeEmail(opts: Omit<WelcomeJobData, 'type'>): Promise<void> {
  await getEmailQueue().add('welcome', { type: 'welcome', ...opts });
}

export async function enqueueMatchAlertEmail(
  opts: Omit<MatchAlertJobData, 'type'>,
): Promise<void> {
  await getEmailQueue().add('match-alert', { type: 'match-alert', ...opts });
}

export async function enqueueConnectionAcceptedEmail(
  opts: Omit<ConnectionAcceptedJobData, 'type'>,
): Promise<void> {
  await getEmailQueue().add('connection-accepted', { type: 'connection-accepted', ...opts });
}
