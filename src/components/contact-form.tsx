"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { initialFormState, submitContact } from "@/app/actions";
import { Arrow } from "@/components/ui";

const SUBJECTS = [
  "Connection card",
  "Prayer request",
  "Zoom link",
  "Other enquiry",
];

const field =
  "w-full border-b border-rule-strong bg-transparent py-3 text-ink placeholder:text-ink/30 focus:border-ink focus:outline-none";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="label group inline-flex items-center gap-2.5 rounded-full bg-ink px-8 py-4 text-paper transition-colors duration-400 hover:bg-accent disabled:opacity-50"
    >
      {pending ? "Sending…" : "Send message"}
      <Arrow />
    </button>
  );
}

export function ContactForm() {
  const [state, action] = useActionState(submitContact, initialFormState);

  if (state.status === "success") {
    return (
      <div className="border-t border-rule pt-10" role="status">
        <h3 className="font-display text-2xl">Message sent</h3>
        <p className="mt-4 max-w-md text-lg text-ink/70">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-8">
      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="label text-ink/45">
            Your name *
          </label>
          <input id="name" name="name" required autoComplete="name" className={`${field} mt-3`} />
        </div>
        <div>
          <label htmlFor="email" className="label text-ink/45">
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={`${field} mt-3`}
          />
        </div>
        <div>
          <label htmlFor="tel" className="label text-ink/45">
            Phone
          </label>
          <input id="tel" name="tel" type="tel" autoComplete="tel" className={`${field} mt-3`} />
        </div>
        <div>
          <label htmlFor="subject" className="label text-ink/45">
            What&rsquo;s it about?
          </label>
          <select id="subject" name="subject" className={`${field} mt-3 appearance-none`}>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="label text-ink/45">
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className={`${field} mt-3 resize-y`}
        />
      </div>

      {/* honeypot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      {state.status === "error" && (
        <p role="alert" className="text-accent">
          {state.message}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-6">
        <Submit />
        <p className="max-w-xs text-sm leading-relaxed text-ink/50">
          By sending this form you agree to our{" "}
          <Link href="/privacy-policy" className="link-underline">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/terms-of-use" className="link-underline">
            Terms of Use
          </Link>
          .
        </p>
      </div>
    </form>
  );
}
