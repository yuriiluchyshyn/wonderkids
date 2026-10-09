
import { useTimeBudget } from '@/core/child/time/screenTime';
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
import { GALAXIES, galaxyKey } from '@/core/game/galaxies';
import { Rich, useCurrency, useDeviceLang, useGameLang, useLang, useParentLang, useT, useVoiceLang } from '@/core/i18n';
import type { GameGroup, SubCategory } from '@/core/game/kernel/types';
import { LANG_CODES, language, type LangCode } from '@/core/lang';
import { CURRENCIES } from '@/core/game/content/currency';
import { portalUrl } from '@/core/app/portal';
import { uid } from '@/core/utils/random';
import { Chip } from '@/components/ui/Chip';
import { cn } from '@/core/utils/cn';
import { Button } from '@/components/ui/Button';
import { ThemeGrid } from '@/components/settings/ThemeGrid';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import { ChildManager } from './ChildManager';
import { GoalRow } from './GoalRow';
import { CHILD_HANDOFF, useAuthStore } from '@/core/account/auth/useAuthStore';
import { auth0Enabled, auth0SendPasswordReset } from '@/core/account/auth/auth0';
import styles from './Parent.module.css';

/**
 * The children's settings as text, to tell whether anything was changed since
 * the last save. Play time is left out: the server owns it, and it moves by
 * itself (and with «Заправити»), which is not an edit to save.
 */
function settingsJson({ children, parentLang }: Pick<PersistableState, 'children' | 'parentLang'>): string {
  return JSON.stringify({ children, parentLang }, (key, value) => (key === 'screenTime' ? undefined : value));
}

const GENDER_OPTIONS: { id: Gender; icon: string }[] = [
  { id: 'girl', icon: '👧' },
  { id: 'boy', icon: '👦' },
];

/** «Січень» … «Грудень» — the months as the language itself names them. */
function monthNames(lang: LangCode): string[] {
  const format = new Intl.DateTimeFormat(lang, { month: 'long' });
  return Array.from({ length: 12 }, (_, i) => {
    const name = format.format(new Date(2021, i, 1));
    return name.charAt(0).toLocaleUpperCase(lang) + name.slice(1);
  });
}

const SPEED_OPTIONS: { id: CompanionSpeed; icon: string }[] = [
  { id: 'off', icon: '🛑' },
  { id: 'verySlow', icon: '🐌' },
  { id: 'slow', icon: '🐢' },
  { id: 'medium', icon: '🚶' },
  { id: 'fast', icon: '⚡' },
];

const CELEBRATION_OPTIONS: { id: CelebrationStyle; icon: string }[] = [
  { id: 'balloons', icon: '🎈' },
  { id: 'balls', icon: '⚽' },
  { id: 'stars', icon: '🏅' },
  { id: 'fireworks', icon: '🎆' },
  { id: 'candy', icon: '🍬' },
];



const GRID_OPTIONS: { id: ChoicesGridSize; label: string; icon: string }[] = [
  { id: 6, label: '6 (3×2)', icon: '⬜' },
  { id: 9, label: '9 (3×3)', icon: '🔳' },
];

const SESSION_MIN_OPTIONS = [5, 10, 15, 20, 30];
const COOLDOWN_MIN_OPTIONS = [15, 30, 45, 60, 90];
const DAILY_MIN_OPTIONS = [20, 30, 45, 60, 90, 120];

/** The games of a galaxy in their sets (the Language galaxy: one per language); a galaxy without sets is one unnamed set. */
function setsOf(subs: SubCategory[]): { group?: GameGroup; subs: SubCategory[] }[] {
  const sets = new Map<string, { group?: GameGroup; subs: SubCategory[] }>();
  for (const sub of subs) {
    const id = sub.group?.id ?? '';
    if (!sets.has(id)) sets.set(id, { group: sub.group, subs: [] });
    sets.get(id)?.subs.push(sub);
  }
  return [...sets.values()];
}

/** One chip per language of the app; the chosen one is lit. */
function LangChips({ value, onPick }: { value: LangCode; onPick: (lang: LangCode) => void }) {
  return (
    <div className={styles.chipRow}>
      {LANG_CODES.map((code) => (
        <Chip key={code} icon={language(code).flag} label={language(code).name} active={value === code} onClick={() => onPick(code)} />
      ))}
    </div>
  );
}

/** Main settings (PRD §10): profile, look & feel, pacing, goals. Audio lives
 *  on its own sub-page so the many sound options stay out of the way. */
export function ParentDashboard() {
  const t = useT();
  const lang = useLang();
  const parentLang = useParentLang();
  const gameLang = useGameLang();
  const voiceLang = useVoiceLang();
  const setParentLang = useGameStore((s) => s.setParentLang);
  const chooseDeviceLang = useDeviceLang((s) => s.choose);
  // The cabinet's language is also what this device is offered from now on (the login page).
  const pickParentLang = (next: LangCode) => {
    setParentLang(next);
    chooseDeviceLang(next);
  };
  // The money in effect: chosen here, or — until then — that of the game's language.
  const currency = useCurrency();
  const hidden = new Set(useGameStore((s) => s.settings.hiddenGames));
  const setGamesHidden = useGameStore((s) => s.setGamesHidden);
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
  // What was last saved, as text: «Зберегти» is offered only while the
  // children's settings differ from it.
  const [savedJson, setSavedJson] = useState(() => settingsJson(useGameStore.getState()));
  const dirty = useGameStore((s) => settingsJson(s)) !== savedJson;
  // Only a password account has a password to change here.
  const hasPassword = useAuthStore((s) => s.user?.provider) === 'auth0';
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
      setSavedJson(settingsJson(data));
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
  const budget = useTimeBudget();
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

  // Every game, to show it to the child or put it away; those with a difficulty
  // ladder also have a step to set (free play has none). One group per galaxy,
  // in the hub's order; inside it the games stay in their sets (a language).
  const stepGroups = moduleRegistry
    .getAll(lang)
    .map((m) => {
      const galaxy = GALAXIES.find((g) => g.moduleId === m.id);
      return {
        moduleId: m.id,
        name: galaxy ? t(galaxyKey(galaxy.id)) : m.id,
        icon: galaxy?.icon ?? m.icon,
        order: galaxy ? GALAXIES.indexOf(galaxy) : GALAXIES.length,
        subs: m.subCategories,
        sets: setsOf(m.subCategories),
      };
    })
    .filter((g) => g.subs.length > 0)
    .sort((a, b) => a.order - b.order);

  // «Відкрити гру»: the child's game in a new tab, signed in as that child —
  // no nick and PIN to type. The tab is opened at once (a browser only allows
  // that inside the tap itself) and pointed at the game when the server has
  // answered with the child's session.
  // «Змінити пароль»: Auth0 emails the link; nothing about passwords lives here.
  const [reset, setReset] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const sendPasswordReset = async () => {
    if (!email || reset === 'sending') return;
    setReset('sending');
    setReset((await auth0SendPasswordReset(email)) ? 'sent' : 'failed');
  };

  const [openGameError, setOpenGameError] = useState(false);
  const openChildGame = () => {
    if (!token || !activeChildId) return;
    setOpenGameError(false);
    const tab = window.open('', '_blank');
    api
      .openChild(token, activeChildId)
      .then((session) => {
        const url = new URL(portalUrl('kid', '/login'), window.location.origin).href + CHILD_HANDOFF + session.token;
        if (tab) tab.location.replace(url);
        else window.location.assign(url);
      })
      .catch(() => {
        tab?.close();
        setOpenGameError(true);
      });
  };

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
      {/* ---- Who is signed in; on a wide screen also «Зберегти» and «Вийти» ---- */}
      <div className={styles.accountBar}>
        <span className={styles.accountWho}>
          <span className="emoji" aria-hidden>
            👤
          </span>
          {email ? (
            <Rich k="parent.signedInAs" name="email" value={email} />
          ) : (
            t('parentLogin.title')
          )}
        </span>
        <div className={cn(styles.accountActions, styles.wideOnly)}>
          <button type="button" className={cn(styles.barButton, styles.barSave)} onClick={saveChanges} disabled={saving || !dirty}>
            {saving ? t('parent.saving') : justSaved ? t('parent.savedBar') : dirty ? t('parent.saveBar') : t('parent.allSaved')}
          </button>
          <button type="button" className={styles.barButton} onClick={logout}>
            {t('parent.logoutBar')}
          </button>
        </div>
      </div>

      <ChildManager />

      {/* ---- Languages: the cabinet's own, and — for the chosen child — the game's and the voice's ---- */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('parent.lang.title')}</h3>
        <p className={styles.hint}>{t('parent.lang.hint')}</p>
        <label className={styles.fieldLabel}>{t('parent.lang.parent')}</label>
        <LangChips value={parentLang} onPick={pickParentLang} />
        {activeChildId && (
          <>
            <label className={styles.fieldLabel}>{t('parent.lang.game')}</label>
            <LangChips value={gameLang} onPick={(lang) => updateSettings({ gameLang: lang })} />
            <label className={styles.fieldLabel}>{t('parent.lang.voice')}</label>
            <LangChips value={voiceLang} onPick={(lang) => updateSettings({ voiceLang: lang })} />
          </>
        )}
      </section>

      {activeChildId ? (
        <>
      {/* ---- Child profile ---- */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('parent.profile.title')}</h3>
        <Button block icon="🎮" onClick={openChildGame}>
          {t('parent.profile.openGame')}
        </Button>
        <p className={styles.hint}>
          {openGameError
            ? t('parent.profile.openFailed')
            : t('parent.profile.openHint')}
        </p>
        <label className={styles.fieldLabel}>{t('parent.profile.name')}</label>
        <input
          className={styles.textInput}
          value={profile.name}
          maxLength={16}
          onChange={(e) => setProfile({ name: e.target.value })}
          aria-label={t('parent.profile.nameLabel')}
        />

        <label className={styles.fieldLabel}>{t('parent.profile.nick')}</label>
        <input
          className={styles.textInput}
          value={profile.nickname}
          maxLength={12}
          placeholder={t('childLogin.nickPlaceholder')}
          onChange={(e) => setProfile({ nickname: e.target.value })}
          aria-label={t('parent.profile.nickLabel')}
        />
        <p className={styles.hint}>{t('parent.profile.nickHint')}</p>

        <label className={styles.fieldLabel}>{t('parent.profile.pin')}</label>
        <input
          className={styles.textInput}
          value={profile.pin}
          inputMode="numeric"
          maxLength={4}
          placeholder={t('parent.profile.pinPlaceholder')}
          onChange={(e) => setProfile({ pin: e.target.value })}
          aria-label={t('parent.profile.pinLabel')}
        />
        <p className={styles.hint}>{t('parent.profile.pinHint')}</p>

        <label className={styles.fieldLabel}>{t('parent.profile.birth')}</label>
        <div className={styles.inline}>
          <select
            className={styles.textInput}
            value={profile.birthMonth}
            onChange={(e) => setProfile({ birthMonth: Number(e.target.value) })}
            aria-label={t('parent.profile.birthMonth')}
          >
            {monthNames(lang).map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
          <select
            className={styles.textInput}
            value={profile.birthYear}
            onChange={(e) => setProfile({ birthYear: Number(e.target.value) })}
            aria-label={t('parent.profile.birthYear')}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <p className={styles.hint}>{t('parent.profile.age', { age })}</p>

        <label className={styles.fieldLabel}>{t('parent.profile.gender')}</label>
        <div className={styles.chipRow}>
          {GENDER_OPTIONS.map((g) => (
            <Chip key={g.id} icon={g.icon} label={t(`gender.${g.id}`)} active={profile.gender === g.id} onClick={() => setProfile({ gender: g.id })} />
          ))}
        </div>
      </section>

      {/* ---- Audio link (hidden sub-page) ---- */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('parent.audio.title')}</h3>
        <p className={styles.hint}>{t('parent.audio.hint')}</p>
        <Button block icon="🎚️" onClick={() => navigate('/parent/audio')}>
          {t('parent.audio.open')}
        </Button>
      </section>

      {/* ---- Appearance ---- */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('parent.theme.title')}</h3>
        <ThemeGrid />
      </section>

      {/* ---- Companion & celebration ---- */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('parent.rollback.title')}</h3>
        <p className={styles.hint}>
          {t('parent.rollback.hint')}
        </p>
        <div className={styles.chipRow}>
          {SPEED_OPTIONS.map((o) => (
            <Chip key={o.id} icon={o.icon} label={t(`speed.${o.id}`)} active={settings.companionSpeed === o.id} onClick={() => updateSettings({ companionSpeed: o.id })} />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('parent.tips.title')}</h3>
        <p className={styles.hint}>
          {t('parent.tips.hint', { count: tipsSeen })}
        </p>
        <Button variant="ghost" icon="🔄" block disabled={tipsSeen === 0} onClick={resetTips}>
          {t('parent.tips.reset')}
        </Button>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('parent.celebration.title')}</h3>
        <div className={styles.chipRow}>
          {CELEBRATION_OPTIONS.map((o) => (
            <Chip key={o.id} icon={o.icon} label={t(`celebration.${o.id}`)} active={settings.celebration === o.id} onClick={() => updateSettings({ celebration: o.id })} />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('parent.grid.title')}</h3>
        <p className={styles.hint}>{t('parent.grid.hint')}</p>
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

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('parent.facts.title')}</h3>
        <p className={styles.hint}>
          {t('parent.facts.hint')}
        </p>
        <div className={styles.chipRow}>
          <Chip
            icon={settings.funFacts ? '💡' : '⏩'}
            label={settings.funFacts ? t('parent.facts.on') : t('parent.facts.off')}
            active={settings.funFacts}
            onClick={() => updateSettings({ funFacts: !settings.funFacts })}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('parent.money.title')}</h3>
        <p className={styles.hint}>
          {t('parent.money.hint')} {settings.currencyChosen ? t('parent.money.chosen') : t('parent.money.auto')}
        </p>
        <div className={styles.chipRow}>
          {Object.values(CURRENCIES).map((c) => (
            <Chip key={c.id} icon={c.flag} label={`${t(`currency.${c.id}`)}, ${c.sign}`} active={currency === c.id} onClick={() => updateSettings({ currency: c.id, currencyChosen: true })} />
          ))}
        </div>
      </section>

      {/* ---- Screen time / fuel ---- */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('parent.time.title')}</h3>
        <p className={styles.hint}>
          {t('parent.time.hint')}
        </p>

        <label className={styles.fieldLabel}>{t('parent.time.session')}</label>
        <select
          className={styles.textInput}
          value={settings.timeControl.sessionDurationMinutes}
          onChange={(e) => updateTimeControl({ sessionDurationMinutes: Number(e.target.value) })}
          aria-label={t('parent.time.sessionLabel')}
        >
          {SESSION_MIN_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {t('parent.time.minutes', { n })}
            </option>
          ))}
        </select>

        <label className={styles.fieldLabel}>{t('parent.time.cooldown')}</label>
        <select
          className={styles.textInput}
          value={settings.timeControl.cooldownMinutes}
          onChange={(e) => updateTimeControl({ cooldownMinutes: Number(e.target.value) })}
          aria-label={t('parent.time.cooldownLabel')}
        >
          {COOLDOWN_MIN_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {t('parent.time.minutes', { n })}
            </option>
          ))}
        </select>

        <label className={styles.fieldLabel}>{t('parent.time.daily')}</label>
        <select
          className={styles.textInput}
          value={settings.timeControl.maxDailyMinutes}
          onChange={(e) => updateTimeControl({ maxDailyMinutes: Number(e.target.value) })}
          aria-label={t('parent.time.dailyLabel')}
        >
          {DAILY_MIN_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {t('parent.time.minutes', { n })}
            </option>
          ))}
        </select>

        <label className={styles.fieldLabel}>{t('parent.time.refill')}</label>
        <p className={styles.hint}>
          {t('parent.time.refillHint')}
        </p>
        {/* The real countdown lives here, for the parent — the child's rest screen never shows one. */}
        {budget.inCooldown && (
          <p className="muted" role="status">
            {t('parent.time.resting', { min: Math.floor(budget.cooldownRemainingSec / 60), sec: String(budget.cooldownRemainingSec % 60).padStart(2, '0') })}
          </p>
        )}
        <Button block icon={timeReset ? '✅' : '⛽'} onClick={resetTimeNow}>
          {timeReset ? t('parent.time.refilled') : t('parent.time.refillButton')}
        </Button>
      </section>

      {/* ---- Milestone goals on the path ---- */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('parent.goals.title')}</h3>
        <p className={styles.hint}>
          {t('parent.goals.hint')}
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
            {t('parent.goals.add')}
          </Button>
        </div>
      </section>

      {/* ---- Per-task step control ---- */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('parent.games.title')}</h3>
        <p className={styles.hint}>
          {t('parent.games.hint')}
        </p>
        <div className="stack">
          {/* One galaxy at a time: all closed until the parent opens one. */}
          {stepGroups.map((group) => (
            <details key={group.moduleId} className={styles.stepGroup}>
              <summary className={styles.stepGroupHead}>
                <span className="emoji" aria-hidden>
                  {group.icon}
                </span>
                <span className={styles.stepGroupName}>{group.name}</span>
                <span className={styles.stepGroupCount}>
                  {group.subs.filter((sub) => !hidden.has(pathKey(group.moduleId, sub.id))).length} / {group.subs.length}
                </span>
              </summary>
              <div className="stack">
                {group.sets.map((set) => {
                  const keys = set.subs.map((sub) => pathKey(group.moduleId, sub.id));
                  const shown = keys.filter((key) => !hidden.has(key)).length;
                  return (
                    <div key={set.group?.id ?? 'all'} className="stack">
                      {/* A whole set — a language — is shown or put away with one tick. */}
                      {set.group && (
                        <label className={styles.setHead}>
                          <input
                            type="checkbox"
                            className={styles.gameCheck}
                            checked={shown > 0}
                            ref={(el) => {
                              if (el) el.indeterminate = shown > 0 && shown < keys.length;
                            }}
                            onChange={(e) => setGamesHidden(keys, !e.target.checked)}
                            aria-label={t('parent.games.showSet', { name: set.group.label })}
                          />
                          <span className="emoji" aria-hidden>
                            {set.group.icon}
                          </span>
                          {set.group.label}
                          <span className={styles.stepGroupCount}>
                            {shown} / {keys.length}
                          </span>
                        </label>
                      )}
                      {set.subs.map((sub) => {
                        const key = pathKey(group.moduleId, sub.id);
                        const step = progress[key] ?? 1;
                        const maxSteps = subSteps(sub);
                        return (
                          <div key={sub.id} className={cn(styles.stepRow, hidden.has(key) && styles.stepRowHidden)}>
                            <label className={styles.stepName}>
                              <input
                                type="checkbox"
                                className={styles.gameCheck}
                                checked={!hidden.has(key)}
                                onChange={(e) => setGamesHidden([key], !e.target.checked)}
                                aria-label={t('parent.games.showLabel', { name: sub.label })}
                              />
                              <span className="emoji" aria-hidden>
                                {sub.icon || group.icon}
                              </span>
                              {sub.label}
                            </label>
                            {!isFreePlay(sub) && (
                              <input
                                className={styles.textInput}
                                type="number"
                                inputMode="numeric"
                                min={1}
                                max={maxSteps}
                                value={step}
                                onChange={(e) => setStep(group.moduleId, sub.id, Number(e.target.value), maxSteps)}
                                aria-label={t('parent.games.stepLabel', { name: sub.label, max: maxSteps })}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <Button block variant="ghost" icon="♻️" onClick={resetProgress}>
          {t('parent.games.reset')}
        </Button>
      </section>
        </>
      ) : (
        <section className={styles.section}>
          <p className={styles.hint} style={{ margin: 0, textAlign: 'center' }}>
            {t('parent.pickChild')}
          </p>
        </section>
      )}

      {/* ---- Password ---- */}
      {auth0Enabled && email && hasPassword && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>{t('parent.password.title')}</h3>
          <p className={styles.hint}>
            {reset === 'sent'
              ? t('parent.password.sent', { email })
              : reset === 'failed'
                ? t('parent.password.failed')
                : t('parent.password.hint', { email })}
          </p>
          <Button block variant="ghost" icon="✉️" onClick={sendPasswordReset} disabled={reset === 'sending'}>
            {reset === 'sending' ? t('parent.password.sending') : reset === 'sent' ? t('parent.password.again') : t('parent.password.change')}
          </Button>
        </section>
      )}

      {/* ---- Sign out: the very last thing on a phone (on a wide screen it is at the top) ---- */}
      <div className={styles.narrowOnly}>
        <Button block variant="ghost" icon="🚪" onClick={logout}>
          {t('parent.logout')}
        </Button>
      </div>

      {/* ---- Explicit save (no live auto-save in the parent cabinet). On a
          phone it appears, stuck to the bottom, once something was changed. ---- */}
      {(dirty || saving || justSaved) && (
        <div className={cn(styles.saveBar, styles.narrowOnly)}>
          <Button block icon={justSaved ? '✅' : '💾'} onClick={saveChanges} disabled={saving || !dirty}>
            {saving ? t('parent.saving') : justSaved && !dirty ? t('parent.saved') : t('parent.save')}
          </Button>
        </div>
      )}
    </div>
  );
}
