import { split } from './shared';

/** Famous buildings, day and night, and the time in other cities — in English. */

/** `the name under the picture|the name in a sentence|the capital|the country`, then ten stories. */
export const LANDMARKS = split({
  paris: 'Eiffel Tower|the Eiffel Tower|Paris|France',
  kyiv: 'Saint Sophia Cathedral|Saint Sophia Cathedral|Kyiv|Ukraine',
  london: 'Big Ben|Big Ben|London|the United Kingdom',
  rome: 'Colosseum|the Colosseum|Rome|Italy',
  cairo: 'Pyramids|the Pyramids|Cairo|Egypt',
  washington: 'White House|the White House|Washington|the United States',
  athens: 'Acropolis|the Acropolis|Athens|Greece',
  tokyo: 'Tokyo Tower|Tokyo Tower|Tokyo|Japan',
  berlin: 'Brandenburg Gate|the Brandenburg Gate|Berlin|Germany',
  beijing: 'Forbidden City|the Forbidden City|Beijing|China',
  copenhagen: 'Little Mermaid statue|the statue of the Little Mermaid|Copenhagen|Denmark',
  warsaw: 'Royal Castle|the Royal Castle|Warsaw|Poland',
});

export const LANDMARK_FACTS = split({
  paris: 'The Eiffel Tower stands in Paris — the capital of France.|The Eiffel Tower was built in 1889 for the World’s Fair.|The Eiffel Tower is more than three hundred meters high.|For forty years the Eiffel Tower was the tallest structure in the world.|The tower is named after the engineer Gustave Eiffel.|The Eiffel Tower is put together from eighteen thousand metal parts.|At first the tower was to be taken down after twenty years, but it came in useful as a radio antenna.|It takes sixty tons of paint to paint the Eiffel Tower.|In the summer sun the tower grows a few centimeters taller: metal swells in the heat.|Every evening the Eiffel Tower sparkles with thousands of little lights.',
  kyiv: 'Saint Sophia Cathedral stands in Kyiv — the capital of Ukraine.|Saint Sophia Cathedral was built under Prince Yaroslav the Wise almost a thousand years ago.|In Saint Sophia there are mosaics and wall paintings hundreds of years old.|The best-known mosaic of the cathedral shows the Virgin Mary with her hands raised in prayer.|Saint Sophia held the first library of Kyivan Rus.|Prince Yaroslav the Wise is buried in Saint Sophia Cathedral.|Saint Sophia Cathedral has thirteen domes.|The bell tower of Saint Sophia is sky blue, and it can be seen from far away.|Saint Sophia of Kyiv is on the UNESCO World Heritage List.|On the walls of the cathedral there are still words that people scratched hundreds of years ago.',
  london: 'Big Ben stands in London — the capital of the United Kingdom.|Big Ben is really the name of the great bell inside the tower.|The clock tower itself is called the Elizabeth Tower.|The bell Big Ben weighs more than thirteen tons.|The clock on the tower has four faces.|The minute hand of this clock is more than four meters long.|The clock on the tower has been running since 1859.|The clock is kept exact with old coins laid on its pendulum.|To climb the tower you have to get up more than three hundred steps.|The British listen to the chimes of Big Ben on New Year’s Eve.',
  rome: 'The Colosseum stands in Rome — the capital of Italy.|The Colosseum is almost two thousand years old.|The Colosseum held fifty thousand people.|Gladiators fought in the arena of the Colosseum.|The Colosseum was built in less than ten years.|In the heat a huge awning was stretched over the people in the Colosseum.|Under the arena of the Colosseum there were passages and cages for wild animals.|The Colosseum had eighty entrances, so people got in very quickly.|Some of the stone of the Colosseum was later carried off for other buildings.|The Colosseum is the biggest amphitheater built in ancient times.',
  cairo: 'The Pyramids stand near Cairo — the capital of Egypt.|The pyramids of Egypt are more than four and a half thousand years old.|The pyramids are the tombs of the pharaohs.|The biggest pyramid is the Great Pyramid of Khufu.|The Great Pyramid is built of more than two million blocks of stone.|For almost four thousand years the Great Pyramid was the tallest structure in the world.|The pyramids are the only one of the seven wonders of the ancient world still standing.|Beside the pyramids lies the Great Sphinx — a lion with a human head.|The pyramids were once covered in smooth white stone and shone in the sun.|The pyramids were built without cranes or machines — only with hands and simple tools.',
  washington: 'The White House stands in Washington — the capital of the United States.|The president of the United States lives and works in the White House.|The White House has more than a hundred and thirty rooms.|The first president to live in the White House moved in in 1800.|The city of Washington is named after the first president of the United States.|The president’s office in the White House is oval, and it is called the Oval Office.|It takes more than two thousand liters of white paint to paint the White House.|The White House has a movie theater, a swimming pool and a bowling alley.|Every spring children roll Easter eggs on the White House lawn.|The White House is pictured on the twenty-dollar bill.',
  athens: 'The Acropolis stands in Athens — the capital of Greece.|The Acropolis is a hill with ancient temples above the city.|The best-known temple of the Acropolis is the Parthenon.|The Parthenon is almost two and a half thousand years old.|The Parthenon was built in honor of the goddess Athena.|The temples of the Acropolis are built of white marble.|The story goes that the goddess Athena gave the city an olive tree.|The word “acropolis” means “upper city.”|Theater and democracy were born in Athens.|The first modern Olympic Games were held in Athens in 1896.',
  tokyo: 'Tokyo Tower stands in Tokyo — the capital of Japan.|Tokyo Tower looks like the Eiffel Tower, but it is a little taller.|Tokyo Tower is painted white and orange so that airplanes can see it well.|Tokyo Tower was built in 1958.|From Tokyo Tower in clear weather you can see Mount Fuji.|Tokyo Tower sends out television and radio signals.|Tokyo is one of the biggest cities in the world.|Japan often has earthquakes, so Tokyo Tower was built very strong.|In the evening Tokyo Tower glows with a warm orange light.|Japan, where Tokyo Tower stands, is called the Land of the Rising Sun.',
  berlin: 'The Brandenburg Gate stands in Berlin — the capital of Germany.|The Brandenburg Gate is more than two hundred years old.|On top of the gate stands a chariot with four horses.|The chariot on the gate is driven by the goddess of victory.|The Brandenburg Gate has five passages between its columns.|The Brandenburg Gate was once a way into the city.|For many years a wall stood beside the gate, dividing Berlin into two parts.|When the wall fell, the Brandenburg Gate became a symbol of Germany’s unity.|The Brandenburg Gate is shown on German euro coins.|Berliners welcome the New Year at the Brandenburg Gate.',
  beijing: 'The Forbidden City is in Beijing — the capital of China.|The Forbidden City is the palace of the emperors of China.|The Forbidden City is more than six hundred years old.|There are almost a thousand buildings in the Forbidden City.|Ordinary people were once not allowed in — that is why the city was called Forbidden.|The roofs of the Forbidden City are covered with yellow tiles: yellow was the emperor’s color.|The Forbidden City is surrounded by a high wall and a moat of water.|Twenty-four emperors lived in the Forbidden City.|Today the Forbidden City is a museum.|The Forbidden City is the biggest palace complex in the world.',
  copenhagen: 'The statue of the Little Mermaid is in Copenhagen — the capital of Denmark.|The Little Mermaid is the heroine of a fairy tale by Hans Christian Andersen.|The statue of the Little Mermaid sits on a rock right by the sea.|The statue of the Little Mermaid is more than a hundred years old.|The statue of the Little Mermaid is small — a little over a meter high.|The statue of the Little Mermaid is made of bronze.|The Little Mermaid is the symbol of Copenhagen.|Andersen, who thought up the Little Mermaid, lived and wrote his fairy tales in Copenhagen.|In Denmark, where the Little Mermaid sits, Lego bricks were invented.|In Copenhagen there are more bicycles than cars.',
  warsaw: 'The Royal Castle stands in Warsaw — the capital of Poland.|The kings of Poland lived in the Royal Castle.|The Royal Castle stands on Castle Square in the Old Town.|In the war the castle was destroyed, and afterwards it was built again.|The Royal Castle was rebuilt with gifts of money from people all over Poland.|In front of the castle stands the tall column of King Sigismund.|There is a clock on the tower of the Royal Castle.|Today the Royal Castle is a museum.|The Old Town of Warsaw is on the UNESCO World Heritage List.|The symbol of Warsaw is a mermaid with a sword and a shield.',
});

/** Day or night: `the city|why`. */
export const DAY_NIGHT = split({
  la: 'Los Angeles|Los Angeles is on the other side of the Earth, and the sun has not reached it yet.',
  london: 'London|London is quite near Kyiv, so it is day there too.',
  delhi: 'Delhi|India is a little farther east, and the sun is shining there too.',
  honolulu: 'Honolulu in Hawaii|Hawaii is far away in the Pacific Ocean — it is the dead of night there now.',
  sydney_n: 'Sydney|When it is midnight in Kyiv, it is already the morning of a new day in Australia.',
  la_n: 'Los Angeles|When it is midnight in Kyiv, it is still daytime in Los Angeles.',
  london_n: 'London|London is nearby, so it is night there too.',
  warsaw_n: 'Warsaw|Warsaw is Kyiv’s neighbor, and it is night there too.',
  paris: 'Paris|Paris is not far from Kyiv, in Europe — it is day there too.',
  sydney: 'Sydney|When it is noon in Kyiv, it is already late evening in Australia, and dark.',
  ny_n: 'New York|When it is midnight in Kyiv, it is still only five in the afternoon in New York.',
  tokyo_n: 'Tokyo|When it is midnight in Kyiv, it is already seven in the morning in Japan — the sun is up.',
  mexico: 'Mexico City|When it is noon in Kyiv, it is still four in the morning in Mexico — everyone is asleep.',
  mexico_n: 'Mexico City|When it is midnight in Kyiv, it is still day in Mexico — four in the afternoon.',
  vancouver: 'Vancouver in Canada|Vancouver is on the other side of the Earth: when it is noon in Kyiv, it is two in the morning there.',
  wellington: 'Wellington in New Zealand|New Zealand is as far from Kyiv as can be: when it is noon in Kyiv, it is almost midnight there.',
  wellington_n: 'Wellington in New Zealand|When it is midnight in Kyiv, it is almost noon of the next day in New Zealand.',
});

/** The cities whose clocks are compared with Kyiv’s. */
export const CITIES: Record<string, string> = {
  warsaw: 'Warsaw', london: 'London', athens: 'Athens', paris: 'Paris', lisbon: 'Lisbon', new_york: 'New York',
  vilnius: 'Vilnius', rome: 'Rome', dubai: 'Dubai', beijing: 'Beijing', tokyo: 'Tokyo', sydney: 'Sydney',
};
