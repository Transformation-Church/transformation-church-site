import Image from "next/image";
import Link from "next/link";

import { site } from "@/lib/site";

/**
 * Supplied brand artwork. The two lockups are not the same drawing — the
 * dark-background version is wordmark-only — so each carries its own aspect
 * ratio rather than sharing one box.
 */
const LOCKUP = {
  light: { src: "/brand/logo-light.png", width: 3000, height: 748 },
  dark: { src: "/brand/logo-dark.png", width: 2199, height: 748 },
} as const;

export function Logo({
  tone = "light",
  className = "",
  priority = false,
}: {
  /** Background the logo sits on, not the colour of the logo itself. */
  tone?: "light" | "dark";
  className?: string;
  priority?: boolean;
}) {
  const art = LOCKUP[tone];

  return (
    <Link
      href="/"
      className={`block shrink-0 ${className}`}
      aria-label={`${site.name} home`}
    >
      <Image
        src={art.src}
        width={art.width}
        height={art.height}
        alt={site.name}
        priority={priority}
        className="h-full w-auto"
        sizes="(max-width: 768px) 220px, 320px"
      />
    </Link>
  );
}
