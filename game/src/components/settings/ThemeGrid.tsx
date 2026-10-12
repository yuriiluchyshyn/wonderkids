import { motion } from 'framer-motion';
import { useLang, useVoiceLang } from '@/core/translator';
import { localTheme } from '@/core/theme/localTheme';
import { DEFAULT_THEME_ID, THEME_LIST } from '@/core/theme/themes';
import { useGameStore } from '@/core/child/store/useGameStore';
import { useSound } from '@/core/audio/useSound';
import { useVoiceSpeak } from '@/core/audio/useSpeech';
import { changeTheme } from '@/core/theme/themeTransition';
import styles from './ThemeGrid.module.css';

/** Theme chooser grid (PRD §6). Lives in Settings; one tap reskins everything. */
export function ThemeGrid() {
  // Not chosen yet — the child is in the default theme, so that one is ticked.
  const themeId = useGameStore((s) => s.themeId) ?? DEFAULT_THEME_ID;
  const setTheme = useGameStore((s) => s.setTheme);
  const { play } = useSound();
  const announce = useVoiceSpeak('selections');
  const lang = useLang();
  const voiceLang = useVoiceLang();

  return (
    <div className={styles.grid}>
      {THEME_LIST.map((spec) => localTheme(spec, lang)).map((t) => (
        <motion.button
          key={t.id}
          className={`${styles.tile} ${t.id === themeId ? styles.active : ''}`}
          style={{
            background: `linear-gradient(150deg, ${t.palette.bg1}, ${t.palette.bg2})`,
            color: t.palette.text,
          }}
          whileTap={{ scale: 0.93 }}
          onClick={() => {
            play('success');
            if (t.id !== themeId) changeTheme(() => setTheme(t.id));
            announce(localTheme(t, voiceLang).name, voiceLang);
          }}
        >
          <span className={`${styles.icon} emoji`} aria-hidden>
            {t.icon}
          </span>
          <span className={styles.name}>{t.name}</span>
        </motion.button>
      ))}
    </div>
  );
}
