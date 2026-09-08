"use client";

import Image from "next/image";

import { useAllowed } from "@/components/consent";

/**
 * An image that may live on someone else's server.
 *
 * Just under half the sermons have no artwork of the church's own, so their
 * thumbnail falls back to YouTube's, which is fetched from i.ytimg.com and
 * hands Google the visitor's IP and the page they are reading. Local artwork
 * has no such question and is rendered straight away.
 *
 * The placeholder is deliberately quiet rather than an error: a sermon list
 * with a few flat panels in it still reads as a list of sermons.
 */
export function RemoteImage({
  src,
  alt,
  sizes,
  className = "",
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
}) {
  const remote = src.startsWith("http");
  const allowed = useAllowed("media");

  if (remote && !allowed) {
    return <span aria-hidden className="block h-full w-full bg-ink/10" />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      // Remote hosts are not in next.config's allowlist by design.
      unoptimized={remote}
    />
  );
}
