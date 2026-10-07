
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGameStore,
  selectPersistable,
  TIP_PREFIX,
  type CelebrationStyle,
  type ChoicesGridSize,
  type CompanionSpeed,
  type Gender,
  type Milestone,
  type PersistableState,
} from '@/core/child/store/useGameStore';
import { api } from '@/core/account/api/client';
import { useSyncControl } from '@/core/account/sync/syncControl';
import { computeAge } from '@/core/utils/age';
import { subSteps, pathKey } from '@/core/child/progress/path';
import { moduleRegistry } from '@/core/game/kernel/ModuleRegistry';
import { isFreePlay } from '@/core/game/kernel/gameConfig';
import { uid } from '@/core/utils/random';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { ThemeGrid } from '@/components/settings/ThemeGrid';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import { ChildManager } from './ChildManager';
import { GoalRow } from './GoalRow';
import { useAuthStore } from '@/core/account/auth/useAuthStore';
import styles from './Parent.module.css';

const GENDER_OPTIONS: { id: Gender; label: string; icon: string }[] = [
  { id: 'girl', label: 'Дівчинка', icon: '👧' },
  { id: 'boy', label: 'Хлопчик', icon: '👦' },
];

const MONTHS = [
  'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
  'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень',
];

const SPEED_OPTIONS: { id: CompanionSpeed; label: string; icon: string }[] = [
  { id: 'off', label: 'Вимкнено', icon: '🛑' },
  { id: 'verySlow', label: 'Дуже повільно', icon: '🐌' },
  { id: 'slow', label: 'Повільно', icon: '🐢' },
  { id: 'medium', label: 'Помірно', icon: '🚶' },
  { id: 'fast', label: 'Швидко', icon: '⚡' },
];

const CELEBRATION_OPTIONS: { id: CelebrationStyle; label: string; icon: string }[] = [
  { id: 'balloons', label: 'Кульки', icon: '🎈' },
  { id: 'balls', label: 'М’ячики', icon: '⚽' },
  { id: 'stars', label: 'Зірочки', icon: '🏅' },
  { id: 'fireworks', label: 'Феєрверк', icon: '🎆' },
  { id: 'candy', label: 'Цукерки', icon: '🍬' },
];



const GRID_OPTIONS: { id: ChoicesGridSize; label: string; icon: string }[] = [
  { id: 6, label: '6 (3×2)', icon: '⬜' },
  { id: 9, label: '9 (3×3)', icon: '🔳' },
];

const SESSION_MIN_OPTIONS = [5, 10, 15, 20, 30];
const COOLDOWN_MIN_OPTIONS = [15, 30, 45, 60, 90];
const DAILY_MIN_OPTIONS = [20, 30, 45, 60, 90, 120];

/** Main settings (PRD §10): profile, look & feel, pacing, goals. Audio lives
 *  on its own sub-page so the many sound options stay out of the way. */
export function ParentDashboard() {
  const navigate = useNavigate();
  const activeChildId = useGameStore((s) => s.activeChildId);
  const profile = useGameStore((s) => s.profile);
  const theme = useActiveTheme();
  const setProfile = useGameStore((s) => s.setProfile);
  const settings = useGameStore((s) => s.settings);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const updateTimeControl = useGameStore((s) => s.updateTimeControl);
  const milestones = useGameStore((s) => s.milestones);
  const setMilestones = useGameStore((s) => s.setMilestones);
  const progress = useGameStore((s) => s.progress);
  const setStep = useGameStore((s) => s.setStep);
  const resetProgress = useGameStore((s) => s.resetProgress);
  const resetScreenTime = useGameStore((s) => s.resetScreenTime);
  const tipsSeen = useGameStore((s) => s.treasures.filter((t) => t.startsWith(TIP_PREFIX)).length);
  const resetTips = useGameStore((s) => s.resetTips);
  const email = useAuthStore((s) => s.user?.email);
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);

  // Explicit-save mode: pause the live server-sync while editing here; snapshot
  // the saved state so leaving without "Save" discards unsaved edits.
  const setPaused = useSyncControl((s) => s.setPaused);
  const savedSnapshot = useRef<PersistableState | null>(null);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [timeReset, setTimeReset] = useState(false);

  useEffect(() => {
    savedSnapshot.current = selectPersistable(useGameStore.getState());
    setPaused(true);
    return () => {
      // Discard any unsaved edits by restoring the last saved snapshot — unless
      // the session was just cleared (logout already reset the store).
      if (savedSnapshot.current && useAuthStore.getState().token) {
        useGameStore.getState().hydrate(savedSnapshot.current);
      }
      setPaused(false);
    };
  }, [setPaused]);

  const saveChanges = async () => {
    if (!token || saving) return;
    setSaving(true);
    try {
      const data = selectPersistable(useGameStore.getState());
      await api.putState(token, data);
      savedSnapshot.current = data;
      setJustSaved(true);
      window.setTimeout(() => setJustSaved(false), 2500);
    } catch {
      /* keep editing; the parent can retry */
    } finally {
      setSaving(false);
    }
  };

  // Give the child a fresh tank right now: clear the cooldown + session + used
  // minutes. Takes effect immediately, without a full "Save".
  const resetTimeNow = async () => {
    resetScreenTime();
    setTimeReset(true);
    window.setTimeout(() => setTimeReset(false), 2500);
    const childId = useGameStore.getState().activeChildId;
    if (!token || !childId) return;
    try {
      // Play time lives on the server (PRD v4.0 §2.2) — the top-up is a
      // dedicated parent-only call, not part of the save.
      const view = await api.sessionReset(token, childId);
      useGameStore.getState().applyServerScreenTime(childId, view, false);
    } catch {
      /* offline: the tank refills once the request can be retried */
    }
  };

  // Only games with a difficulty ladder have a step to set (free play has none).
  const subPaths = moduleRegistry.getAll().flatMap((m) =>
    m.subCategories
      .filter((sub) => !isFreePlay(sub))
      .map((sub) => ({ moduleId: m.id, moduleIcon: m.icon, sub })),
  );

  const patchMilestone = (id: string, patch: Partial<Milestone>) =>
    setMilestones(milestones.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  const removeMilestone = (id: string) =>
    setMilestones(milestones.filter((m) => m.id !== id));
  const addMilestone = () =>
    setMilestones([...milestones, { id: uid('m'), amount: (milestones.at(-1)?.amount ?? 0) + 50, reward: '' }]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 12 }, (_, i) => currentYear - 3 - i); // ages ~3–14
  const age = computeAge(profile.birthYear, profile.birthMonth);

  return (
    <div className="stack">
      <ChildManager />

      {activeChildId ? (
        <>
      {/* ---- Child profile ---- */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>👤 Профіль дитини</h3>
        <label className={styles.fieldLabel}>Ім'я</label>
        <input
          className={styles.textInput}
          value={profile.name}
          maxLength={16}
          onChange={(e) => setProfile({ name: e.target.value })}
          aria-label="Ім'я дитини"
        />

        <label className={styles.fieldLabel}>Унікальний нік (@нік)</label>
        <input
          className={styles.textInput}
          value={profile.nickname}
          maxLength={12}
          placeholder="напр. marko_speed"
          onChange={(e) => setProfile({ nickname: e.target.value })}
          aria-label="Унікальний нік дитини"
        />
        <p className={styles.hint}>Лише малі літери, цифри та «_» (3–12 символів). Показується у шторці профілю.</p>

        <label className={styles.fieldLabel}>PIN для входу (3–4 цифри)</label>
        <input
          className={styles.textInput}
          value={profile.pin}
          inputMode="numeric"
          maxLength={4}
          placeholder="напр. 1234"
          onChange={(e) => setProfile({ pin: e.target.value })}
          aria-label="PIN дитини"
        />
        <p className={styles.hint}>Дитина входить у свій акаунт за ніком і цим PIN.</p>

        <label className={styles.fieldLabel}>Дата народження</label>
        <div className={styles.inline}>
          <select
            className={styles.textInput}
            value={profile.birthMonth}
            onChange={(e) => setProfile({ birthMonth: Number(e.target.value) })}
            aria-label="Місяць народження"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
          <select
            className={styles.textInput}
            value={profile.birthYear}
            onChange={(e) => setProfile({ birthYear: Number(e.target.value) })}
            aria-label="Рік народження"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <p className={styles.hint}>Вік рахується автоматично: {age} р.</p>

        <label className={styles.fieldLabel}>Стать</label>
        <div className={styles.chipRow}>
          {GENDER_OPTIONS.map((g) => (
            <Chip key={g.id} icon={g.icon} label={g.label} active={profile.gender === g.id} onClick={() => setProfile({ gender: g.id })} />
          ))}
        </div>
      </section>

      {/* ---- Audio link (hidden sub-page) ---- */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>🔊 Звук, голос і підписи</h3>
        <p className={styles.hint}>Керування всіма звуками, голосовими підказками та текстовими підписами.</p>
        <Button block icon="🎚️" onClick={() => navigate('/parent/audio')}>
          Відкрити налаштування звуку
        </Button>
      </section>

      {/* ---- Appearance ---- */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>🎨 Тема (світ)</h3>
        <ThemeGrid />
      </section>

      {/* ---- Companion & celebration ---- */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>🏎️ Відкочування супутника</h3>
        <p className={styles.hint}>
          Якщо дитина довго не відповідає, супутник плавно котиться назад. Щойно він відкотиться на цілий крок,
          у рівні з’являється ще одне завдання (не більше трьох додаткових).
        </p>
        <div className={styles.chipRow}>
          {SPEED_OPTIONS.map((o) => (
            <Chip key={o.id} icon={o.icon} label={o.label} active={settings.companionSpeed === o.id} onClick={() => updateSettings({ companionSpeed: o.id })} />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>💡 Підказки про кнопки</h3>
        <p className={styles.hint}>
          Під час першого знайомства гра пояснює дитині, що означає кожна кнопка. Підказка, яку дитина закрила,
          більше не з’являється. Прочитано підказок: {tipsSeen}.
        </p>
        <Button variant="ghost" icon="🔄" block disabled={tipsSeen === 0} onClick={resetTips}>
          Показати знову
        </Button>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>🎉 Святкування перемоги</h3>
        <div className={styles.chipRow}>
          {CELEBRATION_OPTIONS.map((o) => (
            <Chip key={o.id} icon={o.icon} label={o.label} active={settings.celebration === o.id} onClick={() => updateSettings({ celebration: o.id })} />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>🔢 Сітка відповідей</h3>
        <p className={styles.hint}>Більше варіантів — важче вгадати навмання (анти-вгадування).</p>
        <div className={styles.chipRow}>
          {GRID_OPTIONS.map((o) => (
            <Chip
              key={o.id}
              icon={o.icon}
              label={o.label}
              active={settings.choicesGridSize === o.id}
              onClick={() => updateSettings({ choicesGridSize: o.id })}
            />
          ))}
        </div>
      </section>

      {/* ---- Screen time / fuel ---- */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>⛽ Екранний час</h3>
        <p className={styles.hint}>
          Дитина бачить лише тематичну шкалу пального — без цифрових таймерів. Коли пальне закінчується,
          грається коротка мультанімація, а далі — спокійний відпочинок.
        </p>

        <label className={styles.fieldLabel}>Тривалість сеансу (хв)</label>
        <select
          className={styles.textInput}
          value={settings.timeControl.sessionDurationMinutes}
          onChange={(e) => updateTimeControl({ sessionDurationMinutes: Number(e.target.value) })}
          aria-label="Тривалість сеансу у хвилинах"
        >
          {SESSION_MIN_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n} хв
            </option>
          ))}
        </select>

        <label className={styles.fieldLabel}>Відпочинок між сеансами (хв)</label>
        <select
          className={styles.textInput}
          value={settings.timeControl.cooldownMinutes}
          onChange={(e) => updateTimeControl({ cooldownMinutes: Number(e.target.value) })}
          aria-label="Тривалість відпочинку у хвилинах"
        >
          {COOLDOWN_MIN_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n} хв
            </option>
          ))}
        </select>

        <label className={styles.fieldLabel}>Ліміт на день (хв)</label>
        <select
          className={styles.textInput}
          value={settings.timeControl.maxDailyMinutes}
          onChange={(e) => updateTimeControl({ maxDailyMinutes: Number(e.target.value) })}
          aria-label="Денний ліміт у хвилинах"
        >
          {DAILY_MIN_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n} хв
            </option>
          ))}
        </select>

        <label className={styles.fieldLabel}>Поповнити час зараз</label>
        <p className={styles.hint}>
          Миттєво повертає дитині повну шкалу й знімає відпочинок — незалежно від збереження інших змін.
        </p>
        <Button block icon={timeReset ? '✅' : '⛽'} onClick={resetTimeNow}>
          {timeReset ? 'Час поповнено!' : 'Поповнити ігровий час'}
        </Button>
      </section>

      {/* ---- Milestone goals on the path ---- */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>🎯 Сімейні цілі</h3>
        <p className={styles.hint}>
          Скільки артефактів (із будь-яких завдань) треба назбирати у спільний кошик, щоб отримати нагороду.
        </p>
        <div className="stack">
          {milestones.map((m) => (
            <GoalRow
              key={m.id}
              goal={m}
              artifact={theme.artifact.emoji}
              onChange={(patch) => patchMilestone(m.id, patch)}
              onRemove={() => removeMilestone(m.id)}
            />
          ))}
        </div>
        <div style={{ marginTop: 14 }}>
          <Button block variant="ghost" icon="➕" onClick={addMilestone}>
            Додати ціль
          </Button>
        </div>
      </section>

      {/* ---- Per-task step control ---- */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>🪜 Сходинка завдання</h3>
        <p className={styles.hint}>
          Познач, на якій сходинці зараз має бути дитина для кожного завдання.
        </p>
        <div className="stack">
          {subPaths.map(({ moduleId, moduleIcon, sub }) => {
            const step = progress[pathKey(moduleId, sub.id)] ?? 1;
            const maxSteps = subSteps(sub);
            return (
              <div key={`${moduleId}:${sub.id}`} className={styles.stepRow}>
                <span className={styles.stepName}>
                  <span className="emoji" aria-hidden>
                    {sub.icon || moduleIcon}
                  </span>
                  {sub.label}
                </span>
                <input
                  className={styles.textInput}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={maxSteps}
                  value={step}
                  onChange={(e) => setStep(moduleId, sub.id, Number(e.target.value), maxSteps)}
                  aria-label={`Сходинка для ${sub.label} (макс ${maxSteps})`}
                />
              </div>
            );
          })}
        </div>
      </section>

      <section className={styles.section}>
        <Button block variant="ghost" icon="♻️" onClick={resetProgress}>
          Скинути весь прогрес
        </Button>
      </section>
        </>
      ) : (
        <section className={styles.section}>
          <p className={styles.hint} style={{ margin: 0, textAlign: 'center' }}>
            Оберіть дитину вище або додайте нову, щоб налаштувати її гру.
          </p>
        </section>
      )}

      {/* ---- Account ---- */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>👋 Акаунт</h3>
        {email && <p className={styles.hint}>Ви увійшли як {email}</p>}
        <Button block variant="ghost" icon="🚪" onClick={logout}>
          Вийти з акаунту
        </Button>
      </section>

      {/* ---- Explicit save (no live auto-save in the parent cabinet) ---- */}
      <div className={styles.saveBar}>
        <Button block size="lg" icon={justSaved ? '✅' : '💾'} onClick={saveChanges} disabled={saving}>
          {saving ? 'Зберігаємо…' : justSaved ? 'Збережено!' : 'Зберегти зміни'}
        </Button>
      </div>
    </div>
  );
}
