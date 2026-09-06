import Image from "next/image";

/**
 * Wrapper for the migrated WordPress photography.
 *
 * The archive spans 2013-2019 on compact cameras and phones: warm and genuine,
 * but inconsistent in white balance, exposure and sharpness. A shared navy wash
 * plus a slight contrast lift makes a wall of them read as one set instead of a
 * jumble, and hides the softness that a clean full-colour treatment exposes.
 */
export function ArchiveImage({
  src,
  alt,
  className = "",
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
  treatment = "wash",
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** `wash` unifies; `full` leaves colour alone for the strongest few shots. */
  treatment?: "wash" | "full" | "mono";
}) {
  return (
    <span className={`group relative block overflow-hidden bg-ink/10 ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.04] ${
          treatment === "mono" ? "grayscale contrast-[1.05]" : ""
        } ${treatment === "wash" ? "contrast-[1.04] saturate-[0.82]" : ""}`}
      />
      {treatment === "wash" && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-ink/22 mix-blend-multiply transition-opacity duration-700 group-hover:opacity-60"
        />
      )}
      {treatment === "mono" && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-ink/45 mix-blend-color"
        />
      )}
    </span>
  );
}
