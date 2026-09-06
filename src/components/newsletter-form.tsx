"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { initialFormState, subscribeNewsletter } from "@/app/actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="label shrink-0 rounded-full bg-paper px-6 py-3 text-ink transition-colors duration-300 hover:bg-accent hover:text-paper disabled:opacity-50"
    >
      {pending ? "Sending" : "Subscribe"}
    </button>
  );
}

export function NewsletterForm({ className = "" }: { className?: string }) {
  const [state, action] = useActionState(subscribeNewsletter, initialFormState);

  return (
    <form action={action} className={className}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full border-b border-paper/25 bg-transparent pb-3 text-paper placeholder:text-paper-muted focus:border-paper focus:outline-none"
        />
        <Submit />
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

      {state.status !== "idle" && (
        <p
          role="status"
          className={`mt-4 text-sm ${
            state.status === "success" ? "text-paper-body" : "text-accent-soft"
          }`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
