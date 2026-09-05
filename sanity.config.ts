"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";

import { apiVersion, dataset, projectId } from "@/sanity/env";
import { schema } from "@/sanity/schema";

/**
 * Studio config, mounted inside the site at /studio.
 *
 * Keeping the Studio in this repo means the schema and the front-end types
 * move together, and there's one deploy rather than two.
 */
export default defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  schema,
  plugins: [structureTool(), visionTool({ defaultApiVersion: apiVersion })],
});
