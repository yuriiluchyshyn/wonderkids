import type { Appearance, StripeConstructorOptions } from '@stripe/stripe-js';

/**
 * Stripe.js options. The «Stripe.js testing assistant» — the black «stripe ›»
 * button Stripe puts in the corner of any page with Elements while the key is
 * a sandbox's — is turned off: it is a developer's tool, not for parents (and
 * it never shows with a live key anyway).
 */
export const STRIPE_OPTIONS: StripeConstructorOptions = { developerTools: { assistant: { enabled: false } } };

/** A colour of the page as a `#rrggbb`, else the fallback (Stripe reads hex, rgb and hsl, but not `var()`). */
function colour(name: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
}

/** How light a `#rrggbb` is, 0–1. */
function lightness(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * The card and address fields in the site's own look: the colours, the font and
 * the corners of the theme the parent has now (the cabinet wears the dark one),
 * read from the page's variables when the fields are made.
 */
export function stripeAppearance(): Appearance {
  const page = colour('--bg-1', '#0b1026');
  const surface = colour('--surface', '#18213f');
  const text = colour('--text', '#e8ecff');
  const soft = colour('--text-soft', '#aab2db');
  const primary = colour('--primary', '#7c6cff');
  const radius = getComputedStyle(document.documentElement).getPropertyValue('--radius-sm').trim() || '14px';
  const dark = lightness(page) < 0.5;
  const line = dark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.18)';
  return {
    theme: dark ? 'night' : 'stripe',
    variables: {
      colorPrimary: primary,
      colorBackground: surface,
      colorText: text,
      colorTextSecondary: soft,
      colorTextPlaceholder: soft,
      colorDanger: '#f87171',
      fontFamily: getComputedStyle(document.body).fontFamily || 'system-ui, sans-serif',
      fontSizeBase: '16px',
      borderRadius: radius,
      spacingUnit: '4px',
    },
    rules: {
      '.Input': { backgroundColor: surface, border: `1px solid ${line}`, boxShadow: 'none', padding: '12px 14px' },
      '.Input:focus': { borderColor: primary, boxShadow: `0 0 0 2px ${primary}55` },
      '.Label': { color: soft, fontWeight: '600' },
      '.Tab': { backgroundColor: surface, border: `1px solid ${line}`, boxShadow: 'none' },
      '.Tab--selected': { borderColor: primary, boxShadow: `0 0 0 2px ${primary}55`, color: text },
      '.Block': { backgroundColor: surface, border: `1px solid ${line}`, boxShadow: 'none' },
    },
  };
}
