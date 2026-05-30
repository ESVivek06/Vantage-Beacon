export interface MatchAlertEmailData {
  displayName: string;
  matchName: string;
  matchScore: number;
  topReasons: string[];
  matchProfileUrl: string;
  unsubscribeUrl: string;
}

export function matchAlertHtml(d: MatchAlertEmailData): string {
  const scorePercent = Math.round(d.matchScore * 100);
  const reasonsHtml = d.topReasons
    .map((r) => `<li style="margin:4px 0">${r}</li>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/></head>
<body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111">
  <h1 style="font-size:22px">New Top Match: ${d.matchName}</h1>
  <p>Hi ${d.displayName}, you have a new high-quality match on V.B.</p>
  <div style="background:#f0f9ff;border-left:4px solid #2563eb;padding:16px;border-radius:4px;margin:20px 0">
    <strong style="font-size:18px">${d.matchName}</strong>
    <p style="margin:8px 0 4px">Match score: <strong>${scorePercent}%</strong></p>
    ${reasonsHtml ? `<ul style="margin:8px 0;padding-left:20px">${reasonsHtml}</ul>` : ''}
  </div>
  <p>
    <a href="${d.matchProfileUrl}"
       style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;
              text-decoration:none;border-radius:6px;font-weight:600">
      View Profile &amp; Connect
    </a>
  </p>
  <hr style="margin-top:40px;border:none;border-top:1px solid #e5e7eb"/>
  <p style="font-size:12px;color:#6b7280">
    You're receiving match alerts from V.B.
    <a href="${d.unsubscribeUrl}" style="color:#6b7280">Unsubscribe</a>
  </p>
</body>
</html>`;
}

export function matchAlertText(d: MatchAlertEmailData): string {
  const scorePercent = Math.round(d.matchScore * 100);
  const reasons = d.topReasons.map((r) => `- ${r}`).join('\n');
  return `New Top Match: ${d.matchName}

Hi ${d.displayName}, you have a new high-quality match on V.B.

${d.matchName}
Match score: ${scorePercent}%
${reasons}

View Profile & Connect: ${d.matchProfileUrl}

---
You're receiving match alerts from V.B.
Unsubscribe: ${d.unsubscribeUrl}`;
}
