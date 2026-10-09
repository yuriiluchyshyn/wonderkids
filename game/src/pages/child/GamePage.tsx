import { useLang, useT } from '@/core/translator';
import { usePageMeta } from '@/core/app/seo/usePageMeta';
import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { GameScreen } from '@/components/game/GameScreen';
import { moduleRegistry } from '@/core/game/kernel/ModuleRegistry';
import { useGameStore } from '@/core/child/store/useGameStore';
import { clampStep, pathKey, subSteps } from '@/core/child/progress/path';
import { gameStatus } from '@/core/game/kernel/gameConfig';
import { GALAXIES } from '@/core/game/galaxies';
import { useHubState } from '@/core/app/ui/useHubState';
import { gameState, useAvailability } from '@/core/app/availability';

/** Hosts a learning session at the step chosen on the path (?step=). */
export function GamePage() {
  const t = useT();
  const navigate = useNavigate();
  const { moduleId = '', subId = '' } = useParams();
  const [search] = useSearchParams();

  const module = moduleRegistry.get(moduleId, useLang());
  const sub = module?.subCategories.find((s) => s.id === subId);
  usePageMeta({ title: sub ? `${sub.label} · ${module?.title}` : t('page.game') });
  // Frontier step from the store (advances when a session completes).
  const hiddenGames = useGameStore((s) => s.settings.hiddenGames);
  // Offered in the visitor's country, and not held back as «soon» (`/admin/availability`).
  const offered = useAvailability((a) => gameState(a, moduleId, subId) === 'on');
  const storedStep = useGameStore((s) => s.progress[pathKey(moduleId, subId)] ?? 1);

  // The step chosen on the path (never above the frontier); falls back to it.
  const maxSteps = sub ? subSteps(sub) : 30;
  // A path can get shorter between releases — never trust a stored step past its end.
  const liveStep = Math.min(storedStep, maxSteps);
  const requested = Number(search.get('step'));
  const chosenStep = requested ? Math.min(clampStep(requested, maxSteps), liveStep) : liveStep;

  // Freeze the step for the duration of a session so finishing (which advances
  // the stored frontier) doesn't remount mid-celebration. "Play again" replays
  // the same step.
  const [activeStep, setActiveStep] = useState(chosenStep);
  const [sessionKey, setSessionKey] = useState(0);

  // The little house leads back to where the child came from: this game's
  // galaxy, scrolled to this game's card — not to the top of the default one.
  const backToHub = () => {
    const galaxy = GALAXIES.find((g) => g.moduleId === moduleId);
    if (galaxy) useHubState.getState().setGalaxy(galaxy.id);
    navigate('/', { state: { focusGame: `${moduleId}:${subId}` } });
  };

  // A game the parent has put away is not there for this child — by its address either.
  if (!module || !sub || !offered || gameStatus(sub) === 'soon' || hiddenGames.includes(pathKey(module.id, sub.id))) {
    return (
      <div className="page center" style={{ minHeight: '60dvh' }}>
        <div className="stack" style={{ textAlign: 'center' }}>
          <span className="emoji" style={{ fontSize: '3rem' }}>
            🙈
          </span>
          <p>{t('page.gameNotFound')}</p>
          <button className="emoji" onClick={() => navigate('/')} style={{ fontSize: '2rem' }}>
            🏠
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <GameScreen
        key={sessionKey}
        config={{ moduleId, subCategoryId: subId, step: activeStep }}
        subLabel={sub.label}
        onExit={backToHub}
        onPlayAgain={() => {
          setActiveStep(activeStep);
          setSessionKey((k) => k + 1);
        }}
        onContinue={() => {
          // Completing a session advances the stored frontier, so the next
          // step is now unlocked — jump straight into it without a hub trip.
          setActiveStep((s) => clampStep(s + 1, maxSteps));
          setSessionKey((k) => k + 1);
        }}
      />
    </div>
  );
}
