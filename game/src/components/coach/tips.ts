import type { TemplatePayload } from '@/core/game/templates/types';
import type { CoachTip } from './CoachTips';

/**
 * A tip's words are the text `tip.<id>` of the app dictionary.
 *
 * Tips for the hub, in the order the child meets the controls.
 */
export function hubTips(): CoachTip[] {
  return [
    { id: 'hub.card', anchor: '[data-tip="cards"] article' },
    { id: 'hub.galaxy', anchor: '[data-tip="galaxy"]' },
    { id: 'hub.stars', anchor: '[data-tip="stars"]' },
    { id: 'hub.artifacts', anchor: '[data-tip="artifacts"]' },
    { id: 'hub.treasures', anchor: '[data-tip="treasures"]' },
    { id: 'hub.profile', anchor: '[data-tip="profile"]' },
    { id: 'hub.time', anchor: '[data-tip="time"]' },
  ];
}

/**
 * Tips for the game screen. `template` is the board of the current task: how to
 * answer on each kind of board (`tip.how.<board>`) is told once, not printed on
 * every task.
 */
export function gameTips(opts: { template?: TemplatePayload['template']; hasText: boolean }): CoachTip[] {
  const tips: CoachTip[] = [];
  if (opts.template) tips.push({ id: `how.${opts.template}`, anchor: '[data-tip="board"]' });
  if (opts.hasText) {
    tips.push({ id: 'game.tts', anchor: '[data-tts-button]' });
  }
  tips.push(
    { id: 'game.track', anchor: '[data-tip="track"]' },
    { id: 'game.dots', anchor: '[data-tip="dots"]' },
    { id: 'game.home', anchor: '[data-tip="home"]' },
  );
  return tips;
}
