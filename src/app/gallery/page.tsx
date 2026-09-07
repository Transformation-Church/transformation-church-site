import type { Metadata } from "next";

import { canonical } from "@/lib/seo";
import { GalleryGrid } from "@/components/gallery-grid";
import { InstagramFeed } from "@/components/instagram-feed";
import { Accordion, PageHeader, Section, TextLink } from "@/components/ui";
import { gallery, galleryImageCount } from "@/lib/content";
import { site, visitFaqs } from "@/lib/site";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Photographs from across the life of Transformation Church: Sunday services, mission outreach, anniversaries and events.",
  ...canonical("/gallery"),
};

export default function GalleryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Gallery"
        title="Photographs from the life of the church"
        lede={`${galleryImageCount} images from mission outreach, anniversaries and Sundays going back to 2013.`}
      />

      {/* Instagram first: it is the only part of this page that changes week
          to week, and it answers "what is this church like now" in a way a
          2013 photograph cannot. The archive below is the deeper record. */}
      <Section
        index="01"
        eyebrow="Follow along"
        title="From our Instagram"
        action={
          <TextLink href={site.social.instagram} external>
            @transformationchurchuk
          </TextLink>
        }
        tone="warm"
      >
        <InstagramFeed />
      </Section>

      <Section
        index="02"
        eyebrow="The archive"
        title="Photographs from across the years"
        lede={`${galleryImageCount} images, filterable by what was happening.`}
      >
        <GalleryGrid categories={gallery} />
      </Section>

      <Section tone="warm" eyebrow="Before you come" title="Are you new here?">
        <div className="lg:w-3/4">
          <Accordion items={visitFaqs} />
        </div>
      </Section>
    </>
  );
}
