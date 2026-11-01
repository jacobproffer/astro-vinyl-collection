import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const records = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/records" }),
  schema: ({ image }) =>
    z.object({
      artist: z.string(),
      title: z.string(),
      year: z.number().int().optional(),
      label: z.string().optional(),
      genres: z.array(z.string()).default([]),
      styles: z.array(z.string()).default([]),
      format: z.string().optional(),
      variant: z.string().optional(),
      descriptions: z.array(z.string()).default([]),
      cover: image().optional(),
      discogsId: z.number().int().optional(),
      notes: z.string().optional(),
    }),
});

export const collections = { records };
