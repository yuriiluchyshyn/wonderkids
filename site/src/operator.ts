import { CONTACT_EMAIL } from '@pulsar/platform';

/**
 * Who runs Pulsar Kids — the controller of the personal data and the party
 * to the terms. The privacy policy and the terms name these details
 * (`src/legal/<lang>/*.md` ask for `{{operator.name}}` and the rest), and a
 * Polish business must publish them (GDPR art. 13, the act on electronic
 * services art. 5).
 *
 * `tests/site.test.ts` fails while a required detail is empty, so the site
 * cannot be deployed with a policy that names nobody. The name, the postal
 * code and the REGON are as the Ministry of Finance's register of VAT payers
 * gives them for this NIP (checked 2026-10-12).
 */
export const OPERATOR = {
  /** The registered name: «Jan Kowalski Pulsar Kids» for a sole trader (JDG), «Pulsar Kids sp. z o.o.» for a company. */
  name: 'Yurii Luchyshyn',
  /** The registered address, as in CEIDG / KRS: street, postal code, city, Poland. */
  address: 'ul. Józefa Chełmońskiego 146/25, 31-348 Kraków, Poland',
  /** NIP — the tax number. */
  taxId: '9452300633',
  /** The register entry, if there is more to say than the NIP: «REGON 123456789», «KRS 0000123456, Sąd Rejonowy …». Optional. */
  registry: 'REGON 529953785',
  email: CONTACT_EMAIL,
} as const;

export type OperatorDetail = keyof typeof OPERATOR;

/** What must be known before the pages are published. */
const REQUIRED: OperatorDetail[] = ['name', 'address', 'taxId', 'email'];

/** The required details still empty — none, once the operator is written in. */
export const operatorGaps = (): OperatorDetail[] => REQUIRED.filter((detail) => OPERATOR[detail].trim() === '');
