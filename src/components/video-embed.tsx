"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Click-to-play facade for YouTube.
 *
 * Embedding the real iframe on load pulls roughly a megabyte of player and
 * sets third-party cookies before anyone has pressed play. This shows the
 * poster frame and only mounts the iframe on interaction, which also keeps the
 * cookie banner honest.
 */
export function YouTubeEmbed({
  id,
  title,
  poster,
  className = "",
}: {
  id: string;
  title: string;
  poster?: string | null;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const still = poster || `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;

  return (
    <div className={`relative aspect-video overflow-hidden bg-ink-deep ${className}`}>
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 h-full w-full cursor-pointer"
        >
          <span className="sr-only">Play: {title}</span>
          <Image
            src={still}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover opacity-85 transition-all duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.03] group-hover:opacity-100"
            unoptimized
          />
          <span className="absolute inset-0 bg-ink-deep/25 transition-colors duration-500 group-hover:bg-ink-deep/10" />
          <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-paper/95 text-ink shadow-xl transition-all duration-500 ease-[var(--ease-out-expo)] group-hover:scale-110 group-hover:bg-accent group-hover:text-paper">
            <svg viewBox="0 0 12 14" className="ml-1 h-6 w-6" fill="currentColor" aria-hidden>
              <path d="M0 0l12 7-12 7z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}

/**
 * Facebook video. Their embed player has no facade option worth the
 * complexity, so this stays a plain lazy iframe.
 */
export function FacebookEmbed({ url, title }: { url: string; title: string }) {
  const src = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
    url,
  )}&show_text=false&autoplay=false`;

  return (
    <div className="relative aspect-video overflow-hidden bg-ink-deep">
      <iframe
        src={src}
        title={title}
        loading="lazy"
        allow="encrypted-media; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}
