/**
 * Canonical URLs and structured data.
 *
 * Structured data is what lets search engines and language models describe the
 * church accurately rather than guessing from page text: service times, the
 * address, who preached what, and which roles are open.
 *
 * Every builder returns plain JSON-LD objects. Nothing here invents facts —
 * geo coordinates, for example, are deliberately omitted because we don't have
 * surveyed values, and a wrong pin is worse than no pin.
 */

import type { Sermon } from "@/lib/content";
import type { BlogPost } from "@/lib/blog";
import type { Vacancy } from "@/content/vacancies";
import { gatherings, site, visitFaqs } from "@/lib/site";

export const ORG_ID = `${site.url}/#church`;

export function canonical(path = "/") {
  return { alternates: { canonical: path } };
}

export function absolute(path: string) {
  return path.startsWith("http") ? path : `${site.url}${path}`;
}

/* ------------------------------------------------------------------ church */

const DAY = "https://schema.org/Sunday";

export function churchSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Church",
    "@id": ORG_ID,
    name: site.name,
    alternateName: "TC",
    url: site.url,
    logo: absolute("/brand/logo-light.png"),
    image: absolute("/brand/logo-light.png"),
    description: site.description,
    email: site.contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.line1,
      addressLocality: site.address.town,
      addressRegion: "West Midlands",
      postalCode: site.address.postcode,
      addressCountry: "GB",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.address.latitude,
      longitude: site.address.longitude,
    },
    hasMap: site.address.maps,
    parentOrganization: {
      "@type": "Organization",
      name: site.parentOrg,
      description:
        "An accredited member of Assemblies of God, Great Britain, and a registered charity in England and Wales.",
    },
    sameAs: [site.social.facebook, site.social.youtube, site.social.instagram],
    // Registered Charitable Incorporated Organisation.
    identifier: {
      "@type": "PropertyValue",
      propertyID: "Charity Commission for England and Wales",
      value: site.charityNumber,
    },
    openingHoursSpecification: gatherings.map((g) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: DAY,
      opens: g.start,
      name: `${g.name} (${g.language})`,
    })),
    event: gatherings.map((g) => ({
      "@type": "Event",
      name: `${g.name} (${g.language})`,
      eventSchedule: {
        "@type": "Schedule",
        byDay: DAY,
        startTime: g.start,
        repeatFrequency: "P1W",
      },
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: { "@id": ORG_ID },
      organizer: { "@id": ORG_ID },
      isAccessibleForFree: true,
      inLanguage: g.language,
    })),
  };
}

/* ------------------------------------------------------------------ sermon */

export function sermonSchema(sermon: Sermon, poster: string | null) {
  if (!sermon.youtubeId) return null;

  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: sermon.title,
    description:
      sermon.description.slice(0, 300) ||
      `${sermon.title}, preached at ${site.name}.`,
    uploadDate: `${sermon.date}T00:00:00Z`,
    thumbnailUrl: poster ? absolute(poster) : undefined,
    embedUrl: `https://www.youtube-nocookie.com/embed/${sermon.youtubeId}`,
    url: `${site.url}/sermons/${sermon.slug}`,
    publisher: { "@id": ORG_ID },
    ...(sermon.preacher
      ? { author: { "@type": "Person", name: sermon.preacher.name } }
      : {}),
    ...(sermon.series ? { partOfSeries: sermon.series.name } : {}),
  };
}

/* -------------------------------------------------------------- blog post */

export function blogPostSchema(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt.slice(0, 300),
    datePublished: `${post.date}T00:00:00Z`,
    url: `${site.url}/blog/${post.slug}`,
    mainEntityOfPage: `${site.url}/blog/${post.slug}`,
    publisher: { "@id": ORG_ID },
    ...(post.author
      ? { author: { "@type": "Person", name: post.author } }
      : { author: { "@id": ORG_ID } }),
    ...(post.image ? { image: absolute(post.image) } : {}),
    ...(post.categories.length
      ? { articleSection: post.categories.map((c) => c.name) }
      : {}),
  };
}

/* --------------------------------------------------------------- vacancy */

export function jobPostingSchema(role: Vacancy) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: role.title,
    description: role.summary,
    employmentType: "FULL_TIME",
    industry: "Religious Institutions",
    datePosted: role.datePosted,
    validThrough: `${role.closes}T23:59:59Z`,
    hiringOrganization: { "@id": ORG_ID },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        streetAddress: site.address.line1,
        addressLocality: site.address.town,
        addressRegion: "West Midlands",
        postalCode: site.address.postcode,
        addressCountry: "GB",
      },
    },
    directApply: false,
    url: `${site.url}/vacancies/${role.slug}`,
  };
}

/* -------------------------------------------------------------------- faq */

export function faqSchema(
  items: { question: string; answer: string }[] = visitFaqs,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

/* ------------------------------------------------------------- breadcrumbs */

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: step.name,
      item: `${site.url}${step.path}`,
    })),
  };
}
