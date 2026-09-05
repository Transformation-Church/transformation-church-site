"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ArchiveImage } from "@/components/archive-image";
import type { GalleryCategory } from "@/lib/content";

type Item = { src: string; category: string };

export function GalleryGrid({ categories }: { categories: GalleryCategory[] }) {
  const [active, setActive] = useState<string>("All");
  const [open, setOpen] = useState<number | null>(null);

  const items = useMemo<Item[]>(
    () =>
      categories.flatMap((c) => c.images.map((src) => ({ src, category: c.title }))),
    [categories],
  );

  const visible = useMemo(
    () => (active === "All" ? items : items.filter((i) => i.category === active)),
    [items, active],
  );

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (delta: number) =>
      setOpen((i) => (i === null ? null : (i + delta + visible.length) % visible.length)),
    [visible.length],
  );

  useEffect(() => {
    if (open === null) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, step]);

  const tabs = ["All", ...categories.map((c) => c.title)];
  const current = open === null ? null : visible[open];

  return (
    <>
      {/* filters */}
      <div className="flex flex-wrap gap-x-2 gap-y-2 border-b border-rule pb-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setActive(tab);
              setOpen(null);
            }}
            aria-pressed={active === tab}
            className={`label rounded-full px-5 py-2.5 transition-colors duration-300 ${
              active === tab
                ? "bg-ink text-paper"
                : "border border-rule text-ink/60 hover:border-ink/40 hover:text-ink"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <p className="label py-6 text-ink/45" role="status" aria-live="polite">
        {visible.length} {visible.length === 1 ? "photograph" : "photographs"}
      </p>

      {/* grid */}
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {visible.map((item, i) => (
          <li key={item.src}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="block w-full cursor-zoom-in"
            >
              <span className="sr-only">
                Open photograph {i + 1} of {visible.length}
              </span>
              <ArchiveImage
                src={item.src}
                alt=""
                className="aspect-square"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </button>
          </li>
        ))}
      </ul>

      {/* lightbox */}
      {current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photograph viewer"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-deep/97 p-4 md:p-10"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            className="label absolute right-5 top-5 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-paper/25 text-paper transition-colors hover:bg-paper hover:text-ink"
          >
            <span className="sr-only">Close</span>
            <svg viewBox="0 0 14 14" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <path d="M1 1l12 12M13 1L1 13" />
            </svg>
          </button>

          {visible.length > 1 && (
            <>
              <NavButton side="left" onClick={() => step(-1)} />
              <NavButton side="right" onClick={() => step(1)} />
            </>
          )}

          <figure
            className="relative max-h-full w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={current.src}
                alt=""
                fill
                sizes="90vw"
                className="object-contain"
                priority
              />
            </div>
            <figcaption className="label mt-5 flex justify-between gap-4 text-paper/50">
              <span>{current.category}</span>
              <span className="tabular-nums">
                {(open ?? 0) + 1} / {visible.length}
              </span>
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}

function NavButton({
  side,
  onClick,
}: {
  side: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`absolute top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-paper/25 text-paper transition-colors hover:bg-paper hover:text-ink ${
        side === "left" ? "left-4 md:left-8" : "right-4 md:right-8"
      }`}
    >
      <span className="sr-only">{side === "left" ? "Previous" : "Next"}</span>
      <svg
        viewBox="0 0 16 16"
        className={`h-4 w-4 ${side === "left" ? "rotate-180" : ""}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden
      >
        <path d="M1 8h13M9 3l5 5-5 5" />
      </svg>
    </button>
  );
}
