/** Scroll animations: sections rise into view, and the numbers run up from zero to their value. */

/** Cards of one grid come in one after another, and their icons move out of step. */
function staggerGrids(): void {
  document.querySelectorAll<HTMLElement>('.grid, .steps').forEach((grid) => {
    Array.from(grid.children).forEach((card, i) => {
      (card as HTMLElement).style.setProperty('--n', String(i));
      (card as HTMLElement).style.setProperty('--delay', `${Math.min(i % 4, 3) * 0.09}s`);
    });
  });
}

function revealOnScroll(): void {
  const seen = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('in');
        seen.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  document.querySelectorAll('section h2, section .sub, .card, .band').forEach((el) => {
    el.classList.add('reveal');
    seen.observe(el);
  });
}

function runUp(el: HTMLElement, to: number): void {
  const from = performance.now();
  const time = 1100 + Math.min(to, 200) * 4;
  const frame = (now: number): void => {
    // A frame's clock can be a little behind the moment we started, hence the lower bound.
    const t = Math.max(0, Math.min((now - from) / time, 1));
    el.textContent = String(Math.round(to * (1 - Math.pow(1 - t, 3))));
    if (t < 1) requestAnimationFrame(frame);
    else el.classList.add('done');
  };
  frame(from);
}

function countUpNumbers(): void {
  const counted = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const number = entry.target as HTMLElement;
        counted.unobserve(number);
        // One after another, in the order they stand in their row.
        const cell = number.parentElement;
        const place = cell?.parentElement ? Array.from(cell.parentElement.children).indexOf(cell) : 0;
        setTimeout(() => runUp(number, Number(number.dataset.to)), place * 120);
      }
    },
    { threshold: 0.6 },
  );
  document.querySelectorAll<HTMLElement>('.numbers b').forEach((number) => {
    const to = parseInt(number.textContent ?? '', 10);
    if (Number.isNaN(to)) return;
    number.dataset.to = String(to);
    number.setAttribute('aria-label', String(to));
    number.textContent = '0';
    counted.observe(number);
  });
}

export function animateOnScroll(): void {
  // Without the observer nothing was hidden to begin with (the page's first script decides that).
  if (!('IntersectionObserver' in window)) return;
  staggerGrids();
  revealOnScroll();
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) countUpNumbers();
}
