import { SermonList } from "@/components/sermon";
import { PageHeader, TextLink } from "@/components/ui";
import { formatDate, isExactDate, type Facet, type Sermon } from "@/lib/content";

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
  // Only dated sermons can bound the range, and undated ones sort last, so
  // taking the ends of the whole list would read a null date.
  const dated = sermons.filter((s) => isExactDate(s.date));
  const oldest = dated[dated.length - 1];
  const newest = dated[0];

  return (
    <>
      <PageHeader
        eyebrow={eyebrow}
        title={facet.name}
        lede={facet.description || undefined}
        meta={
          <dl className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <dt className="label text-paper-muted">Sermons</dt>
              <dd className="mt-2 font-display text-2xl tabular-nums text-paper">
                {sermons.length}
              </dd>
            </div>
            {newest && (
              <div>
                <dt className="label text-paper-muted">Most recent</dt>
                <dd className="mt-2 text-paper-body">{formatDate(newest.date!)}</dd>
              </div>
            )}
            {oldest && oldest !== newest && (
              <div>
                <dt className="label text-paper-muted">Earliest</dt>
                <dd className="mt-2 text-paper-body">{formatDate(oldest.date!)}</dd>
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
          <SermonList sermons={sermons} />
        </div>
      </section>
    </>
  );
}
