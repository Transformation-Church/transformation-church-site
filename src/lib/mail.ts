import { site } from "@/lib/site";

/**
 * Form delivery.
 *
 * Uses Resend's REST API directly — one fetch, no SDK — so the only setup is a
 * verified sending domain and two environment variables:
 *
 *   RESEND_API_KEY   from resend.com
 *   CONTACT_FROM     e.g. "Transformation Church <website@bpfministries.com>"
 *
 * Without RESEND_API_KEY nothing is sent and the caller is told so, which is
 * what lets the site run locally and on a preview deploy without secrets.
 */

export const CONTACT_TO = process.env.CONTACT_TO || site.contact.email;

export type MailResult =
  | { ok: true }
  | { ok: false; reason: "unconfigured" | "failed"; detail?: string };

export async function sendMail({
  subject,
  text,
  replyTo,
}: {
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<MailResult> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM;

  if (!key || !from) return { ok: false, reason: "unconfigured" };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [CONTACT_TO],
        subject,
        text,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });

    if (!res.ok) {
      return { ok: false, reason: "failed", detail: await res.text() };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: "failed", detail: String(e) };
  }
}

/** Trivial spam gate: a hidden field real people never fill in. */
export function isBot(form: { get(name: string): unknown }) {
  const trap = form.get("website");
  return typeof trap === "string" && trap.trim() !== "";
}
