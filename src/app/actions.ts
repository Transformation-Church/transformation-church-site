"use server";

import { CONTACT_TO, isBot, sendMail } from "@/lib/mail";

export type FormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialFormState: FormState = { status: "idle", message: "" };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Shown when Resend isn't configured yet, so nobody's message silently vanishes. */
const UNCONFIGURED = `Email delivery isn't switched on for this site yet. Please email us directly at ${CONTACT_TO} and we'll come straight back to you.`;

export async function submitContact(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  if (isBot(formData)) return { status: "success", message: "Thank you." };

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const tel = String(formData.get("tel") || "").trim();
  const subject = String(formData.get("subject") || "Other enquiry").trim();
  const message = String(formData.get("message") || "").trim();

  if (!name || !email || !message) {
    return { status: "error", message: "Please fill in your name, email and message." };
  }
  if (!EMAIL.test(email)) {
    return { status: "error", message: "That email address doesn't look right." };
  }

  const result = await sendMail({
    subject: `[Website] ${subject} from ${name}`,
    replyTo: email,
    text: [
      `Subject:  ${subject}`,
      `Name:     ${name}`,
      `Email:    ${email}`,
      tel ? `Phone:    ${tel}` : null,
      "",
      message,
    ]
      .filter(Boolean)
      .join("\n"),
  });

  if (result.ok) {
    return {
      status: "success",
      message: "Thank you. We've got your message and someone will be in touch soon.",
    };
  }
  return {
    status: "error",
    message: result.reason === "unconfigured" ? UNCONFIGURED : "Something went wrong sending your message. Please try again, or email us directly.",
  };
}

export async function subscribeNewsletter(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  if (isBot(formData)) return { status: "success", message: "Thank you." };

  const email = String(formData.get("email") || "").trim();
  if (!EMAIL.test(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  const result = await sendMail({
    subject: "[Website] Newsletter signup",
    replyTo: email,
    text: `New newsletter signup: ${email}`,
  });

  if (result.ok) {
    return { status: "success", message: "You're on the list. Thank you." };
  }
  return {
    status: "error",
    message: result.reason === "unconfigured" ? UNCONFIGURED : "Something went wrong. Please try again.",
  };
}
