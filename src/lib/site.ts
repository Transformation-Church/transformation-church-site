/**
 * Single source of truth for the details that appear across the site.
 * The service schedule here is the one Joe confirmed at handover and replaces
 * the four contradictory versions on the old WordPress site.
 */

export const site = {
  name: "Transformation Church",
  shortName: "TC",
  tagline: "Rowley Regis, Birmingham",
  description:
    "A multicultural Pentecostal church in Rowley Regis, Birmingham. Part of Birmingham Pentecostal Fellowship, an accredited member of Assemblies of God, Great Britain.",
  url: "https://www.transformationchurch.co.uk",
  charityNumber: "1208306",
  parentOrg: "Birmingham Pentecostal Fellowship",

  address: {
    line1: "1 Station Road",
    town: "Rowley Regis",
    postcode: "B65 0LJ",
    country: "United Kingdom",
    maps: "https://maps.app.goo.gl/w2Mh2DpbEgfrguY88",
  },

  contact: {
    email: "info@bpfministries.com",
  },

  social: {
    facebook: "https://www.facebook.com/TransformationChurchBham",
    youtube: "https://www.youtube.com/c/TransformationChurchUK",
    instagram: "https://www.instagram.com/transformationchurchuk",
    linktree: "https://linktr.ee/transformationchurchbham",
  },

  /** ChurchSuite account subdomain — drives event, giving and group embeds. */
  churchSuite: {
    account: "transformationchurchgb",
    get base() {
      return `https://${this.account}.churchsuite.com`;
    },
  },
} as const;

export type Gathering = {
  name: string;
  day: string;
  time: string;
  /** 24h start, for sorting and structured data. */
  start: string;
  language?: string;
  note?: string;
};

/** Confirmed schedule. Sunday services are the two headline gatherings. */
export const gatherings: Gathering[] = [
  {
    name: "Sunday Service",
    day: "Sunday",
    time: "10:00am",
    start: "10:00",
    language: "English",
  },
  {
    name: "Sunday Service",
    day: "Sunday",
    time: "12:00pm",
    start: "12:00",
    language: "Malayalam",
  },
];

export const navigation = [
  { label: "About", href: "/about" },
  { label: "Sermons", href: "/sermons" },
  { label: "Gallery", href: "/gallery" },
  { label: "Blog", href: "/blog" },
  { label: "Foodbank", href: "/restore-foodbank" },
  { label: "Contact", href: "/contact" },
];

/** Secondary links surfaced in the footer rather than the main nav. */
export const footerLinks = [
  { label: "Our History", href: "/our-history" },
  { label: "Kids Space", href: "/kids-space" },
  { label: "Spark", href: "/spark" },
  { label: "Connect With Us", href: "/connect" },
];

export const legalLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Use", href: "/terms-of-use" },
  { label: "Cookie Policy", href: "/cookie-policy" },
];

/**
 * The "Are you new here?" answers, shown on the visit-oriented pages.
 * Kept in one place because the old site had them duplicated six times and
 * they had drifted apart.
 */
export const visitFaqs = [
  {
    question: "What time does it start?",
    answer:
      "We gather every Sunday at 10:00am for our English service and 12:00pm for our Malayalam service. Come a little early if you'd like a coffee and a chat first.",
  },
  {
    question: "Where is the church?",
    answer: `You'll find us at ${site.address.line1}, ${site.address.town}, ${site.address.postcode}.`,
  },
  {
    question: "How do I get here?",
    answer:
      "We're five minutes from Junction 2 of the M5 and a three-minute walk from Rowley Regis railway station. The 4, 4H and 4M bus routes all stop nearby.",
  },
  {
    question: "Where can I park?",
    answer: "There is plenty of free parking on site.",
  },
  {
    question: "What should I expect?",
    answer:
      "Contemporary worship led by our band, a talk rooted in the Bible, and time to pray with someone if you'd like to. Come as you are — there's no dress code.",
  },
];
