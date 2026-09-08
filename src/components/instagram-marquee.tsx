"use client";

import { AllowMediaButton, useAllowed } from "@/components/consent";

/**
 * The scrolling Instagram banner.
 *
 * Split out from InstagramFeed, which is a server component and cannot ask
 * whether the visitor is happy for Behold to serve them images. The <img> tags
 * are never rendered until they are, so nothing is fetched from a third party
 * before the question is answered.
 *
 * Two copies of the posts make the loop seamless. The second is hidden from
 * assistive technology and taken out of the tab order, or every post would be
 * announced and focusable twice.
 */

export type FeedPost = {
  id: string;
  permalink: string;
  image: string;
  caption: string;
};

export function InstagramMarquee({ posts }: { posts: FeedPost[] }) {
  const allowed = useAllowed("media");

  if (!allowed) {
    return (
      <div
        className="flex flex-col items-start gap-5 border-t border-rule pt-8 md:flex-row md:items-center md:justify-between"
        data-reveal
      >
        <p className="max-w-xl leading-relaxed text-ink-muted">
          Our latest Instagram posts are hidden because those images are
          served by Instagram&rsquo;s host rather than by us, and we do not load
          anything from elsewhere without asking.
        </p>
        <AllowMediaButton label="Show the posts" />
      </div>
    );
  }

  const track = [...posts, ...posts];

  return (
    <div className="marquee group relative" data-reveal>
      <ul className="marquee-track flex w-max items-stretch">
        {track.map((post, i) => {
          const duplicate = i >= posts.length;
          return (
            <li
              key={`${post.id}-${i}`}
              className="w-56 shrink-0 pr-3 md:w-72 md:pr-4"
              aria-hidden={duplicate || undefined}
            >
              <a
                href={post.permalink}
                target="_blank"
                rel="noreferrer"
                tabIndex={duplicate ? -1 : undefined}
                className="group/tile relative block aspect-square overflow-hidden bg-ink/10"
              >
                {/* Remote host is user-configured, so next/image optimisation is
                    deliberately bypassed here. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.image}
                  alt={duplicate ? "" : post.caption || "Instagram post"}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover/tile:scale-105"
                />
                <span className="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover/tile:bg-ink/25" />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
