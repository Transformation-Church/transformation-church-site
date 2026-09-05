import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FacetArchive } from "@/components/facet-archive";
import { getFacet, sermonsBy, series } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return series.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const found = getFacet(series, slug);
  if (!found) return {};

  return {
    title: found.name,
    description: `${found.count} ${found.count === 1 ? "sermon" : "sermons"} in the series “${found.name}” from Transformation Church.`,
  };
}

export default async function SeriesPage({ params }: Props) {
  const { slug } = await params;
  const found = getFacet(series, slug);
  if (!found) notFound();

  // Series read best in the order they were preached.
  const inOrder = [...sermonsBy("series", slug)].reverse();

  return <FacetArchive eyebrow="Series" facet={found} sermons={inOrder} />;
}
