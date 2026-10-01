
import { useNavigate } from 'react-router-dom';
import {
  useGameStore,
  type CelebrationStyle,
  type CompanionSpeed,
  type Gender,
  type StepMilestone,
} from '@/core/store/useGameStore';
import { computeAge } from '@/core/utils/age';
import { MAX_STEPS, subSteps, pathKey } from '@/core/progress/path';
import { moduleRegistry } from '@/core/kernel/ModuleRegistry';
import { uid } from '@/core/utils/random';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { ThemeGrid } from '@/components/settings/ThemeGrid';
import { useAuthStore } from '@/core/auth/useAuthStore';
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
  { id: 'slow', label: 'Повільно', icon: '🐢' },
  { id: 'medium', label: 'Помірно', icon: '🐌' },
  { id: 'fast', label: 'Швидко', icon: '⚡' },
];

const CELEBRATION_OPTIONS: { id: CelebrationStyle; label: string; icon: string }[] = [
  { id: 'balloons', label: 'Кульки', icon: '🎈' },
  { id: 'balls', label: 'М’ячики', icon: '⚽' },
  { id: 'stars', label: 'Зірочки', icon: '🏅' },
  { id: 'fireworks', label: 'Феєрверк', icon: '🎆' },
  { id: 'candy', label: 'Цукерки', icon: '🍬' },
];

const SESSION_OPTIONS = [3, 5, 8, 10];

/** Main settings (PRD §10): profile, look & feel, pacing, goals. Audio lives
 *  on its own sub-page so the many sound options stay out of the way. */
export function ParentDashboard() {
  const navigate = useNavigate();
  const profile = useGameStore((s) => s.profile);
  const setProfile = useGameStore((s) => s.setProfile);
  const settings = useGameStore((s) => s.settings);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const milestones = useGameStore((s) => s.milestones);
  const setMilestones = useGameStore((s) => s.setMilestones);
  const progress = useGameStore((s) => s.progress);
  const setStep = useGameStore((s) => s.setStep);
  const resetProgress = useGameStore((s) => s.resetProgress);
  const email = useAuthStore((s) => s.user?.email);
  const logout = useAuthStore((s) => s.logout);

  const subPaths = moduleRegistry.getAll().flatMap((m) =>
    m.subCategories.map((sub) => ({ moduleId: m.id, moduleIcon: m.icon, sub })),
  );

  const patchMilestone = (id: string, patch: Partial<StepMilestone>) =>
    setMilestones(milestones.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  const removeMilestone = (id: string) =>
    setMilestones(milestones.filter((m) => m.id !== id));
  const addMilestone = () =>
    setMilestones([...milestones, { id: uid('m'), step: Math.min(MAX_STEPS, (milestones.at(-1)?.step ?? 0) + 5), reward: '' }]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 12 }, (_, i) => currentYear - 3 - i); // ages ~3–14
  const age = computeAge(profile.birthYear, profile.birthMonth);

  return (
    <div className="stack">
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
        <p className={styles.hint}>Якщо дитина довго не відповідає, супутник плавно котиться назад.</p>
        <div className={styles.chipRow}>
          {SPEED_OPTIONS.map((o) => (
            <Chip key={o.id} icon={o.icon} label={o.label} active={settings.companionSpeed === o.id} onClick={() => updateSettings({ companionSpeed: o.id })} />
          ))}
        </div>
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
        <h3 className={styles.sectionTitle}>⏱️ Завдань у сесії</h3>
        <div className={styles.chipRow}>
          {SESSION_OPTIONS.map((n) => (
            <Chip key={n} label={String(n)} active={settings.sessionLength === n} onClick={() => updateSettings({ sessionLength: n })} />
          ))}
        </div>
      </section>

      {/* ---- Milestone goals on the path ---- */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>🎯 Цілі на шляху</h3>
        <p className={styles.hint}>
          На якій сходинці дитина отримує яку нагороду. Вони показуються на мапі шляху.
        </p>
        <div className="stack">
          {milestones.map((m) => (
            <div key={m.id} className={styles.milestoneRow}>
              <div className={styles.stepField}>
                <span className={styles.stepLabel}>Сходинка</span>
                <input
                  className={styles.textInput}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={MAX_STEPS}
                  value={m.step}
                  onChange={(e) => patchMilestone(m.id, { step: Number(e.target.value) })}
                  aria-label="Сходинка"
                />
              </div>
              <input
                className={styles.textInput}
                value={m.reward}
                placeholder="Напр. Спекти печиво 🍪"
                onChange={(e) => patchMilestone(m.id, { reward: e.target.value })}
                aria-label="Нагорода"
              />
              <button className={styles.removeBtn} onClick={() => removeMilestone(m.id)} aria-label="Видалити ціль">
                🗑️
              </button>
            </div>
          ))}
        </div>
        <Button block variant="ghost" icon="➕" onClick={addMilestone}>
          Додати ціль
        </Button>
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

      {/* ---- Account ---- */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>👋 Акаунт</h3>
        {email && <p className={styles.hint}>Ви увійшли як {email}</p>}
        <Button block variant="ghost" icon="🚪" onClick={logout}>
          Вийти з акаунту
        </Button>
      </section>
    </div>
  );
}
