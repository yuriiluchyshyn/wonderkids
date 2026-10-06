/** Content for the Geography games. Ordered easy → hard: early path steps use
 *  only the first entries, later steps unlock the rest. */

export interface Country {
  id: string;
  name: string;
  flag: string;
  continent: string;
  /** Spoken description of the flag (the "what does it look like" hint). */
  look: string;
}

export const COUNTRIES: Country[] = [
  { id: 'ua', name: 'Україна', flag: '🇺🇦', continent: 'europe', look: 'У цього прапора дві смуги: синя, як небо, і жовта, як пшеничне поле.' },
  { id: 'jp', name: 'Японія', flag: '🇯🇵', continent: 'asia', look: 'У цього прапора червоне коло посередині на білому тлі.' },
  { id: 'fr', name: 'Франція', flag: '🇫🇷', continent: 'europe', look: 'Три стоячі смуги: синя, біла і червона.' },
  { id: 'us', name: 'США', flag: '🇺🇸', continent: 'north_america', look: 'Червоні й білі смуги та синій куточок із зірочками.' },
  { id: 'ca', name: 'Канада', flag: '🇨🇦', continent: 'north_america', look: 'Червоний кленовий листок посередині.' },
  { id: 'br', name: 'Бразилія', flag: '🇧🇷', continent: 'south_america', look: 'Зелений прапор із жовтим ромбом і синім колом.' },
  { id: 'it', name: 'Італія', flag: '🇮🇹', continent: 'europe', look: 'Три стоячі смуги: зелена, біла і червона.' },
  { id: 'de', name: 'Німеччина', flag: '🇩🇪', continent: 'europe', look: 'Три лежачі смуги: чорна, червона і золота.' },
  { id: 'gb', name: 'Велика Британія', flag: '🇬🇧', continent: 'europe', look: 'Синій прапор із червоними і білими хрестами.' },
  { id: 'pl', name: 'Польща', flag: '🇵🇱', continent: 'europe', look: 'Дві смуги: біла згори і червона знизу.' },
  { id: 'cn', name: 'Китай', flag: '🇨🇳', continent: 'asia', look: 'Червоний прапор із жовтими зірками в кутку.' },
  { id: 'in', name: 'Індія', flag: '🇮🇳', continent: 'asia', look: 'Помаранчева, біла і зелена смуги та синє колесо посередині.' },
  { id: 'au', name: 'Австралія', flag: '🇦🇺', continent: 'australia', look: 'Синій прапор із зірками і маленьким британським прапором у кутку.' },
  { id: 'eg', name: 'Єгипет', flag: '🇪🇬', continent: 'africa', look: 'Червона, біла і чорна смуги та золотий орел посередині.' },
  { id: 'es', name: 'Іспанія', flag: '🇪🇸', continent: 'europe', look: 'Червона, широка жовта і знову червона смуги.' },
  { id: 'gr', name: 'Греція', flag: '🇬🇷', continent: 'europe', look: 'Сині й білі смуги та білий хрест у кутку.' },
  { id: 'se', name: 'Швеція', flag: '🇸🇪', continent: 'europe', look: 'Синій прапор із жовтим хрестом.' },
  { id: 'ch', name: 'Швейцарія', flag: '🇨🇭', continent: 'europe', look: 'Червоний квадрат із білим хрестом.' },
  { id: 'tr', name: 'Туреччина', flag: '🇹🇷', continent: 'asia', look: 'Червоний прапор із білим півмісяцем і зіркою.' },
  { id: 'mx', name: 'Мексика', flag: '🇲🇽', continent: 'north_america', look: 'Зелена, біла і червона смуги та орел посередині.' },
  { id: 'ar', name: 'Аргентина', flag: '🇦🇷', continent: 'south_america', look: 'Блакитна, біла і блакитна смуги та сонечко посередині.' },
  { id: 'za', name: 'Південна Африка', flag: '🇿🇦', continent: 'africa', look: 'Дуже кольоровий прапор із зеленою літерою, схожою на «У», що лежить на боці.' },
  { id: 'ke', name: 'Кенія', flag: '🇰🇪', continent: 'africa', look: 'Чорна, червона і зелена смуги та щит зі списами.' },
  { id: 'kr', name: 'Південна Корея', flag: '🇰🇷', continent: 'asia', look: 'Білий прапор із червоно-синім колом посередині.' },
];

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

export const BIOMES = [
  { id: 'arctic', name: 'Арктика', emoji: '❄️', no: 'Бр-р-р, тут занадто холодно!' },
  { id: 'jungle', name: 'Джунглі', emoji: '🌴', no: 'Ой, тут занадто вогко і тісно!' },
  { id: 'desert', name: 'Пустеля', emoji: '🏜️', no: 'Уф-ф, тут занадто спекотно і сухо!' },
  { id: 'ocean', name: 'Океан', emoji: '🌊', no: 'Буль-буль! Я не вмію так плавати!' },
] as const;

export const BIOME_ANIMALS: (Dweller & { fact: string })[] = [
  { id: 'polar_bear', name: 'білий ведмідь', emoji: '🐻‍❄️', home: 'arctic', fact: 'Білий ведмідь живе серед криги, а густе хутро його гріє.' },
  { id: 'camel', name: 'верблюд', emoji: '🐪', home: 'desert', fact: 'Верблюд може довго не пити, тому йому добре в пустелі.' },
  { id: 'monkey', name: 'мавпа', emoji: '🐒', home: 'jungle', fact: 'Мавпа спритно стрибає по гілках у джунглях.' },
  { id: 'dolphin', name: 'дельфін', emoji: '🐬', home: 'ocean', fact: 'Дельфін живе в океані, але дихає повітрям.' },
  { id: 'seal', name: 'тюлень', emoji: '🦭', home: 'arctic', fact: 'Тюлень не мерзне у крижаній воді завдяки товстому шару жиру.' },
  { id: 'parrot', name: 'папуга', emoji: '🦜', home: 'jungle', fact: 'Яскраві папуги живуть на деревах у тропічному лісі.' },
  { id: 'scorpion', name: 'скорпіон', emoji: '🦂', home: 'desert', fact: 'Скорпіон удень ховається від спеки під камінням.' },
  { id: 'octopus', name: 'восьминіг', emoji: '🐙', home: 'ocean', fact: 'У восьминога вісім щупалець і три серця!' },
  { id: 'arctic_hare', name: 'арктичний заєць', emoji: '🐇', home: 'arctic', fact: 'Арктичний заєць білий, щоб ховатися на снігу.' },
  { id: 'tiger', name: 'тигр', emoji: '🐅', home: 'jungle', fact: 'Смугастий тигр ховається серед густих заростей.' },
  { id: 'lizard', name: 'ящірка', emoji: '🦎', home: 'desert', fact: 'Ящірка любить грітися на гарячому піску.' },
  { id: 'whale', name: 'кит', emoji: '🐋', home: 'ocean', fact: 'Кит — найбільша тварина на Землі.' },
  { id: 'shark', name: 'акула', emoji: '🦈', home: 'ocean', fact: 'Акули жили в океані ще до динозаврів.' },
  { id: 'gorilla', name: 'горила', emoji: '🦍', home: 'jungle', fact: 'Горила — найбільша мавпа, вона живе в африканських лісах.' },
  { id: 'snake', name: 'змія', emoji: '🐍', home: 'desert', fact: 'Пустельні змії швидко ковзають по піску.' },
  { id: 'arctic_fox', name: 'песець', emoji: '🦊', home: 'arctic', fact: 'Песець — полярна лисичка з дуже теплим білим хутром.' },
];

export const OCEAN_FACTS: Record<string, string> = {
  pacific: 'Тихий океан — найбільший і найглибший на Землі.',
  atlantic: 'Атлантичний океан лежить між Америкою, Європою та Африкою.',
  indian: 'Індійський океан — найтепліший.',
  arctic: 'Північний Льодовитий океан — найменший і вкритий кригою.',
  southern: 'Південний океан оточує Антарктиду.',
};

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
] as const;
