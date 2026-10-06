import { usePageMeta } from '@/core/seo/usePageMeta';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/core/store/useGameStore';
import { THEMES, DEFAULT_THEME_ID } from '@/core/theme/themes';
import { useSound } from '@/core/audio/useSound';
import { Button } from '@/components/ui/Button';
import styles from './ChildSelectPage.module.css';

const AVATAR: Record<string, string> = { girl: '👧', boy: '👦' };
const PIN_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

/**
 * Child portal entry (Tech Spec v2.1 US-1/FR-AUTH-04): pick your face, then tap
 * your simple PIN. Low-text and tappable — a pre-reader logs in alone. The
 * parent sets names, nicknames and PINs in the parent portal.
 */
export function ChildSelectPage() {
  usePageMeta({ title: 'Хто грає?' });
  const navigate = useNavigate();
  const children = useGameStore((s) => s.children);
  const setActiveChild = useGameStore((s) => s.setActiveChild);
  const { play } = useSound();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [entry, setEntry] = useState('');
  const [shake, setShake] = useState(false);

  const selected = children.find((c) => c.id === selectedId) ?? null;

  const enter = (id: string) => {
    const child = children.find((c) => c.id === id);
    if (!child) return;
    play('tap');
    if (!child.profile.pin) {
      // No PIN set → straight in.
      setActiveChild(id);
      navigate('/', { replace: true });
      return;
    }
    setSelectedId(id);
    setEntry('');
  };

  const press = (key: string) => {
    if (!selected) return;
    if (key === '⌫') {
      play('tap');
      setEntry((e) => e.slice(0, -1));
      return;
    }
    if (key === '') return;
    play('tap');
    const next = (entry + key).slice(0, selected.profile.pin.length || 4);
    setEntry(next);

    if (next.length >= selected.profile.pin.length) {
      if (next === selected.profile.pin) {
        play('success');
        setActiveChild(selected.id);
        navigate('/', { replace: true });
      } else {
        play('sad');
        setShake(true);
        window.setTimeout(() => {
          setShake(false);
          setEntry('');
        }, 500);
      }
    }
  };

  // No profiles yet → point the grown-up to the parent portal.
  if (children.length === 0) {
    return (
      <div className="page center" style={{ minHeight: '70dvh' }}>
        <div className={styles.empty}>
          <span className="emoji" style={{ fontSize: '3.4rem' }} aria-hidden>
            🌌
          </span>
          <h1 className={styles.emptyTitle}>Ще немає гравців</h1>
          <p className="muted">Попроси дорослого створити твій профіль у кабінеті батьків.</p>
          <Button size="lg" icon="⚙️" onClick={() => navigate('/parent')}>
            Відкрити кабінет батьків
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page stack">
      <h1 className={styles.title}>Хто сьогодні грає?</h1>

      <div className={styles.grid}>
        {children.map((c) => {
          const theme = THEMES[c.themeId ?? DEFAULT_THEME_ID];
          return (
            <motion.button
              key={c.id}
              className={styles.card}
              style={{ background: `linear-gradient(150deg, ${theme.palette.bg1}, ${theme.palette.bg2})` }}
              whileTap={{ scale: 0.94 }}
              onClick={() => enter(c.id)}
            >
              <span className={`${styles.cardAvatar} emoji`} aria-hidden>
                {AVATAR[c.profile.gender] ?? AVATAR.girl}
              </span>
              <span className={styles.cardName}>{c.profile.name}</span>
              {c.profile.nickname && <span className={styles.cardNick}>@{c.profile.nickname}</span>}
              {c.profile.pin && (
                <span className={styles.cardLock} aria-hidden>
                  🔒
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* ---- PIN pad ---- */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className={styles.pinOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedId(null)}
          >
            <motion.div
              className={styles.pinSheet}
              initial={{ y: 40, scale: 0.92, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <span className={`${styles.pinAvatar} emoji`} aria-hidden>
                {AVATAR[selected.profile.gender] ?? AVATAR.girl}
              </span>
              <p className={styles.pinName}>Привіт, {selected.profile.name}!</p>
              <p className="muted">Введи свій код</p>

              <motion.div
                className={styles.dots}
                animate={shake ? { x: [0, -10, 10, -8, 8, 0] } : {}}
                transition={{ duration: 0.45 }}
              >
                {Array.from({ length: selected.profile.pin.length || 4 }, (_, i) => (
                  <span key={i} className={`${styles.pinDot} ${i < entry.length ? styles.pinDotOn : ''}`} />
                ))}
              </motion.div>

              <div className={styles.pad}>
                {PIN_KEYS.map((k, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`${styles.key} ${k === '' ? styles.keyGhost : ''}`}
                    disabled={k === ''}
                    onClick={() => press(k)}
                    aria-label={k === '⌫' ? 'Стерти' : k || undefined}
                  >
                    {k}
                  </button>
                ))}
              </div>

              <button type="button" className={styles.pinCancel} onClick={() => setSelectedId(null)}>
                Назад
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
