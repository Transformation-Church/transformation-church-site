import Link from "next/link";
import type { ReactNode } from "react";

/* ------------------------------------------------------------------ header */

/**
 * The navy title block every page opens with. It's what gives the site its
 * rhythm and lets the site header invert predictably on every route.
 */
export function PageHeader({
  eyebrow,
  title,
  lede,
  meta,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  meta?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="relative overflow-hidden bg-ink-deep text-paper">
      <Grain />
      <div className="container-page relative pb-20 pt-[calc(var(--header-height)+4.5rem)] md:pb-28 md:pt-[calc(var(--header-height)+7rem)]">
        <div className="grid gap-x-16 gap-y-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {eyebrow && (
              <p className="label mb-7 flex items-center gap-3 text-paper/55">
                <span className="h-px w-8 bg-accent" />
                {eyebrow}
              </p>
            )}
            <h1 className="font-display text-4xl text-paper">{title}</h1>
          </div>

          {lede && (
            <div className="lg:col-span-4 lg:pt-3">
              <p className="text-lg leading-relaxed text-paper/65">{lede}</p>
            </div>
          )}
        </div>

        {meta && <div className="mt-12 border-t border-paper/12 pt-7">{meta}</div>}
        {children}
      </div>
    </header>
  );
}

/**
 * Subtle film grain — stops the large flat navy areas from banding.
 *
 * A pre-baked tile rather than an inline SVG `feTurbulence`: the filter version
 * is re-rasterised by the browser at every size it's used at, which is enough
 * to stall paint on the full-bleed panels.
 */
export function Grain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-70 mix-blend-overlay"
      style={{
        backgroundImage: "url(/brand/grain.png)",
        backgroundRepeat: "repeat",
        backgroundSize: "128px 128px",
      }}
    />
  );
}

/* ----------------------------------------------------------------- section */

export function Section({
  index,
  eyebrow,
  title,
  lede,
  children,
  className = "",
  tone = "paper",
  action,
}: {
  index?: string;
  eyebrow?: string;
  title?: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
  className?: string;
  tone?: "paper" | "warm" | "ink";
  action?: ReactNode;
}) {
  const tones = {
    paper: "bg-paper text-ink",
    warm: "bg-paper-warm text-ink",
    ink: "bg-ink-deep text-paper",
  };
  const dark = tone === "ink";

  return (
    <section className={`${tones[tone]} ${className}`}>
      <div className="container-page py-20 md:py-28">
        {(eyebrow || title) && (
          <div
            className="mb-14 grid gap-x-16 gap-y-6 lg:grid-cols-12"
            data-reveal
          >
            <div className="lg:col-span-7">
              {eyebrow && (
                <p
                  className={`label mb-6 flex items-center gap-3 ${
                    dark ? "text-paper/55" : "text-ink/70"
                  }`}
                >
                  {index && <span className="tabular-nums">{index}</span>}
                  <span className="h-px w-8 bg-accent" />
                  {eyebrow}
                </p>
              )}
              {title && <h2 className="font-display text-3xl">{title}</h2>}
            </div>

            {(lede || action) && (
              <div className="flex flex-col justify-end gap-6 lg:col-span-4 lg:col-start-9">
                {lede && (
                  <p
                    className={`text-lg leading-relaxed ${
                      dark ? "text-paper/60" : "text-ink/70"
                    }`}
                  >
                    {lede}
                  </p>
                )}
                {action}
              </div>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ button */

const buttonBase =
  "label inline-flex items-center gap-2.5 rounded-full px-7 py-4 transition-all duration-500 ease-[var(--ease-out-expo)]";

const buttonTones = {
  ink: "bg-ink text-paper hover:bg-accent",
  paper: "bg-paper text-ink hover:bg-accent hover:text-paper",
  outline: "border border-current text-ink hover:bg-ink hover:text-paper hover:border-ink",
  outlineLight:
    "border border-paper/35 text-paper hover:bg-paper hover:text-ink hover:border-paper",
};

export function Button({
  href,
  children,
  tone = "ink",
  external = false,
  className = "",
}: {
  href: string;
  children: ReactNode;
  tone?: keyof typeof buttonTones;
  external?: boolean;
  className?: string;
}) {
  const cls = `${buttonBase} ${buttonTones[tone]} ${className} group`;
  const inner = (
    <>
      {children}
      <Arrow />
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden
      className={`h-3 w-3 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M1 8h13M9 3l5 5-5 5" />
    </svg>
  );
}

/** Text link with the arrow affordance, used to close out sections. */
export function TextLink({
  href,
  children,
  tone = "ink",
  external = false,
}: {
  href: string;
  children: ReactNode;
  tone?: "ink" | "paper";
  external?: boolean;
}) {
  const cls = `label group inline-flex items-center gap-2.5 ${
    tone === "paper" ? "text-paper/75 hover:text-paper" : "text-ink/70 hover:text-ink"
  } transition-colors duration-300`;

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        <span className="link-underline">{children}</span>
        <Arrow />
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      <span className="link-underline">{children}</span>
      <Arrow />
    </Link>
  );
}

/* ------------------------------------------------------------------- misc */

export function Accordion({
  items,
  tone = "ink",
}: {
  items: { question: string; answer: string }[];
  tone?: "ink" | "paper";
}) {
  const dark = tone === "paper";
  return (
    <div className={`border-t ${dark ? "border-paper/12" : "border-rule"}`}>
      {items.map((item) => (
        <details
          key={item.question}
          className={`group border-b ${dark ? "border-paper/12" : "border-rule"}`}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
            <span className="font-display text-xl">{item.question}</span>
            <span
              className={`relative h-3 w-3 shrink-0 ${
                dark ? "text-paper/55" : "text-ink/70"
              }`}
              aria-hidden
            >
              <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-current" />
              <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-current transition-transform duration-400 ease-[var(--ease-out-expo)] group-open:rotate-90 group-open:opacity-0" />
            </span>
          </summary>
          <div
            className={`max-w-2xl pb-7 leading-relaxed ${
              dark ? "text-paper/60" : "text-ink/70"
            }`}
          >
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
