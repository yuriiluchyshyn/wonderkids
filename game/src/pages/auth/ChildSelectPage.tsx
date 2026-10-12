import { useLang, useT } from '@/core/translator';
import { usePageMeta } from '@/core/app/seo/usePageMeta';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/core/child/store/useGameStore';
import { useAuthStore } from '@/core/account/auth/useAuthStore';
import { endDemo, useDemo } from '@/core/app/demo';
import { themeOf } from '@/core/theme/localTheme';
import { useSound } from '@/core/audio/useSound';
import { Button } from '@/components/ui/Button';
import styles from './ChildSelectPage.module.css';

const AVATAR: Record<string, string> = { girl: '👧', boy: '👦' };
const PIN_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

/**
 * Child portal entry (Tech Spec v2.1 US-1/FR-AUTH-04): pick your face, then tap
 * your simple PIN. Low-text and tappable — a pre-reader logs in alone. The
 * parent sets names, nicknames and PINs in the parent portal. On a computer the
 * code can be typed on the keyboard too.
 */
export function ChildSelectPage() {
  const t = useT();
  const lang = useLang();
  usePageMeta({ title: t('who.title') });
  const navigate = useNavigate();
  const children = useGameStore((s) => s.children);
  const setActiveChild = useGameStore((s) => s.setActiveChild);
  const logout = useAuthStore((s) => s.logout);
  const demo = useDemo((s) => s.active);
  const { play } = useSound();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [entry, setEntry] = useState('');
  const [shake, setShake] = useState(false);
  /** The key last typed on the keyboard — lit on the pad for a moment. */
  const [lit, setLit] = useState<string | null>(null);
  // The entry as typed so far: keys can come faster than React re-renders.
  const entryRef = useRef('');
  const checking = useRef(false);

  const selected = children.find((c) => c.id === selectedId) ?? null;

  const setCode = (code: string) => {
    entryRef.current = code;
    setEntry(code);
  };

  const close = () => {
    setSelectedId(null);
    setCode('');
  };

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
    setCode('');
  };

  const press = (key: string) => {
    if (!selected || key === '' || checking.current) return;
    play('tap');
    if (key === '⌫') {
      setCode(entryRef.current.slice(0, -1));
      return;
    }
    const length = selected.profile.pin.length || 4;
    const next = (entryRef.current + key).slice(0, length);
    setCode(next);
    if (next.length < length) return;

    if (next === selected.profile.pin) {
      play('success');
      setActiveChild(selected.id);
      navigate('/', { replace: true });
    } else {
      play('sad');
      setShake(true);
      checking.current = true;
      window.setTimeout(() => {
        checking.current = false;
        setShake(false);
        setCode('');
      }, 500);
    }
  };

  // The keyboard while the pad is open: digits (top row and numpad), Backspace,
  // Escape to go back.
  const pressRef = useRef(press);
  pressRef.current = press;
  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      let key: string | null = null;
      if (/^[0-9]$/.test(e.key)) key = e.key;
      else if (e.key === 'Backspace' || e.key === 'Delete') key = '⌫';
      else if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (!key) return;
      e.preventDefault();
      pressRef.current(key);
      setLit(key);
      window.setTimeout(() => setLit((now) => (now === key ? null : now)), 150);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId]);

  const signOut = () => {
    play('tap');
    if (demo) endDemo(); // the trial is over → App shows the login
    else logout(); // clears the session and the device → App goes to /login
  };

  const logoutButton = (
    <div className={styles.footer}>
      <button type="button" className={styles.parentLink} onClick={signOut}>
        <span className="emoji" aria-hidden>
          🚪
        </span>{' '}
        {t('common.logout')}
      </button>
    </div>
  );

  // No profiles yet → point the grown-up to the parent portal.
  if (children.length === 0) {
    return (
      <div className="page center" style={{ minHeight: '70dvh' }}>
        <div className={styles.empty}>
          <span className="emoji" style={{ fontSize: '3.4rem' }} aria-hidden>
            🌌
          </span>
          <h1 className={styles.emptyTitle}>{t('who.empty')}</h1>
          <p className="muted">{t('who.emptyHint')}</p>
          <Button size="lg" icon="⚙️" onClick={() => navigate('/parent')}>
            {t('who.openParents')}
          </Button>
          {logoutButton}
        </div>
      </div>
    );
  }

  return (
    <div className="page stack">
      <h1 className={styles.title}>{t('who.today')}</h1>

      <div className={styles.grid}>
        {children.map((c) => {
          const theme = themeOf(c.themeId, lang);
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

      {logoutButton}

      {/* ---- PIN pad ---- */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className={styles.pinOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <motion.div
              className={styles.pinSheet}
              role="dialog"
              aria-modal="true"
              aria-label={t('who.hello', { name: selected.profile.name })}
              initial={{ y: 40, scale: 0.92, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <span className={`${styles.pinAvatar} emoji`} aria-hidden>
                {AVATAR[selected.profile.gender] ?? AVATAR.girl}
              </span>
              <p className={styles.pinName}>{t('who.hello', { name: selected.profile.name })}</p>
              <p className="muted">{t('who.enterCode')}</p>

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
                    className={`${styles.key} ${k === '' ? styles.keyGhost : ''} ${k !== '' && lit === k ? styles.keyLit : ''}`}
                    disabled={k === ''}
                    onClick={() => press(k)}
                    aria-label={k === '⌫' ? t('who.erase') : k || undefined}
                  >
                    {k}
                  </button>
                ))}
              </div>

              <button type="button" className={styles.pinCancel} onClick={close}>
                {t('common.back')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
