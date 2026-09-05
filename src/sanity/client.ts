import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

import { apiVersion, dataset, projectId, sanityEnabled } from "@/sanity/env";

export const client = sanityEnabled
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      // Published content only, served from the CDN.
      useCdn: true,
      perspective: "published",
    })
  : null;

const builder = client ? imageUrlBuilder(client) : null;

export function urlForImage(source: SanityImageSource) {
  return builder?.image(source);
}
