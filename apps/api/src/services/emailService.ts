import { createHmac } from 'crypto';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import {
  SESv2Client,
  PutSuppressedDestinationCommand,
  SuppressedDestinationReason,
} from '@aws-sdk/client-sesv2';

const ses = new SESClient({ region: process.env.AWS_REGION ?? 'eu-west-2' });
const sesv2 = new SESv2Client({ region: process.env.AWS_REGION ?? 'eu-west-2' });

export const FROM_ADDRESS =
  process.env.SES_FROM_ADDRESS ?? 'noreply@vb.com';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  await ses.send(
    new SendEmailCommand({
      Source: FROM_ADDRESS,
      Destination: { ToAddresses: [payload.to] },
      Message: {
        Subject: { Data: payload.subject, Charset: 'UTF-8' },
        Body: {
          Html: { Data: payload.html, Charset: 'UTF-8' },
          Text: { Data: payload.text, Charset: 'UTF-8' },
        },
      },
    }),
  );
}

/**
 * Add an email address to the SES account-level suppression list.
 * Called when the user clicks the unsubscribe link.
 */
export async function addToSuppressionList(email: string): Promise<void> {
  await sesv2.send(
    new PutSuppressedDestinationCommand({
      EmailAddress: email,
      Reason: SuppressedDestinationReason.COMPLAINT,
    }),
  );
}

/**
 * Generate a stateless HMAC-based unsubscribe token for a user.
 * The token encodes userId so we never store it in the DB.
 */
export function generateUnsubscribeToken(userId: string): string {
  const secret = process.env.UNSUBSCRIBE_SECRET ?? 'change-me-in-production';
  return createHmac('sha256', secret).update(userId).digest('hex');
}

export function verifyUnsubscribeToken(userId: string, token: string): boolean {
  return generateUnsubscribeToken(userId) === token;
}

export function getUnsubscribeUrl(userId: string): string {
  const appUrl = process.env.APP_URL ?? 'https://app.vb.com';
  const token = generateUnsubscribeToken(userId);
  return `${appUrl}/unsubscribe?userId=${encodeURIComponent(userId)}&token=${token}`;
}
