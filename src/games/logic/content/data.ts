/** New tasks every path step opens, in each logic game (the other half of a level is recall). */
export const PER_STEP = 25;

/** Answers on the board of a tap-the-answer task — always nine, never four. */
export const CHOICES = 9;

const row = (line: string) => line.trim().split(/\s+/);

/**
 * Picture sets a pattern is drawn with — nine clearly different things each.
 * A pattern takes a few of them for its roles; all nine are the answers.
 */
export const SETS: string[][] = `
🔴 🔵 🟡 🟢 🟣 🟠 🟤 ⚫ ⚪
⭐ 🌙 ☀️ ☁️ ⚡ ❄️ 🌈 🔥 💧
🚗 🚌 🚜 🚲 🚂 ✈️ 🚀 ⛵ 🚁
🍎 🍌 🍇 🍓 🍐 🍊 🍋 🍉 🍒
🐶 🐱 🐭 🐸 🐰 🐻 🐷 🐮 🦊
🔺 🟦 🟣 🔶 ⭐ ❤️ 🟩 ⬛ 🔷
⚽ 🏀 🎾 🏐 🏈 ⚾ 🎱 🏓 🥊
🌷 🌻 🌵 🍄 🌹 🌲 🌴 🍀 🍁
🧦 👟 🧢 🧤 👕 👗 👖 🧣 👒
🥕 🍅 🥒 🌽 🥦 🍆 🧅 🥔 🌶️
🐟 🐙 🦀 🐬 🐳 🦈 🐢 🦐 🐚
🦆 🦉 🦅 🦜 🐧 🦢 🐓 🦩 🕊️
🦋 🐝 🐞 🐜 🐌 🕷️ 🐛 🦗 🪲
🍞 🧀 🥚 🍕 🍔 🍩 🍪 🍦 🍭
🎸 🥁 🎺 🎹 🎻 🎤 🔔 🎷 🪗
🔨 🔧 ✂️ 🪚 🔑 🧲 🔦 🪜 📏
🧸 🎈 🎁 🪁 🎲 🧩 🪀 🎮 🪆
🏠 🏰 ⛺ 🏫 🗼 ⛪ 🏭 🎡 🌉
❤️ 💛 💚 💙 💜 🧡 🖤 🤍 🤎
🐘 🦒 🦁 🐒 🦓 🐊 🦛 🐪 🦘
✏️ 📚 🎒 🖍️ 📐 🎨 📎 🔍 🖌️
☕ 🥛 🧃 🍵 🥤 🥄 🍴 🥣 🫖
😀 😴 😎 🤔 😢 😡 🥳 😱 🤗
🪑 🛏️ 🚪 🛁 💡 ⏰ 📺 🧹 🪞
`
  .trim()
  .split('\n')
  .map(row);

/**
 * One path step: the repeating unit (letters = different pictures), how many
 * pictures are shown, and where the gap is (`null` — at the end).
 */
export const PATTERN_STEPS: { unit: string; length: number; gap: number | null }[] = [
  { unit: 'AB', length: 4, gap: null },
  { unit: 'AB', length: 6, gap: null },
  { unit: 'AB', length: 6, gap: 3 },
  { unit: 'ABC', length: 6, gap: null },
  { unit: 'ABC', length: 8, gap: null },
  { unit: 'ABC', length: 7, gap: 4 },
  { unit: 'AABB', length: 8, gap: null },
  { unit: 'AAB', length: 6, gap: null },
  { unit: 'ABB', length: 8, gap: 4 },
  { unit: 'ABAC', length: 8, gap: null },
];

/**
 * Everything the shadow lotto can show, as pictograms whose black shadows can
 * still be told apart. A line is a **family** (things of one kind); the groups
 * between `|` are **look-alikes** within it — the closer two things sit here,
 * the more their shadows resemble each other:
 *
 *   another family    nothing alike          — the opening steps
 *   the same family   a dog and a horse      — the middle of the path
 *   the same group    a dog, a fox, a wolf   — the end of it
 *
 * Never list two things with the same outline (a white and a black cat, an
 * apple and an orange, two round balls): their shadows are one and the same.
 */
export const SHADOW_WORLD: string[][][] = `
🐕 🐩 🦮 🐺 🦊 🦝 🐈 🐅 🐆 | 🐎 🦄 🦓 🦌 🫏 🫎 | 🐂 🐃 🐄 🦬 🐐 🐏 🐑 | 🐪 🐫 🦙 🦒 🦘 | 🐘 🦣 🦏 🦛 | 🐁 🐀 🐿️ 🦫 🦔 🐇 | 🦨 🦡 🦦 🐖 🐗 | 🐒 🦍 🦧 🦥 | 🐊 🦎 🐍 🐢 🦕 🦖 🐉
🦆 🦢 🦩 🪿 🐧 🦤 | 🕊️ 🐦 🦅 🦉 🦜 🦚 🦃 🐓 | 🐤 🐥 🐣 🦇
🐟 🐠 🐡 🦈 🐬 🐳 🐋 🦭 | 🐙 🦑 🦐 🦞 🦀 🪼 🐚
🦋 🐝 🐞 🪲 🦟 🪰 🦗 🪳 | 🐛 🐜 🕷️ 🦂 🪱 🐌
🚗 🚙 🏎️ 🛻 🚐 🚌 | 🚚 🚛 🚜 🚒 🚎 | 🏍️ 🛵 🚲 🛴 🛹 🛼 🦽 🦼 🛺
🚂 🚄 🚇 🚝 🚞 🚋 | ✈️ 🛩️ 🚁 🚀 🛸 🪂 🛰️ 🚡 | ⛵ 🚤 🛥️ 🛳️ 🚢 🛶 ⛴️
🍎 🍐 🍌 🍇 🍓 🍒 🍍 🍉 🍋 | 🍆 🥦 🥒 🌶️ 🌽 🥕 🧄 🧅 🥔 🍄 🥑 🫑
🍞 🥐 🥖 🥨 🥯 🥞 🧇 🥪 | 🍗 🍖 🌭 🍔 🍟 🍕 🌮 🌯 | 🎂 🍰 🧁 🍫 🍬 🍭 🍦 🍧 🍿
☕ 🍵 🥛 🧃 🥤 🧋 🍼 🫖 🍶 | 🥄 🍴 🔪 🥢 🍽️ 🥣 🫙 🏺
🔨 🪓 ⛏️ 🔧 🪛 🪚 | 🔩 ✂️ 🧲 🪜 🔦 🪝 📎 📌
👕 👗 👘 👔 🧥 🥼 🦺 👚 🩱 | 👖 🩳 🧦 🧤 🧣 | 🎩 🧢 👒 🎓 ⛑️ 👑 | 👞 👟 🥾 🥿 👠 👡 🩰 👢 | 👜 👛 🎒 🧳 👓 🕶️ 🌂 ☂️
🏠 🏢 🏫 🏭 🏥 🏛️ | 🏯 🏰 ⛪ 🕌 🛕 🗼 🗽 ⛺ 🛖 | 🎡 🎢 🎠 ⛲ 🌉
🌲 🌳 🌴 🌵 🎄 🎋 🪴 | 🌱 🌿 ☘️ 🍀 🍁 🍂 🍃 🌾 | 🌷 🌹 🌺 🌸 🌼 🌻 🪻 🪷 💐
🏓 🏸 🏒 🏑 🥍 🏏 🎣 🏹 🪃 🎿 | ⚽ 🏈 🥊 🥋 ⛸️ 🛷 🥌 🎯 🎽 🤿 | 🧸 🪆 🎲 🧩 ♟️ 🎮 🕹️ 🪅 🪀 🪁 🎈
🎸 🎻 🪕 🎹 🥁 🪗 | 🎺 🎷 📯 🪈 🎤 🎧 🔔
🪑 🛋️ 🛏️ 🚪 🪟 🛁 🚽 🚿 🪞 | 🧹 🧺 🪣 🧽 🧴 🪥 🧼 🧯 | 🔑 🗝️ 🔒 💡 🕯️ 🪔 ⏰ ⌚ ⏳
📱 💻 ⌨️ 🖨️ 📷 📺 📻 ☎️ 🔭 🔬 🧭 | 📚 📖 ✏️ 🖊️ 🖌️ 🖍️ 🎨 📦 🎁 📐 📏
⭐ 🌙 ☁️ ⚡ ❄️ 🔥 💧 🌈 | 🪐 ☄️ 🌋 ⛰️ 🏝️ 🌍
`
  .trim()
  .split('\n')
  .map((family) => family.split('|').map(row));

/**
 * How the shadow lotto hardens along its path, one entry per step: how many
 * pairs are on the board, how close their shadows are (`mix` — see
 * `SHADOW_WORLD`), and how soft the edge of a shadow is, in pixels.
 */
export const SHADOW_STEPS: { pairs: number; mix: 'apart' | 'family' | 'twoGroups' | 'group'; blur: number }[] = [
  { pairs: 3, mix: 'apart', blur: 0.6 },
  { pairs: 3, mix: 'apart', blur: 0.9 },
  { pairs: 4, mix: 'apart', blur: 1.2 },
  { pairs: 3, mix: 'family', blur: 1.5 },
  { pairs: 4, mix: 'family', blur: 1.8 },
  { pairs: 4, mix: 'family', blur: 2.1 },
  { pairs: 4, mix: 'twoGroups', blur: 2.4 },
  { pairs: 4, mix: 'twoGroups', blur: 2.7 },
  { pairs: 4, mix: 'group', blur: 3 },
  { pairs: 5, mix: 'group', blur: 3.3 },
];

/** The left half of a figure: rows of '#' (filled) and '.' (empty); the mirror stands on its right edge. */
export interface Half {
  name?: string;
  rows: string[];
}

/** Hand-drawn halves of familiar things (they open steps 3 and 4). */
export const DRAWN: Half[] = [
  { name: 'Метелик', rows: ['##.', '###', '.##', '###', '#..'] },
  { name: 'Сердечко', rows: ['.##', '###', '###', '.##', '..#'] },
  { name: 'Ялинка', rows: ['..#', '.##', '###', '.##', '..#'] },
  { name: 'Будиночок', rows: ['..#', '.##', '###', '#.#', '###'] },
  { name: 'Ракета', rows: ['..#', '.##', '.##', '###', '#..'] },
  { name: 'Гриб', rows: ['.##', '###', '###', '..#', '.##'] },
  { name: 'Кубок', rows: ['###', '###', '.##', '..#', '.##'] },
  { name: 'Корона', rows: ['#..', '#.#', '###', '###', '.##'] },
  { name: 'Робот', rows: ['.##', '.#.', '###', '#.#', '.#.'] },
  { name: 'Ключ', rows: ['.##', '#..', '.##', '..#', '.##'] },
];

/**
 * The mirror game step by step: the size of the half-figure ([cols, rows]) and
 * how many cells a wrong answer differs from the right one by — from "nothing
 * like it" on the first steps to a single cell at the end.
 */
export const MIRROR_STEPS: { size: [number, number]; differ: [min: number, max: number] }[] = [
  { size: [2, 3], differ: [3, 5] },
  { size: [2, 4], differ: [3, 6] },
  { size: [3, 5], differ: [3, 6] },
  { size: [3, 5], differ: [2, 4] },
  { size: [3, 3], differ: [2, 3] },
  { size: [3, 4], differ: [2, 3] },
  { size: [4, 3], differ: [1, 3] },
  { size: [4, 4], differ: [1, 2] },
  { size: [4, 5], differ: [1, 2] },
  { size: [5, 4], differ: [1, 1] },
];
