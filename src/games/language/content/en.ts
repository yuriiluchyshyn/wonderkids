import { ASSOC_EN } from './assoc';
import type { LangPack, Sentence, Word } from '../tasks';

/** Three-letter words for the phonics steps: C-A-T, D-O-G. */
const PHONICS = `
cat|🐱 dog|🐶 sun|☀️ hat|🎩 bed|🛏️ pig|🐷 bus|🚌 cup|🥤 pen|🖊️ box|📦
fox|🦊 hen|🐔 bat|🦇 bug|🐛 bag|👜 map|🗺️ nut|🥜 pan|🍳 pot|🍲 jet|✈️
van|🚐 web|🕸️ leg|🦵 lip|👄 rat|🐀 ram|🐏 cow|🐄 owl|🦉 bee|🐝 ant|🐜
egg|🥚 eye|👁️ ear|👂 arm|💪 key|🔑 toy|🧸 boy|👦 man|👨 ice|🧊 sea|🌊
car|🚗 jam|🍓 gem|💎 log|🪵 fog|🌫️ tub|🛁 pin|📌 pie|🥧 tea|🍵 ten|🔟
six|6️⃣ one|1️⃣ two|2️⃣ red|🔴 sad|😢 hot|🥵 wet|💦 run|🏃 hug|🤗 cry|😭
ape|🦍 cub|🐻 axe|🪓 saw|🪚 bow|🏹 gas|⛽ oil|🛢️ tie|👔 cap|🧢 art|🎨
zoo|🦓 net|🥅 sky|🌌 kid|🧒 mop|🧹 ham|🍖 bun|🥯 nap|😴 elf|🧝 gym|🏋️
cab cob cod cop cot cut dad den dig dot fan fig fin fit gap gum hip hit hop hut
jar jaw jog joy jug kit lap lid lot mat mix mom mud mug nod pad pal pat paw pea
peg pet pit pod pop pup rag rib rod rug sip sit sum tab tag tan tap tin tip top
tug vet wag wax wig win yak yam zip bib bud dip hum lab rim row sap
`;

/** Longer words to spell: four letters first, then five. */
const SPELL = `
fish|🐟 bird|🐦 frog|🐸 duck|🦆 bear|🐻 lion|🦁 wolf|🐺 goat|🐐 deer|🦌 crab|🦀
seal|🦭 swan|🦢 pony|🐎 bull|🐂 worm|🪱 milk|🥛 cake|🎂 rice|🍚 corn|🌽 pear|🍐
kiwi|🥝 soup|🥣 meat|🥩 salt|🧂 taco|🌮 book|📖 ball|⚽ door|🚪 lamp|💡 sock|🧦
shoe|👟 boot|👢 coat|🧥 ring|💍 bell|🔔 drum|🥁 kite|🪁 boat|⛵ ship|🚢 bike|🚲
taxi|🚕 fork|🍴 bowl|🍜 soap|🧼 sofa|🛋️ flag|🚩 gift|🎁 coin|🪙 lock|🔒 tent|⛺
star|⭐ moon|🌙 rain|🌧️ snow|❄️ wind|🌬️ fire|🔥 tree|🌳 leaf|🍃 rose|🌹 rock|🪨
road|🛣️ city|🏙️ hand|✋ foot|🦶 nose|👃 face|🙂 baby|👶 girl|👧 king|🤴 game|🎮
dice|🎲 card|🃏 film|🎬 zero|0️⃣ four|4️⃣ five|5️⃣ nine|9️⃣ snail|🐌 snake|🐍 mouse|🐭
horse|🐴 sheep|🐑 zebra|🦓 tiger|🐯 panda|🐼 koala|🐨 camel|🐫 whale|🐳 shark|🦈 eagle|🦅
chick|🐥 bunny|🐰 otter|🦦 sloth|🦥 hippo|🦛 rhino|🦏 llama|🦙 squid|🦑 bread|🍞 apple|🍎
lemon|🍋 grape|🍇 peach|🍑 mango|🥭 melon|🍈 pizza|🍕 salad|🥗 candy|🍬 honey|🍯 juice|🧃
water|💧 onion|🧅 bacon|🥓 pasta|🍝 donut|🍩 train|🚆 plane|🛩️ truck|🚚 house|🏠 chair|🪑
clock|⏰ phone|📱 watch|⌚ brush|🖌️ broom|🧹 spoon|🥄 knife|🔪 plate|🍽️ robot|🤖 crown|👑
dress|👗 shirt|👕 pants|👖 scarf|🧣 glove|🧤 heart|❤️ cloud|☁️ beach|🏖️ world|🌍 plant|🌱
tooth|🦷 mouth|👄 brain|🧠 queen|👸 clown|🤡 ghost|👻 angel|👼 music|🎵 piano|🎹 smile|😄
bank barn bath bead beak bean beef belt bush cage camp cane cape cart cave chin clap claw clay coal
comb cook cord cork crow cube curl desk dish doll dove drop dust farm fort gate glue gold hair hall
harp hawk heel hill hive hood hook horn hose iron joke jump knee knot lace lake lamb lane lawn lime
line loaf mail mask meal mint mist moth nail neck nest oven page pail palm park path pipe plum pond
pool rake roof room root rope sail sand seed shop silk sink sled soil song tail tape town tray twig
vase vest vine wall wave whip wing wire wood wool yard yarn
bench brick bride chain chalk cheek chest cliff coach coast couch crane cream dance dream earth elbow fairy feast fence
field flame flour flute fruit giant glass globe goose grass gravy guest hotel jeans jelly jewel judge lunch magic maple
march medal month night noise north nurse ocean olive paint paper party pearl pedal penny petal pilot porch prize puppy
purse quilt radio ranch river ruler scale shade shelf shell skate skirt slide smoke snack spark stamp steam stick stone
storm story straw sugar swing sword table teeth thumb toast tower towel track trail tulip uncle voice wagon wheat wheel
bridge bubble bucket butter button cheese cherry circle crayon dragon engine finger garden hammer island jacket kettle kitten ladder letter
lizard mirror monkey orange pencil pepper pillow pocket rabbit school spider spring square stairs street ticket tunnel turtle valley violin zipper
`;

/** A word in two halves: compound words first (sun + flower), then two-syllable words. */
const HALVES = `
sun|flower|🌻 rain|bow|🌈 cup|cake|🧁 butter|fly|🦋 snow|man|⛄ pan|cake|🥞 pop|corn|🍿 tooth|brush|🪥 air|plane|✈️ gold|fish|🐠
lady|bug|🐞 bath|tub|🛁 fire|truck|🚒 pine|apple|🍍 straw|berry|🍓 water|melon|🍉 pea|nut|🥜 hot|dog|🌭 hand|bag|👜 back|pack|🎒
note|book|📓 key|board|⌨️ basket|ball|🏀 base|ball|⚾ foot|ball|🏈 snow|flake|❄️ sun|glasses|🕶️ rain|coat|🧥 mail|box|📫 door|bell|🔔
skate|board|🛹 moon|light|🌙 neck|lace|📿 lip|stick|💄 tea|pot|🫖 egg|plant|🍆 grass|hopper|🦗 cow|boy|🤠 rail|road|🛤️ motor|bike|🏍️
space|ship|🚀 sun|rise|🌅 class|room|🏫 birth|day|🎂 bed|room|🛏️ mon|key|🐒 ti|ger|🐯 rab|bit|🐰 kit|ten|🐱 pup|py|🐶
tur|tle|🐢 spi|der|🕷️ par|rot|🦜 pen|guin|🐧 dol|phin|🐬 chi|cken|🐔 pan|da|🐼 ze|bra|🦓 ap|ple|🍎 le|mon|🍋
car|rot|🥕 che|rry|🍒 coo|kie|🍪 can|dy|🍬 piz|za|🍕 win|dow|🪟 pen|cil|✏️ bas|ket|🧺 ro|bot|🤖 bal|loon|🎈
gui|tar|🎸 vio|lin|🎻 doc|tor|🧑‍⚕️ ba|by|👶 flo|wer|🌸 gar|den|🏡 win|ter|☃️ sum|mer|🏖️ moun|tain|⛰️ is|land|🏝️
cas|tle|🏰 buc|ket|🪣 ham|mer|🔨 lad|der|🪜 mir|ror|🪞 can|dle|🕯️ jac|ket|🧥 um|brella|☂️ ri|ver|🏞️ roc|ket|🚀
`;

/** Rhyme families (by sound, not spelling), pictured ones first. */
const RHYMES = `
cat|🐱 hat|🎩 bat|🦇 mat
dog|🐶 frog|🐸 log|🪵 fog|🌫️
sun|☀️ bun|🥯 run|🏃 fun|🎉
bee|🐝 tree|🌳 key|🔑 three|3️⃣
cake|🎂 lake|🏞️ snake|🐍 rake
star|⭐ car|🚗 jar guitar|🎸
moon|🌙 spoon|🥄 balloon|🎈 raccoon|🦝
bear|🐻 chair|🪑 pear|🍐 hair|💇
fish|🐟 dish|🍽️ wish|🌠 swish
boat|⛵ coat|🧥 goat|🐐 float
king|🤴 ring|💍 wing swing
train|🚆 rain|🌧️ plane|✈️ crane|🏗️
night|🌃 light|💡 kite|🪁 white|⚪
clock|⏰ sock|🧦 rock|🪨 lock|🔒
nose|👃 rose|🌹 toes|🦶 hose
pig big dig wig
hen pen ten men
bed red sled bread
ball wall tall small
book cook hook look
fly sky pie eye
day play tray gray
bell shell well smell
duck truck luck stuck
sheep sleep jeep deep
snow crow blow grow
cow now how wow
shoe blue two zoo
four door floor more
nine line pine shine
five dive hive drive
eight gate plate skate
hand sand band land
name game same flame
green queen bean clean
bug rug hug mug
map cap nap clap
hill bill mill still
nest best test west
jump bump pump lump
cold gold old told
funny bunny sunny runny
mice rice ice dice
toy boy joy enjoy
hot pot dot spot
`;

const cells = (raw: string) => raw.trim().split(/\s+/);
const lines = (raw: string) => raw.trim().split('\n');

/** Each word once, in the order written. */
const words = (raw: string): Word[] => {
  const seen = new Set<string>();
  return cells(raw)
    .map((cell) => cell.split('|') as Word)
    .filter((w) => !seen.has(w[0]) && seen.add(w[0]));
};
const PHONICS_WORDS = words(PHONICS);

// ---- Sentences: built from parts so every combination is a correct one. ----

/** Who — and five things they do ("Dogs bark."). */
const DOERS: [who: string, emoji: string, does: string[]][] = [
  ['Dogs', '🐶', ['bark', 'run', 'sleep', 'eat', 'play']],
  ['Cats', '🐱', ['sleep', 'purr', 'jump', 'eat', 'play']],
  ['Birds', '🐦', ['fly', 'sing', 'eat', 'sleep', 'hop']],
  ['Fish', '🐟', ['swim', 'eat', 'sleep', 'play', 'hide']],
  ['Frogs', '🐸', ['jump', 'swim', 'croak', 'eat', 'sleep']],
  ['Bears', '🐻', ['sleep', 'eat', 'walk', 'growl', 'climb']],
  ['Bees', '🐝', ['fly', 'buzz', 'work', 'dance', 'rest']],
  ['Kids', '🧒', ['play', 'run', 'jump', 'laugh', 'sing']],
  ['Horses', '🐴', ['run', 'jump', 'eat', 'sleep', 'walk']],
  ['Babies', '👶', ['cry', 'sleep', 'eat', 'smile', 'crawl']],
  ['Ducks', '🦆', ['swim', 'quack', 'fly', 'eat', 'walk']],
  ['Lions', '🦁', ['roar', 'run', 'sleep', 'eat', 'hunt']],
  ['Monkeys', '🐒', ['climb', 'jump', 'play', 'eat', 'swing']],
  ['Rabbits', '🐰', ['hop', 'run', 'eat', 'hide', 'dig']],
  ['Cows', '🐄', ['moo', 'eat', 'walk', 'sleep', 'stand']],
  ['Pigs', '🐷', ['oink', 'eat', 'sleep', 'dig', 'run']],
  ['Owls', '🦉', ['fly', 'hoot', 'hunt', 'watch', 'sleep']],
  ['Wolves', '🐺', ['howl', 'run', 'hunt', 'sleep', 'eat']],
  ['Snakes', '🐍', ['hiss', 'crawl', 'hide', 'sleep', 'hunt']],
  ['Whales', '🐳', ['swim', 'dive', 'sing', 'eat', 'jump']],
  ['Mice', '🐭', ['squeak', 'run', 'hide', 'eat', 'sleep']],
  ['Hens', '🐔', ['cluck', 'peck', 'walk', 'eat', 'sleep']],
  ['Ants', '🐜', ['work', 'walk', 'dig', 'climb', 'carry']],
  ['Planes', '✈️', ['fly', 'land', 'turn', 'climb', 'wait']],
  ['Boys', '👦', ['run', 'play', 'read', 'jump', 'swim']],
];

const PEOPLE = ['Mom', 'Dad', 'Grandma', 'Grandpa', 'Anna', 'Tom', 'Kate', 'Max', 'Lily', 'Sam', 'Emma', 'Ben', 'Mia', 'Jack', 'Lucy'];
const ACTIONS: [phrase: string, emoji: string][] = [
  ['reads books', '📖'],
  ['eats apples', '🍎'],
  ['drinks juice', '🧃'],
  ['draws flowers', '🌸'],
  ['bakes cakes', '🎂'],
  ['likes pizza', '🍕'],
  ['buys bread', '🍞'],
  ['washes dishes', '🍽️'],
  ['plays football', '⚽'],
  ['makes soup', '🍲'],
  ['feeds cats', '🐱'],
  ['rides bikes', '🚲'],
  ['wears hats', '🎩'],
  ['loves music', '🎵'],
  ['paints pictures', '🖼️'],
  ['grows flowers', '🌷'],
  ['drives cars', '🚗'],
  ['builds houses', '🏠'],
  ['catches fish', '🐟'],
  ['opens doors', '🚪'],
  ['sings songs', '🎶'],
  ['needs help', '🤝'],
  ['likes apples', '🍏'],
  ['has toys', '🧸'],
  ['sees stars', '⭐'],
  ['wants milk', '🥛'],
  ['finds keys', '🔑'],
  ['eats cake', '🎂'],
  ['drinks tea', '🍵'],
  ['reads maps', '🗺️'],
];

const HEROES: [who: string, emoji: string][] = [
  ['The little dog', '🐶'],
  ['The big bear', '🐻'],
  ['The funny monkey', '🐒'],
  ['The small mouse', '🐭'],
  ['The happy girl', '👧'],
  ['The kind boy', '👦'],
  ['The white cat', '🐱'],
  ['The green frog', '🐸'],
  ['The old horse', '🐴'],
  ['The yellow bird', '🐤'],
  ['The brown fox', '🦊'],
  ['The gray wolf', '🐺'],
  ['The fat pig', '🐷'],
  ['The tall giraffe', '🦒'],
  ['The fast rabbit', '🐰'],
  ['The black sheep', '🐑'],
  ['The young lion', '🦁'],
  ['The pink duck', '🦆'],
  ['The sleepy koala', '🐨'],
  ['The clever owl', '🦉'],
];
/** One-word endings make four-word sentences, two-word ones — five. */
const ENDINGS = ['runs', 'sleeps', 'jumps', 'eats', 'plays', 'walks', 'hides', 'waits', 'smiles', 'rests', 'runs fast', 'sleeps well', 'eats slowly', 'jumps high', 'plays outside', 'walks home', 'swims well', 'hides here', 'sits down', 'goes away', 'comes back', 'looks up', 'stands still', 'runs away', 'wakes up'];

const TWO: Sentence[] = DOERS[0][2].flatMap((_, i) => DOERS.map(([who, emoji, does]): Sentence => [`${who} ${does[i]}.`, emoji]));
const THREE: Sentence[] = ACTIONS.flatMap(([phrase, emoji], i) => PEOPLE.map((_, j): Sentence => [`${PEOPLE[(i + j) % PEOPLE.length]} ${phrase}.`, emoji]));
const LONG: Sentence[] = ENDINGS.flatMap((ending, i) => HEROES.map((_, j): Sentence => {
  const [who, emoji] = HEROES[(i + j) % HEROES.length];
  return [`${who} ${ending}.`, emoji];
}));

export const EN: LangPack = {
  lang: 'en',
  name: 'Англійська мова',
  flag: '🇬🇧',
  prefix: 'en_',
  alphabet: [...'abcdefghijklmnopqrstuvwxyz'],
  partWords: PHONICS_WORDS.map(([word, emoji]) => ({ parts: [...word], emoji })),
  spellWords: words(SPELL),
  halves: cells(HALVES).map((cell) => cell.split('|') as [string, string, string]),
  assoc: ASSOC_EN,
  rhymes: lines(RHYMES).map(cells),
  sentences: { two: TWO, three: THREE, long: LONG },
  cards: {
    alphabet: {
      label: 'Alphabet',
      icon: '🔠',
      blurb: 'Англійська: постав літери на свої місця в абетці',
      intro: 'Вчимо англійську абетку! Літери в ній стоять одна за одною, завжди в тому самому порядку. Кілька літер загубилося — перетягни кожну на її місце.',
      difficulty: [1, 2],
    },
    bubbles: {
      label: 'Bubble Pop',
      icon: '🫧',
      blurb: 'Англійська: лопай бульбашки — абетка і слова з літер',
      intro: 'Вчимо англійську! У бульбашках — англійські літери. Лопай їх по порядку, як в англійській абетці. Натисни на динамік, щоб почути літеру.',
      difficulty: [1, 2],
    },
    chain: {
      label: 'Word Chain',
      icon: '🔗',
      blurb: 'Англійська: з’єднуй слова з літерами та між собою',
      intro: 'Вчимо англійські слова! З’єднай кожне слово з літерою, на яку воно починається. Натисни на динамік, щоб почути слово.',
      difficulty: [1, 3],
    },
    rhymes: {
      label: 'Rhyme Matcher',
      icon: '🎶',
      blurb: 'Англійська: знаходь слова, що римуються',
      intro: 'В англійській мові теж є рими — слова, які звучать схоже наприкінці. Натискай на динаміки, слухай слова і з’єднуй ті, що римуються.',
      difficulty: [2, 3],
    },
    sentences: {
      label: 'Sentence Builder',
      icon: '🧱',
      blurb: 'Англійська: склади речення зі слів',
      intro: 'Складаємо речення англійською! Постав слова по порядку. Перше слово пишеться з великої літери, а в кінці стоїть крапка.',
      difficulty: [2, 3],
    },
  },
};
