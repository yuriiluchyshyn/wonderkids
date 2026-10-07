import { usePageMeta } from '@/core/app/seo/usePageMeta';
import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { GameScreen } from '@/components/game/GameScreen';
import { moduleRegistry } from '@/core/game/kernel/ModuleRegistry';
import { useGameStore } from '@/core/child/store/useGameStore';
import { clampStep, pathKey, subSteps } from '@/core/child/progress/path';
import { gameStatus } from '@/core/game/kernel/gameConfig';

/** Hosts a learning session at the step chosen on the path (?step=). */
export function GamePage() {
  const navigate = useNavigate();
  const { moduleId = '', subId = '' } = useParams();
  const [search] = useSearchParams();

  const module = moduleRegistry.get(moduleId);
  const sub = module?.subCategories.find((s) => s.id === subId);
  usePageMeta({ title: sub ? `${sub.label} · ${module?.title}` : 'Гра' });
  // Frontier step from the store (advances when a session completes).
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

  if (!module || !sub || gameStatus(sub) === 'soon') {
    return (
      <div className="page center" style={{ minHeight: '60dvh' }}>
        <div className="stack" style={{ textAlign: 'center' }}>
          <span className="emoji" style={{ fontSize: '3rem' }}>
            🙈
          </span>
          <p>Таку пригоду не знайдено.</p>
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
        onExit={() => navigate('/')}
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
