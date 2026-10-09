import { useVoiceSpeak } from '@/core/audio/useSpeech';
import { useWorld, type World } from '@/core/child/world/useWorld';
import { useT, useVoiceLang, type T } from '@/core/i18n';

/**
 * The voice of «Мій світ». What is read out is made in the VOICE's language,
 * from that language's own words: `t` is its dictionary and `said` — the same
 * world, named in it. So a child whose screen is in English and whose voice is
 * Polish hears Polish phrases about «Kosmodrom», not English ones read by
 * Polish rules. With one language for both it is simply the world on the screen.
 */
export function useTell(planet?: number) {
  const speak = useVoiceSpeak('selections');
  const lang = useVoiceLang();
  const t = useT(lang);
  const said = useWorld(planet, lang);
  return {
    /** Says what `make` builds from the voice's dictionary and world. */
    tell: (make: (t: T, said: World) => string) => speak(make(t, said), lang),
    lang,
  };
}
