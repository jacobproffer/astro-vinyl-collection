import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { sortKey } from "../lib/vinyl";

export const prerender = true;

const escapeMarkdown = (value: string) =>
  value
    .replaceAll("\\", "\\\\")
    .replace(/[\r\n]+/g, " ")
    .replaceAll("*", "\\*")
    .replaceAll("_", "\\_")
    .replaceAll("`", "\\`")
    .replaceAll("[", "\\[")
    .replaceAll("]", "\\]")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

export const GET: APIRoute = async () => {
  const records = (await getCollection("records")).sort(
    (a, b) =>
      sortKey(a.data.artist).localeCompare(sortKey(b.data.artist)) ||
      a.data.title.localeCompare(b.data.title),
  );

  const markdown = [
    "# Vinyl Collection",
    "",
    "> A personal archive of vinyl records, soundtracks, and pressings.",
    "",
    `This collection contains ${records.length} records, listed alphabetically by artist.`,
    "",
    "## Records",
    "",
    ...records.flatMap(({ data }) => {
      const details = [
        `Artist: ${data.artist}`,
        data.year && `Year: ${data.year}`,
        data.label && `Label: ${data.label}`,
        data.format && `Format: ${data.format}`,
        data.variant && `Variant: ${data.variant}`,
        data.genres.length && `Genres: ${data.genres.join(", ")}`,
        data.styles.length && `Styles: ${data.styles.join(", ")}`,
        ...data.descriptions.map((description) => `Description: ${description}`),
        data.notes && `Notes: ${data.notes}`,
      ].filter((detail): detail is string => Boolean(detail));

      return [
        `### ${escapeMarkdown(data.title)}`,
        ...details.map((detail) => `- ${escapeMarkdown(detail)}`),
        "",
      ];
    }),
  ].join("\n");

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
};
