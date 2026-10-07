import type { Assoc } from '../tasks';

/**
 * Words linked by meaning («Холодно — Сніг» / "Cold — Snow"), the same pairs
 * in both languages, easy → harder. The last field is the group: pairs of one
 * group could be mixed up with each other, so they never meet in one task.
 *
 *   ukA | ukB | enA | enB | emojiA | emojiB | group
 */
const RAW = `
холодно|сніг|cold|snow|🥶|❄️|winter
дощ|парасолька|rain|umbrella|🌧️|☂️|rain
ніч|місяць|night|moon|🌃|🌙|night
бджола|мед|bee|honey|🐝|🍯|flower
корова|молоко|cow|milk|🐄|🥛|dairy
курка|яйце|hen|egg|🐔|🥚|hen
собака|кістка|dog|bone|🐕|🦴|dog
мавпа|банан|monkey|banana|🐒|🍌|monkey
заєць|морква|rabbit|carrot|🐇|🥕|rabbit
риба|вода|fish|water|🐟|💧|sea
ключ|замок|key|lock|🔑|🔒|key
лікар|ліки|doctor|medicine|🧑‍⚕️|💊|doctor
спека|сонце|hot|sun|🥵|☀️|sun
сон|ліжко|sleep|bed|😴|🛏️|night
птах|пір’я|bird|feather|🐦|🪶|hen
вівця|вовна|sheep|wool|🐑|🧶|sheep
білка|горіх|squirrel|nut|🐿️|🌰|squirrel
павук|павутина|spider|web|🕷️|🕸️|spider
кухар|каструля|cook|pot|🧑‍🍳|🍲|table
пожежник|вогонь|firefighter|fire|🧑‍🚒|🔥|fire
пілот|літак|pilot|plane|🧑‍✈️|✈️|plane
космонавт|ракета|astronaut|rocket|🧑‍🚀|🚀|space
король|корона|king|crown|🤴|👑|king
око|окуляри|eye|glasses|👁️|👓|eye
рука|рукавичка|hand|glove|✋|🧤|winter
нога|шкарпетка|foot|sock|🦶|🧦|foot
зуб|щітка|tooth|toothbrush|🦷|🪥|tooth
хліб|масло|bread|butter|🍞|🧈|dairy
чай|чашка|tea|cup|🍵|☕|table
торт|свічки|cake|candles|🎂|🕯️|party
яблуко|дерево|apple|tree|🍎|🌳|tree
потяг|рейки|train|rails|🚆|🛤️|train
корабель|море|ship|sea|🚢|🌊|sea
машина|дорога|car|road|🚗|🛣️|road
вогнище|дим|campfire|smoke|🏕️|💨|fire
зима|санки|winter|sled|⛄|🛷|winter
літо|морозиво|summer|ice cream|🏖️|🍦|sun
грім|блискавка|thunder|lightning|🌩️|⚡|rain
зірка|небо|star|sky|⭐|🌌|night
метелик|квітка|butterfly|flower|🦋|🌸|flower
панда|бамбук|panda|bamboo|🐼|🎋|panda
равлик|мушля|snail|shell|🐌|🐚|snail
верблюд|пустеля|camel|desert|🐫|🏜️|desert
кит|океан|whale|ocean|🐳|🌊|sea
учитель|школа|teacher|school|🧑‍🏫|🏫|school
художник|пензель|artist|brush|🧑‍🎨|🖌️|art
фермер|трактор|farmer|tractor|🧑‍🌾|🚜|farm
співак|мікрофон|singer|microphone|🧑‍🎤|🎤|music
клоун|цирк|clown|circus|🤡|🎪|circus
чарівник|чарівна паличка|wizard|magic wand|🧙|🪄|magic
пірат|скарб|pirate|treasure|🏴‍☠️|💰|pirate
голова|шапка|head|hat|🙂|🧢|winter
шия|шарф|neck|scarf|🦒|🧣|winter
палець|каблучка|finger|ring|☝️|💍|winter
суп|ложка|soup|spoon|🍲|🥄|table
піца|сир|pizza|cheese|🍕|🧀|dairy
виноград|сік|grapes|juice|🍇|🧃|tree
лампа|світло|lamp|light|💡|✨|lamp
мило|ванна|soap|bath|🧼|🛁|soap
телефон|дзвінок|phone|call|📱|🔔|phone
годинник|час|clock|time|⏰|⌛|clock
гроші|гаманець|money|wallet|💵|👛|pirate
подарунок|свято|gift|party|🎁|🎉|party
лист|пошта|letter|mail|✉️|📮|post
велосипед|шолом|bike|helmet|🚲|⛑️|road
автобус|зупинка|bus|bus stop|🚌|🚏|road
гриб|ліс|mushroom|forest|🍄|🌲|tree
осінь|листя|autumn|leaves|🍂|🍁|tree
вітер|повітряний змій|wind|kite|🌬️|🪁|wind
м’яч|ворота|ball|goal|⚽|🥅|ball
лук|стріла|bow|arrow|🏹|🎯|bow
гітара|струни|guitar|strings|🎸|🎶|music
фотоапарат|фото|camera|photo|📷|🖼️|art
вудка|гачок|fishing rod|hook|🎣|🪝|sea
ранок|сніданок|morning|breakfast|🌅|🥞|sun
ялинка|Новий рік|fir tree|New Year|🎄|🎅|party
сокира|дрова|axe|firewood|🪓|🪵|tree
зоопарк|лев|zoo|lion|🎟️|🦁|zoo
бібліотека|книги|library|books|🏛️|📚|school
лід|ковзани|ice|skates|🧊|⛸️|winter
зошит|ручка|notebook|pen|📓|🖊️|school
рюкзак|підручник|backpack|textbook|🎒|📘|school
пінгвін|крига|penguin|ice|🐧|🧊|winter
вулкан|лава|volcano|lava|🌋|♨️|fire
насіння|росток|seed|sprout|🌻|🌱|seed
гора|вершина|mountain|peak|⛰️|🏔️|mountain
річка|міст|river|bridge|🏞️|🌉|river
піаніно|музика|piano|music|🎹|🎵|music
шахи|дошка|chess|board|♟️|🏁|chess
кіно|попкорн|cinema|popcorn|🎬|🍿|cinema
лікарня|швидка|hospital|ambulance|🏥|🚑|doctor
поліція|сирена|police|siren|👮|🚨|police
будівельник|цегла|builder|bricks|👷|🧱|build
молоток|цвях|hammer|nail|🔨|📌|build
голка|нитка|needle|thread|🪡|🧵|sew
ножиці|папір|scissors|paper|✂️|📄|paper
компас|північ|compass|north|🧭|⬆️|compass
термометр|температура|thermometer|temperature|🌡️|🤒|doctor
телескоп|зорі|telescope|stars|🔭|🌠|night
магніт|залізо|magnet|iron|🧲|🔩|magnet
`;

const ALL = RAW.trim()
  .split('\n')
  .map((line) => line.split('|'));

export const ASSOC_UK: Assoc[] = ALL.map(([a, b, , , ea, eb, group]) => ({ a, b, ea, eb, group }));
export const ASSOC_EN: Assoc[] = ALL.map(([, , a, b, ea, eb, group]) => ({ a, b, ea, eb, group }));
