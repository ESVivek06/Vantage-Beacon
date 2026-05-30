export interface WelcomeEmailData {
  displayName: string;
  unsubscribeUrl: string;
}

export function welcomeHtml(d: WelcomeEmailData): string {
  const dashboardUrl = `${process.env.APP_URL ?? 'https://app.vb.com'}/dashboard`;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/></head>
<body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111">
  <h1 style="font-size:24px">Welcome to V.B, ${d.displayName}!</h1>
  <p>You're now part of a network connecting founders, investors, freelancers, and suppliers.</p>
  <p>
    <a href="${dashboardUrl}"
       style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;
              text-decoration:none;border-radius:6px;font-weight:600">
      Explore Your Dashboard
    </a>
  </p>
  <p>We'll notify you as new matches become available.</p>
  <hr style="margin-top:40px;border:none;border-top:1px solid #e5e7eb"/>
  <p style="font-size:12px;color:#6b7280">
    You're receiving this because you signed up for V.B.
    <a href="${d.unsubscribeUrl}" style="color:#6b7280">Unsubscribe</a>
  </p>
</body>
</html>`;
}

export function welcomeText(d: WelcomeEmailData): string {
  const dashboardUrl = `${process.env.APP_URL ?? 'https://app.vb.com'}/dashboard`;
  return `Welcome to V.B, ${d.displayName}!

You're now part of a network connecting founders, investors, freelancers, and suppliers.

Explore Your Dashboard: ${dashboardUrl}

We'll notify you as new matches become available.

---
You're receiving this because you signed up for V.B.
Unsubscribe: ${d.unsubscribeUrl}`;
}
