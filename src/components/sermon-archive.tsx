"use client";

import { useDeferredValue, useMemo, useState } from "react";

import { SermonRow } from "@/components/sermon";
import type { Facet, Sermon } from "@/lib/content";

const PAGE_SIZE = 30;

type Filters = { preacher: string; series: string; serviceType: string };
const EMPTY: Filters = { preacher: "", series: "", serviceType: "" };

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
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState(PAGE_SIZE);

  // Typing across 167 records stays smooth if the list lags the input.
  const deferredQuery = useDeferredValue(query);

  const results = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return sermons.filter((s) => {
      if (filters.preacher && s.preacher?.slug !== filters.preacher) return false;
      if (filters.series && s.series?.slug !== filters.series) return false;
      if (filters.serviceType && s.serviceType?.slug !== filters.serviceType) {
        return false;
      }
      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) ||
        (s.preacher?.name.toLowerCase().includes(q) ?? false) ||
        (s.series?.name.toLowerCase().includes(q) ?? false) ||
        (s.passage?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [sermons, filters, deferredQuery]);

  const set = (key: keyof Filters) => (value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setShown(PAGE_SIZE);
  };

  const active =
    filters.preacher || filters.series || filters.serviceType || query.trim();

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
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShown(PAGE_SIZE);
            }}
            placeholder="Title, preacher, passage"
            className="w-full border-b border-rule-strong bg-transparent py-2.5 font-display text-lg text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none"
          />
        </div>

        <Select label="Preacher" value={filters.preacher} options={preachers} onChange={set("preacher")} />
        <Select label="Series" value={filters.series} options={series} onChange={set("series")} />
        <Select
          label="Service"
          value={filters.serviceType}
          options={serviceTypes}
          onChange={set("serviceType")}
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
              setFilters(EMPTY);
              setQuery("");
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
          <div className="border-t border-rule">
            {results.slice(0, shown).map((s) => (
              <SermonRow key={s.slug} sermon={s} />
            ))}
          </div>

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
