import type { Metadata } from "next";

import { InstagramFeed } from "@/components/instagram-feed";
import { Button, PageHeader, Section, TextLink } from "@/components/ui";
import { BELIEFS_PDF, beliefs } from "@/content/beliefs";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Transformation Church is part of Birmingham Pentecostal Fellowship, an accredited member of Assemblies of God, Great Britain. Our mission, vision, values and what we believe.",
};

const leadership = [
  { name: "Dr Wessly Lukose", role: "Senior Minister" },
  { name: "Dr Joy T Samuel", role: "Minister" },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About us"
        title="A Christ-centred church, being transformed"
        lede="Transformation Church is an integral part of Birmingham Pentecostal Fellowship, an accredited member of Assemblies of God, Great Britain."
      />

      {/* --------------------------------------------------- mission/vision */}
      <Section index="01" eyebrow="Mission & vision">
        <div className="grid gap-x-16 gap-y-12 lg:grid-cols-2">
          <div data-reveal>
            <h3 className="font-display text-2xl">Our mission</h3>
            <p className="mt-5 text-lg leading-relaxed text-ink/70">
              We involve ourselves in evangelism, church planting and church
              growth, pastoral care and charity work. We also promote and
              preserve holistic development through spiritual and material
              means, including prayer, counselling and support.
            </p>
          </div>
          <div data-reveal style={{ ["--reveal-delay" as string]: "100ms" }}>
            <h3 className="font-display text-2xl">Our vision</h3>
            <p className="mt-5 text-lg leading-relaxed text-ink/70">
              To become a leading multicultural and multi-directional
              fellowship, transformed so as to impact lives and communities with
              the power of the Holy Spirit, the transformative message of
              Christ, and Christ-like nature.
            </p>
          </div>
        </div>

        <blockquote
          className="mt-16 max-w-4xl border-t border-rule pt-10 font-display text-2xl leading-[1.3]"
          data-reveal
        >
          Ours is a Christ-centred church, striving to be transformed into
          Christ-likeness — to transform our community and beyond with the love
          and message of Christ. God has a unique purpose for your life.
        </blockquote>
      </Section>

      {/* -------------------------------------------------------- believe */}
      <Section
        index="02"
        eyebrow="What we believe"
        title="Thirteen convictions"
        lede="These statements are shared across Assemblies of God, Great Britain, and shape everything we teach."
        action={
          <TextLink href={BELIEFS_PDF} external>
            Download the full statement
          </TextLink>
        }
        tone="warm"
      >
        <ol className="grid gap-x-14 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
          {beliefs.map((b, i) => (
            <li
              key={b.title}
              className="border-t border-rule pt-6"
              data-reveal
              style={{ ["--reveal-delay" as string]: `${(i % 3) * 80}ms` }}
            >
              <span className="label tabular-nums text-ink/35">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-display text-xl">{b.title}</h3>
              <p className="mt-3 leading-relaxed text-ink/70">{b.body}</p>
              <p className="mt-4 text-sm leading-relaxed text-ink/45">
                {b.references}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      {/* ----------------------------------------------------- leadership */}
      <Section
        index="03"
        eyebrow="Our team"
        title="Leadership"
        lede="Our leadership is made up of pastors, the church council and the ministry support team, supported by a team of volunteers who look after our key departments."
      >
        <ul className="grid gap-x-14 gap-y-8 border-t border-rule pt-10 sm:grid-cols-2 lg:w-2/3">
          {leadership.map((p) => (
            <li key={p.name} data-reveal>
              <h3 className="font-display text-2xl">{p.name}</h3>
              <p className="label mt-2 text-ink/45">{p.role}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* ------------------------------------------------------- history */}
      <section className="bg-ink-deep text-paper">
        <div className="container-page grid gap-x-16 gap-y-8 py-20 md:py-24 lg:grid-cols-12">
          <div className="lg:col-span-7" data-reveal>
            <p className="label mb-6 flex items-center gap-3 text-paper/45">
              <span className="tabular-nums">04</span>
              <span className="h-px w-8 bg-accent" />
              Since 2002
            </p>
            <h2 className="font-display text-3xl text-paper">
              Eleven people, one front room in Sutton Coldfield
            </h2>
          </div>
          <div className="flex flex-col items-start gap-7 lg:col-span-4 lg:col-start-9" data-reveal>
            <p className="text-lg leading-relaxed text-paper/65">
              The story of how a Malayalam prayer fellowship became a
              multilingual church with cell groups across the West Midlands.
            </p>
            <Button href="/our-history" tone="paper">
              Read our history
            </Button>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------- instagram */}
      <Section
        index="05"
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
    </>
  );
}
