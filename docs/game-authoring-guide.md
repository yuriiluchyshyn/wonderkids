# WonderKids — Game Authoring Guide

> **What this document is.** A complete, self-contained specification of **how a
> new game is created** in the WonderKids (ДивоСвіт) codebase: which game
> *types* exist, which *UI templates* a game can be built on, how many answer
> *options* each supports, how *difficulty* and *levels* work, which *icons /
> illustrations* are available, and what *content* (hints, reward facts) every
> task needs.
>
> **How it is used (the two-step pipeline).**
> 1. **Gemini** reads this guide and produces a **Game Spec** — a filled-in
>    copy of the template in [§12](#12-the-game-spec-template-gemini-fills-this)
>    describing one concrete new game: its config, every task type, every piece
>    of content (prompts, options, correct answers, hints, 10+ reward facts).
> 2. **Kiro** reads that Game Spec and generates the actual TypeScript module
>    code, wiring it into the micro-kernel exactly like the existing modules.
>
> Because of step 2, the Game Spec must speak the vocabulary defined here:
> template names, field names, and value ranges must match this document
> verbatim so the code can be produced mechanically.
>
> **Language rule (non-negotiable).** Every string a child or parent ever sees
> or hears — prompts, option labels, hints, facts, intros, blurbs — **must be in
> Ukrainian**. Field names, ids and template names stay in English (they are
> code). Examples in this guide keep the Ukrainian so you can copy the tone.

---

## 0. Table of contents

1. [Architecture in 60 seconds](#1-architecture-in-60-seconds)
2. [The two ways to build a game](#2-the-two-ways-to-build-a-game)
3. [Game config — the catalog card](#3-game-config--the-catalog-card)
4. [The 10 UI templates (the core of the system)](#4-the-10-ui-templates)
5. [Anti-guessing & how many options](#5-anti-guessing--how-many-options)
6. [Difficulty, progression, levels & recall](#6-difficulty-progression-levels--recall)
7. [Icons & illustrations](#7-icons--illustrations)
8. [Hints and reward facts (the 10+ rule)](#8-hints-and-reward-facts)
9. [Content data file conventions](#9-content-data-file-conventions)
10. [Hard rules & authoring checklist](#10-hard-rules--authoring-checklist)
11. [How the code is wired (for Kiro / reference)](#11-how-the-code-is-wired)
12. [The Game Spec template (Gemini fills this)](#12-the-game-spec-template-gemini-fills-this)
13. [A fully worked example spec](#13-a-fully-worked-example-spec)

---

## 1. Architecture in 60 seconds

WonderKids is a **micro-kernel plugin app**. A *subject* (Math, Geography,
History, Ecology, Nature…) is a **module** that registers itself once with the
`moduleRegistry`. The Hub discovers every registered module and builds its
catalog automatically — adding a subject or a game touches no core code.

```
Subject (LearningModule)
└── Games (SubCategory / TemplateGame)   ← one catalog card each
    └── Levels (one play-through of a step)
        └── Tasks (TaskInstance)          ← one question
            └── Payload (TemplatePayload) ← which UI template + its data
```

Three layers do the work, and a game author only ever touches the first:

| Layer | Responsibility | Files |
| --- | --- | --- |
| **Content / Module** | *What* to ask: generates tasks + their data | `src/modules/<subject>/` |
| **Engine** | Level assembly, recall, mistake handling, rewards | `src/core/engine/*`, `src/core/templates/validate.ts` |
| **Presentation** | *How* it looks & the interaction | `src/components/templates/*` |

> Read `docs/level-design.md` **together with this file** — it is the deep dive
> on how one level is assembled (the "5 new + 5 recall" rule, mistake handling,
> companion roll-back). This guide is the catalog of *what you can build*; that
> one is *how a level behaves once built*.

Key contracts (source of truth):

- `src/core/kernel/types.ts` — `LearningModule`, `SubCategory`, `TaskInstance`, `TaskConfig`.
- `src/core/templates/types.ts` — every `TemplatePayload` (the 10 templates).
- `src/modules/shared/templateModule.ts` — `defineTemplateModule`, `TemplateGame`, helpers.

---

## 2. The two ways to build a game

There are exactly two authoring paths. **Pick path A unless the game is
mathematics with a bespoke visualisation.**

### Path A — Template game (data only, no view code) ✅ default

The game is **pure data**: its module produces, for each task, one
`TemplatePayload` and reuses the shared `TemplateGameView` to render it. You add
a game by adding one `TemplateGame` object (config + a `pool(step)` function);
no React, no layout, no CSS. **This is how Geography, History, Ecology and
Nature are built, and it is what Gemini should target for every new game.**

A whole subject is declared with `defineTemplateModule({ id, title, icon, accent, games: [...] })`.

### Path B — Custom module (bespoke `GameView`) ⚠️ advanced, rarely needed

The module ships its own React `GameView` component and generators. Only the
**Math** module does this, because it needs animated counters, pie-charts,
clock faces and drag physics beyond the generic templates. A Game Spec should
**not** choose this path unless it explicitly requires a brand-new interaction
that none of the 10 templates can express — in which case flag it to Kiro as
"needs a new template" rather than specifying a one-off.

> **For Gemini:** always design on top of the 10 templates in §4 (Path A). If a
> game idea cannot be expressed with them, say so in the spec's *Open questions*
> section instead of inventing a mechanic.

---

## 3. Game config — the catalog card

Every game is one object. For template games it is a `TemplateGame` (a
`SubCategory` plus a `pool`). These are the fields, with allowed values and
defaults. **Bold = required.**

| Field | Type / values | Meaning | Default |
| --- | --- | --- | --- |
| **`id`** | string, snake_case | Unique within the subject (`'flags'`, `'biomes'`). | — |
| **`label`** | Ukrainian string | Card title the child sees («Вгадай Прапор»). | — |
| **`icon`** | one emoji | Card icon. | — |
| **`blurb`** | short Ukrainian string | One-line description under the title. | — |
| `gameId` | string | Globally-unique id (`'geo_flags_quiz'`). | `"${module}_${id}"` |
| `intro` | Ukrainian string | Spoken + shown once before play: what this game is and how to play. | — |
| `introFor` | `(step) => string \| undefined` | Per-step intro (explain each new task type as the path reaches it). Overrides `intro` for that step. | — |
| `progression` | `'path'` \| `'free'` | `path` = Duolingo-style ladder of rising difficulty. `free` = open play, no levels, unlimited replay. | `'path'` |
| `steps` | integer ≥ 1 | **Path length** (number of difficulty steps). Required for `path`; omit for `free`. | — |
| `difficulty` | `1` \| `2` \| `3` \| `[min,max]` | Age badge, shown as 1–3 stars. `1`=6–7 y, `2`=7–8 y, `3`=9–10 y. A pair marks a game spanning bands. | `1` |
| `tasksPerLevel` | integer 5–10 | Tasks per level — **required for every game**. 10 for a quick path game, 6 for free play (5–8), 5 when one task is long (a maze). | `10` |
| `mechanics` | one or more `MechanicsType` | Which UI template(s) the game uses (see §4). Array if the game mixes templates. | — |
| `hasText` | boolean | `true` if the child must read task/answer text — enables tap-to-hear speaker buttons + the first-run guide. Set it whenever any option or prompt relies on reading. | `false` |
| `landmark` | `{ name, emoji, stages? }` | What the game builds in the child's world («Землі знань»); grows in 4 stages. See §7. | — |
| `publishDate` | ISO 8601 UTC | Before it the card is locked («Скоро»); for 60 days after it shows a "NEW" badge. Use the shared release constant. | — |
| **`pool`** | `(step, config) => TaskInstance[]` | **The generator**: all candidate tasks available at `step`. Must be pure (no side effects, deterministic given input). | — |
| `level` | `(step, count) => TaskInstance[]` | Optional: compose a level yourself (ranked content). Without it, path games get `recallLevel`, free games a random draw. | — |

`MechanicsType` (the value(s) for `mechanics`) is one of **six** canonical
names:

```
UI_GRID_CHOICE · UI_DRAG_MATCH · UI_CHRONO_SEQUENCE ·
UI_MAP_PUZZLE · UI_BALANCE_SCALE · UI_SORTER_BINS
```

Four more templates exist as *families* of those (cash tray, tangram, grid
area, number maze — see §4); when you use one of them, set `mechanics` to its
parent family name (e.g. a cash-tray game is `UI_DRAG_MATCH`, a number-maze
game is `UI_GRID_CHOICE`).

---

## 4. The 10 UI templates

This is the heart of the system. A task's `payload.template` picks one of these,
and the rest of the payload is that template's data. Every payload may also
carry the shared optional fields:

```ts
stimulus?: { emoji?, art?, glyphs?, clock?, shape?, pieces?, scene?, caption? } // the picture/line shown above the answers
hint?: string   // spoken how-to, played when the scaffolding helper appears (after mistakes)
fact?: string   // (rarely used directly — reward facts live on TaskInstance.outro, see §8)
```

The reusable building block is a **`Card`** — anything a child can look at, tap
or drag:

```ts
interface Card {
  id: string;
  emoji?: string;              // big pictogram — the pre-reader-friendly face
  label?: string;              // short text; a labelled card gets a tap-to-hear speaker
  glyphs?: Glyph[];            // math content instead of label (numbers / fractions)
  speak?: string;              // what the speaker says (defaults to label)
  shape?: { cols, rows, cells: number[] }; // a figure on a cell grid (geometry)
  clock?: { h, m };            // a drawn clock face
}
// Glyph = string ("+", "=", "7") | { n, d } (a fraction drawn vertically)
```

Below, each template lists: **use it for**, its **payload**, the **number of
options** it expects, and a real example from the codebase.

---

### 4.1 `UI_GRID_CHOICE` — tap one card out of N  ⭐ most common

- **Use it for:** multiple-choice. Hear/read a prompt, tap the right card.
- **Options:** `cols` is **2 or 3**. Provide **3, 4 or 6 options**:
  - `cols: 2` → a 2×2 grid of **4** options (or 3 — right answer + 2 distractors).
  - `cols: 3` → a 2×3 grid of **6** options.
  - Keep it 4 for text-heavy answers, 6 only for compact ones (flags, emoji).
- **Payload:**

```ts
{
  template: 'UI_GRID_CHOICE',
  cols: 2 | 3,
  options: Card[],       // includes exactly one correct card
  correctId: string,     // id of the correct card
  stimulus?: {...},      // optional picture/line above the options
  hint?: string,
}
```

- **Example** (Geography flags, 6 options, 3 cols): prompt «Знайди прапор:
  Японія», options are 6 flag cards, `correctId: 'jp'`.

---

### 4.2 `UI_SORTER_BINS` — send the object to the right container

- **Use it for:** classification (which material / biome / epoch / diet).
- **Options:** **2–4 bins** (3 is the sweet spot). Each wrong bin can "speak" a
  friendly line via `wrongSay`.
- **Payload:**

```ts
{
  template: 'UI_SORTER_BINS',
  item: Card,                       // the thing to sort
  bins: Card[],                     // 2–4 destination bins (emoji + label)
  correctBinId: string,
  wrongSay?: Record<string,string>, // binId → "Бр-р-р, тут занадто холодно!"
  hint?: string,
}
```

- **Example** (Ecology recycling): item = «скляна пляшка 🍾», bins = Скло/Папір/
  Пластик, `correctBinId: 'glass'`.

---

### 4.3 `UI_CHRONO_SEQUENCE` — put the cards in order

- **Use it for:** ordering by time/size/sequence (months, historical events).
- **Options:** **3–5 cards**. The child swaps cards until the order is right;
  correctly-placed cards are outlined green.
- **Payload:**

```ts
{
  template: 'UI_CHRONO_SEQUENCE',
  cards: Card[],                    // in the CORRECT order
  initial: string[],               // card ids in the shuffled start order
  orientation: 'horizontal' | 'vertical',
  ends?: [string, string],         // labels for first/last place; default «найдавніше»/«найновіше»
  hint?: string,
}
```

- **Note:** always scramble `initial` so it is not already solved (use a
  guaranteed-not-sorted shuffle).
- **Example** (Nature): «Постав місяці по порядку: весна» → березень, квітень,
  травень.

---

### 4.4 `UI_DRAG_MATCH` — drag every item onto its slot

- **Use it for:** connect-pairs (person ↔ what they're famous for).
- **Options:** **3 pairs** is standard (`items.length === slots.length`).
- **Payload:**

```ts
{
  template: 'UI_DRAG_MATCH',
  items: Card[],
  slots: Card[],
  pairs: Record<string,string>,    // itemId → slotId
  hint?: string,
}
```

- **Example** (History "connect three"): drag each of 3 people onto the symbol
  they are known for.

---

### 4.5 `UI_MAP_PUZZLE` — tap a region, or drag a marker onto it

- **Use it for:** geography placement on the stylised world map.
- **Options:** the map layer provides the targets — **7 continents** or **5
  oceans** (see `worldMap.ts`). You supply one marker and one `targetId`.
- **Payload:**

```ts
{
  template: 'UI_MAP_PUZZLE',
  layer: 'continents' | 'oceans',
  mode: 'tap' | 'drag',
  marker: Card,                     // the thing travelling (tap) or being placed (drag)
  targetId: string,                 // region id, e.g. 'africa', 'pacific'
  hint?: string,
}
```

- **Valid region ids** — continents: `north_america, south_america, europe,
  africa, asia, australia, antarctica`; oceans: `pacific, atlantic, indian,
  arctic, southern`.
- **Example** (Geography): «Де живе 🦘? Перетягни на карту», `layer:
  'continents'`, `mode: 'drag'`, `targetId: 'australia'`.

---

### 4.6 `UI_BALANCE_SCALE` — find the weight that balances the left pan

- **Use it for:** math equivalence (which weight equals the left expression).
- **Options:** **3–4 weight cards**, each with a numeric `value`.
- **Payload:**

```ts
{
  template: 'UI_BALANCE_SCALE',
  left: { glyphs: Glyph[], value: number },         // e.g. glyphs ['3','+','4'], value 7
  weights: (Card & { value: number })[],
  hintDots?: number[],                              // dot groups for the helper, e.g. [3,4]
  hint?: string,
}
```

- **Mechanics note:** the answer is checked by *value* with float tolerance, so
  `1/2` and `3/6` both balance.

---

### 4.7 `UI_CASH_TRAY` — pay the exact price (family of `UI_DRAG_MATCH`)

- **Use it for:** money / making an amount from coins.
- **Options:** a `wallet` of coin/note denominations (hryvnias).
- **Payload:**

```ts
{
  template: 'UI_CASH_TRAY',
  item: Card,            // the thing being bought
  price: number,         // target amount in грн
  wallet: number[],      // available denominations, ALL DIFFERENT, e.g. [1,2,5,10,20]
  hint?: string,
}
```

- Set `mechanics: 'UI_DRAG_MATCH'` on the game card.

---

### 4.8 `UI_TANGRAM` — rebuild a silhouette from shapes (family of `UI_DRAG_MATCH`)

- **Use it for:** geometry / spatial puzzles.
- **Payload:**

```ts
{
  template: 'UI_TANGRAM',
  figure: string,            // name of the target figure
  pieces: TangramPiece[],    // placement on a 100×100 canvas
}
// TangramPiece: { id, shape:'triangle'|'square'|'circle'|'rect', x, y, size, rotate?, color }
```

- Set `mechanics: 'UI_DRAG_MATCH'`.

---

### 4.9 `UI_GRID_AREA` — colour cells to build a pen of a given area (family of `UI_GRID_CHOICE`)

- **Use it for:** area / perimeter on a grid.
- **Payload:**

```ts
{
  template: 'UI_GRID_AREA',
  cols: number,
  rows: number,
  targetArea: number,
}
```

---

### 4.10 `UI_NUMBER_MAZE` — walk the grid stepping only on cells that fit a rule (family of `UI_GRID_CHOICE`)

- **Use it for:** number rules (even numbers, multiples of 3, counting by 5s).
- **Payload:**

```ts
{
  template: 'UI_NUMBER_MAZE',
  cols: number,
  rows: number,
  cells: number[],   // row-major cell values
  path: number[],    // cell indices of the route, start → finish
  open?: number[],   // dead-end corridors: fit the rule, lead nowhere (6×6 and up)
  divisor?: number,  // the rule, when it is "divisible by" — verified by check:content
}
```

---

### 4.11 `UI_BUBBLE_POP` — pop the bubbles in order (family of `UI_CHRONO_SEQUENCE`)

- **Use it for:** the alphabet, building a word from syllables or letters.
- **Options:** **2–6 bubbles** in the right order, plus optional decoys (`extras`) that never pop.
  Bubbles with the same face (the two «МА» of «МАМА») are interchangeable.
- **Payload:**

```ts
{
  template: 'UI_BUBBLE_POP',
  bubbles: Card[],   // in the CORRECT popping order
  extras?: Card[],   // decoys — their face must differ from every real bubble
  target?: Card,     // what is being built: picture, word, speaker
}
```

### 4.12 `UI_DOT_TO_DOT` — join the stars in order (family of `UI_CHRONO_SEQUENCE`)

- **Use it for:** counting (by ones, twos, tens), the alphabet — the line reveals a figure.
- **Options:** **4–15 stars** on a 100×100 canvas, at least 12 units apart, 8 units from the edge.
- **Payload:**

```ts
{
  template: 'UI_DOT_TO_DOT',
  stars: { x, y, label }[],          // in the CORRECT joining order, labels all different
  figure: { name, emoji },           // shown when the drawing is finished
}
```

### 4.13 `UI_COLOR_MIX` — pour two paints into the cauldron (family of `UI_DRAG_MATCH`)

- **Use it for:** colour theory. The object is drawn grey and gets its colour on success.
- **Options:** **3–6 paints**; exactly two of them are the recipe.
- **Payload:**

```ts
{
  template: 'UI_COLOR_MIX',
  object: Card,                      // emoji + label of the thing to paint
  result: { id, name, color },       // the colour to get
  paints: { id, name, color }[],
  recipe: [string, string],          // ids of the two paints
}
```

Two more `Card` fields: `silhouette: true` draws the pictogram as its black
shadow (shadow lotto), and `lang: 'en'` makes the speaker read the card in
English (English lessons).

### Template picker (cheat sheet)

| The game asks the child to… | Template | Options |
| --- | --- | --- |
| pick the right answer | `UI_GRID_CHOICE` | 4 (2×2) or 6 (2×3) |
| decide which category something belongs to | `UI_SORTER_BINS` | 2–4 bins |
| put things in order | `UI_CHRONO_SEQUENCE` | 3–5 cards |
| connect pairs | `UI_DRAG_MATCH` | 3 pairs |
| place something on the world map | `UI_MAP_PUZZLE` | 7 continents / 5 oceans |
| balance an equation | `UI_BALANCE_SCALE` | 3–4 weights |
| pay an amount of money | `UI_CASH_TRAY` | wallet of coins |
| rebuild a shape | `UI_TANGRAM` | n pieces |
| build a given area | `UI_GRID_AREA` | grid |
| follow a number rule across a grid | `UI_NUMBER_MAZE` | grid |
| pop letters / syllables in order | `UI_BUBBLE_POP` | 2–6 bubbles |
| join numbered or lettered dots | `UI_DOT_TO_DOT` | 4–15 stars |
| mix two paints | `UI_COLOR_MIX` | 3–6 paints |

---

## 5. Anti-guessing & how many options

The platform is built around a **Zero-Aggression, anti-guessing** philosophy
(see the PRD and `docs/level-design.md`):

- **Give the recommended option counts** from §4. For `UI_GRID_CHOICE`, the
  default anti-guessing grid is 3×3 (9) at the engine level (`TaskConfig.choicesCount`
  defaults to 9), but **template games set their own `options` list** and in
  practice use **4 or 6** — enough to prevent guessing without overwhelming a
  pre-reader. Prefer **4** for text answers, **6** for pictorial answers.
- **Distractors must be *plausible and already-known*.** A wrong option is drawn
  only from content the child has already met at this step (`knownAt(step)`), so
  an answer the child has never seen can never be the trap. Use the
  `withDistractors(correct, pool, count, same)` helper — it returns the correct
  item plus `count − 1` random others, shuffled.
- **Never make the correct option visually obvious** (don't let it be the only
  one with a label, the only emoji, the longest text, etc.).
- Mistakes never punish. Two mistakes on a task raise a visual **hint**; more
  mistakes/idle add extra practice tasks (handled by the engine, not the game).

---

## 6. Difficulty, progression, levels & recall

Summarised here; full rules in `docs/level-design.md`.

- **`step`** is both the position on the path *and* the difficulty. Step 1 is
  easiest. The game's hardness must depend **only on `step`**, never adapt
  mid-level.
- **Path games** (`progression: 'path'`): a level is **10 tasks = 5 new + 5
  recall** (`tasksPerLevel`, usually 10; `RECALL_WINDOW = 5`). The engine builds
  this for you via `recallLevel`/`composeLevel` as long as your `pool(step)`
  honestly returns everything unlocked up to and including `step`. A level
  shrinks on its own if there isn't enough unique content.
- **Free games** (`progression: 'free'`): no ladder, 5–8 tasks per level
  (`tasksPerLevel`), unlimited replay. Use for content with no meaningful
  difficulty growth (sort the rubbish, name the 5 oceans, random time-machine
  tasks).
- **Ranked content** (flags by fame, people by fame): the *list order* is the
  difficulty. Use `introSteps(total, atStart, perStep)` to decide which step
  each item appears on, and provide a `level(step,count)` that marks items of
  the current step as "new" and earlier ones as "recall". To make a game harder
  later, ask the same item two ways («Чим прославився?» / «Хто прославився
  цим?») so N new items yield 2N tasks.
- **`key`** on every task identifies *the question itself* (`flag:jp`, `3+4`),
  independent of its presentation. Two tasks the child would call "the same"
  must share a `key`; the engine never shows the same `key` twice in a level.

---

## 7. Icons & illustrations

Three visual sources, in order of preference:

1. **Emoji** — the default for every `Card.emoji`, bin, stimulus and the game's
   catalog `icon`. Pre-reader-friendly, no assets needed. Use a *distinct,
   unambiguous* emoji per item. Almost all content uses this.
2. **Math glyphs** — numbers, operators and vertically-drawn fractions via
   `Card.glyphs` / `stimulus.glyphs` (`Glyph = string | { n, d }`). Operators
   are spoken correctly automatically (`+`→«плюс», `=`→«дорівнює»…).
3. **Drawn landmark art (`stimulus.art`)** — flat SVG silhouettes for things
   emoji can't show (real landmarks). **Only these ids exist today** (in
   `components/templates/LandmarkArt.tsx`):

   `paris, kyiv, london, rome, cairo, washington, athens, tokyo, berlin,
   beijing, copenhagen, warsaw`

   To use one: `stimulus: { emoji: '🗼', art: 'paris', caption: 'Ейфелева вежа' }`
   (the emoji is a fallback). **Do not invent new `art` ids in a spec** — if a
   game needs a landmark not in this list, note it under *Open questions* so new
   art can be drawn; otherwise fall back to an emoji.

Special drawn cards also exist via `Card.shape` (figure on a cell grid) and
`Card.clock` (a drawn analogue clock) — used by Math.

### The `landmark` (what the game builds in the child's world)

Every game should define a `landmark` — the structure the child grows in «Мій
світ» as they progress. It has a `name`, an `emoji`, and optional 4-stage
growth:

```ts
landmark: {
  name: 'Алея прапорів',
  emoji: '🚩',
  stages: [['🇺🇦','Україна'], ['🗼','Франція'], ['🗻','Японія'], ['🗽','Америка']],
}
```

`stages` is **exactly 4** `[emoji, label]` pairs (stage 1→4). Without `stages`
the same building simply grows larger.

---

## 8. Hints and reward facts

Two different pieces of spoken content per task. **Both are mandatory.**

### `hint` (on the payload) — the scaffolding help after mistakes

A single short, encouraging Ukrainian sentence that explains **how to solve this
specific task**. It is spoken when the Zero-Aggression helper appears (after two
mistakes), never as a nag. Point at the clue, don't give the answer away.

> «Шукай материк, який блимає. Кенгуру живе на материку Австралія.»

### `outro` (on the `TaskInstance`) — the reward fact after a correct answer

A short fact shown and spoken on success. **Every task must have a pool of at
least 10 different texts** (`outro: string[]`), so replaying is never boring.
This is enforced by `npm run check:content`.

Build the pool with the `factPool(...)` helper: **first the task's own fact,
then at least nine more real facts about its category** (the material, the
continent, the person's calling, the question's topic). Ten rephrasings of one
fact do **not** count — they must be genuinely different facts.

```ts
import { factPool } from '../shared/facts';
// the item's own fact first, then the shared category pool:
outro: factPool(animal.fact, ANIMAL_FACTS[animal.id]);
outro: factPool(person.fact, CALLING_FACTS[person.calling]);
```

Shared fact pools live in a `facts.ts` next to the module. A spec must therefore
deliver, for every distinct task (or task category), **the own fact + ≥9
category facts**.

> **For Gemini:** this is the most content-heavy requirement. Budget for it:
> every item needs its own one-line fact, and every *category* of items needs a
> pool of at least 9 shared facts. See §13 for the shape.

### `intro` — the one-time "what is this game" explainer

A friendly Ukrainian paragraph played once before the first level, explaining
what the game is and how to play. Use `introFor(step)` to explain each new task
type as the path unlocks it (see Nature's seasons game).

---

## 9. Content data file conventions

A template subject folder looks like this (copy the shape):

```
src/modules/<subject>/
  index.ts     ← defineTemplateModule({...}); the games + their pool() functions
  data.ts      ← the raw content arrays (ordered easy→hard where it matters)
  facts.ts     ← the shared outro fact pools (≥9 per category)
  questions.ts ← (optional) Q&A content, as in ecology
```

Conventions:

- **Order content easy → hard / famous → obscure** in `data.ts`; the path keys
  off list order (`unlocked`, `introSteps`).
- Keep `pool(step)` **pure**: no randomness in the `key`, no I/O. Shuffling for
  presentation is fine; identity is not.
- Register the module by adding one import line to `src/modules/index.ts`.
- Reuse the shared release constant for `publishDate`
  (`V4_RELEASE = '2026-10-06T00:00:00Z'`).

---

## 10. Hard rules & authoring checklist

**Hard rules (a spec that breaks these cannot be built):**

1. Build on the 10 templates (Path A). No new mechanics without flagging it.
2. All child/parent-facing text is **Ukrainian**.
3. Every task has a stable `key` describing the question, unique per level.
4. Every task has a `hint` and an `outro` pool of **≥10 genuinely different
   facts**.
5. Respect the option counts in §4; distractors come from already-known content.
6. `path` games define `steps`; every game defines `tasksPerLevel` (path 5–10, free 5–8).
7. Only use `stimulus.art` ids that exist (§7).
8. `landmark.stages`, when present, has exactly 4 `[emoji, label]` pairs.

**Checklist (from `docs/level-design.md` §8):**

1. Choose type: path (set `steps`) or free; set `tasksPerLevel` either way.
2. Give each task a meaningful `key`.
3. Pick the authoring method: growing `pool(step)` or ranked `level(step)`.
4. Give each task a `hint` and a 10+ `outro` pool.
5. If the game shows readable text → `hasText: true`.
6. Add a `landmark`.
7. Verify: `npm test`, `npm run check:content`, `npm run build`.

---

## 11. How the code is wired

*(Reference for Kiro when turning a spec into code; Gemini can skip this.)*

A template game becomes code like this (abridged from `geography/index.ts`):

```ts
export const geographyModule = defineTemplateModule({
  id: 'geography', title: 'Географія', icon: '🌍', accent: '#0ea5e9',
  games: [
    {
      id: 'flags',
      gameId: 'geo_flags_quiz',
      label: 'Вгадай Прапор', icon: '🚩',
      blurb: `Усі ${COUNTRIES.length} прапори світу — від найвідоміших`,
      intro: 'У кожної країни є свій прапор…',
      landmark: { name: 'Алея прапорів', emoji: '🚩', stages: [/* 4 */] },
      steps: FLAG_STEPS,
      difficulty: 1,
      publishDate: V4_RELEASE,
      mechanics: 'UI_GRID_CHOICE',
      level: flagsLevel,          // ranked content → custom level()
      pool: flags,                // all tasks available at a step
    },
    // …more games
  ],
});
```

A single task is created with `templateTask(key, prompt, payload, step, outro)`:

```ts
templateTask(
  `flag:${country.id}`,
  `Знайди прапор: ${country.name}`,
  {
    template: 'UI_GRID_CHOICE',
    cols: 3,
    options: withDistractors(country, known, 6, byId).map(c => card(c.id, c.flag, undefined, c.name)),
    correctId: country.id,
    hint: `${country.name} — це країна в ${country.continentName}. Придивись до кольорів.`,
  },
  step,
  flagStories(country),   // the 10+ outro pool
);
```

Helpers available in `src/modules/shared/templateModule.ts`:
`card`, `templateTask`, `withDistractors`, `unlocked`, `introSteps`,
`recallLevel`, `progressOf`, `rewardFor`; and `factPool` in `shared/facts.ts`.

Final wiring: add `import './<subject>';` to `src/modules/index.ts`.

---

## 12. The Game Spec template (Gemini fills this)

> Produce **one filled copy per new game**. Keep headings; replace the
> placeholders. Every child-facing string in Ukrainian. If something cannot be
> expressed with the 10 templates, write it under *Open questions* instead of
> inventing a mechanic.

```md
# Game Spec: <Ukrainian label>

## 1. Catalog card
- subject (module):            <existing id, e.g. geography | history | … | NEW: name>
- id:                          <snake_case, unique in subject>
- gameId:                      <subject>_<id>
- label (UA):                  «…»
- icon (emoji):                …
- blurb (UA):                  «…»
- progression:                 path | free
- steps:                       <N if path, else —>
- tasksPerLevel:               <5–10; 10 unless a task is long, 5–8 if free>
- difficulty:                  1 | 2 | 3 | [min,max]
- hasText:                     true | false
- mechanics:                   <one or more of the 6 MechanicsType>
- publishDate:                 2026-10-06T00:00:00Z   (or as directed)
- landmark:                    { name:«…», emoji:…, stages:[[e,«…»],[e,«…»],[e,«…»],[e,«…»]] }
- intro (UA):                  «…»   (and introFor(step) notes if task types unlock over the path)

## 2. Task types
For EACH kind of task the game asks, specify:
- name & when it appears:      <e.g. "flag quiz, every step" / "day-night, step ≥ 5">
- template:                    <one of the 10>
- prompt pattern (UA):         «Знайди прапор: {country}»
- key pattern:                 flag:{id}
- options / bins / cards:      <count + what they are; for GRID_CHOICE give cols>
- correct answer:              <how it is identified>
- distractor rule:             <drawn from which known pool>
- stimulus:                    <emoji / art id / glyphs / none>
- hint (UA):                   «…»   (one per task or a formula)

## 3. Content
Provide the raw data table(s). Order easy→hard / famous→obscure.
| id | emoji/art | label (UA) | correct/category | own fact (UA, one line) |
|----|-----------|------------|------------------|-------------------------|
| …  | …         | …          | …                | …                       |

## 4. Reward facts (outro) — ≥10 per task
For each category of task, give the shared fact pool (≥9 genuinely different
facts in UA). Each task's pool = its own fact (from §3) + this category pool.

### Category: <name>
1. «…»  2. «…»  …  9. «…»   (minimum nine)

## 5. Difficulty plan
- how `pool(step)` grows (what unlocks at which step), OR
- ranked order + introSteps(total, atStart, perStep) for ranked content.

## 6. Open questions / assets needed
- new landmark art ids required (if any)
- anything the 10 templates can't express
```

---

## 13. A fully worked example spec

A compact, real-shaped example so Gemini can copy the density and tone. (This is
illustrative; the live game may differ.)

```md
# Game Spec: «Музичні Інструменти»

## 1. Catalog card
- subject (module):   NEW: music   (title «Музика», icon 🎵, accent #ec4899)
- id:                 instruments
- gameId:             music_instruments
- label (UA):         «Вгадай Інструмент»
- icon:               🎺
- blurb (UA):         «Який інструмент так звучить і до якої родини належить»
- progression:        path
- steps:              8
- difficulty:         [1, 2]
- hasText:            true
- mechanics:          [UI_GRID_CHOICE, UI_SORTER_BINS]
- publishDate:        2026-10-06T00:00:00Z
- landmark:           { name:«Концертний зал», emoji:🎻,
                        stages:[[🥁,«Барабан»],[🎸,«Гітара»],[🎻,«Скрипка»],[🎹,«Оркестр»]] }
- intro (UA):         «Познайомся з музичними інструментами! Упізнай інструмент
                       і дізнайся, до якої родини він належить — струнні, духові
                       чи ударні.»

## 2. Task types
### A. "Who is this instrument?" — every step — UI_GRID_CHOICE
- prompt (UA):     «Який це інструмент?»
- key:             instrument:{id}
- options:         4 cards (cols 2); labels are instrument names
- correctId:       {id}
- distractors:     withDistractors from instruments known at this step
- stimulus:        { emoji of the instrument }
- hint (UA):       «Прислухайся: {clue}. Його назва починається на «{letter}».»

### B. "Which family?" — step ≥ 3 — UI_SORTER_BINS
- prompt (UA):     «До якої родини належить {name}?»
- key:             family:{id}
- bins:            3 — Струнні 🎻 / Духові 🎺 / Ударні 🥁
- correctBinId:    {family}
- wrongSay:        { strings:«Я звучу інакше!», … }
- hint (UA):       «{name} — це {family}. {clue}»

## 3. Content
| id      | emoji | label (UA)   | family   | own fact (UA)                                           |
|---------|-------|--------------|----------|---------------------------------------------------------|
| drum    | 🥁    | «Барабан»    | ударні   | «По барабану б’ють — і він гучно гуде.»                 |
| guitar  | 🎸    | «Гітара»     | струнні  | «У гітари шість струн; їх перебирають пальцями.»        |
| violin  | 🎻    | «Скрипка»    | струнні  | «На скрипці грають смичком, водячи ним по струнах.»     |
| trumpet | 🎺    | «Труба»      | духові   | «У трубу дмуть — і вона співає гучно й яскраво.»         |
| …       | …     | …            | …        | …                                                       |

## 4. Reward facts (outro)
### Category: струнні (≥9)
1. «У струнних інструментів звук народжується, коли дрижить струна.»
2. «Що товща струна, то нижчий звук.»
3. «Арфа — найбільший струнний інструмент.»
4. «Віолончель тримають між колінами.»
… (9+ total)

### Category: духові (≥9)
1. «Духові звучать від струменя повітря.»
… (9+ total)

### Category: ударні (≥9)
1. «Ударні задають ритм усьому оркестру.»
… (9+ total)

## 5. Difficulty plan
- Instruments ordered best-known first in data.ts.
- introSteps(total, atStart=5, perStep=3): 5 instruments on step 1, +3 each step.
- Task A every step; Task B (family) unlocks at step 3.

## 6. Open questions / assets needed
- No landmark art needed (emoji only).
- Audio clips of each instrument would improve Task A but are optional; without
  them the prompt relies on the picture + name.
```

---

### One-line summary for the pipeline

> **Gemini:** fill §12 for one game, obeying §3 (config), §4 (templates +
> option counts), §5 (anti-guessing), §6 (difficulty), §7 (icons), §8 (hints +
> 10 facts), §10 (hard rules). **Kiro:** turn that filled spec into a
> `defineTemplateModule` game using the patterns in §11.
