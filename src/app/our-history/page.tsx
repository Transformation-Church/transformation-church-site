import type { Metadata } from "next";

import { canonical } from "@/lib/seo";
import { Button, PageHeader, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Our History",
  description:
    "From eleven people praying in a house in Sutton Coldfield in 2002 to a multilingual church in Rowley Regis: the story of Birmingham Pentecostal Fellowship.",
  ...canonical("/our-history"),
};

/**
 * Preserved close to verbatim from the original page — this is the founding
 * story of the church and the wording matters. Only paragraph breaks and
 * headings have been added for readability.
 */
const chapters = [
  {
    period: "Before 2004",
    title: "Pre-history",
    paragraphs: [
      "There was a flow of migrants belonging to south India, particularly Kerala, to the UK for work since the closing years of the 20th century. Most of them were female nurses. Some of them were Pentecostal believers, and they began to gather in various places for prayer.",
      "That is how a small prayer fellowship began in Malayalam, on 16 July 2002 in Sutton Coldfield. About 11 members gathered together on the first day to worship the Lord in one of the believers' houses. At the same time, another prayer group formed in Birmingham City Centre in 2003, and believers gathered from various areas like Selly Oak, Kings Heath and Small Heath. The former was named Birmingham Christian Fellowship (BCF) and the latter New Life Church (NLC).",
    ],
  },
  {
    period: "2004 to 2005",
    title: "Formation of BPF",
    paragraphs: [
      "Having realised the significance of unity for the furtherance of God's Kingdom and for His glory, the believers of both BCF and NLC decided to merge the groups together and move as a single unit with a new title: Birmingham Pentecostal Fellowship (BPF).",
      "They came together on Saturday 4 September 2004 and held a fasting prayer in Kings Heath. On the 5th of September, they had their first Sunday service together. People started coming from various locations of Birmingham and surrounding places. Mr K J Mathewkutty and Mr Sam T Varghese led various services of this Fellowship.",
      "Pastor Wessly Lukose from Rajasthan, India, who was doing his doctoral studies in theology at the University of Birmingham, took responsibility as the Senior Minister of BPF on 19 June 2005, at the request of the church.",
    ],
  },
  {
    period: "2009 to today",
    title: "Growth and recognition",
    paragraphs: [
      "The main language of worship was Malayalam, as almost all the existing members originally belonged to south India, particularly Kerala. The services have since evolved into a multilingual gathering, and people come from various parts of Birmingham and beyond.",
      "Cell groups formed in various places, and BPF now has ten such cells meeting during the week in Rowley Regis, Coventry, Northfield, Redditch, Sutton Coldfield, Walsall, Wolverhampton, Small Heath, Selly Oak and Worcester, aiming at prayerful discipleship and leadership. Outreach activities are conducted periodically in West Bromwich, Walsall, Coventry, Northfield, Erdington and Birmingham City Centre.",
      "On 9 September 2009, BPF was given the status of registered charity by the Charity Commission of the UK. BPF continues to grow, aiming to be a multilingual fellowship creating a Christ-like community.",
    ],
  },
];

export default function HistoryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our history"
        title="Eleven people, one front room, 2002"
        lede="Birmingham Pentecostal Fellowship is the first Indian Pentecostal community church in Birmingham, with Malayalam, the mother tongue of Kerala, as its original medium of worship."
      />

      <Section>
        <ol className="grid gap-16">
          {chapters.map((c, i) => (
            <li
              key={c.title}
              className="grid gap-x-16 gap-y-6 border-t border-rule pt-10 lg:grid-cols-12"
              data-reveal
            >
              <div className="lg:col-span-4">
                <p className="label flex items-center gap-3 text-ink/70">
                  <span className="tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="h-px w-6 bg-accent" />
                  {c.period}
                </p>
                <h2 className="mt-5 font-display text-2xl">{c.title}</h2>
              </div>

              <div className="prose-tc lg:col-span-7 lg:col-start-6">
                {c.paragraphs.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="ink" title="Come and be part of what's next">
        <div className="flex flex-wrap gap-4">
          <Button href="/visit" tone="paper">
            Plan your visit
          </Button>
          <Button href="/about" tone="outlineLight">
            What we believe
          </Button>
        </div>
      </Section>
    </>
  );
}
