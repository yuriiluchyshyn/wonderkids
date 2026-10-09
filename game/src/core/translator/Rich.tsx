import type { AppKey } from './app';
import { useT } from './LangContext';

/** Stands in the sentence for the piece to be shown in bold. */
const MARK = '\u0001';

/**
 * A sentence of the dictionary with one of its pieces — an address, a name —
 * shown in bold: `<Rich k="parent.signedInAs" name="email" value={email} />`.
 * The sentence stays whole in the dictionary, so each language puts the piece
 * where its own word order wants it.
 */
export function Rich({ k, name, value }: { k: AppKey; name: string; value: string }) {
  const t = useT();
  const [before, after = ''] = t(k, { [name]: MARK }).split(MARK);
  return (
    <>
      {before}
      <b>{value}</b>
      {after}
    </>
  );
}
