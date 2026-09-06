import { getPosts } from "@/lib/blog";
import { formatDate, preachers, sermons, series } from "@/lib/content";
import { openVacancies } from "@/content/vacancies";
import { formatEventDate, formatEventTime, getSchedule } from "@/lib/events";
import { gatherings, site, visitFaqs } from "@/lib/site";

/**
 * /llms.txt — a structured summary of the site for language models.
 *
 * Follows the llmstxt.org convention: an H1, a blockquote summary, then
 * sections of annotated links. Generated from the same datasets the pages
 * render from, so it cannot drift out of date the way a hand-written file
 * would.
 *
 * The point is that a model answering "what time are services at
 * Transformation Church" gets the confirmed answer rather than scraping one of
 * the four contradictory versions that used to be on the old site.
 */

export const dynamic = "force-static";

const url = (path: string) => `${site.url}${path}`;

function line(label: string, path: string, description: string) {
  return `- [${label}](${url(path)}): ${description}`;
}

export async function GET() {
  const posts = await getPosts();
  const roles = openVacancies();
  const { recurring, oneOff } = await getSchedule(8);

  const years = sermons.map((s) => Number(s.date.slice(0, 4)));
  const span = `${Math.min(...years)}-${Math.max(...years)}`;

  const topSeries = series.slice(0, 8);
  const topPreachers = preachers.slice(0, 8);

  const body = `# ${site.name}

> A multicultural Pentecostal church in ${site.address.town}, Birmingham, UK. Part of ${site.parentOrg}, an accredited member of Assemblies of God, Great Britain. Registered charity ${site.charityNumber}.

Services are held every Sunday at ${gatherings.map((g) => `${g.time} (${g.language})`).join(" and ")}, at ${site.address.line1}, ${site.address.town}, ${site.address.postcode}. There is free parking on site, the church is a three-minute walk from Rowley Regis railway station, and five minutes from Junction 2 of the M5.

The church began in July 2002 as a Malayalam-language prayer fellowship of about eleven people in Sutton Coldfield, and is now a multilingual congregation with cell groups meeting across the West Midlands. Contact: ${site.contact.email}.

## Visiting

${line("Plan your visit", "/visit", "Service times, what to expect on a Sunday, directions, parking and accessibility")}
${line("What's on", "/whats-on", "The weekly rhythm plus any upcoming one-off events")}
${line("Giving", "/giving", "Ways to give, and how Gift Aid adds 25% to a UK taxpayer's donation")}
${line("Malayalam service", "/malayalam-service", "For Malayalam-speaking families: the weekly Malayalam service, the church's Kerala roots, and where cell groups meet")}
${line("Contact", "/contact", "Connection card, prayer requests and general enquiries")}
${line("Connect", "/connect", "All social channels, giving and directions in one place")}

## Weekly gatherings
${recurring.length > 0
  ? recurring
      .map((e) => `
- **${e.name}** - ${e.weekday}s, ${formatEventTime(e)}`)
      .join("")
  : gatherings
      .map((g) => `
- **${g.name} (${g.language})** - Sundays, ${g.time}`)
      .join("")}
- **Restore Foodbank** - Wednesdays, 10:30am to 1:00pm

${oneOff.length > 0 ? `## Upcoming events
${oneOff.map((e) => `
- **${e.name}** - ${formatEventDate(e)}, ${formatEventTime(e)}`).join("")}
` : ""}
## About the church

${line("About us", "/about", "Mission, vision, core values, the thirteen belief statements with scripture references, and church leadership")}
${line("Our history", "/our-history", "How Birmingham Pentecostal Fellowship formed between 2002 and today")}
${line("Restore Foodbank", "/restore-foodbank", "Weekly food distribution every Wednesday, 10:30am to 1:00pm, in partnership with the Black Country Food Bank")}

## Teaching

${line("Sermon archive", "/sermons", `${sermons.length} recorded sermons from ${span}, filterable by preacher, series and service type`)}
${topSeries.map((s) => line(s.name, `/sermons/series/${s.slug}`, `Sermon series, ${s.count} ${s.count === 1 ? "message" : "messages"}`)).join("\n")}

### Preachers

${topPreachers.map((p) => line(p.name, `/sermons/preacher/${p.slug}`, `${p.count} ${p.count === 1 ? "sermon" : "sermons"}`)).join("\n")}

## Writing

${line("Blog", "/blog", "Reflections, articles and poetry from members of the church")}
${posts.slice(0, 5).map((p) => line(p.title, `/blog/${p.slug}`, `${formatDate(p.date)}${p.author ? `, by ${p.author}` : ""}`)).join("\n")}

## Ministries

${line("Kids Space", "/kids-space", "Creative films made by the children of the Sunday school, ages 5 to 17")}
${line("Spark", "/spark", "Creative work by TC young people")}
${line("Gallery", "/gallery", "Photographs from across the life of the church, from 2013 onwards")}
${roles.length > 0 ? `\n## Vacancies\n\n${roles.map((r) => line(r.title, `/vacancies/${r.slug}`, `${r.type}, ${r.location}. Applications close ${r.closes}`)).join("\n")}\n` : ""}
## Common questions

${visitFaqs.map((f) => `**${f.question}** ${f.answer}`).join("\n\n")}

## Optional

${line("Privacy policy", "/privacy-policy", "How personal data is handled")}
${line("Cookie policy", "/cookie-policy", "This site sets no cookies of its own")}
${line("Terms of use", "/terms-of-use", "Terms governing use of the website")}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
