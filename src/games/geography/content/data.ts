/** Content for the Geography games. Ordered easy → hard: early path steps use
 *  only the first entries, later steps unlock the rest. */
import { own } from '@/core/lang/marks';

export interface Dweller {
  id: string;
  name: string;
  emoji: string;
  home: string;
}

/** Animals placed on their home continent in «Склади Карту». */
export const CONTINENT_ANIMALS: Dweller[] = [
  { id: 'kangaroo', name: 'кенгуру', emoji: '🦘', home: 'australia' },
  { id: 'penguin', name: 'пінгвін', emoji: '🐧', home: 'antarctica' },
  { id: 'lion', name: 'лев', emoji: '🦁', home: 'africa' },
  { id: 'panda', name: 'панда', emoji: '🐼', home: 'asia' },
  { id: 'llama', name: 'лама', emoji: '🦙', home: 'south_america' },
  { id: 'bison', name: 'бізон', emoji: '🦬', home: 'north_america' },
  { id: 'hedgehog', name: 'їжачок', emoji: '🦔', home: 'europe' },
  { id: 'giraffe', name: 'жирафа', emoji: '🦒', home: 'africa' },
  { id: 'koala', name: 'коала', emoji: '🐨', home: 'australia' },
  { id: 'tiger', name: 'тигр', emoji: '🐅', home: 'asia' },
];

export type BiomeId = 'arctic' | 'jungle' | 'desert' | 'ocean' | 'savanna' | 'forest' | 'mountains';

export interface Biome {
  id: BiomeId;
  name: string;
  emoji: string;
  /** «Хто живе …?» — the zone in the locative. */
  where: string;
  /** What this zone "says" to an animal that does not belong there. */
  no: string;
  /** How to recognise the zone without naming it («Яка це природна зона?»). */
  signs: [string, string];
}

/** The first four open the game; the rest join as the path goes on. */
export const BIOMES: Biome[] = [
  {
    id: 'arctic', name: 'Арктика', emoji: '❄️', where: 'в Арктиці', no: 'Бр-р-р, тут занадто холодно!',
    signs: ['Тут майже завжди зима: сніг, крига і лютий мороз.', 'Тут улітку сонце не заходить, а взимку триває довга полярна ніч.'],
  },
  {
    id: 'jungle', name: 'Джунглі', emoji: '🌴', where: 'у джунглях', no: 'Ой, тут занадто вогко і тісно!',
    signs: ['Тут завжди тепло і щодня йде дощ, а дерева ростуть так густо, що внизу сутінки.', 'Тут із гілок звисають ліани, а на деревах живе більше тварин, ніж на землі.'],
  },
  {
    id: 'desert', name: 'Пустеля', emoji: '🏜️', where: 'у пустелі', no: 'Уф-ф, тут занадто спекотно і сухо!',
    signs: ['Тут удень страшенна спека, майже немає води, а довкола — пісок і каміння.', 'Тут дощ може не йти роками, а з рослин — лише колючі кактуси.'],
  },
  {
    id: 'ocean', name: 'Океан', emoji: '🌊', where: 'в океані', no: 'Буль-буль! Я не вмію так плавати!',
    signs: ['Тут усюди солона вода — глибока, з хвилями й течіями.', 'Тут є коралові рифи, а на дні — справжні підводні гори.'],
  },
  {
    id: 'savanna', name: 'Савана', emoji: '🌾', where: 'у савані', no: 'Ой, тут самі трави — і зовсім нема де сховатися!',
    signs: ['Тут безкраї рівнини з високою травою, де подекуди стоять поодинокі дерева.', 'Тут пів року ллють дощі, а пів року — посуха, і великі стада мандрують у пошуках води.'],
  },
  {
    id: 'forest', name: 'Ліс', emoji: '🌲', where: 'у лісі', no: 'Ой, тут стільки дерев, що я заблукаю!',
    signs: ['Тут ростуть дуби, сосни й ялини, восени опадає листя, а взимку лежить сніг.', 'Тут є всі чотири пори року, а ще гриби, ягоди й шишки.'],
  },
  {
    id: 'mountains', name: 'Гори', emoji: '🏔️', where: 'у горах', no: 'Ох, тут зависоко і страшенно круто!',
    signs: ['Тут круті скелі, на вершинах цілий рік лежить сніг, а повітря холодне.', 'Тут що вище підіймаєшся, то холодніше, і замість дерев — саме каміння.'],
  },
];

/** A few facts about each zone itself (told after «Яка це природна зона?»). */
export const BIOME_FACTS: Record<BiomeId, string[]> = {
  arctic: [
    'Арктика лежить довкола Північного полюса — на самій «маківці» Землі.',
    'В Арктиці немає суходолу під полюсом: там океан, укритий товстою кригою.',
    'Арктичні тварини мають біле хутро, щоб ховатися на снігу.',
    'Улітку в Арктиці сонце не заходить кілька місяців — це полярний день.',
  ],
  jungle: [
    'Джунглі — це тропічний ліс. У ньому живе більше половини всіх видів тварин Землі.',
    'У джунглях дерева ростуть поверхами: внизу темно, а вгорі — сонце й птахи.',
    'Найбільший тропічний ліс росте вздовж річки Амазонки в Південній Америці.',
    'У джунглях дощ іде майже щодня, тому там завжди вогко.',
  ],
  desert: [
    'Найбільша спекотна пустеля світу — Сахара в Африці.',
    'Удень у пустелі дуже спекотно, а вночі буває по-справжньому холодно.',
    'Місце в пустелі, де є вода і ростуть пальми, називається оазис.',
    'Пустельні тварини здебільшого виходять уночі, коли спека спадає.',
  ],
  ocean: [
    'Океани вкривають більшу частину нашої планети — тому Земля з космосу блакитна.',
    'Вода в океані солона, пити її не можна.',
    'Найглибші місця океану темні й холодні — туди не дістає сонце.',
    'В океані живуть і найбільші тварини Землі — кити, і зовсім крихітний планктон.',
  ],
  savanna: [
    'Савана — це трав’яна рівнина в теплих краях. Найвідоміші савани — в Африці.',
    'У савані живуть найбільші наземні тварини: слони, жирафи, носороги.',
    'У сезон посухи трава в савані жовтіє, а річки міліють.',
    'Дерева савани — баобаби й акації — запасають воду на суху пору.',
  ],
  forest: [
    'Ліси називають легенями планети: дерева роблять повітря чистим.',
    'У лісі багато схованок: дупла, нори, густі кущі.',
    'Восени листяний ліс стає жовтим і червоним, а хвойний лишається зеленим.',
    // Ukraine's own: the other languages tell of their own forests and mountains here (`own`).
    own('Найбільші ліси України ростуть у Карпатах і на Поліссі.'),
  ],
  mountains: [
    'Найвища гора світу — Еверест.' + own(' Найвища гора України — Говерла.'),
    'На високих вершинах сніг не тане навіть улітку.',
    'Що вище в гори, то менше дерев: на вершинах — лише каміння й мох.',
    'Гірські тварини чудово лазять по скелях і мають густе хутро.',
  ],
};

export interface BiomeAnimal extends Dweller {
  home: BiomeId;
  fact: string;
  /**
   * Zones where this animal could arguably live too (a seal swims in the
   * ocean, snakes live in jungles). Such a zone is never offered as a wrong
   * answer for it, so no question has two defensible answers.
   */
  also?: BiomeId[];
}

/**
 * Ordered by when the path meets them: the first sixteen cover the four zones
 * the game opens with, then the savanna and the forest arrive, then more sea
 * and jungle dwellers, and the mountains last.
 */
export const BIOME_ANIMALS: BiomeAnimal[] = [
  { id: 'polar_bear', name: 'білий ведмідь', emoji: '🐻‍❄️', home: 'arctic', fact: 'Білий ведмідь живе серед криги, а густе хутро його гріє.' },
  { id: 'camel', name: 'верблюд', emoji: '🐪', home: 'desert', fact: 'Верблюд може довго не пити, тому йому добре в пустелі.' },
  { id: 'monkey', name: 'мавпа', emoji: '🐒', home: 'jungle', fact: 'Мавпа спритно стрибає по гілках у джунглях.' },
  { id: 'dolphin', name: 'дельфін', emoji: '🐬', home: 'ocean', fact: 'Дельфін живе в океані, але дихає повітрям.' },
  { id: 'seal', name: 'тюлень', emoji: '🦭', home: 'arctic', also: ['ocean'], fact: 'Тюлень не мерзне у крижаній воді завдяки товстому шару жиру.' },
  { id: 'parrot', name: 'папуга', emoji: '🦜', home: 'jungle', fact: 'Яскраві папуги живуть на деревах у тропічному лісі.' },
  { id: 'scorpion', name: 'скорпіон', emoji: '🦂', home: 'desert', fact: 'Скорпіон удень ховається від спеки під камінням.' },
  { id: 'octopus', name: 'восьминіг', emoji: '🐙', home: 'ocean', fact: 'У восьминога вісім щупалець і три серця!' },
  { id: 'arctic_hare', name: 'арктичний заєць', emoji: '🐇', home: 'arctic', fact: 'Арктичний заєць білий, щоб ховатися на снігу.' },
  { id: 'tiger', name: 'тигр', emoji: '🐅', home: 'jungle', also: ['forest'], fact: 'Смугастий тигр ховається серед густих заростей.' },
  { id: 'lizard', name: 'ящірка', emoji: '🦎', home: 'desert', also: ['jungle', 'forest', 'savanna'], fact: 'Ящірка любить грітися на гарячому піску.' },
  { id: 'whale', name: 'кит', emoji: '🐋', home: 'ocean', fact: 'Кит — найбільша тварина на Землі.' },
  { id: 'shark', name: 'акула', emoji: '🦈', home: 'ocean', fact: 'Акули жили в океані ще до динозаврів.' },
  { id: 'gorilla', name: 'горила', emoji: '🦍', home: 'jungle', fact: 'Горила — найбільша мавпа, вона живе в африканських лісах.' },
  { id: 'snake', name: 'змія', emoji: '🐍', home: 'desert', also: ['jungle', 'forest', 'savanna'], fact: 'Пустельні змії швидко ковзають по піску.' },
  { id: 'arctic_fox', name: 'песець', emoji: '🦊', home: 'arctic', fact: 'Песець — полярна лисичка з дуже теплим білим хутром.' },
  // The savanna.
  { id: 'lion', name: 'лев', emoji: '🦁', home: 'savanna', fact: 'Лев живе на відкритих трав’яних рівнинах Африки і полює на стада.' },
  { id: 'zebra', name: 'зебра', emoji: '🦓', home: 'savanna', fact: 'Зебри пасуться табунами на трав’яних рівнинах.' },
  { id: 'giraffe', name: 'жирафа', emoji: '🦒', home: 'savanna', fact: 'Жирафа дістає листя з верхівок поодиноких дерев серед трави.' },
  { id: 'elephant', name: 'слон', emoji: '🐘', home: 'savanna', also: ['jungle'], fact: 'Слони мандрують трав’яними рівнинами від водопою до водопою.' },
  { id: 'rhino', name: 'носоріг', emoji: '🦏', home: 'savanna', fact: 'Носоріг пасеться на рівнинах, де багато трави.' },
  // The forest.
  { id: 'brown_bear', name: 'бурий ведмідь', emoji: '🐻', home: 'forest', also: ['mountains'], fact: 'Бурий ведмідь знаходить у лісі ягоди, горіхи й затишний барліг.' },
  { id: 'squirrel', name: 'білка', emoji: '🐿️', home: 'forest', fact: 'Білка живе на деревах і їсть горіхи та шишки.' },
  { id: 'wolf', name: 'вовк', emoji: '🐺', home: 'forest', also: ['arctic', 'mountains'], fact: 'Вовча зграя живе й полює серед лісів.' },
  { id: 'hedgehog', name: 'їжачок', emoji: '🦔', home: 'forest', fact: 'Їжачок шукає жуків у лісовій підстилці й зимує під купою листя.' },
  { id: 'owl', name: 'сова', emoji: '🦉', home: 'forest', also: ['arctic', 'desert', 'mountains'], fact: 'Сова живе в дуплі старого дерева.' },
  { id: 'deer', name: 'олень', emoji: '🦌', home: 'forest', also: ['arctic', 'mountains'], fact: 'Олень ховається серед дерев і їсть листя та кору.' },
  { id: 'boar', name: 'дикий кабан', emoji: '🐗', home: 'forest', fact: 'Дикий кабан риє землю під дубами, шукаючи жолуді.' },
  // More dwellers of the sea and the jungle.
  { id: 'sea_turtle', name: 'морська черепаха', emoji: '🐢', home: 'ocean', fact: 'Морська черепаха має ласти замість лап і все життя плаває.' },
  { id: 'orangutan', name: 'орангутан', emoji: '🦧', home: 'jungle', fact: 'Орангутан майже ніколи не спускається з дерев тропічного лісу.' },
  { id: 'crab', name: 'краб', emoji: '🦀', home: 'ocean', fact: 'Краб живе на морському дні та на узбережжі.' },
  { id: 'sloth', name: 'лінивець', emoji: '🦥', home: 'jungle', fact: 'Лінивець усе життя висить на гілках у вогкому тропічному лісі.' },
  { id: 'jellyfish', name: 'медуза', emoji: '🪼', home: 'ocean', fact: 'Медуза майже вся складається з води і плаває за течією.' },
  { id: 'clownfish', name: 'риба-клоун', emoji: '🐠', home: 'ocean', fact: 'Риба-клоун живе на теплих коралових рифах.' },
  { id: 'squid', name: 'кальмар', emoji: '🦑', home: 'ocean', fact: 'Кальмар плаває в товщі морської води, як маленька ракета.' },
  // The mountains.
  { id: 'mountain_goat', name: 'гірський козел', emoji: '🐐', home: 'mountains', fact: 'Гірський козел стрибає по майже прямовисних скелях.' },
  { id: 'eagle', name: 'орел', emoji: '🦅', home: 'mountains', also: ['forest', 'desert', 'savanna'], fact: 'Орел в’є гніздо на високих скелях.' },
  { id: 'llama', name: 'лама', emoji: '🦙', home: 'mountains', fact: 'Лама живе високо в горах Південної Америки — Андах.' },
  { id: 'mountain_ram', name: 'гірський баран', emoji: '🐏', home: 'mountains', fact: 'Гірський баран легко стрибає з каменя на камінь.' },
];

export const OCEAN_FACTS: Record<string, string> = {
  pacific: 'Тихий океан — найбільший і найглибший на Землі.',
  atlantic: 'Атлантичний океан лежить між Америкою, Європою та Африкою.',
  indian: 'Індійський океан — найтепліший.',
  arctic: 'Північний Льодовитий океан — найменший і вкритий кригою.',
  southern: 'Південний океан оточує Антарктиду.',
};

/** «Пливи до …» without naming the ocean: three riddles each, easy first. */
export const OCEAN_RIDDLES: Record<string, [string, string, string]> = {
  pacific: ['найбільшого океану на Землі', 'найглибшого океану', 'океану, який лежить між Азією та Америкою'],
  atlantic: ['океану між Америкою та Європою', 'океану, який переплив Колумб', 'океану, де тече тепла течія Гольфстрим'],
  indian: ['найтеплішого океану', 'океану між Африкою та Австралією', 'океану, названого на честь Індії'],
  arctic: ['океану, вкритого кригою, де живуть білі ведмеді', 'найменшого океану', 'океану, де розташований Північний полюс'],
  southern: ['океану, який оточує Антарктиду', 'океану, біля якого живуть пінгвіни', 'океану біля Південного полюса'],
};

export interface OceanPart {
  id: string;
  /** As the question names it. */
  name: string;
  /** The ocean it belongs to. */
  ocean: string;
  fact: string;
}

/** Seas and the ocean each is a part of — the best-known first. */
export const SEAS: OceanPart[] = [
  { id: 'black', name: 'Чорне море', ocean: 'atlantic', fact: 'Чорне море омиває південь України. Через протоки й Середземне море воно сполучене з Атлантичним океаном.' },
  { id: 'mediterranean', name: 'Середземне море', ocean: 'atlantic', fact: 'Середземне море лежить між Європою, Африкою та Азією і вузькою Гібралтарською протокою з’єднане з Атлантичним океаном.' },
  { id: 'red', name: 'Червоне море', ocean: 'indian', fact: 'Червоне море — частина Індійського океану. Воно дуже тепле й солоне, а в ньому безліч коралів.' },
  { id: 'baltic', name: 'Балтійське море', ocean: 'atlantic', fact: 'Балтійське море — частина Атлантичного океану на півночі Європи. Вода в ньому майже несолона.' },
  { id: 'caribbean', name: 'Карибське море', ocean: 'atlantic', fact: 'Карибське море — тепла частина Атлантичного океану біля берегів Америки. Колись там плавали пірати.' },
  { id: 'japan', name: 'Японське море', ocean: 'pacific', fact: 'Японське море — частина Тихого океану між Японією та материком Азія.' },
  { id: 'north', name: 'Північне море', ocean: 'atlantic', fact: 'Північне море — частина Атлантичного океану між Великою Британією та Норвегією.' },
  { id: 'arabian', name: 'Аравійське море', ocean: 'indian', fact: 'Аравійське море — частина Індійського океану біля берегів Індії та Аравії.' },
  { id: 'coral', name: 'Коралове море', ocean: 'pacific', fact: 'Коралове море — частина Тихого океану біля Австралії. Саме тут лежить Великий бар’єрний риф.' },
  { id: 'barents', name: 'Баренцове море', ocean: 'arctic', fact: 'Баренцове море — частина Північного Льодовитого океану на півночі Європи.' },
  { id: 'bering', name: 'Берингове море', ocean: 'pacific', fact: 'Берингове море — холодна північна частина Тихого океану між Азією та Америкою.' },
  { id: 'ross', name: 'море Росса', ocean: 'southern', fact: 'Море Росса — частина Південного океану біля берегів Антарктиди. Там живуть пінгвіни й тюлені.' },
  { id: 'south_china', name: 'Південнокитайське море', ocean: 'pacific', fact: 'Південнокитайське море — тепла частина Тихого океану біля берегів Азії.' },
  { id: 'andaman', name: 'Андаманське море', ocean: 'indian', fact: 'Андаманське море — частина Індійського океану біля Таїланду.' },
  { id: 'greenland', name: 'Гренландське море', ocean: 'arctic', fact: 'Гренландське море — частина Північного Льодовитого океану біля найбільшого острова світу, Гренландії.' },
  { id: 'beaufort', name: 'море Бофорта', ocean: 'arctic', fact: 'Море Бофорта — частина Північного Льодовитого океану біля півночі Канади. Майже весь рік воно вкрите кригою.' },
  { id: 'weddell', name: 'море Ведделла', ocean: 'southern', fact: 'Море Ведделла — частина Південного океану біля Антарктиди. Вода в ньому — одна з найпрозоріших у світі.' },
];

/** Famous places: «У якому океані …?» — `name` completes that question. */
export const OCEAN_PLACES: OceanPart[] = [
  { id: 'mariana', name: 'Маріанська западина — найглибше місце на Землі', ocean: 'pacific', fact: 'Маріанська западина — у Тихому океані. Вона така глибока, що в ній сховалася б найвища гора світу.' },
  { id: 'titanic', name: 'затонув корабель «Титанік»', ocean: 'atlantic', fact: 'Корабель «Титанік» затонув в Атлантичному океані, коли плив із Європи до Америки і наштовхнувся на айсберг.' },
  { id: 'madagascar', name: 'лежить острів Мадагаскар', ocean: 'indian', fact: 'Острів Мадагаскар лежить в Індійському океані біля берегів Африки. Тільки там живуть лемури.' },
  { id: 'svalbard', name: 'лежить архіпелаг Шпіцберген, де білих ведмедів більше, ніж людей', ocean: 'arctic', fact: 'Архіпелаг Шпіцберген лежить у Північному Льодовитому океані, зовсім близько до Північного полюса.' },
  { id: 'reef', name: 'Великий бар’єрний риф', ocean: 'pacific', fact: 'Великий бар’єрний риф — у Тихому океані біля Австралії. Його видно навіть із космосу.' },
  { id: 'hawaii', name: 'лежать Гавайські острови', ocean: 'pacific', fact: 'Гавайські острови лежать посеред Тихого океану. Це вершини підводних вулканів.' },
  { id: 'iceland', name: 'лежить острів Ісландія', ocean: 'atlantic', fact: 'Острів Ісландія лежить на півночі Атлантичного океану. Там є вулкани, гейзери й льодовики.' },
  { id: 'maldives', name: 'лежать Мальдівські острови', ocean: 'indian', fact: 'Мальдіви — понад тисяча коралових острівців в Індійському океані.' },
  { id: 'bermuda', name: 'лежить Бермудський трикутник', ocean: 'atlantic', fact: 'Бермудський трикутник — частина Атлантичного океану, про яку розповідають багато загадкових історій.' },
  { id: 'galapagos', name: 'лежать Галапагоські острови з велетенськими черепахами', ocean: 'pacific', fact: 'Галапагоські острови лежать у Тихому океані. Там живуть велетенські черепахи, які важать як кілька дорослих людей.' },
  { id: 'sri_lanka', name: 'лежить острів Шрі-Ланка', ocean: 'indian', fact: 'Острів Шрі-Ланка лежить в Індійському океані біля Індії. Там вирощують знаменитий чай.' },
  { id: 'easter', name: 'лежить острів Пасхи з кам’яними велетнями', ocean: 'pacific', fact: 'Острів Пасхи лежить у Тихому океані. На ньому стоять сотні велетенських кам’яних статуй.' },
];

/** Landmarks → the capital they stand in. */
export const LANDMARKS = [
  { id: 'paris', emoji: '🗼', landmark: 'Ейфелева вежа', capital: 'Париж', country: 'Франції' },
  { id: 'kyiv', emoji: '⛪', landmark: 'Софія Київська', capital: 'Київ', country: 'України' },
  { id: 'london', emoji: '🕰️', landmark: 'Біг-Бен', capital: 'Лондон', country: 'Великої Британії' },
  { id: 'rome', emoji: '🏟️', landmark: 'Колізей', capital: 'Рим', country: 'Італії' },
  { id: 'cairo', emoji: '🐫', landmark: 'Піраміди', capital: 'Каїр', country: 'Єгипту' },
  { id: 'washington', emoji: '🏛️', landmark: 'Білий дім', capital: 'Вашингтон', country: 'США' },
  { id: 'athens', emoji: '🏺', landmark: 'Акрополь', capital: 'Афіни', country: 'Греції' },
  { id: 'tokyo', emoji: '🗾', landmark: 'Токійська вежа', capital: 'Токіо', country: 'Японії' },
  { id: 'berlin', emoji: '🚪', landmark: 'Бранденбурзькі ворота', capital: 'Берлін', country: 'Німеччини' },
  { id: 'beijing', emoji: '🏯', landmark: 'Заборонене місто', capital: 'Пекін', country: 'Китаю' },
  { id: 'copenhagen', emoji: '🧜‍♀️', landmark: 'Статуя Русалоньки', capital: 'Копенгаген', country: 'Данії' },
  { id: 'warsaw', emoji: '🏰', landmark: 'Королівський замок', capital: 'Варшава', country: 'Польщі' },
] as const;

/**
 * Capitals by country code, for the countries of `countries.ts` (which also
 * gives the order: best-known first). Countries with no single undisputed
 * capital, or one named like the country itself, are left out.
 */
// prettier-ignore
export const CAPITAL_OF: Record<string, string> = {
  ua: 'Київ', us: 'Вашингтон', gb: 'Лондон', fr: 'Париж', de: 'Берлін', it: 'Рим', pl: 'Варшава', jp: 'Токіо',
  ca: 'Оттава', es: 'Мадрид', cn: 'Пекін', br: 'Бразиліа', tr: 'Анкара', gr: 'Афіни', eg: 'Каїр', in: 'Нью-Делі',
  au: 'Канберра', mx: 'Мехіко', ar: 'Буенос-Айрес', ch: 'Берн', se: 'Стокгольм', no: 'Осло', nl: 'Амстердам', pt: 'Лісабон',
  kr: 'Сеул', at: 'Відень', cz: 'Прага', be: 'Брюссель', dk: 'Копенгаген', fi: 'Гельсінкі', ie: 'Дублін', hu: 'Будапешт',
  ro: 'Бухарест', bg: 'Софія', hr: 'Загреб', sk: 'Братислава', lt: 'Вільнюс', lv: 'Рига', ee: 'Таллінн', md: 'Кишинів',
  ge: 'Тбілісі', sa: 'Ер-Ріяд', ae: 'Абу-Дабі', th: 'Бангкок', vn: 'Ханой', nz: 'Веллінгтон', cu: 'Гавана', jm: 'Кінгстон',
  cl: 'Сантьяго', co: 'Богота', pe: 'Ліма', is: 'Рейк’явік', rs: 'Белград', si: 'Любляна', cy: 'Нікосія', mt: 'Валлетта',
  kz: 'Астана', am: 'Єреван', az: 'Баку', uz: 'Ташкент', mn: 'Улан-Батор', pk: 'Ісламабад', ph: 'Маніла', my: 'Куала-Лумпур',
  np: 'Катманду', ir: 'Тегеран', iq: 'Багдад', qa: 'Доха', jo: 'Амман', lb: 'Бейрут', ma: 'Рабат', ke: 'Найробі',
  ng: 'Абуджа', et: 'Аддис-Абеба', gh: 'Аккра', ve: 'Каракас', uy: 'Монтевідео', py: 'Асунсьйон', ec: 'Кіто', cr: 'Сан-Хосе',
};

/**
 * Clock difference with Kyiv: `shift` hours later (+) or earlier (−).
 * `kyiv` — the two Kyiv hours the question is asked for (the answer stays
 * within the same day). `winter`: the city does not move its clocks as we do,
 * so the number is true for our winter and the question says so.
 */
export const TIME_SHIFTS = [
  { id: 'warsaw', city: 'Варшаві', shift: -1, kyiv: [9, 14] },
  { id: 'london', city: 'Лондоні', shift: -2, kyiv: [10, 17] },
  { id: 'athens', city: 'Афінах', shift: 0, kyiv: [8, 15] },
  { id: 'paris', city: 'Парижі', shift: -1, kyiv: [12, 20] },
  { id: 'lisbon', city: 'Лісабоні', shift: -2, kyiv: [7, 13] },
  { id: 'new_york', city: 'Нью-Йорку', shift: -7, kyiv: [15, 19] },
  { id: 'vilnius', city: 'Вільнюсі', shift: 0, kyiv: [11, 18] },
  { id: 'rome', city: 'Римі', shift: -1, kyiv: [10, 16] },
  { id: 'dubai', city: 'Дубаї', shift: 2, kyiv: [9, 18], winter: true },
  { id: 'beijing', city: 'Пекіні', shift: 6, kyiv: [8, 14], winter: true },
  { id: 'tokyo', city: 'Токіо', shift: 7, kyiv: [7, 12], winter: true },
  { id: 'sydney', city: 'Сіднеї', shift: 9, kyiv: [6, 11], winter: true },
] as const;

/** When it is `kyiv` in Kyiv, is it day or night in the other city? */
export const DAY_NIGHT = [
  { id: 'la', kyiv: 'day', city: 'Лос-Анджелесі', answer: 'night', why: 'Лос-Анджелес — на іншому боці Землі, і сонце туди ще не дійшло.' },
  { id: 'london', kyiv: 'day', city: 'Лондоні', answer: 'day', why: 'Лондон зовсім близько до нас, тому там теж день.' },
  { id: 'delhi', kyiv: 'day', city: 'Делі', answer: 'day', why: 'Індія трохи східніше, там теж світить сонце.' },
  { id: 'honolulu', kyiv: 'day', city: 'Гонолулу на Гаваях', answer: 'night', why: 'Гаваї далеко в Тихому океані — там зараз глибока ніч.' },
  { id: 'sydney_n', kyiv: 'night', city: 'Сіднеї', answer: 'day', why: 'Коли в нас північ, в Австралії вже ранок нового дня.' },
  { id: 'la_n', kyiv: 'night', city: 'Лос-Анджелесі', answer: 'day', why: 'Коли в нас північ, у Лос-Анджелесі ще триває день.' },
  { id: 'london_n', kyiv: 'night', city: 'Лондоні', answer: 'night', why: 'Лондон поруч, тож і там зараз ніч.' },
  { id: 'warsaw_n', kyiv: 'night', city: 'Варшаві', answer: 'night', why: 'Варшава — наша сусідка, там теж ніч.' },
  { id: 'paris', kyiv: 'day', city: 'Парижі', answer: 'day', why: 'Париж недалеко від нас, у Європі, — там теж день.' },
  { id: 'sydney', kyiv: 'day', city: 'Сіднеї', answer: 'night', why: 'Коли в нас полудень, в Австралії вже пізній вечір і темно.' },
  { id: 'ny_n', kyiv: 'night', city: 'Нью-Йорку', answer: 'day', why: 'Коли в нас північ, у Нью-Йорку ще тільки п’ята вечора.' },
  { id: 'tokyo_n', kyiv: 'night', city: 'Токіо', answer: 'day', why: 'Коли в нас північ, у Японії вже сьома ранку — сонце зійшло.' },
  { id: 'mexico', kyiv: 'day', city: 'Мехіко', answer: 'night', why: 'Коли в нас полудень, у Мексиці ще четверта ранку — усі сплять.' },
  { id: 'mexico_n', kyiv: 'night', city: 'Мехіко', answer: 'day', why: 'Коли в нас північ, у Мексиці ще день — четверта година.' },
  { id: 'vancouver', kyiv: 'day', city: 'Ванкувері в Канаді', answer: 'night', why: 'Ванкувер — на іншому боці Землі: коли в нас полудень, там друга година ночі.' },
  { id: 'wellington', kyiv: 'day', city: 'Веллінгтоні в Новій Зеландії', answer: 'night', why: 'Нова Зеландія — найдалі від нас: коли в нас полудень, там уже майже північ.' },
  { id: 'wellington_n', kyiv: 'night', city: 'Веллінгтоні в Новій Зеландії', answer: 'day', why: 'Коли в нас північ, у Новій Зеландії вже майже полудень наступного дня.' },
] as const;
