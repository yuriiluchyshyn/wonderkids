/** Content for the History games. Ordered easy → hard (see `unlocked`). */

export interface Achiever {
  id: string;
  name: string;
  /** Stand-in portrait until illustrated ones exist. */
  face: string;
  symbol: string;
  symbolName: string;
  fact: string;
  /** Who the verb agrees with («прославилася», «прославилися»). Default: he. */
  who?: 'she' | 'they';
}

/**
 * Ordered by fame — best-known first. The ORDER decides the path: the first
 * five open step 1, then three more arrive on every step (see `introSteps`),
 * so step N teaches people of "fame level" N and recalls the earlier ones.
 */
export const WORLD_FIGURES: Achiever[] = [
  // ---- level 1
  { id: 'einstein', name: 'Альберт Ейнштейн', face: '👨‍🔬', symbol: '⚛️', symbolName: 'Атом і формули', fact: 'Альберт Ейнштейн — фізик, який пояснив, як влаштовані час, простір і світло.' },
  { id: 'davinci', name: 'Леонардо да Вінчі', face: '👨‍🎨', symbol: '🖼️', symbolName: 'Мона Ліза', fact: 'Леонардо да Вінчі намалював «Мону Лізу» і придумував літальні машини.' },
  { id: 'columbus', name: 'Христофор Колумб', face: '🧭', symbol: '⛵', symbolName: 'Корабель до Америки', fact: 'Колумб переплив океан на вітрильниках і дістався Америки.' },
  { id: 'armstrong', name: 'Ніл Армстронг', face: '🧑‍🚀', symbol: '🌙', symbolName: 'Місяць', fact: 'Ніл Армстронг першим із людей ступив на Місяць.' },
  { id: 'mozart', name: 'Вольфганг Моцарт', face: '🧑‍🎤', symbol: '🎹', symbolName: 'Музика з дитинства', fact: 'Моцарт почав складати музику, коли йому було лише п’ять років.' },
  // ---- level 2
  { id: 'newton', name: 'Ісаак Ньютон', face: '🧑‍🏫', symbol: '🍎', symbolName: 'Яблуко і тяжіння', fact: 'Ісаак Ньютон зрозумів, чому яблуко падає вниз: Земля все притягує до себе.' },
  { id: 'shakespeare', name: 'Вільям Шекспір', face: '🧔', symbol: '🎭', symbolName: 'Театр', fact: 'Шекспір написав п’єси, які в театрах грають уже понад чотириста років.' },
  { id: 'galileo', name: 'Галілео Галілей', face: '🧙‍♂️', symbol: '🔭', symbolName: 'Телескоп', fact: 'Галілей першим роздивився в телескоп гори на Місяці та супутники Юпітера.' },
  // ---- level 3
  { id: 'curie', name: 'Марія Кюрі', who: 'she', face: '👩‍🔬', symbol: '🧪', symbolName: 'Досліди в лабораторії', fact: 'Марія Кюрі відкрила нові хімічні елементи і двічі отримала Нобелівську премію.' },
  { id: 'picasso', name: 'Пабло Пікассо', face: '🧑‍🎨', symbol: '🎨', symbolName: 'Незвичайні картини', fact: 'Пікассо малював людей із кубиків і трикутників.' },
  { id: 'darwin', name: 'Чарльз Дарвін', face: '👴', symbol: '🐢', symbolName: 'Тварини з далеких островів', fact: 'Дарвін вивчав тварин і пояснив, як вони змінюються з часом.' },
  // ---- level 4
  { id: 'gutenberg', name: 'Йоганн Гутенберг', face: '🧑‍🔧', symbol: '📖', symbolName: 'Друкована книга', fact: 'Гутенберг придумав друкарський верстат — і книжок стало багато.' },
  { id: 'edison', name: 'Томас Едісон', face: '👨‍🔧', symbol: '💡', symbolName: 'Лампочка', fact: 'Томас Едісон зробив лампочку, яка світила дуже довго, і ще понад тисячу винаходів.' },
  { id: 'magellan', name: 'Фернан Магеллан', face: '🧑‍✈️', symbol: '🌍', symbolName: 'Подорож навколо світу', fact: 'Кораблі Фернана Магеллана першими обпливли навколо всієї Землі.' },
  // ---- level 5
  { id: 'beethoven', name: 'Людвіг ван Бетховен', face: '👨‍🦱', symbol: '🎼', symbolName: 'Симфонії', fact: 'Бетховен писав музику навіть тоді, коли втратив слух.' },
  { id: 'archimedes', name: 'Архімед', face: '🧓', symbol: '🛁', symbolName: '«Еврика!» у ванні', fact: 'Архімед зрозумів, чому предмети плавають, коли сидів у ванні, — і вигукнув: «Еврика!»' },
  { id: 'cleopatra', name: 'Клеопатра', who: 'she', face: '👸', symbol: '👑', symbolName: 'Цариця Єгипту', fact: 'Клеопатра була останньою царицею Стародавнього Єгипту.' },
  // ---- level 6
  { id: 'joan', name: 'Жанна д’Арк', who: 'she', face: '👩', symbol: '🛡️', symbolName: 'Дівчина-воїн', fact: 'Жанна д’Арк ще дівчиною повела французьке військо в бій і стала героїнею Франції.' },
  { id: 'vangogh', name: 'Вінсент ван Гог', face: '👨‍🦰', symbol: '🌻', symbolName: '«Соняшники»', fact: 'Вінсент ван Гог малював яскраві соняшники й зоряне небо.' },
  { id: 'alexander', name: 'Олександр Македонський', face: '🤴', symbol: '🗺️', symbolName: 'Величезна імперія', fact: 'Олександр Македонський створив величезну державу — від Греції аж до Індії.' },
  // ---- level 7
  { id: 'wright', name: 'Брати Райт', who: 'they', face: '👬', symbol: '✈️', symbolName: 'Перший літак', fact: 'Брати Райт збудували перший літак із мотором і піднялися на ньому в небо.' },
  { id: 'michelangelo', name: 'Мікеланджело', face: '🧔‍♂️', symbol: '🗿', symbolName: 'Мармурові статуї', fact: 'Мікеланджело вирізьбив із мармуру статую Давида і розписав стелю Сикстинської капели.' },
  { id: 'copernicus', name: 'Миколай Коперник', face: '👨‍🏫', symbol: '☀️', symbolName: 'Сонце в центрі', fact: 'Миколай Коперник пояснив, що Земля обертається навколо Сонця, а не навпаки.' },
  // ---- level 8
  { id: 'andersen', name: 'Ганс Крістіан Андерсен', face: '👨‍💼', symbol: '🧜‍♀️', symbolName: 'Казки', fact: 'Андерсен написав казки «Русалонька», «Гидке каченя» і «Снігова королева».' },
  { id: 'tesla', name: 'Нікола Тесла', face: '👨‍💻', symbol: '⚡', symbolName: 'Електричний струм', fact: 'Нікола Тесла придумав, як передавати електричний струм на великі відстані.' },
  { id: 'marcopolo', name: 'Марко Поло', face: '🧳', symbol: '🐫', symbolName: 'Подорож до Китаю', fact: 'Марко Поло багато років мандрував до Китаю і розповів про нього Європі.' },
  // ---- level 9
  { id: 'nightingale', name: 'Флоренс Найтінгейл', who: 'she', face: '👩‍⚕️', symbol: '🏥', symbolName: 'Догляд за хворими', fact: 'Флоренс Найтінгейл навчила лікарні бути чистими й дбайливо доглядати хворих.' },
  { id: 'chaplin', name: 'Чарлі Чаплін', face: '🥸', symbol: '🎩', symbolName: 'Німе кіно', fact: 'Чарлі Чаплін смішив увесь світ у німих фільмах — без жодного слова.' },
  { id: 'cousteau', name: 'Жак-Ів Кусто', face: '🧑‍🔬', symbol: '🤿', symbolName: 'Підводний світ', fact: 'Жак-Ів Кусто допоміг створити акваланг і показав людям підводний світ.' },
  // ---- level 10
  { id: 'jobs', name: 'Стів Джобс', face: '👨‍💼', symbol: '📱', symbolName: 'Смартфон', fact: 'Стів Джобс разом із командою створив комп’ютери і смартфон, яким користуються в усьому світі.' },
  { id: 'pythagoras', name: 'Піфагор', face: '👳', symbol: '📐', symbolName: 'Теорема про трикутник', fact: 'Піфагор — давньогрецький математик. Його теорему про трикутник вивчають у школі.' },
  { id: 'goodall', name: 'Джейн Гудолл', who: 'she', face: '👩‍🦳', symbol: '🐒', symbolName: 'Дружба з шимпанзе', fact: 'Джейн Гудолл багато років жила поруч із шимпанзе й відкрила, що вони вміють користуватися знаряддями.' },
];

/** Ordered by fame too: the first four open step 1, then one more per step. */
export const UA_FIGURES: Achiever[] = [
  { id: 'shevchenko', name: 'Тарас Шевченко', face: '👨‍🦳', symbol: '📖', symbolName: '«Кобзар»', fact: 'Тарас Шевченко — поет і художник. Його головна книжка називається «Кобзар».' },
  { id: 'korolov', name: 'Сергій Корольов', face: '👨‍🚀', symbol: '🚀', symbolName: 'Космічна ракета', fact: 'Сергій Корольов народився в Житомирі і сконструював перші космічні ракети.' },
  { id: 'yaroslav', name: 'Ярослав Мудрий', face: '🤴', symbol: '📜', symbolName: 'Закони і бібліотека', fact: 'Князь Ярослав Мудрий записав перші закони і зібрав велику бібліотеку.' },
  { id: 'lesia', name: 'Леся Українка', who: 'she', face: '👩‍🦰', symbol: '🌳', symbolName: '«Лісова пісня»', fact: 'Леся Українка написала казкову «Лісову пісню» про Мавку.' },
  { id: 'leontovych', name: 'Микола Леонтович', face: '🧑‍🎼', symbol: '🔔', symbolName: '«Щедрик»', fact: 'Микола Леонтович створив «Щедрик» — мелодію, яку на Різдво співає весь світ.' },
  { id: 'sikorsky', name: 'Ігор Сікорський', face: '👨‍✈️', symbol: '🚁', symbolName: 'Гелікоптер', fact: 'Ігор Сікорський народився в Києві і побудував перший серійний гелікоптер.' },
  { id: 'olha', name: 'Княгиня Ольга', who: 'she', face: '👸', symbol: '👑', symbolName: 'Правителька Русі', fact: 'Княгиня Ольга мудро правила Київською Руссю понад тисячу років тому.' },
  { id: 'khmelnytsky', name: 'Богдан Хмельницький', face: '🧔‍♂️', symbol: '🐎', symbolName: 'Гетьман козаків', fact: 'Богдан Хмельницький був гетьманом і очолив козацьке військо.' },
  { id: 'skovoroda', name: 'Григорій Сковорода', face: '🧙', symbol: '🎒', symbolName: 'Мандрівний філософ', fact: 'Григорій Сковорода мандрував пішки з торбинкою і вчив людей мудрості.' },
  { id: 'franko', name: 'Іван Франко', face: '👨‍🏫', symbol: '🦊', symbolName: '«Лис Микита»', fact: 'Іван Франко написав для дітей казку «Лис Микита».' },
  { id: 'prymachenko', name: 'Марія Примаченко', who: 'she', face: '👵', symbol: '🎨', symbolName: 'Казкові звірі на картинах', fact: 'Марія Примаченко малювала яскравих казкових звірів, яких не буває насправді.' },
  { id: 'kadeniuk', name: 'Леонід Каденюк', face: '🧑‍🚀', symbol: '🛰️', symbolName: 'Політ у космос', fact: 'Леонід Каденюк — перший космонавт незалежної України.' },
  { id: 'amosov', name: 'Микола Амосов', face: '👨‍⚕️', symbol: '❤️', symbolName: 'Операції на серці', fact: 'Лікар Микола Амосов навчився лагодити людські серця.' },
];

export interface Invention {
  id: string;
  name: string;
  emoji: string;
  by: string;
  fact: string;
  /** Portrait of the inventor: a file of `public/people` (without the extension). */
  face?: string;
  /** The question, where «Хто винайшов …?» would be untrue (a thing that was discovered, not invented). */
  ask?: string;
}

/**
 * People whose work has a real picture in `public/things/<person id>.webp`
 * (see its CREDITS.md). The others keep the pictogram: a work still under
 * copyright (Picasso, Prymachenko) or one no honest picture exists for.
 */
export const PICTURED = new Set(['alexander', 'andersen', 'archimedes', 'armstrong', 'beethoven', 'chaplin', 'cleopatra', 'columbus', 'copernicus', 'cousteau', 'curie', 'darwin', 'davinci', 'edison', 'franko', 'galileo', 'goodall', 'gutenberg', 'joan', 'kadeniuk', 'khmelnytsky', 'korolov', 'leontovych', 'lesia', 'magellan', 'marcopolo', 'michelangelo', 'mozart', 'newton', 'nightingale', 'pythagoras', 'shakespeare', 'shevchenko', 'sikorsky', 'tesla', 'vangogh', 'wright', 'yaroslav']);
/** Inventions that have no picture of their own in `public/things/inv_<id>.webp`. */
export const UNPICTURED_INVENTIONS = new Set<string>([]);

export const WORLD_INVENTIONS: Invention[] = [
  { id: 'bulb', name: 'Лампочка', emoji: '💡', by: 'Томас Едісон', face: 'edison', fact: 'Томас Едісон зробив лампочку, яка могла світити дуже довго.' },
  { id: 'telephone', name: 'Телефон', emoji: '☎️', by: 'Александер Белл', face: 'bell', fact: 'Александер Белл придумав телефон, щоб чути голос здалеку.' },
  { id: 'plane', name: 'Літак', emoji: '✈️', by: 'Брати Райт', face: 'wright', fact: 'Брати Райт першими піднялися в небо на літаку з мотором.' },
  { id: 'radio', name: 'Радіо', emoji: '📻', by: 'Гульєльмо Марконі', face: 'marconi', fact: 'Марконі навчився передавати сигнали без дротів.' },
  { id: 'press', name: 'Друкарський верстат', emoji: '📖', by: 'Йоганн Гутенберг', face: 'gutenberg', fact: 'Завдяки верстату Гутенберга книжки перестали переписувати від руки.' },
  { id: 'car', name: 'Автомобіль', emoji: '🚗', by: 'Карл Бенц', face: 'benz', fact: 'Карл Бенц збудував перший автомобіль із бензиновим двигуном.' },
  { id: 'train', name: 'Паровоз', emoji: '🚂', by: 'Джордж Стефенсон', face: 'stephenson', fact: 'Паровоз Стефенсона возив людей швидше за коней.' },
  { id: 'penicillin', name: 'Пеніцилін', ask: 'Хто відкрив пеніцилін — ліки, що перемагають мікробів?', emoji: '💊', by: 'Александер Флемінг', face: 'fleming', fact: 'Флемінг відкрив пеніцилін — ліки, що перемагають мікробів.' },
  { id: 'web', name: 'Інтернет-сторінки', ask: 'Хто придумав вебсторінки в інтернеті?', emoji: '🌐', by: 'Тім Бернерс-Лі', face: 'berners_lee', fact: 'Тім Бернерс-Лі придумав вебсторінки, які ми відкриваємо щодня.' },
  { id: 'telescope', name: 'Телескоп для зірок', ask: 'Хто першим спрямував телескоп на зорі?', emoji: '🔭', by: 'Галілео Галілей', face: 'galileo', fact: 'Галілей удосконалив телескоп і спрямував його на небо.' },
];

export const UA_INVENTIONS: Invention[] = [
  { id: 'helicopter', name: 'Гелікоптер', emoji: '🚁', by: 'Ігор Сікорський', face: 'sikorsky', fact: 'Киянин Ігор Сікорський створив гелікоптер, який літає і сьогодні.' },
  { id: 'kerosene', name: 'Гасова лампа', emoji: '🪔', by: 'Ігнатій Лукасевич і Ян Зег', face: 'lukasiewicz', fact: 'Гасову лампу винайшли у львівській аптеці.' },
  { id: 'cinema', name: 'Кіноапарат', emoji: '🎥', by: 'Йосип Тимченко', face: 'tymchenko', fact: 'Одеський механік Йосип Тимченко зробив апарат для показу рухомих картинок раніше за братів Люм’єр.' },
  { id: 'welding', name: 'Швидке зварювання металу', ask: 'Хто навчив машини швидко зварювати метал?', emoji: '⚡', by: 'Євген Патон', face: 'paton', fact: 'Євген Патон навчив машини зварювати метал. Його іменем названо міст у Києві.' },
  { id: 'xray', name: 'Рентгенівські промені', ask: 'Хто з українців досліджував рентгенівські промені?', emoji: '🩻', by: 'Іван Пулюй', face: 'pulyui', fact: 'Іван Пулюй досліджував промені, якими лікарі бачать кістки.' },
  { id: 'tram', name: 'Електричний трамвай', emoji: '🚋', by: 'Федір Піроцький', face: 'pirotsky', fact: 'Федір Піроцький придумав, як пустити електрику по рейках для трамвая.' },
  { id: 'vaccine', name: 'Вакцина від чуми й холери', emoji: '💉', by: 'Володимир Хавкін', face: 'haffkine', fact: 'Одесит Володимир Хавкін створив вакцини, які врятували мільйони людей.' },
  { id: 'mriya', name: 'Літак «Мрія»', ask: 'Хто створив найбільший у світі літак «Мрія»?', emoji: '✈️', by: 'Конструктори Антонова', fact: 'Український літак «Мрія» був найбільшим у світі.' },
  { id: 'cd', name: 'Компакт-диск', emoji: '💿', by: "В'ячеслав Петров", fact: 'Киянин В’ячеслав Петров придумав оптичний диск — попередника компакт-диска.' },
  { id: 'rocket', name: 'Космічна ракета', emoji: '🚀', by: 'Сергій Корольов', face: 'korolov', fact: 'Ракети Сергія Корольова першими вивели людину в космос.' },
];

/**
 * «Хто …?» for every person — the question asked when the child has to
 * recognise them by what they did. Written out, not glued from a symbol's
 * name: «Хто відкрив Америку?», never «Хто прославився цим: корабель до Америки?».
 */
export const WHO_ASK: Record<string, string> = {
  einstein: 'Хто пояснив, як влаштовані час, простір і світло?',
  davinci: 'Хто намалював «Мону Лізу»?',
  columbus: 'Хто переплив океан і відкрив Америку?',
  armstrong: 'Хто першим із людей ступив на Місяць?',
  mozart: 'Хто почав складати музику в п’ять років?',
  newton: 'Хто зрозумів, чому яблуко падає вниз?',
  shakespeare: 'Хто написав п’єси, які вже чотириста років грають у театрах?',
  galileo: 'Хто першим роздивився Місяць у телескоп?',
  curie: 'Хто відкрив нові хімічні елементи і двічі отримав Нобелівську премію?',
  picasso: 'Хто малював людей із кубиків і трикутників?',
  darwin: 'Хто пояснив, як тварини змінюються з часом?',
  gutenberg: 'Хто придумав друкарський верстат?',
  edison: 'Хто зробив лампочку, яка світила дуже довго?',
  magellan: 'Чиї кораблі першими обпливли навколо Землі?',
  beethoven: 'Хто писав музику навіть тоді, коли втратив слух?',
  archimedes: 'Хто вигукнув «Еврика!», сидячи у ванні?',
  cleopatra: 'Хто був останньою царицею Стародавнього Єгипту?',
  joan: 'Хто ще дівчиною повів французьке військо в бій?',
  vangogh: 'Хто намалював «Соняшники» і зоряне небо?',
  alexander: 'Хто створив державу від Греції аж до Індії?',
  wright: 'Хто збудував перший літак із мотором?',
  michelangelo: 'Хто вирізьбив із мармуру статую Давида?',
  copernicus: 'Хто пояснив, що Земля обертається навколо Сонця?',
  andersen: 'Хто написав казки «Русалонька» і «Гидке каченя»?',
  tesla: 'Хто придумав, як передавати електричний струм на великі відстані?',
  marcopolo: 'Хто багато років мандрував до Китаю і розповів про нього Європі?',
  nightingale: 'Хто навчив лікарні бути чистими й дбайливо доглядати хворих?',
  chaplin: 'Хто смішив увесь світ у німому кіно?',
  cousteau: 'Хто показав людям підводний світ?',
  jobs: 'Хто зі своєю командою створив смартфон?',
  pythagoras: 'Чию теорему про трикутник вивчають у школі?',
  goodall: 'Хто багато років жив поруч із шимпанзе?',
  shevchenko: 'Хто написав «Кобзар»?',
  korolov: 'Хто сконструював перші космічні ракети?',
  yaroslav: 'Хто записав перші закони Русі і зібрав велику бібліотеку?',
  lesia: 'Хто написав «Лісову пісню»?',
  leontovych: 'Хто створив «Щедрик»?',
  sikorsky: 'Хто побудував перший серійний гелікоптер?',
  olha: 'Хто мудро правив Київською Руссю понад тисячу років тому?',
  khmelnytsky: 'Хто був гетьманом і очолив козацьке військо?',
  skovoroda: 'Хто мандрував пішки з торбинкою і вчив людей мудрості?',
  franko: 'Хто написав казку «Лис Микита»?',
  prymachenko: 'Хто малював яскравих казкових звірів?',
  kadeniuk: 'Хто став першим космонавтом незалежної України?',
  amosov: 'Хто навчився лагодити людські серця?',
};
