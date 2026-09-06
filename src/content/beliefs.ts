/**
 * The statement of faith, transcribed from TC-What-We-Believe.pdf.
 *
 * The PDF is the authoritative version — the old website's About page carried
 * the same thirteen statements with the scripture references stripped out.
 */

export type Belief = {
  title: string;
  body: string;
  references: string;
};

export const beliefs: Belief[] = [
  {
    title: "The Bible",
    body: "We believe that the Bible (the Old and New Testaments excluding the Apocrypha) is the inspired Word of God, the infallible, all-sufficient rule for faith and practice.",
    references: "2 Timothy 3:15-16; 2 Peter 1:21",
  },
  {
    title: "One True and Living God",
    body: "We believe in the unity of the One True and Living God who is the Eternal, Self-Existent “I AM”, who has also revealed Himself as One being co-existing in three Persons: Father, Son and Holy Spirit.",
    references: "Deuteronomy 6:4; Mark 12:29; Matthew 28:19; 2 Corinthians 13:14",
  },
  {
    title: "Virgin Birth",
    body: "We believe in the Virgin Birth, Sinless Life, Miraculous Ministry, Substitutionary Atoning Death, Bodily Resurrection, Triumphant Ascension and Abiding Intercession of the Lord Jesus Christ, and in His personal, visible, bodily return in power and glory as the blessed hope of all believers.",
    references:
      "Isaiah 7:14; Matthew 1:23; Hebrews 7:26; 1 Peter 2:22; Acts 2:22, 10:38; 2 Corinthians 5:21; Hebrews 9:12; Luke 24:39; 1 Corinthians 15:4; Acts 1:9; Ephesians 4:8-10; Romans 8:34; Hebrews 7:25; 1 Corinthians 15:22-24, 51-57; 1 Thessalonians 4:13-18; Revelation 20:1-6",
  },
  {
    title: "Fall of Man",
    body: "We believe in the fall of man, who was created pure and upright, but fell by voluntary transgression.",
    references: "Genesis 1:26-31, 3:1-7; Romans 5:12-21",
  },
  {
    title: "Salvation",
    body: "We believe in salvation through faith in Christ, who, according to the Scriptures, died for our sins, was buried and was raised from the dead on the third day, and that through His Blood we have Redemption.",
    references: "Titus 2:11, 3:5-7; Romans 10:8-15; 1 Corinthians 15:3-4",
  },
  {
    title: "Love",
    body: "This experience is also known as the new birth, and is an instantaneous and complete operation of the Holy Spirit upon initial faith in the Lord Jesus Christ.",
    references: "John 3:5-6; James 1:18; 1 Peter 1:23; 1 John 5:1",
  },
  {
    title: "Repentance",
    body: "We believe that all who have truly repented and believed in Christ as Lord and Saviour are commanded to be baptized by immersion in water in the name of the Father, the Son and the Holy Spirit.",
    references: "Matthew 28:19; Acts 10:47-48; Acts 2:38-39",
  },
  {
    title: "Holy Spirit",
    body: "We believe in the baptism in the Holy Spirit as an enduement of the believer with power for service and witnessing, and the essential, biblical evidence of which is the speaking with other tongues as the Spirit gives utterance.",
    references: "Acts 1:4-5, 8, 2:4, 10:44-46, 11:14-16, 19:6",
  },
  {
    title: "Gifts of the Holy Spirit",
    body: "We believe in the operation of the gifts of the Holy Spirit and the gifts of Christ in the Church today.",
    references: "1 Corinthians 12:4-11, 28; Ephesians 4:7-16",
  },
  {
    title: "Holiness",
    body: "We believe in holiness of life and conduct in obedience to the command of God.",
    references: "1 Peter 1:14-16; Hebrews 12:14; 1 Thessalonians 5:23; 1 John 2:6",
  },
  {
    title: "Deliverance",
    body: "We believe that deliverance from sickness, by Divine Healing, is provided for in the Atonement.",
    references: "Isaiah 53:4-5; Matthew 8:16-17; James 5:13-16",
  },
  {
    title: "Water Baptism",
    body: "We believe that all who have truly repented and believe in Christ as Lord and Saviour, and have received water baptism, should regularly participate in the Breaking of Bread.",
    references: "Luke 22:14-20; 1 Corinthians 11:20-34",
  },
  {
    title: "Resurrection",
    body: "We believe in the bodily resurrection of all people; the everlasting, conscious and quality life with God for all who truly believe in our Lord Jesus Christ; and the eternal separation from God, and conscious painful life, for all whose names are not written in the Book of Life.",
    references:
      "Daniel 12:2-3; John 5:28-29; 1 Corinthians 15:22-24; Matthew 25:46; 2 Thessalonians 1:9; Revelation 20:10-15",
  },
];

export const BELIEFS_PDF = "/media/2021/01/TC-What-We-Believe.pdf";
