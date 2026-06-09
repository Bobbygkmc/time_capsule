import { Resend } from "resend";

/**
 * Transactional email via Resend.
 *
 * Ported from the nested "time-capsule" copy (copy C) during the 2026-05-31
 * consolidation. Adapted to copy A's conventions:
 *   - Resend client is created lazily (not at module load) so `next build`
 *     never touches a missing RESEND_API_KEY at import time.
 *   - Sender address is configurable via RESEND_FROM_EMAIL instead of the
 *     hard-coded "noreply@yourdomain.com" placeholder C shipped with.
 *
 * Reference original: _imports/from-nested-time-capsule/src/lib/email.ts
 */

const DEFAULT_FROM = "Time Capsule <onboarding@resend.dev>";

function getResend(): Resend {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendUnlockEmail(
  to: string,
  capsuleTitle: string,
  capsuleUrl: string,
) {
  const resend = getResend();
  const from = process.env.RESEND_FROM_EMAIL ?? DEFAULT_FROM;

  return resend.emails.send({
    from,
    to,
    subject: `Your time capsule "${capsuleTitle}" is now open`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#0f172a;color:#e2e8f0;border-radius:12px">
        <h1 style="font-size:22px;font-weight:700;color:#ffffff;margin:0 0 8px">
          Your capsule is open 🔓
        </h1>
        <p style="margin:0 0 24px;color:#94a3b8">
          The time you sealed has arrived. Your capsule
          <strong style="color:#ffffff">"${capsuleTitle}"</strong>
          is now unlocked and ready to read.
        </p>
        <a
          href="${capsuleUrl}"
          style="display:inline-block;background:#4f46e5;color:#ffffff;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none"
        >
          Open capsule
        </a>
        <p style="margin:24px 0 0;font-size:12px;color:#475569">
          If you didn't expect this email, you can safely ignore it.
        </p>
      </div>
    `,
  });
}
