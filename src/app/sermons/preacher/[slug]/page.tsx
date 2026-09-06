import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FacetArchive } from "@/components/facet-archive";
import { canonical } from "@/lib/seo";
import { getFacet, preachers, sermonsBy } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return preachers.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const preacher = getFacet(preachers, slug);
  if (!preacher) return {};

  return {
    title: `Sermons by ${preacher.name}`,
    ...canonical(`/sermons/preacher/${preacher.slug}`),
    description: `${preacher.count} ${preacher.count === 1 ? "sermon" : "sermons"} preached by ${preacher.name} at Transformation Church.`,
  };
}

export default async function PreacherPage({ params }: Props) {
  const { slug } = await params;
  const preacher = getFacet(preachers, slug);
  if (!preacher) notFound();

  return (
    <FacetArchive
      eyebrow="Preacher"
      facet={preacher}
      sermons={sermonsBy("preacher", slug)}
    />
  );
}
