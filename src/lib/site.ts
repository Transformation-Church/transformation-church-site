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
    "Malayalam, English and Hindi Pentecostal church in Rowley Regis, Birmingham. Part of Birmingham Pentecostal Fellowship, an accredited member of Assemblies of God, Great Britain. Everyone welcome on Sundays.",
  url: "https://www.transformationchurch.co.uk",
  charityNumber: "1208306",
  parentOrg: "Birmingham Pentecostal Fellowship",

  address: {
    line1: "1 Station Road",
    town: "Rowley Regis",
    postcode: "B65 0LJ",
    country: "United Kingdom",
    // From the ChurchSuite site record, not estimated.
    latitude: 52.477975,
    longitude: -2.034637,
    // Long-form place URL rather than a maps.app.goo.gl short link. The old
    // site used one of those and it now returns "Dynamic Link Not Found",
    // because Google retired the dynamic-link service behind them. This form
    // points at the same Business Profile listing and does not depend on it.
    maps: "https://www.google.com/maps/place/Transformation+Church+UK+(+Part+of+BPF+Ministries)/@52.4779727,-2.0346321,17z/data=!4m6!3m5!1s0x4870970726982b27:0xa004ed42e300a1ff",
  },

  contact: {
    email: "info@bpfministries.com",
  },

  social: {
    facebook: "https://www.facebook.com/TransformationChurchBham",
    youtube: "https://www.youtube.com/c/TransformationChurchUK",
    instagram: "https://www.instagram.com/transformationchurchuk",
    /**
     * Behold republishes the Instagram account as plain JSON, which is what
     * InstagramFeed reads. Not a secret: it is a public, read-only endpoint
     * meant to be fetched by a browser, so it lives here rather than in an
     * environment variable nobody can see. INSTAGRAM_FEED_URL still overrides
     * it, for pointing a preview at a different feed.
     */
    instagramFeed: "https://feeds.behold.so/QXqO4YThKYHSPuAd1E2w",
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

/**
 * Fallback only. ChurchSuite is the source of truth for service times, read via
 * getGatherings() in src/lib/events.ts. This list is used when the calendar
 * feed is unreachable, so a build during an outage still ships correct Sunday
 * times rather than an empty schedule. It deliberately omits the Friday Hindi
 * service, which exists only in ChurchSuite.
 */
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

/**
 * Where the midweek cell groups meet, alphabetically.
 *
 * Some entries pair two towns because one group serves both. Listed once here
 * because the Malayalam page shows it as a list and answers a question with it
 * in prose, and those two drifted apart last time.
 */
export const cellGroups = [
  "Coventry and Corby",
  "Northfield and Redditch",
  "Rowley Regis",
  "Selly Oak",
  "Small Heath",
  "Sutton Coldfield",
  "Walsall and Wolverhampton",
  "Worcester and Evesham",
];

/** The same places as individual towns, for running text. */
export const cellGroupTowns = cellGroups
  .flatMap((entry) => entry.split(" and "))
  .sort((a, b) => a.localeCompare(b, "en-GB"));

/**
 * Restore Foodbank, from its own returns for 2023, 2024 and 2025 added
 * together.
 *
 *   people      253 + 303 + 249 adults, 189 + 212 + 116 children  = 1,322
 *   food        2639 + 2858 + 2148.6 kg distributed               = 7,645.60
 *   non-food    641 + 257 + 230.62 kg distributed                 = 1,128.62
 *
 * Rounded down, so the plus sign is honest: each figure is at least this.
 *
 * These are what the foodbank gave out, not what came in. The donation lines
 * in the same returns are much smaller, because most stock arrives through the
 * Black Country Food Bank rather than as direct gifts, so they understate the
 * work. The labels have to keep saying distributed.
 *
 * Here rather than on a page because the homepage and the foodbank page both
 * show them, and last time they were written out twice the homepage was left
 * on the 2023 figures.
 */
export const foodbankStats = [
  { value: "1,300+", label: "People used our service since 2023" },
  { value: "10", label: "Volunteers" },
  { value: "7,600+", label: "Kilos of food distributed" },
  { value: "1,100+", label: "Kilos of non-food items distributed" },
];

export const navigation = [
  { label: "About", href: "/about" },
  { label: "What's On", href: "/whats-on" },
  { label: "Sermons", href: "/sermons" },
  { label: "Foodbank", href: "/restore-foodbank" },
  { label: "Give", href: "/giving" },
  { label: "Contact", href: "/contact" },
];

/** Secondary links surfaced in the footer rather than the main nav. */
export const footerLinks = [
  { label: "Malayalam Service", href: "/malayalam-service" },
  { label: "Blog", href: "/blog" },
  { label: "Gallery", href: "/gallery" },
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
      "Contemporary worship led by our band, a talk rooted in the Bible, and time to pray with someone if you'd like to. Come as you are. There's no dress code.",
  },
];
