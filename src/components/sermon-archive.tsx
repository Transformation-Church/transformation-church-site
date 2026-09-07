"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";

import { SermonList } from "@/components/sermon";
import type { Facet, Sermon } from "@/lib/content";

const PAGE_SIZE = 30;

type Filters = { preacher: string; series: string; serviceType: string };

/**
 * Normalises for forgiving search: strips accents and punctuation so
 * "Pr. S. Mathew" is found by "pr s mathew", "mathew", or "prsmathew".
 *
 * Many of these preacher names are transliterated from Malayalam and get
 * spelled several ways, so plain substring matching fails people constantly.
 */
function normalise(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Every term must appear somewhere, in any order. */
function matches(haystack: string, query: string) {
  const terms = query.split(" ").filter(Boolean);
  if (terms.length === 0) return true;
  const compact = haystack.replace(/\s/g, "");
  return terms.every((t) => haystack.includes(t) || compact.includes(t));
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Facet[];
  onChange: (v: string) => void;
}) {
  const id = `filter-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="label text-ink-muted">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none border-b border-rule-strong bg-transparent py-2.5 pr-8 font-display text-lg text-ink focus:border-ink focus:outline-none"
        >
          <option value="">All</option>
          {options.map((o) => (
            <option key={o.slug} value={o.slug}>
              {o.name} ({o.count})
            </option>
          ))}
        </select>
        <svg
          viewBox="0 0 12 8"
          aria-hidden
          className="pointer-events-none absolute right-1 top-1/2 h-2 w-3 -translate-y-1/2 text-ink-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M1 1l5 5 5-5" />
        </svg>
      </div>
    </div>
  );
}

export function SermonArchive({
  sermons,
  preachers,
  series,
  serviceTypes,
}: {
  sermons: Sermon[];
  preachers: Facet[];
  series: Facet[];
  serviceTypes: Facet[];
}) {
  const router = useRouter();
  const params = useSearchParams();

  // The URL is the source of truth, so a filtered view can be shared,
  // bookmarked and survives a refresh. Changes use replace() rather than
  // push(), so the back button leaves the archive instead of stepping back
  // through every filter the visitor tried.
  const filters: Filters = {
    preacher: params.get("preacher") ?? "",
    series: params.get("series") ?? "",
    serviceType: params.get("service") ?? "",
  };
  const query = params.get("q") ?? "";

  // The input stays local so typing is never held up by routing.
  const [draft, setDraft] = useState(query);
  const [shown, setShown] = useState(PAGE_SIZE);
  const deferredDraft = useDeferredValue(draft);

  useEffect(() => setDraft(query), [query]);

  const push = useCallback(
    (next: Partial<Filters & { q: string }>) => {
      const search = new URLSearchParams(params.toString());
      const set = (key: string, value: string | undefined) => {
        if (value === undefined) return;
        if (value) search.set(key, value);
        else search.delete(key);
      };
      set("preacher", next.preacher);
      set("series", next.series);
      set("service", next.serviceType);
      set("q", next.q);

      const qs = search.toString();
      router.replace(qs ? `/sermons?${qs}` : "/sermons", { scroll: false });
      setShown(PAGE_SIZE);
    },
    [params, router],
  );

  // Commit the typed query to the URL once typing pauses, so the address bar
  // does not churn on every keystroke.
  useEffect(() => {
    if (deferredDraft === query) return;
    const id = setTimeout(() => push({ q: deferredDraft }), 350);
    return () => clearTimeout(id);
  }, [deferredDraft, query, push]);

  const indexed = useMemo(
    () =>
      sermons.map((s) => ({
        sermon: s,
        haystack: normalise(
          [s.title, s.preacher?.name, s.series?.name, s.passage, s.serviceType?.name]
            .filter(Boolean)
            .join(" "),
        ),
      })),
    [sermons],
  );

  const results = useMemo(() => {
    const q = normalise(deferredDraft);
    return indexed
      .filter(({ sermon }) => {
        if (filters.preacher && sermon.preacher?.slug !== filters.preacher) return false;
        if (filters.series && sermon.series?.slug !== filters.series) return false;
        if (filters.serviceType && sermon.serviceType?.slug !== filters.serviceType) {
          return false;
        }
        return true;
      })
      .filter(({ haystack }) => matches(haystack, q))
      .map(({ sermon }) => sermon);
  }, [indexed, filters.preacher, filters.series, filters.serviceType, deferredDraft]);

  const active =
    filters.preacher || filters.series || filters.serviceType || draft.trim();

  return (
    <>
      {/* filters */}
      <div className="grid gap-x-10 gap-y-8 border-b border-rule pb-10 md:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="sermon-search" className="label text-ink-muted">
            Search
          </label>
          <input
            id="sermon-search"
            type="search"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Title, preacher, passage"
            className="w-full border-b border-rule-strong bg-transparent py-2.5 font-display text-lg text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none"
          />
        </div>

        <Select
          label="Preacher"
          value={filters.preacher}
          options={preachers}
          onChange={(v) => push({ preacher: v })}
        />
        <Select
          label="Series"
          value={filters.series}
          options={series}
          onChange={(v) => push({ series: v })}
        />
        <Select
          label="Service"
          value={filters.serviceType}
          options={serviceTypes}
          onChange={(v) => push({ serviceType: v })}
        />
      </div>

      {/* count */}
      <div className="flex items-center justify-between gap-6 py-6">
        <p className="label text-ink-muted" role="status" aria-live="polite">
          {results.length} {results.length === 1 ? "sermon" : "sermons"}
        </p>
        {active && (
          <button
            type="button"
            onClick={() => {
              setDraft("");
              router.replace("/sermons", { scroll: false });
              setShown(PAGE_SIZE);
            }}
            className="label link-underline text-ink-muted hover:text-ink"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* results */}
      {results.length === 0 ? (
        <p className="border-t border-rule py-20 text-center text-lg text-ink-muted">
          No sermons match those filters. Try widening your search.
        </p>
      ) : (
        <>
          <SermonList sermons={results.slice(0, shown)} />

          {shown < results.length && (
            <div className="flex justify-center pt-12">
              <button
                type="button"
                onClick={() => setShown((n) => n + PAGE_SIZE)}
                className="label rounded-full border border-rule-strong px-8 py-4 text-ink transition-colors duration-400 hover:border-ink hover:bg-ink hover:text-paper"
              >
                Load {Math.min(PAGE_SIZE, results.length - shown)} more
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
