import { SermonRow } from "@/components/sermon";
import { PageHeader, TextLink } from "@/components/ui";
import { formatDate, type Facet, type Sermon } from "@/lib/content";

/** Shared layout for the preacher and series archives. */
export function FacetArchive({
  eyebrow,
  facet,
  sermons,
}: {
  eyebrow: string;
  facet: Facet;
  sermons: Sermon[];
}) {
  const oldest = sermons[sermons.length - 1];
  const newest = sermons[0];

  return (
    <>
      <PageHeader
        eyebrow={eyebrow}
        title={facet.name}
        lede={facet.description || undefined}
        meta={
          <dl className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <dt className="label text-paper/40">Sermons</dt>
              <dd className="mt-2 font-display text-2xl tabular-nums text-paper">
                {sermons.length}
              </dd>
            </div>
            {newest && (
              <div>
                <dt className="label text-paper/40">Most recent</dt>
                <dd className="mt-2 text-paper/85">{formatDate(newest.date)}</dd>
              </div>
            )}
            {oldest && oldest !== newest && (
              <div>
                <dt className="label text-paper/40">Earliest</dt>
                <dd className="mt-2 text-paper/85">{formatDate(oldest.date)}</dd>
              </div>
            )}
          </dl>
        }
      >
        <div className="mt-10">
          <TextLink href="/sermons" tone="paper">
            Back to all sermons
          </TextLink>
        </div>
      </PageHeader>

      <section className="bg-paper">
        <div className="container-page py-16 md:py-20">
          <div className="border-t border-rule">
            {sermons.map((s) => (
              <SermonRow key={s.slug} sermon={s} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
