import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { Arrow, Button, PageHeader, Section } from "@/components/ui";
import { openVacancies } from "@/content/vacancies";
import { canonical } from "@/lib/seo";
import { jobPostingSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Vacancies",
  description:
    "Current job opportunities at Transformation Church, Rowley Regis, Birmingham.",
  ...canonical("/vacancies"),
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
      {roles.length > 0 && <JsonLd data={roles.map(jobPostingSchema)} />}

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
                key={role.slug}
                className="grid gap-x-16 gap-y-8 border-t border-rule pt-10 lg:grid-cols-12"
                data-reveal
              >
                <div className="lg:col-span-7">
                  <h2 className="font-display text-3xl">
                    <Link
                      href={`/vacancies/${role.slug}`}
                      className="group inline-flex items-baseline gap-3 transition-colors hover:text-accent"
                    >
                      {role.title}
                      <Arrow className="h-4 w-4" />
                    </Link>
                  </h2>
                  <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
                    {role.summary}
                  </p>

                  <div className="mt-9">
                    <Button href={`/vacancies/${role.slug}`}>
                      Read the job description
                    </Button>
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
                      <dt className="label text-ink-muted">{row.k}</dt>
                      <dd className="text-right text-ink-body">{row.v}</dd>
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
