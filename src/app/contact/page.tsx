import type { Metadata } from "next";

import { canonical } from "@/lib/seo";
import { ContactForm } from "@/components/contact-form";
import { Accordion, PageHeader, Section, TextLink } from "@/components/ui";
import { site, visitFaqs } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Fill out a connection card, send a prayer request, or just say hello. We'd love to hear from you.",
  ...canonical("/contact"),
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="We'd love to hear from you"
        lede="Fill out a connection card, send us a prayer request, or ask us anything at all. Someone from the team will come back to you."
      />

      <Section>
        <div className="grid gap-x-16 gap-y-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ContactForm />
          </div>

          <div className="lg:col-span-4 lg:col-start-9">
            <h2 className="label text-ink-muted">Other ways to reach us</h2>

            <dl className="mt-7 border-t border-rule">
              <div className="border-b border-rule py-6">
                <dt className="label text-ink-muted">Email</dt>
                <dd className="mt-2">
                  <a
                    href={`mailto:${site.contact.email}`}
                    className="link-underline font-display text-xl"
                  >
                    {site.contact.email}
                  </a>
                </dd>
              </div>

              <div className="border-b border-rule py-6">
                <dt className="label text-ink-muted">Visit</dt>
                <dd className="mt-2 leading-snug text-ink-muted">
                  {site.address.line1}
                  <br />
                  {site.address.town}
                  <br />
                  {site.address.postcode}
                </dd>
                <dd className="mt-4">
                  <TextLink href={site.address.maps} external>
                    Get directions
                  </TextLink>
                </dd>
              </div>

              <div className="border-b border-rule py-6">
                <dt className="label text-ink-muted">Social</dt>
                <dd className="mt-3 flex flex-col gap-2">
                  <a href={site.social.instagram} target="_blank" rel="noreferrer" className="link-underline text-ink-muted">
                    Instagram
                  </a>
                  <a href={site.social.facebook} target="_blank" rel="noreferrer" className="link-underline text-ink-muted">
                    Facebook
                  </a>
                  <a href={site.social.youtube} target="_blank" rel="noreferrer" className="link-underline text-ink-muted">
                    YouTube
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </Section>

      <Section tone="warm" eyebrow="Before you come" title="Are you new here?">
        <div className="lg:w-3/4">
          <Accordion items={visitFaqs} />
        </div>
      </Section>
    </>
  );
}
