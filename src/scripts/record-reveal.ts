const sleeves = document.querySelectorAll<HTMLElement>(".sleeve");

if (
  !matchMedia("(prefers-reduced-motion: reduce)").matches &&
  "IntersectionObserver" in window
) {
  document.documentElement.classList.add("has-scroll-reveal");

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
  );

  sleeves.forEach((sleeve) => observer.observe(sleeve));
}
