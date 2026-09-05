export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-10-01";

/**
 * Whether the CMS is wired up.
 *
 * Until a project ID exists the blog reads from the posts migrated out of
 * WordPress, so the site is complete and deployable before Sanity is created.
 */
export const sanityEnabled = projectId.length > 0;
