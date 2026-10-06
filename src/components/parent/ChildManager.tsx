import { useEffect, useRef, useState } from 'react';
import {
  useGameStore,
  selectNicknameTaken,
  type ChoicesGridSize,
  type Gender,
} from '@/core/store/useGameStore';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { api, ApiError } from '@/core/api/client';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Modal } from '@/components/ui/Modal';
import styles from './Parent.module.css';

const AVATAR: Record<string, string> = { girl: '👧', boy: '👦' };
const MAX_CHILDREN = 5;
const NICKNAME_RE = /^[a-z0-9_]{3,12}$/;

const GENDER_OPTIONS: { id: Gender; label: string; icon: string }[] = [
  { id: 'girl', label: 'Дівчинка', icon: '👧' },
  { id: 'boy', label: 'Хлопчик', icon: '👦' },
];
const GRID_OPTIONS: { id: ChoicesGridSize; label: string }[] = [
  { id: 6, label: '6' },
  { id: 9, label: '9' },
];

type NickStatus = 'idle' | 'invalid' | 'checking' | 'available' | 'taken' | 'error';

interface NewChild {
  name: string;
  nickname: string;
  pin: string;
  gender: Gender;
  choicesGridSize: ChoicesGridSize;
}

const BLANK: NewChild = {
  name: '',
  nickname: '',
  pin: '',
  gender: 'girl',
  choicesGridSize: 9,
};

/**
 * Multi-child management (Tech Spec v2.1 US-1): the family roster with a central
 * "+ Додати дитину" CTA. Each child has a unique nickname (validated live
 * against the whole platform) and a simple PIN. Tapping a child selects it so
 * the settings below edit that child.
 */
export function ChildManager() {
  const children = useGameStore((s) => s.children);
  const activeChildId = useGameStore((s) => s.activeChildId);
  const addChild = useGameStore((s) => s.addChild);
  const removeChild = useGameStore((s) => s.removeChild);
  const setActiveChild = useGameStore((s) => s.setActiveChild);
  const token = useAuthStore((s) => s.token);

  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<NewChild>(BLANK);
  const [nickStatus, setNickStatus] = useState<NickStatus>('idle');
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const checkSeq = useRef(0);

  const atLimit = children.length >= MAX_CHILDREN;

  const openAdd = () => {
    setDraft(BLANK);
    setNickStatus('idle');
    setAdding(true);
  };

  // Live nickname validation: charset → within-account → backend uniqueness.
  useEffect(() => {
    if (!adding) return;
    const nick = draft.nickname.trim().toLowerCase();
    if (!nick) {
      setNickStatus('idle');
      return;
    }
    if (!NICKNAME_RE.test(nick)) {
      setNickStatus('invalid');
      return;
    }
    if (selectNicknameTaken(useGameStore.getState(), nick)) {
      setNickStatus('taken');
      return;
    }
    setNickStatus('checking');
    const seq = ++checkSeq.current;
    const timer = window.setTimeout(async () => {
      if (!token) {
        // Offline / no session: fall back to the local check already passed.
        if (checkSeq.current === seq) setNickStatus('available');
        return;
      }
      try {
        const { available } = await api.checkNickname(token, nick);
        if (checkSeq.current === seq) setNickStatus(available ? 'available' : 'taken');
      } catch (err) {
        if (checkSeq.current !== seq) return;
        setNickStatus(err instanceof ApiError && err.code === 'invalid_nickname' ? 'invalid' : 'error');
      }
    }, 400);
    return () => window.clearTimeout(timer);
  }, [draft.nickname, adding, token]);

  const pinValid = draft.pin === '' || /^\d{3,4}$/.test(draft.pin);
  const canSave =
    draft.name.trim().length > 0 &&
    NICKNAME_RE.test(draft.nickname.trim().toLowerCase()) &&
    (nickStatus === 'available' || nickStatus === 'error') &&
    pinValid;

  const save = () => {
    if (!canSave) return;
    addChild({
      profile: {
        name: draft.name,
        nickname: draft.nickname,
        pin: draft.pin,
        gender: draft.gender,
      },
      settings: {
        choicesGridSize: draft.choicesGridSize,
      },
    });
    setAdding(false);
  };

  const NICK_MESSAGE: Record<NickStatus, string> = {
    idle: 'Лише малі літери, цифри та «_» (3–12 символів).',
    invalid: '✋ Нік має бути 3–12 символів: малі літери, цифри, «_».',
    checking: '⏳ Перевіряємо, чи вільний нік…',
    available: '✅ Нік вільний!',
    taken: '🙈 Цей нік уже зайнятий. Спробуй інший.',
    error: '⚠️ Не вдалося перевірити онлайн — збережемо як є.',
  };

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>👨‍👩‍👧 Діти</h3>
      <p className={styles.hint}>
        До {MAX_CHILDREN} дітей на акаунт. Торкніться дитини, щоб редагувати її налаштування нижче.
      </p>

      <div className={styles.childrenGrid}>
        {children.map((c) => (
          <div
            key={c.id}
            className={`${styles.childCard} ${c.id === activeChildId ? styles.childCardActive : ''}`}
          >
            <button
              type="button"
              className={styles.childPick}
              onClick={() => setActiveChild(c.id)}
              aria-label={`Редагувати ${c.profile.name}`}
            >
              <span className={`${styles.childAvatar} emoji`} aria-hidden>
                {AVATAR[c.profile.gender] ?? AVATAR.girl}
              </span>
              <span className={styles.childName}>{c.profile.name}</span>
              {c.profile.nickname && <span className={styles.childNick}>@{c.profile.nickname}</span>}
              {c.id === activeChildId && <span className={styles.activeTag}>редагується</span>}
            </button>
            <button
              type="button"
              className={styles.childRemove}
              onClick={() => setConfirmRemove(c.id)}
              aria-label={`Видалити ${c.profile.name}`}
            >
              🗑️
            </button>
          </div>
        ))}
      </div>

      <Button block size="lg" icon="➕" onClick={openAdd} disabled={atLimit}>
        {atLimit ? 'Максимум 5 дітей' : 'Додати дитину'}
      </Button>

      {/* ---- Add child ---- */}
      <Modal open={adding} onClose={() => setAdding(false)} title="Нова дитина" icon="🧒">
        <div className="stack">
          <div>
            <label className={styles.fieldLabel}>Ім'я</label>
            <input
              className={styles.textInput}
              value={draft.name}
              maxLength={16}
              placeholder="напр. Марко"
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              aria-label="Ім'я дитини"
            />
          </div>

          <div>
            <label className={styles.fieldLabel}>Унікальний нік (@нік)</label>
            <input
              className={styles.textInput}
              value={draft.nickname}
              maxLength={12}
              placeholder="напр. marko_speed"
              autoCapitalize="none"
              autoCorrect="off"
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  nickname: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 12),
                }))
              }
              aria-label="Унікальний нік"
            />
            <p className={`${styles.nickStatus} ${styles[`nick_${nickStatus}`] ?? ''}`}>
              {NICK_MESSAGE[nickStatus]}
            </p>
          </div>

          <div>
            <label className={styles.fieldLabel}>PIN для входу (3–4 цифри)</label>
            <input
              className={styles.textInput}
              value={draft.pin}
              inputMode="numeric"
              maxLength={4}
              placeholder="напр. 1234"
              onChange={(e) =>
                setDraft((d) => ({ ...d, pin: e.target.value.replace(/\D/g, '').slice(0, 4) }))
              }
              aria-label="PIN дитини"
            />
            <p className={styles.nickStatus}>
              {pinValid
                ? 'Дитина входить за ніком і цим PIN.'
                : '✋ PIN має бути 3 або 4 цифри.'}
            </p>
          </div>

          <div>
            <label className={styles.fieldLabel}>Стать</label>
            <div className={styles.chipRow}>
              {GENDER_OPTIONS.map((g) => (
                <Chip
                  key={g.id}
                  icon={g.icon}
                  label={g.label}
                  active={draft.gender === g.id}
                  onClick={() => setDraft((d) => ({ ...d, gender: g.id }))}
                />
              ))}
            </div>
          </div>

          <div>
            <label className={styles.fieldLabel}>Сітка відповідей</label>
            <div className={styles.chipRow}>
              {GRID_OPTIONS.map((o) => (
                <Chip
                  key={o.id}
                  label={o.label}
                  active={draft.choicesGridSize === o.id}
                  onClick={() => setDraft((d) => ({ ...d, choicesGridSize: o.id }))}
                />
              ))}
            </div>
          </div>

          <Button block size="lg" icon="✅" onClick={save} disabled={!canSave}>
            Створити профіль
          </Button>
        </div>
      </Modal>

      {/* ---- Remove confirm ---- */}
      <Modal open={confirmRemove !== null} onClose={() => setConfirmRemove(null)} title="Видалити дитину?" icon="🗑️">
        <p className={styles.hint}>Увесь прогрес цього профілю буде втрачено. Цю дію не можна скасувати.</p>
        <div className="stack">
          <Button
            block
            size="lg"
            icon="🗑️"
            onClick={() => {
              if (confirmRemove) removeChild(confirmRemove);
              setConfirmRemove(null);
            }}
          >
            Так, видалити
          </Button>
          <Button block variant="ghost" icon="↩️" onClick={() => setConfirmRemove(null)}>
            Скасувати
          </Button>
        </div>
      </Modal>
    </section>
  );
}
