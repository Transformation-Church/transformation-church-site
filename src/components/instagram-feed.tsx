import { Button } from "@/components/ui";
import { site } from "@/lib/site";

/**
 * Instagram grid.
 *
 * Instagram's Basic Display API was shut down in December 2024, and the npm
 * packages that scrape the public profile break constantly and breach Meta's
 * terms. So this reads a single JSON feed URL instead — set INSTAGRAM_FEED_URL
 * to either:
 *
 *   • a Behold.so feed (free tier, no server code, refreshes itself), or
 *   • your own endpoint wrapping the Instagram Graph API.
 *
 * Both return an array of posts; the shapes differ slightly, so both are
 * normalised below. With nothing configured — or if the feed is unreachable —
 * the section degrades to a follow panel rather than an empty or broken grid.
 *
 * The old site's cached thumbnails are not a usable fallback: that plugin's
 * cache directory has been cleared on the live server and Instagram's CDN URLs
 * have expired, so every one of them 404s.
 */

type Post = { id: string; permalink: string; image: string; caption: string };

type BeholdPost = {
  id?: string;
  permalink?: string;
  sizes?: { medium?: { mediaUrl?: string }; small?: { mediaUrl?: string } };
  mediaUrl?: string;
  thumbnailUrl?: string;
  prunedCaption?: string;
  caption?: string;
};

function normalise(raw: unknown): Post[] {
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as { posts?: unknown[] })?.posts)
      ? (raw as { posts: unknown[] }).posts
      : Array.isArray((raw as { data?: unknown[] })?.data)
        ? (raw as { data: unknown[] }).data
        : [];

  return list
    .map((item) => {
      const p = item as BeholdPost;
      const image =
        p.sizes?.medium?.mediaUrl ??
        p.sizes?.small?.mediaUrl ??
        p.thumbnailUrl ??
        p.mediaUrl ??
        "";
      return {
        id: String(p.id ?? p.permalink ?? image),
        permalink: p.permalink ?? site.social.instagram,
        image,
        caption: (p.prunedCaption ?? p.caption ?? "").slice(0, 140),
      };
    })
    .filter((p) => p.image);
}

async function fetchPosts(): Promise<Post[]> {
  const url = process.env.INSTAGRAM_FEED_URL;
  if (!url) return [];

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return normalise(await res.json()).slice(0, 6);
  } catch {
    // A social embed is never worth failing a page render over.
    return [];
  }
}

export async function InstagramFeed() {
  const posts = await fetchPosts();

  if (posts.length === 0) {
    return (
      <div
        className="flex flex-col items-start gap-7 border-t border-rule pt-10 md:flex-row md:items-center md:justify-between"
        data-reveal
      >
        <p className="max-w-lg text-lg leading-relaxed text-ink/70">
          We post service times, events and moments from the life of the church
          on Instagram — it&rsquo;s the quickest way to see what a Sunday with us
          actually looks like.
        </p>
        <Button href={site.social.instagram} external>
          Follow @transformationchurchuk
        </Button>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4" data-reveal>
      {posts.map((post) => (
        <li key={post.id}>
          <a
            href={post.permalink}
            target="_blank"
            rel="noreferrer"
            className="group relative block aspect-square overflow-hidden bg-ink/10"
          >
            {/* Remote host is user-configured, so next/image optimisation is
                deliberately bypassed here. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image}
              alt={post.caption || "Instagram post"}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/25" />
          </a>
        </li>
      ))}
    </ul>
  );
}
