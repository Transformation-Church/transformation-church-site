"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Logo } from "@/components/logo";
import { navigation, site } from "@/lib/site";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // Every page opens on a navy title block, so the header starts inverted and
  // resolves to paper once you scroll past it.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 72);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const solid = scrolled && !open;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ease-[var(--ease-out-expo)] ${
          solid
            ? "border-b border-rule bg-paper/90 backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="container-page flex h-[var(--header-height)] items-center justify-between gap-8">
          <Logo
            tone={solid ? "light" : "dark"}
            priority
            className="h-7 md:h-8"
          />

          <nav className="hidden items-center gap-9 lg:flex" aria-label="Primary">
            {navigation.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`label link-underline py-1 transition-colors duration-300 ${
                    solid
                      ? active
                        ? "text-ink"
                        : "text-ink-muted hover:text-ink"
                      : active
                        ? "text-paper"
                        : "text-paper-body hover:text-paper"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            <Link
              href="/visit"
              className={`label rounded-full px-5 py-3 transition-all duration-400 ease-[var(--ease-out-expo)] ${
                solid
                  ? "bg-ink text-paper hover:bg-accent"
                  : "bg-paper text-ink hover:bg-accent hover:text-paper"
              }`}
            >
              Plan your visit
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className={`relative z-50 flex h-11 w-11 items-center justify-center lg:hidden ${
              open || !solid ? "text-paper" : "text-ink"
            }`}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span className="flex w-6 flex-col gap-[5px]">
              <span
                className={`h-px w-full bg-current transition-transform duration-500 ease-[var(--ease-out-expo)] ${
                  open ? "translate-y-[6px] rotate-45" : ""
                }`}
              />
              <span
                className={`h-px w-full bg-current transition-opacity duration-300 ${
                  open ? "opacity-0" : ""
                }`}
              />
              <span
                className={`h-px w-full bg-current transition-transform duration-500 ease-[var(--ease-out-expo)] ${
                  open ? "-translate-y-[6px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        hidden={!open}
        className="fixed inset-0 z-40 bg-ink-deep text-paper lg:hidden"
      >
        <div className="container-page flex h-full flex-col justify-between pb-14 pt-[calc(var(--header-height)+2rem)]">
          <nav aria-label="Primary mobile">
            <ul>
              {navigation.map((item, i) => (
                <li key={item.href} className="border-b border-paper/12">
                  <Link
                    href={item.href}
                    className="flex items-baseline gap-4 py-5"
                    style={{ transitionDelay: `${i * 40}ms` }}
                  >
                    <span className="label text-paper-muted text-[0.6rem]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-3xl">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href="/visit"
              className="label mt-10 inline-flex rounded-full bg-paper px-7 py-4 text-ink"
            >
              Plan your visit
            </Link>
          </nav>

          <div className="label space-y-2 text-paper-muted text-[0.62rem] leading-relaxed">
            <p>
              {site.address.line1}, {site.address.town} {site.address.postcode}
            </p>
            <p>
              <a href={`mailto:${site.contact.email}`} className="link-underline">
                {site.contact.email}
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
