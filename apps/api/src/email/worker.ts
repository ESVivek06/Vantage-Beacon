import { Worker, type Job } from 'bullmq';
import { redisConnection } from '../workers/queues';
import { EMAIL_QUEUE_NAME, type EmailJobData } from './queue';
import { sendEmail, getUnsubscribeUrl } from '../services/emailService';
import { welcomeHtml, welcomeText } from './templates/welcome';
import { matchAlertHtml, matchAlertText } from './templates/matchAlert';
import { connectionAcceptedHtml, connectionAcceptedText } from './templates/connectionAccepted';

async function processEmailJob(job: Job<EmailJobData>): Promise<void> {
  const data = job.data;

  switch (data.type) {
    case 'welcome': {
      const templateData = {
        displayName: data.displayName,
        unsubscribeUrl: getUnsubscribeUrl(data.userId),
      };
      await sendEmail({
        to: data.to,
        subject: 'Welcome to V.B!',
        html: welcomeHtml(templateData),
        text: welcomeText(templateData),
      });
      break;
    }

    case 'match-alert': {
      const templateData = {
        displayName: data.displayName,
        matchName: data.matchName,
        matchScore: data.matchScore,
        topReasons: data.topReasons,
        matchProfileUrl: data.matchProfileUrl,
        unsubscribeUrl: getUnsubscribeUrl(data.userId),
      };
      await sendEmail({
        to: data.to,
        subject: `New match: ${data.matchName}`,
        html: matchAlertHtml(templateData),
        text: matchAlertText(templateData),
      });
      break;
    }

    case 'connection-accepted': {
      const appUrl = process.env.APP_URL ?? 'https://app.vb.com';
      const templateData = {
        displayName: data.displayName,
        connectionName: data.connectionName,
        messagesUrl: `${appUrl}/messages`,
        unsubscribeUrl: getUnsubscribeUrl(data.userId),
      };
      await sendEmail({
        to: data.to,
        subject: `${data.connectionName} accepted your connection request`,
        html: connectionAcceptedHtml(templateData),
        text: connectionAcceptedText(templateData),
      });
      break;
    }

    default: {
      const _exhaustive: never = data;
      throw new Error(`Unknown email job type: ${(_exhaustive as EmailJobData).type}`);
    }
  }
}

let _emailWorker: Worker<EmailJobData> | null = null;

export function startEmailWorker(): Worker<EmailJobData> {
  if (_emailWorker) return _emailWorker;

  _emailWorker = new Worker<EmailJobData>(EMAIL_QUEUE_NAME, processEmailJob, {
    connection: redisConnection,
    concurrency: 5,
  });

  _emailWorker.on('completed', (job) => {
    console.log(`[email-worker] job ${job.id} (${job.data.type}) completed`);
  });

  _emailWorker.on('failed', (job, err) => {
    console.error(`[email-worker] job ${job?.id} (${job?.data?.type}) failed:`, err.message);
  });

  _emailWorker.on('error', (err) => {
    console.error('[email-worker] error:', err.message);
  });

  console.log('[email-worker] started');
  return _emailWorker;
}

export async function stopEmailWorker(): Promise<void> {
  if (_emailWorker) {
    await _emailWorker.close();
    _emailWorker = null;
  }
}
