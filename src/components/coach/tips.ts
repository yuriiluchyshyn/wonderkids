import type { TemplatePayload } from '@/core/templates/types';
import type { CoachTip } from './CoachTips';

/** Tips for the hub, in the order the child meets the controls. */
export function hubTips(): CoachTip[] {
  return [
    { id: 'hub.card', anchor: '[data-tip="cards"] article', text: 'Це гра. Натисни на неї, щоб почати гратися!' },
    { id: 'hub.galaxy', anchor: '[data-tip="galaxy"]', text: 'Тут можна обрати інший предмет: математику, географію, історію чи природу.' },
    { id: 'hub.stars', anchor: '[data-tip="stars"]', text: 'Зірочки показують складність. Одна зірочка — найлегші ігри, три — найважчі.' },
    {
      id: 'hub.artifacts',
      anchor: '[data-tip="artifacts"]',
      text: 'Це твоя скарбничка: тут усе, що ти заробив в іграх. Натисни — і зможеш купити за це будівлі та прикраси для свого світу.',
    },
    { id: 'hub.world', anchor: '[data-tip="world"]', text: 'Це твій світ. Натисни, щоб подивитися, що ти вже збудував.' },
    { id: 'hub.treasures', anchor: '[data-tip="treasures"]', text: 'Тут лежать скарби, які ти знаходиш у скринях на своєму шляху.' },
    { id: 'hub.profile', anchor: '[data-tip="profile"]', text: 'Це ти! Натисни, щоб побачити свої цілі та змінити тему.' },
    { id: 'hub.time', anchor: '[data-tip="time"]', text: 'Це твій час для гри. Коли він закінчиться — настане пора відпочити.' },
  ];
}

/** How to answer on each kind of board — told once, not printed on every task. */
const HOW_TO: Record<TemplatePayload['template'], string> = {
  UI_GRID_CHOICE: 'Щоб відповісти, торкнись правильної картки.',
  UI_DRAG_MATCH: 'Перетягни кожну картку на її місце. Або торкнись картки, а потім — місця для неї.',
  UI_CHRONO_SEQUENCE: 'Торкнись двох карток, щоб поміняти їх місцями. Коли все стоїть по порядку — натисни «Готово».',
  UI_MAP_PUZZLE: 'Перетягни на карту або просто торкнись потрібного місця на ній.',
  UI_BALANCE_SCALE: 'Перетягни гирю на праву шальку ваг.',
  UI_SORTER_BINS: 'Перетягни предмет у потрібне місце — або просто торкнись цього місця.',
  UI_CASH_TRAY: 'Торкайся монет і купюр, щоб покласти їх на касу.',
  UI_TANGRAM: 'Перетягни кожну фігуру на її контур.',
  UI_GRID_AREA: 'Торкайся клітинок, щоб зафарбувати їх, а тоді натисни «Готово».',
  UI_NUMBER_MAZE: 'Торкайся сусідньої клітинки, щоб зробити крок.',
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
    { id: 'game.voice', anchor: '[data-tip="voice"]', text: 'Ця кнопка вмикає і вимикає голос, який читає завдання.' },
    { id: 'game.home', anchor: '[data-tip="home"]', text: 'Будиночок повертає до всіх ігор.' },
  );
  return tips;
}
