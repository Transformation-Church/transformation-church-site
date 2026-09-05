import type { Metadata } from "next";

import { GalleryGrid } from "@/components/gallery-grid";
import { Accordion, PageHeader, Section } from "@/components/ui";
import { gallery, galleryImageCount } from "@/lib/content";
import { visitFaqs } from "@/lib/site";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Photographs from across the life of Transformation Church — Sunday services, mission outreach, anniversaries and events.",
};

export default function GalleryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Gallery"
        title="Photographs from the life of the church"
        lede={`${galleryImageCount} images from mission outreach, anniversaries and Sundays going back to 2013.`}
      />

      <section className="bg-paper">
        <div className="container-page py-16 md:py-20">
          <GalleryGrid categories={gallery} />
        </div>
      </section>

      <Section tone="warm" eyebrow="Before you come" title="Are you new here?">
        <div className="lg:w-3/4">
          <Accordion items={visitFaqs} />
        </div>
      </Section>
    </>
  );
}
