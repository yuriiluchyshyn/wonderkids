/**
 * The «Ціни» links of every page (`[data-pricing-link]`, shown only in the paid
 * mode — `health.ts`) open the window of prices instead of leaving the page.
 * The window's code is fetched at the first tap, so a page that is only read
 * carries none of it. Without scripts the link leads to the page of prices.
 */
export function wirePricingLinks(): void {
  document.addEventListener('click', (e) => {
    const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[data-pricing-link], [data-pricing-link] a');
    if (!link || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    void import('./pricing/flow.ts').then(({ pricingFlow }) => pricingFlow().open());
  });
}
