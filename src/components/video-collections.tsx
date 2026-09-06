import { FacebookEmbed, YouTubeEmbed } from "@/components/video-embed";
import type { VideoCollection } from "@/lib/content";

/** Shared body for the Kids Space and Spark pages. */
export function VideoCollections({
  collections,
}: {
  collections: VideoCollection[];
}) {
  if (collections.length === 0) {
    return (
      <p className="border-t border-rule py-16 text-lg text-ink/70">
        There&rsquo;s nothing here just yet. Check back soon.
      </p>
    );
  }

  return (
    <div className="grid gap-20">
      {collections.map((collection, i) => (
        <section key={collection.title} data-reveal>
          <div className="flex items-baseline gap-5 border-t border-rule pt-7">
            <span className="label tabular-nums text-ink/70">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h2 className="font-display text-2xl">{collection.title}</h2>
            <span className="label ml-auto text-ink/70">
              {collection.videos.length}{" "}
              {collection.videos.length === 1 ? "film" : "films"}
            </span>
          </div>

          <div
            className={`mt-8 grid gap-6 ${
              collection.videos.length === 1
                ? "lg:w-3/4"
                : "md:grid-cols-2 lg:gap-8"
            }`}
          >
            {collection.videos.map((video) =>
              video.provider === "youtube" ? (
                <YouTubeEmbed
                  key={video.id}
                  id={video.id}
                  title={collection.title}
                />
              ) : (
                <FacebookEmbed
                  key={video.url}
                  url={video.url}
                  title={collection.title}
                />
              ),
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
