export interface ConnectionAcceptedEmailData {
  displayName: string;
  connectionName: string;
  messagesUrl: string;
  unsubscribeUrl: string;
}

export function connectionAcceptedHtml(d: ConnectionAcceptedEmailData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/></head>
<body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111">
  <h1 style="font-size:22px">Connection Accepted!</h1>
  <p>Hi ${d.displayName}, <strong>${d.connectionName}</strong> has accepted your connection request on V.B.</p>
  <p>You can now send messages and collaborate directly.</p>
  <p>
    <a href="${d.messagesUrl}"
       style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;
              text-decoration:none;border-radius:6px;font-weight:600">
      Send a Message
    </a>
  </p>
  <hr style="margin-top:40px;border:none;border-top:1px solid #e5e7eb"/>
  <p style="font-size:12px;color:#6b7280">
    You're receiving connection notifications from V.B.
    <a href="${d.unsubscribeUrl}" style="color:#6b7280">Unsubscribe</a>
  </p>
</body>
</html>`;
}

export function connectionAcceptedText(d: ConnectionAcceptedEmailData): string {
  return `Connection Accepted!

Hi ${d.displayName}, ${d.connectionName} has accepted your connection request on V.B.

You can now send messages and collaborate directly.

Send a Message: ${d.messagesUrl}

---
You're receiving connection notifications from V.B.
Unsubscribe: ${d.unsubscribeUrl}`;
}
