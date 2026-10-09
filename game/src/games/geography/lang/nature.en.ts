import { own } from '@/core/lang/marks';
import type { BiomeId } from '../content/data';
import { split } from './shared';

/** Animals and natural zones in English. */

/** The animals put on the continents: «where does the … live?» */
export const MAP_ANIMALS: Record<string, string> = {
  kangaroo: 'kangaroo', penguin: 'penguin', lion: 'lion', panda: 'panda', llama: 'llama',
  bison: 'bison', hedgehog: 'hedgehog', giraffe: 'giraffe', koala: 'koala', tiger: 'tiger',
};

/** An animal of a zone: `name|riddle|where it lives|two more stories` (the stories only for the later animals). */
export const ANIMALS = split({
  polar_bear: 'polar bear|A big white animal that walks on ice floes and catches seals.|The polar bear lives among the ice, and its thick fur keeps it warm.',
  camel: 'camel|It has one hump and can walk a long way over the sands without water.|A camel can go a long time without drinking, so it does well in the desert.',
  monkey: 'monkey|It leaps nimbly from branch to branch and loves bananas.|A monkey leaps nimbly along the branches in the jungle.',
  dolphin: 'dolphin|A clever sea animal that leaps out of the water and breathes air.|The dolphin lives in the ocean, but it breathes air.',
  seal: 'seal|It has flippers instead of paws and rests on ice floes.|A seal does not freeze in icy water, thanks to a thick layer of fat.',
  parrot: 'parrot|A bright bird with a hooked beak that can repeat words.|Bright parrots live in the trees of the tropical forest.',
  scorpion: 'scorpion|It has pincers and a curved tail with a sting at the end.|By day a scorpion hides from the heat under stones.',
  octopus: 'octopus|It has eight arms and three hearts.|An octopus has eight arms and three hearts!',
  arctic_hare: 'arctic hare|A long-eared animal in a white coat that cannot be seen on the snow.|The arctic hare is white, to hide on the snow.',
  tiger: 'tiger|The biggest cat in the world — orange with black stripes.|The striped tiger hides among thick undergrowth.',
  lizard: 'lizard|A small reptile that can drop its own tail.|A lizard loves to bask on the hot sand.',
  whale: 'whale|The biggest animal on Earth, which blows a fountain of water.|The whale is the biggest animal on Earth.',
  shark: 'shark|A sea hunter with a sharp fin on its back and many rows of teeth.|Sharks lived in the ocean even before the dinosaurs.',
  gorilla: 'gorilla|The biggest ape, which beats its chest with its fists.|The gorilla is the biggest ape; it lives in the forests of Africa.',
  snake: 'snake|It has no legs, it crawls and it hisses.|Desert snakes glide quickly over the sand.',
  arctic_fox: 'arctic fox|A little fox of the far north: white in winter and gray-brown in summer.|The arctic fox is a little polar fox with very warm white fur.',
  lion: 'lion|The king of beasts, with a splendid mane.|The lion lives on the open grassy plains of Africa and hunts the herds.',
  zebra: 'zebra|It looks like a horse, but is all in black and white stripes.|Zebras graze in herds on the grassy plains.',
  giraffe: 'giraffe|The tallest animal, with a very long neck and spots.|A giraffe reaches leaves at the tops of the lone trees among the grass.',
  elephant: 'elephant|The biggest land animal, with a trunk and big ears.|Elephants wander the grassy plains from one watering hole to the next.',
  rhino: 'rhinoceros|A heavy, thick-skinned animal with a horn on its nose.|A rhino grazes on the plains, where there is plenty of grass.',
  brown_bear: 'brown bear|A big brown animal that loves honey and sleeps in a den in winter.|A brown bear finds berries, nuts and a snug den in the forest.',
  squirrel: 'squirrel|A red-furred jumper with a fluffy tail that hides nuts.|A squirrel lives in the trees and eats nuts and cones.',
  wolf: 'wolf|A gray hunter that lives in a pack and howls at the moon.|A wolf pack lives and hunts among the forests.',
  hedgehog: 'hedgehog|A little animal in a prickly coat that rolls up into a ball.|A hedgehog looks for beetles among the fallen leaves and winters under a pile of them.',
  owl: 'owl|A night bird with big eyes that says “hoo-hoo.”|An owl lives in the hollow of an old tree.',
  deer: 'deer|A slender animal with branching antlers.|A deer hides among the trees and eats leaves and bark.',
  boar: 'wild boar|A wild pig with tusks that digs up the ground looking for acorns.|A wild boar digs up the ground under the oaks, looking for acorns.',
  sea_turtle: 'sea turtle|It has a shell and flippers, and it lays its eggs in the sand on the beach.|A sea turtle has flippers instead of paws and swims all its life.',
  orangutan: 'orangutan|A big red-haired ape with very long arms.|An orangutan hardly ever comes down from the trees of the tropical forest.',
  crab: 'crab|It has pincers and a shell and walks sideways.|A crab lives on the seabed and on the shore.',
  sloth: 'sloth|The slowest animal: it hangs upside down from a branch and sleeps almost all the time.|A sloth hangs from the branches of the damp tropical forest all its life.',
  jellyfish: 'jellyfish|See-through, shaped like an umbrella, with stinging tentacles.|A jellyfish is made almost entirely of water and drifts with the current.',
  clownfish: 'clownfish|A little orange fish with white stripes that hides in a sea anemone.|The clownfish lives on warm coral reefs.',
  squid: 'squid|It has ten arms and escapes by squirting out a little cloud of ink.|A squid swims through the deep sea water like a little rocket.',
  mountain_goat: 'mountain goat|A horned jumper that climbs sheer cliffs.|A mountain goat leaps about on almost sheer cliffs.',
  eagle: 'eagle|A big bird of prey with sharp eyes that soars high in the sky.|An eagle builds its nest on high cliffs.',
  llama: 'llama|A fluffy relative of the camel without a hump, which carries loads in the Andes.|The llama lives high in the mountains of South America — the Andes.',
  mountain_ram: 'mountain ram|It has big curling horns and leaps from rock to rock.|A mountain ram leaps easily from rock to rock.',
  crocodile: 'crocodile|A green, toothy reptile that lies in the river like a log.|The crocodile lives in the warm rivers and swamps of the tropical forest.|A crocodile can lie under water for an hour without breathing.|Crocodiles lived on Earth back in the time of the dinosaurs.',
  tree_frog: 'tree frog|A little bright jumper with sticky toes that lives on the leaves.|The tree frog lives on the leaves high in the treetops of the tropical forest.|A tree frog has sticky pads on its toes — it holds on to the leaves with them.|The brightest frogs of the tropics are poisonous: their color warns that they must not be touched.',
  morpho: 'morpho butterfly|It has big blue wings that shine in the sun.|The morpho butterfly flies among the trees of the tropical forest.|The wings of the morpho butterfly are blue and shine like metal.|A morpho’s wingspan is as wide as a grown person’s hand.',
  bat: 'bat|It flies at night and sleeps hanging upside down.|The biggest bats — flying foxes — live in tropical forests and eat fruit.|The bat is the only furry animal that can truly fly.|Bats sleep by day, hanging upside down.',
  peacock: 'peacock|A bird that spreads its tail into a huge colorful fan.|The peacock lives in the thick forests of hot India.|Only male peacocks have the splendid tail with “eyes.”|A peacock spreads its tail like a fan to please the peahen.',
  leafcutter: 'leafcutter ant|A tiny worker that carries a piece of leaf above its head.|Leafcutter ants live in the tropical forests of America.|Leafcutter ants carry pieces of leaf many times heavier than themselves.|From the leaves these ants grow mushrooms under the ground — and feed on them.',
  hippo: 'hippopotamus|A fat animal with a huge mouth that sits in the water all day.|The hippo lives in the rivers and lakes of the African savanna.|By day a hippo sits in the water, and at night it comes out to graze on grass.|A hippo can open its mouth wider than any other land animal.',
  buffalo: 'buffalo|A mighty black bull with wide curved horns.|The African buffalo grazes in big herds in the savanna.|Buffalo keep together: even a lion is afraid to attack such a herd.|A buffalo loves to lie in the mud — that is how it escapes the heat and the insects.',
  kangaroo: 'kangaroo|It hops on its hind legs and carries its baby in a pouch.|The kangaroo lives on the grassy plains of Australia.|A mother kangaroo carries her baby in a pouch on her belly.|A kangaroo cannot walk backwards.',
  grasshopper: 'grasshopper|A green jumper that chirps in the grass.|The grasshopper lives in the tall grass of the open plains.|A grasshopper jumps twenty times the length of its body.|A grasshopper “sings” by rubbing one wing against the other.',
  flamingo: 'flamingo|A pink bird on long legs that likes to stand on one of them.|Flamingos live on shallow salt lakes in the African savanna.|Flamingos turn pink from the shrimp and algae they eat.|A flamingo often stands on one leg — that way it gets less cold.',
  panda: 'panda|A black-and-white bear that chews bamboo all day.|The panda lives in the bamboo forests on the mountain slopes of China.|A panda eats bamboo almost all day long.|A newborn panda is pink and weighs as much as an apple.',
  koala: 'koala|A gray fluffy animal that sits in a eucalyptus tree and sleeps almost all the time.|The koala lives in the eucalyptus trees of Australia’s forests.|A koala eats nothing but eucalyptus leaves and hardly ever drinks.|A koala sleeps for up to twenty hours a day.',
  otter: 'otter|A nimble swimmer with thick fur that catches fish in the river.|The otter lives by forest rivers and lakes.|An otter swims wonderfully and catches fish under water.|An otter’s fur is so thick that the skin under it does not get wet.',
  beaver: 'beaver|A builder of dams with a flat tail and strong teeth.|The beaver lives on forest rivers and builds dams there.|A beaver gnaws through a tree trunk with its teeth.|The way into a beaver’s lodge is hidden under water.',
  badger: 'badger|It has a white face with two black stripes and lives in a burrow.|The badger lives in the forest, in a deep burrow with many passages.|A badger is very tidy: it changes the bedding in its burrow regularly.|In winter a badger sleeps in its burrow, though on warm days it may wake up.',
  skunk: 'skunk|A black-and-white animal that defends itself with a very nasty smell.|The skunk lives in the forests of North America.|When a skunk is frightened, it sprays a very smelly liquid.|A skunk’s black-and-white coat warns: “Keep away!”',
  raccoon: 'raccoon|It has a black “mask” on its face and a striped tail.|The raccoon lives in the forest near water and sleeps in hollow trees.|A raccoon rinses its food in water before eating it.|On a raccoon’s face there is a black “mask,” like a robber’s.',
  forest_mouse: 'wood mouse|A tiny gnawing animal with a long tail that stores seeds.|The wood mouse lives in a little burrow under the roots of trees.|A wood mouse stores seeds and nuts for the winter.|A wood mouse climbs well and can get up a tree.',
  raven: 'raven|A big black bird that croaks and is very clever.|The raven builds its nest in tall trees deep in the forest.|The raven is one of the cleverest birds: it can solve puzzles.|Ravens live in pairs and stay together all their lives.',
  snail: 'snail|It crawls very slowly and carries its house on its back.|The snail lives in damp forest grass and under leaves.|A snail carries its little house on its back.|A snail’s eyes are at the tips of its long feelers.',
  bee: 'wild bee|A striped worker that gathers nectar and makes honey.|Wild bees live in the hollows of forest trees.|To make a spoonful of honey, bees visit thousands of flowers.|A bee tells her sisters where the flowers are with a special dance.',
  spider: 'garden spider|It has eight legs and spins a web.|The garden spider spins its web between branches in the forest.|A spider has eight legs, so it is not an insect.|A spider’s thread is stronger than a steel thread of the same thickness.',
  ladybug: 'ladybug|A little red beetle with black dots on its back.|The ladybug lives in forest clearings and at the forest’s edge.|A ladybug eats aphids, and so it saves plants.|A ladybug’s bright dots warn birds that it tastes bad.',
  moose: 'moose|The biggest deer, with antlers like shovels.|The moose lives in thick northern forests near swamps.|The moose is the biggest of the deer: it is taller than a grown person.|A moose’s antlers look like wide shovels, and it sheds them every year.',
  wisent: 'European bison|The heaviest animal of Europe — a shaggy forest bull.|The European bison lives in the old forests of Europe.|The European bison is the heaviest land animal of Europe.|European bison once almost vanished, but people saved them in nature reserves.',
  turkey: 'wild turkey|A big bird with a red “beard” that spreads its tail like a fan.|The wild turkey lives in the forests of North America.|A wild turkey can fly, and it spends the night in trees.|A male turkey spreads its tail like a fan, as a peacock does.',
  lobster: 'lobster|A sea animal with two big claws and long feelers.|The lobster lives on the rocky seabed.|A lobster has two big claws: with one it crushes, with the other it cuts.|A lobster grows all its life and sheds its tight shell from time to time.',
  shrimp: 'shrimp|A little sea animal with long feelers that swims in swarms.|Shrimp live in the sea in big swarms.|A shrimp’s heart is in its head.|A shrimp swims backwards with a sharp flick of its tail.',
  puffer: 'pufferfish|A fish that blows itself up like a prickly ball when it is scared.|The pufferfish lives in warm seas among the corals.|When a pufferfish is scared, it blows itself up like a prickly ball.|A pufferfish is very poisonous, so hunters leave it alone.',
  tuna: 'tuna|A big silvery fish — one of the fastest in the ocean.|The tuna swims in the open ocean all its life.|The tuna is one of the fastest swimmers in the ocean.|A tuna never stops: it swims even in its sleep.',
  sperm_whale: 'sperm whale|A giant toothed whale with a huge square head.|The sperm whale lives in the ocean and dives into the darkest depths.|A sperm whale dives more than a kilometer deep — after giant squid.|The sperm whale has the biggest brain of any animal on Earth.',
  penguin: 'penguin|A bird in a black “tailcoat” that cannot fly, but swims wonderfully.|Penguins live on the coast of Antarctica and feed in the cold ocean.|The penguin is a bird that cannot fly, but it swims wonderfully.|A father penguin keeps the egg warm on his feet, under a fold of skin.',
  oyster: 'oyster|It lives in a two-part shell and never moves anywhere.|An oyster lives on the seabed, its shell grown fast to a stone.|If a grain of sand gets into the shell, some shellfish grow a pearl around it.|An oyster strains sea water through itself, and so it cleans it.',
  hermit: 'hermit crab|It carries someone else’s shell on its back for a house.|The hermit crab lives on the seabed in someone else’s empty shell.|When a hermit crab grows, it looks for a bigger shell.|A hermit crab carries its shell everywhere it goes.',
  coral: 'coral|It looks like a little stone bush, but really it is a great many tiny animals.|Corals live in warm clear seas and build reefs.|A coral looks like a stone or a plant, but it is tiny animals.|More kinds of fish live on a coral reef than anywhere else in the ocean.',
  lemming: 'lemming|A little fluffy gnawing animal of the tundra that looks like a hamster.|The lemming lives in the cold tundra by the Arctic Ocean.|In winter a lemming digs tunnels under the snow, where it is warmer.|Arctic foxes and snowy owls feed on lemmings.',
  snow_goose: 'snow goose|A white bird that flies far in a V and honks.|The snow goose raises its chicks in the cold tundra of the far north.|For the winter snow geese fly far to the south in enormous flocks.|In flight geese line up in a V — it is easier to fly that way.',
  bactrian: 'two-humped camel|It has two humps and thick fur.|The two-humped camel lives in the cold deserts of Asia.|A camel’s humps hold not water but a store of fat.|Thick fur saves the two-humped camel from both heat and frost.',
  scarab: 'scarab beetle|A beetle that rolls a big ball in front of itself.|The scarab beetle lives in the hot sands.|A scarab rolls a ball much bigger than itself.|In Ancient Egypt the scarab was thought a sacred beetle.',
  jerboa: 'jerboa|A tiny jumper with long hind legs and a tuft on its tail.|The jerboa lives in the desert and hides in a cool burrow by day.|A jerboa hops on its long hind legs, like a little kangaroo.|A jerboa may not drink at all: it gets enough water from its food.',
  yak: 'yak|A shaggy mountain bull with fur right down to the ground.|The yak lives very high in the mountains of Tibet.|A yak’s long thick fur hangs almost to the ground and keeps it warm in the frost.|Yaks help people carry loads along mountain paths.',
  snow_leopard: 'snow leopard|A spotted mountain cat with a very long fluffy tail.|The snow leopard lives among the rocks and snows of the highest mountains of Asia.|A snow leopard covers itself with its long fluffy tail, as with a blanket.|A snow leopard leaps across chasms as wide as a room.',
});

interface Zone {
  name: string;
  /** «in the jungle» */
  where: string;
  no: string;
  signs: string[];
  facts: string[];
}

export const ZONES: Record<BiomeId, Zone> = {
  arctic: {
    name: 'The Arctic', where: 'in the Arctic', no: 'Brrr, it is too cold here!',
    signs: [
      'It is winter here almost always: snow, ice and bitter frost.',
      'In summer the sun does not set here, and in winter there is a long polar night.',
      'The ground here does not thaw even in summer, and no trees grow at all.',
      'Ice floes drift on the sea here, and the northern lights shine in the sky.',
      'The warmest month here is colder than our spring.',
      'People here ride on sleds pulled by dogs or reindeer.',
    ],
    facts: [
      'The Arctic lies around the North Pole — at the very top of the Earth.',
      'There is no land under the pole in the Arctic: there is an ocean there, covered with thick ice.',
      'Arctic animals have white fur, to hide on the snow.',
      'In summer the sun does not set in the Arctic for several months — that is the polar day.',
    ],
  },
  jungle: {
    name: 'Jungle', where: 'in the jungle', no: 'Oh, it is too damp and crowded here!',
    signs: [
      'It is always warm here and it rains every day, and the trees grow so thickly that it is dusk below.',
      'Vines hang from the branches here, and more animals live in the trees than on the ground.',
      'There is no winter here: all year it is hot and damp, as in a greenhouse.',
      'The trees here are so tall that their tops make a green roof.',
      'Cocoa, which chocolate is made from, grows here, and so do bananas.',
      'Almost every afternoon there is a thunderstorm here.',
    ],
    facts: [
      'The jungle is a tropical forest. More than half of all the kinds of animals on Earth live in it.',
      'In the jungle the trees grow in layers: below it is dark, and up above there is sun and birds.',
      'The biggest tropical forest grows along the Amazon River in South America.',
      'In the jungle it rains almost every day, so it is always damp there.',
    ],
  },
  desert: {
    name: 'Desert', where: 'in the desert', no: 'Phew, it is too hot and dry here!',
    signs: [
      'By day it is terribly hot here, there is almost no water, and all around are sand and stones.',
      'Here it may not rain for years, and the only plants are prickly cactuses.',
      'By day the sand here is as hot as a frying pan, and at night it can freeze.',
      'The wind here piles up tall hills of sand — dunes.',
      'Water can be found here only in an oasis.',
      'The plants here store water in thick stems and have spines instead of leaves.',
    ],
    facts: [
      'The biggest hot desert in the world is the Sahara in Africa.',
      'By day it is very hot in the desert, and at night it can be truly cold.',
      'A place in the desert where there is water and palm trees grow is called an oasis.',
      'Desert animals mostly come out at night, when the heat dies down.',
    ],
  },
  ocean: {
    name: 'Ocean', where: 'in the ocean', no: 'Glug-glug! I can’t swim like that!',
    signs: [
      'There is salt water everywhere here — deep, with waves and currents.',
      'There are coral reefs here, and real underwater mountains on the bottom.',
      'There is no ground under your feet here — only water as far as you can see.',
      'Twice a day the water here comes up to the shore and goes back again.',
      'In a storm, waves as high as a house rise here.',
      'Down in the deep here it is always dark and cold, and some fish make their own light.',
    ],
    facts: [
      'Oceans cover most of our planet — that is why the Earth is blue from space.',
      'The water in the ocean is salty, and you cannot drink it.',
      'The deepest parts of the ocean are dark and cold — the sun does not reach there.',
      'In the ocean live both the biggest animals on Earth — whales — and the tiniest plankton.',
    ],
  },
  savanna: {
    name: 'Savanna', where: 'in the savanna', no: 'Oh, there is nothing but grass here — and nowhere at all to hide!',
    signs: [
      'There are endless plains of tall grass here, with a lone tree here and there.',
      'For half the year it pours with rain here, and for half the year it is dry, and great herds wander in search of water.',
      'It is hot here all year, and the trees grow far apart.',
      'In the dry season the grass here turns yellow, and fires often break out.',
      'The baobab grows here — a tree with an enormously thick trunk.',
      'Elephants, zebras and antelopes gather together at the watering hole here.',
    ],
    facts: [
      'The savanna is a grassy plain in warm lands. The best-known savannas are in Africa.',
      'The biggest land animals live in the savanna: elephants, giraffes, rhinos.',
      'In the dry season the grass in the savanna turns yellow, and the rivers run low.',
      'The trees of the savanna — baobabs and acacias — store water for the dry season.',
    ],
  },
  forest: {
    name: 'Forest', where: 'in the forest', no: 'Oh, there are so many trees here that I’ll get lost!',
    signs: [
      'Oaks, pines and firs grow here, the leaves fall in the fall, and snow lies in winter.',
      'There are all four seasons here, and mushrooms, berries and cones as well.',
      'In spring the leaves come out here, and in the fall they turn yellow and drop.',
      'Under your feet here is soft moss, and overhead the treetops rustle.',
      'In winter bears and hedgehogs sleep here, and in spring they wake up.',
      'You can hear a woodpecker and a cuckoo here.',
    ],
    facts: [
      'Forests are called the lungs of the planet: trees make the air clean.',
      'There are many hiding places in a forest: hollows, burrows, thick bushes.',
      'In the fall a leafy forest turns yellow and red, while a pine forest stays green.',
      own('The biggest forest on Earth is the taiga: it stretches across the whole north.'),
    ],
  },
  mountains: {
    name: 'Mountains', where: 'in the mountains', no: 'Oh, it is too high here and terribly steep!',
    signs: [
      'There are steep cliffs here, snow lies on the peaks all year, and the air is cold.',
      'The higher you climb here, the colder it gets, and instead of trees there is bare rock.',
      'The air here is so thin that it is hard to breathe until you are used to it.',
      'Fast cold streams run down the slopes here, and waterfalls tumble.',
      'An avalanche of snow may come down the slope here.',
      'The road here winds in hairpin bends, and the paths run above deep drops.',
    ],
    facts: [
      'The highest mountain in the world is Everest.' + own(' The highest mountain in the Alps is Mont Blanc.'),
      'On high peaks the snow does not melt even in summer.',
      'The higher up a mountain, the fewer trees: on the peaks there are only rocks and moss.',
      'Mountain animals climb rocks wonderfully and have thick fur.',
    ],
  },
};
