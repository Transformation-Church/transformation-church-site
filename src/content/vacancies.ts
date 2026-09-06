/**
 * Open roles.
 *
 * Transcribed in full from the job description PDFs, so the detail pages carry
 * everything the PDF does — search engines and Google Jobs can't read a PDF
 * usefully, and neither can most people on a phone. The PDF stays available as
 * a download for anyone who wants it.
 *
 * Delete a role once it's filled: the vacancies page, its footer link and its
 * sitemap entries all disappear on their own when the list is empty or every
 * role has closed.
 */

import { site } from "@/lib/site";

export type VacancySection = {
  heading: string;
  body?: string[];
  list?: string[];
};

export type Vacancy = {
  slug: string;
  title: string;
  /** Contract shape, as advertised. */
  type: string;
  location: string;
  denomination: string;
  /** ISO date; the role stops showing the day after this. */
  closes: string;
  /** ISO date the role was first advertised — required by Google Jobs. */
  datePosted: string;
  summary: string;
  pdf: string;
  sections: VacancySection[];
  apply: { intro: string; items: string[]; outro?: string };
};

export const vacancies: Vacancy[] = [
  {
    slug: "youth-pastor",
    title: "Youth Pastor",
    type: "Full-time, permanent",
    location: `${site.address.town}, Birmingham`,
    denomination: "Pentecostal",
    closes: "2026-09-30",
    datePosted: "2026-07-01",
    summary:
      "We're looking for a Spirit-led Youth Pastor with a heart for walking alongside young people, mentoring them, grounding them in the Word, and leading the growth of our youth ministry.",
    pdf: "/media/2026/07/TC_Youth_Pastor_Job_Description.pdf",
    sections: [
      {
        heading: "About us",
        body: [
          "Transformation Church is a vibrant, Spirit-filled Pentecostal church with a vision to see lives transformed by the power of Christ's message. We are committed to raising a generation of young believers who know their identity in Christ, are sound in the Word, walk in the gifts of the Holy Spirit, and are passionate about witnessing Christ.",
        ],
      },
      {
        heading: "The role",
        body: [
          "We are seeking a Spirit-led Youth Pastor who has a heart for serving young people in their spiritual journey, mentoring and shaping young lives, and maintaining a passion for Christlikeness. You will be responsible for leading, developing and growing our youth ministry in alignment with BPF and TC's values and vision.",
        ],
      },
      {
        heading: "Key responsibilities",
        list: [
          "Lead and pastor the youth through mentoring, regular fellowships, Bible studies and other events",
          "Disciple young people in the Word, worship, prayer and spiritual gifts",
          "Use your experience to build a mission-focused culture",
          "Organise outreach events and youth conferences",
          "Equip and mentor youth to take up roles in the youth and church ministries",
          "Build strong relationships with parents, schools and the wider community",
          "Ensure safeguarding and child protection practices are followed",
          "Work in close fellowship with the Senior and Associate Ministers, assisting them in preaching and teaching, visiting families, counselling, and other ministerial duties as required",
          "Any other duties and responsibilities identified and assigned by the Senior and Associate Minister",
          "Provide administrative support as needed",
        ],
      },
      {
        heading: "Who we're looking for",
        list: [
          "An ordained minister from a Pentecostal denomination or accredited body who accepts BPF's statement of faith",
          "Willing to accept the mission and vision of the church",
          "A proven leader with significant experience in church-based youth ministry, teaching and delivering pastoral support",
          "A Spirit-led leader with a heart for youth",
          "Ministry experience, for example youth ministry, missions, evangelism or teaching",
          "Passionate about the Bible, evangelism and spiritual growth",
          "Culturally aware and able to relate to young people in the UK today",
          "Able to work in a multicultural environment",
          "Able to multi-task and remain self-motivated",
          "Committed to safeguarding best practices",
          "Theologically trained, to postgraduate level from an accredited body",
          "Proficient in spoken and written English. Fluency in Malayalam and Hindi is essential, given the South Asian community focus",
          "Holds a valid driving licence",
        ],
      },
      {
        heading: "Desirable qualities",
        list: [
          "A calling to work with young people, to raise young leaders and disciple them in biblical teaching",
          "An interest in apologetics",
          "Prayerful and grounded in God's Word",
          "Creative and enthusiastic",
          "A team player with strong communication skills",
        ],
      },
    ],
    apply: {
      intro: `Please send the following to ${site.contact.email}:`,
      items: [
        "Your CV",
        "A cover letter sharing your testimony, your calling to youth ministry, and your experience",
        "Two references, including one pastoral: a Christian leader and a local church pastor or previous employer",
      ],
      outro:
        "We look forward to hearing from you about how God may be calling you to serve His Kingdom alongside us.",
    },
  },
];

export function openVacancies(now = new Date()) {
  const today = now.toISOString().slice(0, 10);
  return vacancies.filter((v) => v.closes >= today);
}

export function getVacancy(slug: string) {
  return vacancies.find((v) => v.slug === slug);
}
