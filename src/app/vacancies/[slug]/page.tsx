import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import { Button, PageHeader, Section, TextLink } from "@/components/ui";
import { getVacancy, openVacancies, vacancies } from "@/content/vacancies";
import { breadcrumbSchema, canonical, jobPostingSchema } from "@/lib/seo";
import { site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return vacancies.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const role = getVacancy(slug);
  if (!role) return {};

  return {
    title: `${role.title} | Vacancy`,
    description: role.summary,
    ...canonical(`/vacancies/${role.slug}`),
    openGraph: {
      type: "article",
      title: `${role.title} at ${site.name}`,
      description: role.summary,
    },
  };
}

const CLOSES = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export default async function VacancyPage({ params }: Props) {
  const { slug } = await params;
  const role = getVacancy(slug);
  if (!role) notFound();

  const stillOpen = openVacancies().some((v) => v.slug === role.slug);

  const facts = [
    { k: "Contract", v: role.type },
    { k: "Location", v: role.location },
    { k: "Denomination", v: role.denomination },
    { k: "Applications close", v: CLOSES.format(new Date(`${role.closes}T00:00:00Z`)) },
  ];

  return (
    <>
      <JsonLd
        data={[
          jobPostingSchema(role),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Vacancies", path: "/vacancies" },
            { name: role.title, path: `/vacancies/${role.slug}` },
          ]),
        ]}
      />

      <PageHeader
        eyebrow="Vacancy"
        title={role.title}
        lede={role.summary}
        meta={
          <dl className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {facts.map((f) => (
              <div key={f.k}>
                <dt className="label text-paper/40">{f.k}</dt>
                <dd className="mt-2 text-paper/85">{f.v}</dd>
              </div>
            ))}
          </dl>
        }
      >
        <div className="mt-10">
          <TextLink href="/vacancies" tone="paper">
            All vacancies
          </TextLink>
        </div>
      </PageHeader>

      {!stillOpen && (
        <div className="bg-accent/10">
          <div className="container-page py-6">
            <p className="text-ink/75">
              <strong className="font-semibold">This role has closed.</strong>{" "}
              Applications were accepted until{" "}
              {CLOSES.format(new Date(`${role.closes}T00:00:00Z`))}. Do{" "}
              <a href="/contact" className="link-underline">
                get in touch
              </a>{" "}
              if you&rsquo;d still like to serve with us.
            </p>
          </div>
        </div>
      )}

      <Section>
        <div className="grid gap-x-16 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {role.sections.map((section, i) => (
              <section
                key={section.heading}
                className={i > 0 ? "mt-14" : ""}
                data-reveal
              >
                <h2 className="font-display text-2xl">{section.heading}</h2>

                {section.body?.map((p, j) => (
                  <p key={j} className="mt-5 text-lg leading-relaxed text-ink/75">
                    {p}
                  </p>
                ))}

                {section.list && (
                  <ul className="mt-6 border-t border-rule">
                    {section.list.map((item) => (
                      <li
                        key={item}
                        className="flex gap-4 border-b border-rule py-4 leading-relaxed text-ink/75"
                      >
                        <span
                          aria-hidden
                          className="mt-[0.65em] h-px w-4 shrink-0 bg-accent"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            {/* how to apply */}
            <section className="mt-16 border-t border-rule pt-10" data-reveal>
              <h2 className="font-display text-2xl">How to apply</h2>
              <p className="mt-5 text-lg leading-relaxed text-ink/75">
                {role.apply.intro}
              </p>
              <ul className="mt-6 border-t border-rule">
                {role.apply.items.map((item) => (
                  <li
                    key={item}
                    className="flex gap-4 border-b border-rule py-4 leading-relaxed text-ink/75"
                  >
                    <span
                      aria-hidden
                      className="mt-[0.65em] h-px w-4 shrink-0 bg-accent"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {role.apply.outro && (
                <p className="mt-7 text-lg leading-relaxed text-ink/75">
                  {role.apply.outro}
                </p>
              )}

              {stillOpen && (
                <div className="mt-9">
                  <Button
                    href={`mailto:${site.contact.email}?subject=${encodeURIComponent(
                      `Application: ${role.title}`,
                    )}`}
                    external
                  >
                    Apply by email
                  </Button>
                </div>
              )}
            </section>
          </div>

          {/* aside */}
          <aside className="lg:col-span-3 lg:col-start-10">
            <div className="lg:sticky lg:top-[calc(var(--header-height)+2rem)]">
              <h2 className="label text-ink/45">At a glance</h2>
              <dl className="mt-6 border-t border-rule">
                {facts.map((f) => (
                  <div key={f.k} className="border-b border-rule py-4">
                    <dt className="label text-ink/40">{f.k}</dt>
                    <dd className="mt-1.5 text-ink/80">{f.v}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-8">
                <TextLink href={role.pdf} external>
                  Download as PDF
                </TextLink>
              </div>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
