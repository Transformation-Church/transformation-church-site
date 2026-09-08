"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";

/**
 * Consent for third-party media.
 *
 * The site sets no cookies of its own, so under PECR there is nothing here
 * that legally needs consent. What it does do is fetch two kinds of image from
 * someone else's server: sermon artwork from YouTube where the church has none
 * of its own, and Instagram posts through Behold. Neither sets a cookie, but
 * both hand a visitor's IP address and the page they are on to a third party,
 * and that is processing worth asking about.
 *
 * So this banner gates something real rather than performing compliance. Until
 * a choice is made, nothing third-party is fetched.
 *
 * The choice lives in localStorage rather than a cookie. A cookie banner that
 * sets a cookie to remember you refused cookies is the joke it sounds like,
 * and localStorage is not sent to any server.
 *
 * Refusal is one click, in the same place, at the same size as acceptance.
 * GDPR requires that they be equally easy, and burying "reject" behind a
 * settings panel is the most common way sites get this wrong.
 */

type Choice = "granted" | "denied";
type State = Choice | "unset";

const STORAGE_KEY = "tc-media-consent";

const ConsentContext = createContext<{
  state: State;
  decide: (choice: Choice) => void;
}>({ state: "unset", decide: () => {} });

export function useConsent() {
  return useContext(ConsentContext);
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  // Starts "unset" on the server and on the first client render, so the markup
  // matches and nothing third-party is requested before we have read the
  // stored choice.
  const [state, setState] = useState<State>("unset");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "granted" || stored === "denied") setState(stored);
    } catch {
      // Private windows and blocked site data both throw. Treat it as no
      // choice made: the banner shows, and nothing loads until they answer.
    }
    setReady(true);
  }, []);

  const decide = useCallback((choice: Choice) => {
    setState(choice);
    try {
      window.localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // The choice still holds for this page view.
    }
  }, []);

  return (
    <ConsentContext.Provider value={{ state, decide }}>
      {children}
      {ready && state === "unset" && <ConsentBanner onDecide={decide} />}
    </ConsentContext.Provider>
  );
}

function ConsentBanner({ onDecide }: { onDecide: (choice: Choice) => void }) {
  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-heading"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-paper/12 bg-ink-deep text-paper"
    >
      <div className="container-page flex flex-col gap-6 py-6 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        <div className="max-w-3xl">
          <h2 id="consent-heading" className="label text-paper-muted">
            Before we load anything from elsewhere
          </h2>
          <p className="mt-3 leading-relaxed text-paper-body">
            This site sets no cookies and does not track you. Some pages show
            sermon artwork from YouTube and photographs from our Instagram,
            which are fetched from those companies&rsquo; servers and tell them
            your IP address. You can say no and the rest of the site works
            exactly the same.{" "}
            <Link href="/cookie-policy" className="link-underline text-paper">
              More detail
            </Link>
            .
          </p>
        </div>

        {/* Equal weight on purpose: refusing has to be as easy as accepting. */}
        <div className="flex shrink-0 flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onDecide("granted")}
            className="label rounded-full bg-paper px-6 py-3.5 text-ink transition-colors duration-300 hover:bg-accent hover:text-paper"
          >
            Allow
          </button>
          <button
            type="button"
            onClick={() => onDecide("denied")}
            className="label rounded-full border border-paper/35 px-6 py-3.5 text-paper transition-colors duration-300 hover:border-paper hover:bg-paper hover:text-ink"
          >
            No thanks
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Renders children only once third-party media is allowed.
 *
 * The fallback is not an apology: it says what is missing and offers the way
 * to get it, so a page that has been refused still reads as finished.
 */
export function ConsentGate({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback: ReactNode;
}) {
  const { state } = useConsent();
  return <>{state === "granted" ? children : fallback}</>;
}

/** For a page that wants to offer the choice again inline. */
export function AllowMediaButton({ label }: { label: string }) {
  const { decide } = useConsent();
  return (
    <button
      type="button"
      onClick={() => decide("granted")}
      className="label link-underline text-ink-muted transition-colors hover:text-ink"
    >
      {label}
    </button>
  );
}
