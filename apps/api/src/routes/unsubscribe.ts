import { Router, type Request, type Response } from 'express';
import { verifyUnsubscribeToken, addToSuppressionList } from '../services/emailService';
import { getClient } from '@vb/database';

export const unsubscribeRouter = Router();

/**
 * GET /unsubscribe?userId=<uuid>&token=<hmac>
 *
 * Validates the HMAC token, adds the user's email to the SES account-level
 * suppression list, and returns a confirmation page.
 */
unsubscribeRouter.get('/', async (req: Request, res: Response) => {
  const { userId, token } = req.query as { userId?: string; token?: string };

  if (!userId || !token) {
    res.status(400).send('Invalid unsubscribe link — missing parameters.');
    return;
  }

  if (!verifyUnsubscribeToken(userId, token)) {
    res.status(403).send('Invalid or expired unsubscribe link.');
    return;
  }

  try {
    const db = getClient();
    const user = await db.user.findUnique({
      where: { id: userId, deletedAt: null },
      select: { email: true },
    });

    if (!user) {
      res.status(404).send('User not found.');
      return;
    }

    await addToSuppressionList(user.email);

    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="utf-8"/><title>Unsubscribed</title></head>
      <body style="font-family:sans-serif;max-width:480px;margin:80px auto;text-align:center">
        <h1>You've been unsubscribed</h1>
        <p>You will no longer receive email notifications from V.B.</p>
        <p>If this was a mistake, please contact support.</p>
      </body>
      </html>
    `);
  } catch (err) {
    console.error('[unsubscribe] error:', err);
    res.status(500).send('Something went wrong. Please try again later.');
  }
});
