import { Mechanics } from '@/core/game/kernel/mechanics';
import type { TemplatePayload } from '@/core/game/templates/types';
import type { CoachTip } from './CoachTips';

/** Tips for the hub, in the order the child meets the controls. */
export function hubTips(): CoachTip[] {
  return [
    { id: 'hub.card', anchor: '[data-tip="cards"] article', text: 'Це гра. Натисни на неї, щоб почати гратися!' },
    { id: 'hub.galaxy', anchor: '[data-tip="galaxy"]', text: 'Тут можна обрати інший предмет: математику, мову, логіку, географію чи астрономію.' },
    { id: 'hub.stars', anchor: '[data-tip="stars"]', text: 'Зірочки показують складність. Одна зірочка — найлегші ігри, три — найважчі.' },
    {
      id: 'hub.artifacts',
      anchor: '[data-tip="artifacts"]',
      text: 'Це твоя скарбничка: тут усе, що ти заробив в іграх. Натисни — і потрапиш у свій світ: там за це можна купити будівлі та прикраси.',
    },
    { id: 'hub.treasures', anchor: '[data-tip="treasures"]', text: 'Тут лежать скарби, які ти знаходиш у скринях на своєму шляху.' },
    { id: 'hub.profile', anchor: '[data-tip="profile"]', text: 'Це ти! Натисни, щоб побачити свої цілі та змінити тему.' },
    { id: 'hub.time', anchor: '[data-tip="time"]', text: 'Це твій час для гри. Коли він закінчиться — настане пора відпочити.' },
  ];
}

/** How to answer on each kind of board — told once, not printed on every task. */
const HOW_TO: Record<TemplatePayload['template'], string> = {
  [Mechanics.GridChoice]: 'Щоб відповісти, торкнись правильної картки.',
  [Mechanics.DragMatch]: 'Перетягни кожну картку на її місце. Або торкнись картки, а потім — місця для неї.',
  [Mechanics.ChronoSequence]: 'Торкнись двох карток, щоб поміняти їх місцями. Коли все стоїть по порядку — натисни «Готово».',
  [Mechanics.MapPuzzle]: 'Перетягни на карту або просто торкнись потрібного місця на ній.',
  [Mechanics.BalanceScale]: 'Перетягни гирю на праву шальку ваг.',
  [Mechanics.SorterBins]: 'Перетягни предмет у потрібне місце — або просто торкнись цього місця.',
  [Mechanics.CashTray]: 'Торкайся монет і купюр, щоб покласти їх на касу.',
  [Mechanics.Tangram]: 'Перетягни кожну фігуру на її контур.',
  [Mechanics.GridArea]: 'Торкайся клітинок, щоб зафарбувати їх, а тоді натисни «Готово».',
  [Mechanics.NumberMaze]: 'Торкайся сусідньої клітинки, щоб зробити крок.',
  [Mechanics.BubblePop]: 'Лопай бульбашки по порядку: торкнись тієї, що має бути наступною.',
  [Mechanics.DotToDot]: 'Торкайся зірочок по порядку — між ними з’явиться лінія.',
  [Mechanics.ColorMix]: 'Торкнись двох фарб, щоб вилити їх у казан і змішати.',
};

/** Tips for the game screen. `template` is the board of the current task. */
export function gameTips(opts: { template?: TemplatePayload['template']; hasText: boolean }): CoachTip[] {
  const tips: CoachTip[] = [];
  if (opts.template) tips.push({ id: `how.${opts.template}`, anchor: '[data-tip="board"]', text: HOW_TO[opts.template] });
  if (opts.hasText) {
    tips.push({ id: 'game.tts', anchor: '[data-tts-button]', text: 'Не знаєш, що тут написано? Натисни на динамік — і я прочитаю!' });
  }
  tips.push(
    { id: 'game.track', anchor: '[data-tip="track"]', text: 'Твій друг біжить до фінішу. Кожна правильна відповідь — це крок уперед!' },
    { id: 'game.dots', anchor: '[data-tip="dots"]', text: 'Кружечки показують, скільки завдань у рівні. Зафарбовані — ти вже виконав.' },
    { id: 'game.home', anchor: '[data-tip="home"]', text: 'Будиночок повертає до всіх ігор.' },
  );
  return tips;
}
