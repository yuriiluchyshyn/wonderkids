import { useEffect } from 'react';

const SITE_NAME = 'Pulsar Kids';

interface PageMeta {
  /** Page name; the site name is appended ("Вхід для дітей — Pulsar Kids"). */
  title: string;
  description?: string;
  /**
   * Whether search engines may list this page. Only public pages (the logins)
   * are; everything behind a session is personal and stays out of search.
   */
  index?: boolean;
}

function setMeta(selector: string, attr: 'name' | 'property', key: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Per-page SEO for the single-page app: the document title, description,
 * robots directive, canonical URL and the matching Open Graph tags. (The
 * landing page is static HTML and carries its own.)
 */
export function usePageMeta({ title, description, index = false }: PageMeta): void {
  useEffect(() => {
    const fullTitle = `${title} — ${SITE_NAME}`;
    document.title = fullTitle;
    setMeta('meta[name="robots"]', 'name', 'robots', index ? 'index, follow' : 'noindex, nofollow');
    setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    if (description) {
      setMeta('meta[name="description"]', 'name', 'description', description);
      setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    }

    // Canonical: this page without query string or hash.
    const url = `${window.location.origin}${window.location.pathname}`;
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;
    setMeta('meta[property="og:url"]', 'property', 'og:url', url);
  }, [title, description, index]);
}
