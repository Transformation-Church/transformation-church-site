import type { Metadata } from "next";

import { canonical } from "@/lib/seo";
import { VideoCollections } from "@/components/video-collections";
import { Accordion, PageHeader, Section } from "@/components/ui";
import { kidsSpace } from "@/lib/content";
import { visitFaqs } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kids Space",
  description:
    "Creative work by the children of Transformation Church: films, retellings and projects made by our Sunday school.",
  ...canonical("/kids-space"),
};

export default function KidsSpacePage() {
  const films = kidsSpace.collections.reduce((n, c) => n + c.videos.length, 0);

  return (
    <>
      <PageHeader
        eyebrow="Kids Space"
        title="Creative work by TC children"
        lede="Films, retellings and projects made by the children of our Sunday school, aged 5 to 17."
        meta={
          <dl className="flex gap-12">
            <div>
              <dt className="label text-paper-muted">Collections</dt>
              <dd className="mt-2 font-display text-2xl tabular-nums text-paper">
                {kidsSpace.collections.length}
              </dd>
            </div>
            <div>
              <dt className="label text-paper-muted">Films</dt>
              <dd className="mt-2 font-display text-2xl tabular-nums text-paper">
                {films}
              </dd>
            </div>
          </dl>
        }
      />

      <Section>
        <VideoCollections collections={kidsSpace.collections} />
      </Section>

      <Section tone="warm" eyebrow="Before you come" title="Are you new here?">
        <div className="lg:w-3/4">
          <Accordion items={visitFaqs} />
        </div>
      </Section>
    </>
  );
}
