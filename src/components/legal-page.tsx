import { PageHeader } from "@/components/ui";
import legal from "@/content/legal.json";

type Block = { heading: string | null; paragraphs: string[] };
type Doc = { title: string; blocks: Block[] };

const docs = legal as Record<string, Doc | undefined>;

export function LegalPage({
  slug,
  lede,
}: {
  slug: "privacy-policy" | "terms-of-use";
  lede: string;
}) {
  const doc = docs[slug];

  return (
    <>
      <PageHeader eyebrow="Legal" title={doc?.title ?? slug} lede={lede} />

      <section className="bg-paper">
        <div className="container-page py-16 md:py-24">
          <div className="container-prose prose-tc">
            {doc?.blocks.map((block, i) => (
              <section key={i}>
                {block.heading && <h2>{block.heading}</h2>}
                {block.paragraphs.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
