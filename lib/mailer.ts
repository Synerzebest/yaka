import 'server-only';

type Email = { to: string; subject: string; text: string; html: string };

/**
 * Sends a transactional e-mail through the Resend HTTP API (https://resend.com/docs/api-reference/emails/send-email).
 * Requires RESEND_API_KEY and EMAIL_FROM. In development without a key, the message is printed in the terminal
 * so the flow can be tested; in production nothing is sent and the caller gets an explicit error.
 */
export async function sendEmail(
  email: Email,
): Promise<{ ok: true } | { error: 'email_not_configured' | 'email_failed' }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) {
    if (process.env.NODE_ENV === 'development') {
      console.info(
        `\n[Yaka · e-mail non envoyé, RESEND_API_KEY absent]\nÀ : ${email.to}\nObjet : ${email.subject}\n\n${email.text}\n`,
      );
      return { ok: true };
    }
    return { error: 'email_not_configured' };
  }
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [email.to], subject: email.subject, text: email.text, html: email.html }),
      signal: AbortSignal.timeout(10_000),
    });
    return response.ok ? { ok: true } : { error: 'email_failed' };
  } catch {
    return { error: 'email_failed' };
  }
}

export function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!,
  );
}

/** Absolute links in e-mails come from configuration, never from the request's Host header. */
export function siteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  if (configured) return configured;
  return process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null;
}
