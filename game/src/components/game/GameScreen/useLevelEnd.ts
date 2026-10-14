import { useEffect, useRef, useState } from 'react';
import { useSound } from '@/core/audio/useSound';
import { voice } from '@/core/audio/voice';
import { finishDemo, useDemo } from '@/core/app/demo';
import { pickChestTreasure, treasureKey } from '@/core/child/progress/treasures';
import { giftTierOf, hasChest } from '@/core/child/progress/pathStops';
import { subSteps } from '@/core/child/progress/path';
import { useGameStore } from '@/core/child/store/useGameStore';
import { keysOf } from '@/core/child/world/games';
import { isFreePlay } from '@/core/game/kernel/gameConfig';
import type { SubCategory } from '@/core/game/kernel/types';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import type { Treasure } from '@/core/theme/theme.types';
import { useT, useVoiceLang } from '@/core/translator';
import type { GameSessionConfig } from '../useGameSession';
import type { GameSession } from './types';

/** How long the trial's win screen stays, after it has been read out, before the way to an account. */
const TRIAL_OVER_MS = 2500;

/**
 * The end of a level, in the order the child meets it: the mascot reaches the
 * goal with a happy «crunch» (and whatever was being said stops — nothing about
 * a task may sound under the win screen); on a chest step the chest opens and
 * its treasure flies into the collection; then the win screen, with its jingle,
 * read out — its title and what was earned, never the buttons. The trial game
 * is one level: once that has been seen and heard, the way to an account takes over.
 *
 * `seen` — the win screen has been shown and read out (what a rest waits for).
 */
export function useLevelEnd({ config, sub, session, blocked }: { config: GameSessionConfig; sub?: SubCategory; session: GameSession; blocked: boolean }) {
  const { play } = useSound();
  const theme = useActiveTheme();
  const voiceLang = useVoiceLang();
  const sayT = useT(voiceLang);
  const voiceTheme = useActiveTheme(voiceLang);
  const gender = useGameStore((s) => s.profile.gender);
  const voiceOn = useGameStore((s) => s.settings.voiceOn);
  const collectTreasure = useGameStore((s) => s.collectTreasure);
  const trial = useDemo((s) => s.active);

  // A gift pops at every 5th / 10th / final step; some steps hide a chest. Free play has no ladder.
  const maxSteps = sub ? subSteps(sub) : 0;
  const free = sub ? isFreePlay(sub) : false;
  const gift = free ? null : giftTierOf(config.step, maxSteps);
  const chest = !free && hasChest(config.step, maxSteps);

  // The chest's treasure (none until the level ends on a chest step); the win screen waits for it.
  const [reveal, setReveal] = useState<{ treasure: Treasure; isNew: boolean } | null>(null);
  const [revealDone, setRevealDone] = useState(false);
  const [summarySaid, setSummarySaid] = useState(false);

  // Keys of knowledge this level brought, counted against what there was before the win.
  const keys = useGameStore((s) => keysOf(s.progress, s.treasures));
  const keysBefore = useRef(keys);
  if (!session.finished) keysBefore.current = keys;
  const keysWon = Math.max(0, keys - keysBefore.current);
  const winTitle = `game.win.title.${gender === 'boy' ? 'boy' : 'girl'}` as const;
  const summarySpeech = [
    sayT(winTitle),
    keysWon > 0
      ? sayT('game.win.collectedWithKeys', { amount: voiceTheme.artifact.count(session.earned), keys: sayT('world.keyCount', { count: keysWon }) })
      : sayT('game.win.collected', { amount: voiceTheme.artifact.count(session.earned) }),
    sayT('game.tasksDone', { count: session.total }),
    sayT('game.win.great'),
  ].join(' ');
  const winShown = session.finished && revealDone;

  useEffect(() => {
    if (!session.finished) return;
    voice.stop();
    play('crunch');
  }, [session.finished]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!winShown) {
      setSummarySaid(false);
      return;
    }
    if (blocked || !voiceOn || !voice.supported) {
      setSummarySaid(true);
      return;
    }
    // Let the victory jingle ring first.
    const t = window.setTimeout(() => voice.speak(summarySpeech, () => setSummarySaid(true), voiceLang), 900);
    return () => window.clearTimeout(t);
  }, [winShown]); // eslint-disable-line react-hooks/exhaustive-deps

  // The win screen is never silent: a clear victory sound the moment it appears.
  useEffect(() => {
    if (!winShown) return;
    play('win');
    const t = window.setTimeout(() => play('fanfare'), 480);
    return () => window.clearTimeout(t);
  }, [winShown]); // eslint-disable-line react-hooks/exhaustive-deps

  // On a chest step, a treasure to reveal — new to the collection if one is still missing.
  useEffect(() => {
    if (!session.finished) {
      setReveal(null);
      setRevealDone(false);
      return;
    }
    if (!chest) {
      setRevealDone(true);
      return;
    }
    const picked = pickChestTreasure(theme, useGameStore.getState().treasures);
    if (!picked) {
      setRevealDone(true);
      return;
    }
    setReveal(picked);
    setRevealDone(false);
    if (picked.isNew) collectTreasure(treasureKey(theme.id, picked.treasure.id));
  }, [session.finished]); // eslint-disable-line react-hooks/exhaustive-deps

  const seen = winShown && summarySaid;
  useEffect(() => {
    if (!trial || !seen) return;
    const id = window.setTimeout(finishDemo, TRIAL_OVER_MS);
    return () => window.clearTimeout(id);
  }, [trial, seen]);

  return { gift, maxSteps, reveal, revealDone, setRevealDone, winShown, seen, keysWon, winTitle, trial };
}
