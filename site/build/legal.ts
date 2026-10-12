import type { PublicUrls } from '@pulsar/platform';
import { readFileSync } from 'node:fs';
import { sitePath, type SiteLang } from '../src/languages.ts';
import { LEGAL_UPDATED, legalPath, type LegalDoc } from '../src/legal.ts';
import { OPERATOR } from '../src/operator.ts';
import { markdownToHtml } from './markdown.ts';

/**
 * A legal text of the site — the privacy policy or the terms — in a language.
 *
 * The texts are Markdown files, `src/legal/<lang>/<doc>.md`, written per
 * language (the Polish ones are the operator's own law; the others say the
 * same). What changes without the text changing is asked for by name:
 *
 *   {{operator.name}} {{operator.address}} {{operator.id}} {{operator.email}}   who runs the service (`src/operator.ts`)
 *   {{site}} {{play}} {{parents}}                                              the public addresses
 *   {{home}} {{privacy}} {{terms}}                                             this language's pages
 *   {{updated}}                                                                the day the text last changed (`LEGAL_UPDATED`)
 *
 * A name the list does not have fails the build.
 */
export interface LegalText {
  /** The text's own heading — its first `# ` line. */
  title: string;
  /** The text with every name filled in: served beside the page as `index.md`. */
  markdown: string;
  /** The same as HTML, for the page. */
  html: string;
}

/** Shown in place of a detail of the operator not written in yet — the site's tests do not let it be published. */
const MISSING = '⟨…⟩';

export function legalText(lang: SiteLang, doc: LegalDoc, urls: PublicUrls): LegalText {
  const source = readFileSync(new URL(`../src/legal/${lang}/${doc}.md`, import.meta.url), 'utf8');
  const facts: Record<string, string> = {
    'operator.name': OPERATOR.name || MISSING,
    'operator.address': OPERATOR.address || MISSING,
    'operator.id': [`NIP ${OPERATOR.taxId || MISSING}`, OPERATOR.registry].filter(Boolean).join(', '),
    'operator.email': OPERATOR.email,
    site: urls.site,
    play: urls.play,
    parents: urls.parents,
    home: `/${sitePath(lang)}`,
    privacy: `/${legalPath(lang, 'privacy')}`,
    terms: `/${legalPath(lang, 'terms')}`,
    updated: new Intl.DateTimeFormat(lang, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${LEGAL_UPDATED[doc]}T00:00:00Z`)),
  };
  const markdown = source.replace(/\{\{([\w.]+)\}\}/g, (_all, name: string) => {
    if (!(name in facts)) throw new Error(`src/legal/${lang}/${doc}.md asks for «${name}», which build/legal.ts does not know`);
    return facts[name];
  });
  const title = /^# (.+)$/m.exec(markdown)?.[1];
  if (!title) throw new Error(`src/legal/${lang}/${doc}.md has no heading`);
  return { title, markdown, html: markdownToHtml(markdown) };
}
