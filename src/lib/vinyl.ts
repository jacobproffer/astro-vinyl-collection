// Ignore a leading "The " so "The Beatles" sorts under B.
export const sortKey = (s: string) => s.replace(/^the\s+/i, "");

export const decadeOf = (year?: number) =>
  year ? Math.floor(year / 10) * 10 : undefined;

// Map pressing-variant names to disc colours, in the order they're mentioned,
// so "Orange & Blue Split" renders as a two-colour split disc.
const vinylColors: [RegExp, string][] = [
  [/\bred\b|blood/, "#a3121b"],
  [/\borange\b|campfire/, "#e8661c"],
  [/\byellow\b/, "#f2c418"],
  [/\bochre\b/, "#b9852d"],
  [/\bgreen\b/, "#3f9a3a"],
  [/\baquamarine\b/, "#3fc1b0"],
  [/\bblue\b/, "#2456c9"],
  [/\b(violet|purple)\b/, "#7a3fb8"],
  [/\b(pink|strawberry)\b/, "#ec6aa0"],
  [/\bbrown\b|woodcutting/, "#6b4423"],
  [/\btan\b/, "#c9a97a"],
  [/\b(silver|gunmetal|grey)\b/, "#8a8d91"],
  [/\bwhite\b/, "#ececec"],
  [/\b(clear|transparent)\b/, "rgb(200 210 215 / 0.55)"],
  [/\bblack\b/, "#111"],
];

export function discStyle(variant?: string) {
  const text = variant?.toLowerCase() ?? "";
  const found = vinylColors
    .map(([re, color]) => ({ color, at: text.search(re) }))
    .filter((c) => c.at >= 0)
    .sort((a, b) => a.at - b.at)
    .map((c) => c.color)
    .slice(0, 3);
  if (found.length === 0) return undefined;
  const step = 100 / found.length;
  const stops = found.map((c, i) => `${c} ${i * step}% ${(i + 1) * step}%`);
  return `--disc: conic-gradient(${stops.join(", ")})`;
}
