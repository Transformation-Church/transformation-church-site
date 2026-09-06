import Link from "next/link";

import { ArchiveImage } from "@/components/archive-image";
import { HomeHero } from "@/components/home-hero";
import { SermonCard } from "@/components/sermon";
import { Button, Section, TextLink } from "@/components/ui";
import { gallery, posts, sermons, formatDate } from "@/lib/content";
import { site } from "@/lib/site";

const values = [
  {
    name: "Worshipping",
    body: "Gathered every Sunday to worship God together, in English, in Malayalam, in one family.",
  },
  {
    name: "Witnessing",
    body: "Sharing the message of Christ across Birmingham and the Black Country, and beyond.",
  },
  {
    name: "Serving",
    body: "Caring practically for our neighbours, through the foodbank and the everyday work of the church.",
  },
];

export default function HomePage() {
  const latestSermons = sermons.slice(0, 3);
  const latestPosts = posts.slice(0, 3);

  // A few of the strongest frames from the archive, for the life-at-TC mosaic.
  const mosaic = gallery.flatMap((c) => c.images).slice(0, 5);

  return (
    <>
      <HomeHero />

      {/* ---------------------------------------------------------- welcome */}
      <Section index="01" eyebrow="Who we are" tone="paper">
        <div className="grid gap-x-16 gap-y-10 lg:grid-cols-12">
          <div className="lg:col-span-7" data-reveal>
            <p className="font-display text-2xl leading-[1.25] text-ink">
              Transformation Church is part of Birmingham Pentecostal
              Fellowship, the first Indian Pentecostal community church in
              Birmingham, and an accredited member of Assemblies of God, Great
              Britain.
            </p>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink/70">
              What began in 2002 as eleven people praying together in a house in
              Sutton Coldfield is now a multilingual church in Rowley Regis, with
              cell groups meeting across the West Midlands. We are a Christ-centred
              church, striving to be transformed into Christ-likeness so that we
              can transform our community and beyond.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Button href="/about">About the church</Button>
              <Button href="/our-history" tone="outline">
                Our history
              </Button>
            </div>
          </div>

          <div className="lg:col-span-4 lg:col-start-9" data-reveal>
            <h2 className="label text-ink/70">Our core values</h2>
            <dl className="mt-7 border-t border-rule">
              {values.map((v) => (
                <div key={v.name} className="border-b border-rule py-6">
                  <dt className="font-display text-xl">{v.name}</dt>
                  <dd className="mt-2 text-ink/70">{v.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------- sermons */}
      <Section
        index="02"
        eyebrow="Sermons"
        title="Teaching you can come back to"
        lede={`Every message we've recorded, all ${sermons.length} of them, with the preachers and series behind them.`}
        action={<TextLink href="/sermons">Browse the archive</TextLink>}
        tone="warm"
      >
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {latestSermons.map((s, i) => (
            <SermonCard key={s.slug} sermon={s} index={i} />
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------------ life */}
      <Section
        index="03"
        eyebrow="Life at TC"
        title="Twenty years of Sundays, outreach and everything in between"
        lede="Our gallery holds photographs from across the life of the church: mission trips, anniversaries, and the ordinary weeks that make up a congregation."
        action={<TextLink href="/gallery">See the gallery</TextLink>}
      >
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4" data-reveal>
          {mosaic[0] && (
            <ArchiveImage
              src={mosaic[0]}
              alt="Life at Transformation Church"
              className="col-span-2 aspect-[4/3] md:row-span-2 md:aspect-auto"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          )}
          {mosaic.slice(1, 5).map((src) => (
            <ArchiveImage
              key={src}
              src={src}
              alt=""
              className="aspect-square"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ))}
        </div>
      </Section>

      {/* -------------------------------------------------------- foodbank */}
      <section className="relative overflow-hidden bg-ink text-paper">
        <div className="container-page grid gap-x-16 gap-y-12 py-20 md:py-28 lg:grid-cols-12">
          <div className="lg:col-span-5" data-reveal>
            <p className="label mb-6 flex items-center gap-3 text-paper/55">
              <span className="tabular-nums">04</span>
              <span className="h-px w-8 bg-accent" />
              In the community
            </p>
            <h2 className="font-display text-3xl text-paper">Restore Foodbank</h2>
            <p className="mt-7 max-w-md text-lg leading-relaxed text-paper/65">
              We believe service to the community is service to God. Every
              Wednesday we distribute food to families and individuals in crisis,
              in partnership with the Black Country Food Bank.
            </p>
            <div className="mt-9">
              <Button href="/restore-foodbank" tone="paper">
                How it works
              </Button>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-px self-center lg:col-span-6 lg:col-start-7" data-reveal>
            {[
              { n: "440+", l: "People supported in 2023" },
              { n: "2,500+", l: "Kilos of food donated" },
              { n: "690+", l: "Kilos of non-food items" },
              { n: "10", l: "Volunteers" },
            ].map((s) => (
              <div key={s.l} className="border-t border-paper/12 py-8 pr-6">
                <dt className="font-display text-4xl text-paper">{s.n}</dt>
                <dd className="label mt-3 leading-relaxed text-paper/55">{s.l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* --------------------------------------------------------- writing */}
      {latestPosts.length > 0 && (
        <Section
          index="05"
          eyebrow="Read & listen"
          title="Words for your week"
          lede="Reflections and poetry from across the church, written to nourish and encourage."
          action={<TextLink href="/blog">All writing</TextLink>}
          tone="warm"
        >
          <div className="border-t border-rule">
            {latestPosts.map((p, i) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="group grid grid-cols-12 items-baseline gap-x-6 gap-y-2 border-b border-rule py-7 transition-colors duration-500 hover:border-ink/35"
                data-reveal
                style={{ ["--reveal-delay" as string]: `${i * 80}ms` }}
              >
                <span className="label col-span-12 text-ink/70 md:col-span-2">
                  {formatDate(p.date)}
                </span>
                <span className="col-span-12 md:col-span-7">
                  <span className="font-display text-2xl transition-transform duration-500 ease-[var(--ease-out-expo)] md:group-hover:translate-x-1">
                    {p.title}
                  </span>
                  {p.author && (
                    <span className="mt-1 block text-sm text-ink/70">
                      by {p.author}
                    </span>
                  )}
                </span>
                <span className="label col-span-12 text-accent md:col-span-3 md:text-right">
                  {p.categories[0]?.name}
                </span>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* ------------------------------------------------------------ visit */}
      <Section index="06" eyebrow="Come and see" title="You'd be very welcome">
        <div className="grid gap-x-16 gap-y-10 lg:grid-cols-12">
          <div className="lg:col-span-6" data-reveal>
            <p className="text-lg leading-relaxed text-ink/70">
              There&rsquo;s no dress code and nothing you need to bring. Expect
              contemporary worship led by our band, a talk rooted in the Bible,
              and someone to pray with you if you&rsquo;d like. There&rsquo;s
              plenty of free parking on site, and we&rsquo;re a three-minute walk
              from Rowley Regis station.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Button href="/visit">Plan your visit</Button>
              <Button href="/contact" tone="outline">
                Get in touch
              </Button>
            </div>
          </div>

          <address className="not-italic lg:col-span-4 lg:col-start-9" data-reveal>
            <h3 className="label text-ink/70">Find us</h3>
            <p className="mt-6 font-display text-2xl leading-snug">
              {site.address.line1}
              <br />
              {site.address.town}
              <br />
              {site.address.postcode}
            </p>
            <div className="mt-6">
              <TextLink href={site.address.maps} external>
                Open in Google Maps
              </TextLink>
            </div>
          </address>
        </div>
      </Section>
    </>
  );
}
