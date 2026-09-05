import type { Metadata } from "next";

import { Button, PageHeader, Section, TextLink } from "@/components/ui";
import { openVacancies, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Vacancies",
  description:
    "Current job opportunities at Transformation Church, Rowley Regis, Birmingham.",
};

const CLOSES = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export default function VacanciesPage() {
  const roles = openVacancies();

  return (
    <>
      <PageHeader
        eyebrow="Work with us"
        title={roles.length > 0 ? "Join the team" : "No current vacancies"}
        lede={
          roles.length > 0
            ? "We're looking for people who want to serve this church and this community."
            : "There are no open roles at the moment. Do check back, or get in touch if you'd like to volunteer."
        }
      />

      <Section>
        {roles.length === 0 ? (
          <div className="flex flex-wrap gap-4">
            <Button href="/contact">Get in touch</Button>
          </div>
        ) : (
          <ul className="grid gap-12">
            {roles.map((role) => (
              <li
                key={role.title}
                className="grid gap-x-16 gap-y-8 border-t border-rule pt-10 lg:grid-cols-12"
                data-reveal
              >
                <div className="lg:col-span-7">
                  <h2 className="font-display text-3xl">{role.title}</h2>
                  <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/70">
                    {role.summary}
                  </p>

                  <div className="mt-9 flex flex-wrap items-center gap-4">
                    <Button href={role.pdf} external>
                      Read the job description
                    </Button>
                    <TextLink href={`mailto:${site.contact.email}?subject=${encodeURIComponent(`Application: ${role.title}`)}`}>
                      Apply by email
                    </TextLink>
                  </div>
                </div>

                <dl className="lg:col-span-4 lg:col-start-9">
                  {[
                    { k: "Contract", v: role.type },
                    { k: "Location", v: role.location },
                    {
                      k: "Applications close",
                      v: CLOSES.format(new Date(`${role.closes}T00:00:00Z`)),
                    },
                  ].map((row) => (
                    <div
                      key={row.k}
                      className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-rule py-4 first:border-t"
                    >
                      <dt className="label text-ink/40">{row.k}</dt>
                      <dd className="text-right text-ink/80">{row.v}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
