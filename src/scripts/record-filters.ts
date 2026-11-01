const search = document.querySelector<HTMLInputElement>("#search")!;
const genre = document.querySelector<HTMLSelectElement>("#genre")!;
const decade = document.querySelector<HTMLSelectElement>("#decade")!;
const sort = document.querySelector<HTMLSelectElement>("#sort")!;
const grid = document.querySelector<HTMLElement>("#grid")!;
const clear = document.querySelector<HTMLButtonElement>("#clear")!;
const clearEmpty = document.querySelector<HTMLButtonElement>("#clear-empty")!;
const empty = document.querySelector<HTMLElement>("#empty")!;
const count = document.querySelector<HTMLElement>("#count")!;
const items = [...document.querySelectorAll<HTMLElement>("#grid > li")];

function apply() {
  const q = search.value.trim().toLowerCase();
  let shown = 0;
  for (const li of items) {
    const match =
      (!q || li.dataset.search!.includes(q)) &&
      (!genre.value || li.dataset.genres!.split("|").includes(genre.value)) &&
      (!decade.value || li.dataset.decade === decade.value);
    li.hidden = !match;
    if (match) shown++;
  }
  clear.hidden = !(q || genre.value || decade.value);
  empty.hidden = shown > 0;
  count.textContent = `${shown} of ${items.length} records`;
}

const text = (li: HTMLElement, key: "artist" | "title") =>
  li.dataset[key] ?? "";
const byArtist = (a: HTMLElement, b: HTMLElement) =>
  text(a, "artist").localeCompare(text(b, "artist")) ||
  text(a, "title").localeCompare(text(b, "title"));

// Records without a year always sort last.
const byYear = (dir: 1 | -1) => (a: HTMLElement, b: HTMLElement) => {
  const ya = a.dataset.year ? Number(a.dataset.year) : null;
  const yb = b.dataset.year ? Number(b.dataset.year) : null;
  if (ya === null && yb === null) return byArtist(a, b);
  if (ya === null) return 1;
  if (yb === null) return -1;
  return (ya - yb) * dir || byArtist(a, b);
};

function applySort() {
  const sorters: Record<string, (a: HTMLElement, b: HTMLElement) => number> = {
    artist: byArtist,
    title: (a, b) =>
      text(a, "title").localeCompare(text(b, "title")) || byArtist(a, b),
    "year-desc": byYear(-1),
    "year-asc": byYear(1),
  };
  grid.append(...[...items].sort(sorters[sort.value]));
}

[search, genre, decade].forEach((el) => el.addEventListener("input", apply));
sort.addEventListener("input", applySort);

function resetFilters() {
  search.value = "";
  genre.value = "";
  decade.value = "";
  apply();
  search.focus();
}
clear.addEventListener("click", resetFilters);
clearEmpty.addEventListener("click", resetFilters);
apply();
