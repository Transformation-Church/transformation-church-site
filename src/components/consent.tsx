"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";

/**
 * Consent, by category.
 *
 * Today the site sets no cookies at all, and the only thing worth asking about
 * is that some images are fetched from other companies' servers. Analytics and
 * advertising pixels are coming, though, and those are a different matter
 * legally: under PECR they need opt-in consent before they load, not a notice
 * afterwards. So the model is built for them now, rather than bolted on later
 * when there is a live pixel to get wrong.
 *
 * The rules this encodes, which are the ones implementations usually break:
 *
 *   - Nothing in a consent-requiring category runs before consent. Not with a
 *     "denied by default" flag, not queued: the script is not on the page.
 *   - Refusing everything is one click, in the same place, at the same size as
 *     accepting everything.
 *   - Consent can be withdrawn as easily as it was given, so there is a Cookie
 *     settings link in the footer, on every page, forever.
 *   - No category is on by default, and Save with nothing ticked means no.
 *
 * The answer lives in localStorage rather than a cookie. A cookie banner that
 * sets a cookie to remember you refused cookies is the joke it sounds like,
 * and localStorage is never sent to a server.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * ADDING GOOGLE ANALYTICS, A FACEBOOK PIXEL, OR ANYTHING LIKE THEM
 *
 * Do not put the snippet in layout.tsx. Put it in a component and wrap it:
 *
 *     <ConsentedScript category="analytics">
 *       <Script src="https://www.googletagmanager.com/gtag/js?id=G-XXXX" />
 *       …
 *     </ConsentedScript>
 *
 * category is "analytics" for measurement (GA4, Plausible if self-hosted with
 * cookies, Hotjar) and "marketing" for anything that follows people across
 * sites (Meta Pixel, Google Ads, TikTok). If in doubt it is marketing.
 *
 * Then add a line to CATEGORIES below naming it, so the panel tells the truth
 * about what is running, and update /cookie-policy. Both are part of the job,
 * not tidying up afterwards.
 * ─────────────────────────────────────────────────────────────────────────
 */

export type Category = "media" | "analytics" | "marketing";

type Consent = Record<Category, boolean>;

const NONE: Consent = { media: false, analytics: false, marketing: false };
const ALL: Consent = { media: true, analytics: true, marketing: true };

/**
 * What the preferences panel says. Keep the descriptions concrete: "improve
 * your experience" tells nobody anything, and is the wording regulators single
 * out. Name the company and say what it learns.
 */
const CATEGORIES: {
  key: Category;
  name: string;
  detail: string;
  live: boolean;
}[] = [
  {
    key: "media",
    name: "Images from YouTube and Instagram",
    detail:
      "Sermon artwork comes from YouTube where we have none of our own, and our Instagram photographs are served by Behold. No cookies are set, but both learn your IP address and which page you are on.",
    live: true,
  },
  {
    key: "analytics",
    name: "Measuring how the site is used",
    detail:
      "Which pages people read and how they arrived, so we know what is worth keeping. Sets cookies. Nothing is running in this category yet.",
    live: false,
  },
  {
    key: "marketing",
    name: "Advertising and social media tracking",
    detail:
      "Lets services like Facebook recognise you across other websites in order to target advertising. Sets cookies. Nothing is running in this category yet.",
    live: false,
  },
];

// Bump when the categories change materially, which re-asks everyone. Do that
// when something new starts running, not for wording changes.
const STORAGE_KEY = "tc-consent-v2";

const ConsentContext = createContext<{
  consent: Consent;
  decided: boolean;
  save: (next: Consent) => void;
  reopen: () => void;
}>({ consent: NONE, decided: false, save: () => {}, reopen: () => {} });

export function useConsent() {
  return useContext(ConsentContext);
}

/** True when this category may load. */
export function useAllowed(category: Category) {
  return useConsent().consent[category];
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  // Denied on the server and on the first client render, so the markup matches
  // and nothing is requested before the stored answer has been read.
  const [consent, setConsent] = useState<Consent>(NONE);
  const [decided, setDecided] = useState(false);
  const [ready, setReady] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Consent>;
        setConsent({
          media: parsed.media === true,
          analytics: parsed.analytics === true,
          marketing: parsed.marketing === true,
        });
        setDecided(true);
      }
    } catch {
      // Private windows, blocked site data, or a corrupted value. Treat every
      // one as no answer given: ask again, and load nothing meanwhile.
    }
    setReady(true);
  }, []);

  const save = useCallback((next: Consent) => {
    setConsent(next);
    setDecided(true);
    setPanelOpen(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // The choice still holds for this page view.
    }
  }, []);

  const reopen = useCallback(() => setPanelOpen(true), []);

  return (
    <ConsentContext.Provider value={{ consent, decided, save, reopen }}>
      {children}
      {ready && !decided && !panelOpen && (
        <ConsentBanner
          onAcceptAll={() => save(ALL)}
          onRejectAll={() => save(NONE)}
          onCustomise={() => setPanelOpen(true)}
        />
      )}
      {ready && panelOpen && (
        <ConsentPanel
          initial={consent}
          onSave={save}
          onClose={() => setPanelOpen(false)}
          dismissable={decided}
        />
      )}
    </ConsentContext.Provider>
  );
}

/* ------------------------------------------------------------------ banner */

function ConsentBanner({
  onAcceptAll,
  onRejectAll,
  onCustomise,
}: {
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onCustomise: () => void;
}) {
  return (
    <div
      role="region"
      aria-labelledby="consent-heading"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-paper/12 bg-ink-deep text-paper"
    >
      <div className="container-page flex flex-col gap-6 py-6 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        <div className="max-w-3xl">
          <h2 id="consent-heading" className="label text-paper-muted">
            Before we load anything from elsewhere
          </h2>
          <p className="mt-3 leading-relaxed text-paper-body">
            This site sets no cookies of its own and does not track you. Some
            pages show sermon artwork from YouTube and photographs from our
            Instagram, which are fetched from those companies&rsquo; servers and
            tell them your IP address. You can say no and the rest of the site
            works exactly the same.{" "}
            <Link href="/cookie-policy" className="link-underline text-paper">
              More detail
            </Link>
            .
          </p>
        </div>

        {/* Accept and reject carry the same weight, in the same place. */}
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onAcceptAll}
            className="label rounded-full bg-paper px-6 py-3.5 text-ink transition-colors duration-300 hover:bg-accent hover:text-paper"
          >
            Allow all
          </button>
          <button
            type="button"
            onClick={onRejectAll}
            className="label rounded-full border border-paper/35 px-6 py-3.5 text-paper transition-colors duration-300 hover:border-paper hover:bg-paper hover:text-ink"
          >
            Reject all
          </button>
          <button
            type="button"
            onClick={onCustomise}
            className="label link-underline px-2 py-3.5 text-paper-muted transition-colors hover:text-paper"
          >
            Choose
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- panel */

function ConsentPanel({
  initial,
  onSave,
  onClose,
  dismissable,
}: {
  initial: Consent;
  onSave: (next: Consent) => void;
  onClose: () => void;
  dismissable: boolean;
}) {
  const [draft, setDraft] = useState<Consent>(initial);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const returnTo = useRef<Element | null>(null);

  useEffect(() => {
    returnTo.current = document.activeElement;
    headingRef.current?.focus();
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissable) onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      (returnTo.current as HTMLElement | null)?.focus?.();
    };
  }, [dismissable, onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink-deep/70 backdrop-blur-sm sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="consent-panel-heading"
        className="max-h-[90dvh] w-full overflow-y-auto bg-paper sm:max-w-2xl"
      >
        <div className="p-7 md:p-10">
          <h2
            id="consent-panel-heading"
            ref={headingRef}
            tabIndex={-1}
            className="font-display text-2xl outline-none"
          >
            What you allow
          </h2>
          <p className="mt-4 leading-relaxed text-ink-muted">
            Nothing in these categories runs until you allow it. You can change
            your mind at any time from the Cookie settings link in the footer.
          </p>

          <div className="mt-8 border-t border-rule">
            {CATEGORIES.map((c) => (
              <label
                key={c.key}
                className="flex cursor-pointer items-start gap-5 border-b border-rule py-6"
              >
                <input
                  type="checkbox"
                  checked={draft[c.key]}
                  onChange={(e) =>
                    setDraft({ ...draft, [c.key]: e.target.checked })
                  }
                  className="mt-1.5 h-5 w-5 shrink-0 accent-[var(--color-ink)]"
                />
                <span>
                  <span className="block font-display text-xl">
                    {c.name}
                    {!c.live && (
                      <span className="label ml-3 align-middle text-ink-muted">
                        Not in use yet
                      </span>
                    )}
                  </span>
                  <span className="mt-2 block leading-relaxed text-ink-muted">
                    {c.detail}
                  </span>
                </span>
              </label>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onSave(draft)}
              className="label rounded-full bg-ink px-6 py-3.5 text-paper transition-colors duration-300 hover:bg-accent"
            >
              Save choices
            </button>
            <button
              type="button"
              onClick={() => onSave(NONE)}
              className="label rounded-full border border-rule-strong px-6 py-3.5 text-ink transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-paper"
            >
              Reject all
            </button>
            {dismissable && (
              <button
                type="button"
                onClick={onClose}
                className="label link-underline px-2 py-3.5 text-ink-muted hover:text-ink"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- gates */

/**
 * Renders children only once its category is allowed.
 *
 * The fallback is not an apology: it says what is missing and offers the way to
 * get it, so a page that has been refused still reads as finished.
 */
export function ConsentGate({
  category,
  children,
  fallback,
}: {
  category: Category;
  children: ReactNode;
  fallback: ReactNode;
}) {
  return <>{useAllowed(category) ? children : fallback}</>;
}

/**
 * For analytics and advertising snippets. The children are not rendered at
 * all until the category is allowed, so the script never reaches the page.
 */
export function ConsentedScript({
  category,
  children,
}: {
  category: Category;
  children: ReactNode;
}) {
  return <>{useAllowed(category) ? children : null}</>;
}

/** Offers the choice again from inside a page. */
export function AllowMediaButton({ label }: { label: string }) {
  const { consent, save } = useConsent();
  return (
    <button
      type="button"
      onClick={() => save({ ...consent, media: true })}
      className="label link-underline text-ink-muted transition-colors hover:text-ink"
    >
      {label}
    </button>
  );
}

/** The footer's way back in, which is what makes consent withdrawable. */
export function CookieSettingsButton({ className }: { className?: string }) {
  const { reopen } = useConsent();
  return (
    <button type="button" onClick={reopen} className={className}>
      Cookie settings
    </button>
  );
}
