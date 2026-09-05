import type { Metadata } from "next";

import { VideoCollections } from "@/components/video-collections";
import { Accordion, PageHeader, Section, TextLink } from "@/components/ui";
import { spark } from "@/lib/content";
import { visitFaqs } from "@/lib/site";

export const metadata: Metadata = {
  title: "Spark",
  description:
    "Spark — creative work by the children and young people of Transformation Church.",
};

export default function SparkPage() {
  return (
    <>
      <PageHeader
        eyebrow="Spark"
        title="Creative work by TC children"
        lede="Our young people's creative projects, filmed and edited by the team."
      />

      <Section
        action={<TextLink href="/kids-space">See more in Kids Space</TextLink>}
      >
        <VideoCollections collections={spark.collections} />
      </Section>

      <Section tone="warm" eyebrow="Before you come" title="Are you new here?">
        <div className="lg:w-3/4">
          <Accordion items={visitFaqs} />
        </div>
      </Section>
    </>
  );
}
