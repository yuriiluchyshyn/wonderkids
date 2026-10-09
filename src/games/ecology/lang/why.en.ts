import type { Lines, Rows } from './types';

/**
 * «Why Is That?» in English: the questions of `content/questions.ts` and
 * `content/questionsMore.ts`, in the same order. Where the Ukrainian asks
 * about Ukraine (its longest river, its biggest animal) the English asks the
 * same kind of thing about the world.
 */

export const ROWS: Rows = {
  waste: [
    ['Why should we sort our rubbish?', 'So that new things can be made from it', 'So that the bins look nicer', 'So that the rubbish gets heavier', 'Sorted rubbish is raw material: glass, paper and plastic are made into new things.'],
    ['What is the best thing to take to the shop?', 'Your own cloth bag', 'A new plastic bag every time', 'Ten bags, just in case', 'A cloth bag lasts for years, while a plastic bag becomes rubbish within minutes.'],
    ['What should you do with a toy you no longer play with?', 'Give it to another child', 'Throw it away in the forest', 'Hide it and forget it', 'A thing that can still serve somebody does not become rubbish. This is called giving things a second life.'],
    ['Which stays in nature longer?', 'A plastic bottle', 'An apple core', 'A dry leaf', 'An apple core is gone in a few weeks, but a plastic bottle will lie there for hundreds of years.'],
    ['Where should a used battery go?', 'To a special collection point', 'Into the river', 'Into a hole in the garden', 'A battery holds harmful substances: one battery can poison the ground around it. They are collected separately.'],
    ['What should we do with vegetable and fruit peels?', 'Put them in the compost', 'Throw them on the road', 'Burn them in the yard', 'In the compost, peels rot down and become food for the garden.'],
    ['Why must we take our rubbish with us after a picnic?', 'It harms animals and does not disappear for years', 'In the forest rubbish disappears overnight by itself', 'The birds will eat it anyway', 'Animals can cut themselves on glass or swallow a bag. The forest must stay just as we found it.'],
  ],
  air: [
    ['What cleans the air in a city?', 'Trees', 'Cars', 'Factory chimneys', 'Trees take in carbon dioxide, hold back dust and give us oxygen.'],
    ['What is good about cycling to school?', 'A bicycle does not pollute the air', 'A bicycle is faster than a plane', 'A bicycle rings loudly', 'A bicycle burns no fuel, so it gives off no harmful gases.'],
    ['Why must we not burn fallen leaves?', 'The smoke poisons the air, and hedgehogs and insects live in the leaves', 'Leaves are needed for painting fences', 'It spoils the pavement', 'Smoke from leaves is bad for the lungs. And fallen leaves are a blanket for the ground and a winter home for hedgehogs.'],
    ['Why do cars pollute the air?', 'They burn fuel and give off gases', 'Because they have four wheels', 'Because they drive on the road', 'When an engine burns gasoline, harmful gases come out of the exhaust pipe.'],
    ['Why must we not set dry grass on fire?', 'Insects and nests die in the fire, and the fire can reach the forest', 'The grass will turn blue afterwards', 'It makes the rain start', 'Fire runs very fast through dry grass and can jump to a forest or to houses.'],
    ['Why are trees planted along roads?', 'They hold back dust and give shade', 'So that cars go faster', 'So that there is somewhere to hide rubbish', 'Leaves catch the dust and gases from cars, and trees soften the noise too.'],
    ['What is smog?', 'A dirty fog of smoke and gases over a city', 'The name of a fluffy little cloud', 'Morning dew on the grass', 'Smog appears where there are many cars and factories. Breathing it is harmful.'],
  ],
  water: [
    ['Why should you turn off the tap while brushing your teeth?', 'So as not to waste clean water', 'So that the water does not get cold', 'So that the tap can rest', 'While you brush your teeth with the tap running, several buckets of clean water run away.'],
    ['Why must we not throw rubbish into a river?', 'It poisons the water and harms the fish', 'It makes the river deeper', 'Fish love playing with rubbish', 'Dirty water harms fish, birds and the people who drink water from that river.'],
    ['What water is safe to drink?', 'Clean water: filtered or boiled', 'Water from a puddle', 'Water from the sea', 'Microbes live in dirty water, and sea water is far too salty.'],
    ['Where does the water in the tap come from?', 'From rivers, lakes and underground springs', 'From a little cloud above the house', 'It is made from air at a factory', 'Water is taken from a river or from under the ground, cleaned and sent through pipes to our homes.'],
    ['Why must we take care of fresh water?', 'There is very little of it on the Earth', 'It goes bad quickly', 'It is heavier than salt water', 'Almost all the water on the planet is salty. There is not much fresh water that can be drunk.'],
    ['How can we save water at home?', 'Take a shower instead of a full bath', 'Wash the dishes all day long', 'Water the flowers while it rains', 'A full bath takes three times as much water as a short shower.'],
    ['What happens if oil or paint is poured into a river?', 'A film forms on the water, and the river’s creatures find it hard to breathe', 'The water gets tastier', 'The river flows faster', 'The film lets no air into the water. Fish and plants beneath it do not get enough oxygen.'],
  ],
  climate: [
    ['Why are the glaciers melting?', 'Because the Earth is getting warmer', 'Because polar bears are gnawing them', 'Because they are very old', 'The planet is slowly warming up, and ice that has lain for thousands of years is beginning to melt.'],
    ['Who has the hardest time when the ice melts in the Arctic?', 'Polar bears', 'Camels', 'Parrots', 'Polar bears hunt seals from the ice. When there is little ice, it is hard for them to find food.'],
    ['What is a drought?', 'When there is no rain for a long time and the ground dries out', 'When it rains every day', 'When the first snow has fallen', 'In a drought rivers run low, and plants do not get enough water.'],
    ['Why is the Earth getting warmer?', 'Factories and cars send a lot of gases into the air', 'The Sun has come closer', 'People have started dressing more warmly', 'These gases hold the heat near the Earth like a blanket. That is why the planet is warming up.'],
    ['What will happen to the sea if many glaciers melt?', 'The water level will rise', 'The sea will dry up', 'The water will turn sweet', 'Meltwater runs into the ocean, and it rises. Low shores may be flooded.'],
    ['What helps the Earth not to overheat?', 'Forests: trees take in carbon dioxide', 'More pavement', 'More bonfires', 'Trees take out of the air a gas that holds heat. That is why forests must be looked after and planted.'],
    ['How can a child help the climate?', 'Turn off the lights, take care of things and walk more', 'Light bonfires more often', 'Throw away food that was not finished', 'The less energy and the fewer things we use up, the fewer gases get into the air.'],
  ],
  wildlife: [
    ['Why do we make bird feeders in winter?', 'It is hard for birds to find food under the snow', 'So that the birds do not fly south', 'To decorate the tree', 'In winter seeds and insects are hidden under the snow. A feeder helps birds get through the frost.'],
    ['What can birds be fed in winter?', 'Seeds and unsalted fat', 'Potato chips', 'Candy', 'Salty, fried and sweet food is bad for birds. Best of all are raw sunflower seeds.'],
    ['Why are bees so important?', 'They pollinate flowers, and that is how fruit grows', 'They buzz loudly', 'They chase the clouds away', 'A bee carries pollen from flower to flower — without that no apples or cherries would set.'],
    ['Why must we not pick snowdrops?', 'They are rare and could disappear', 'They are prickly', 'They have no scent at all', 'A picked flower gives no seeds. In many countries snowdrops are protected by law.'],
    ['What should you do if you find a baby bird under a tree?', 'Leave it alone: its parents are near and feed it', 'Take it home', 'Carry it onto the road', 'Baby birds learn to fly from the ground while their parents watch over them. At home it would not survive.'],
    ['Why must we not destroy an anthill?', 'Ants are the forest’s cleaners: they destroy pests', 'The ants will take offense and stop saying hello', 'Squirrels keep their seeds in it', 'The ants of a single anthill gather thousands of harmful insects in a day.'],
    ['Why must we not cut down all the forests?', 'A forest is a home for animals and a source of oxygen', 'Trees get in the way of the wind', 'It is too dark in a forest', 'Without the forest, animals and birds are left without a home, and the air gets dirtier.'],
  ],
  energy: [
    ['Why should you turn off the light when you leave a room?', 'So as not to waste electricity', 'So that the bulb gets brighter', 'So that the room is quieter', 'To make electricity, power stations burn fuel. The less we use, the cleaner the air.'],
    ['Where can we get clean energy from?', 'From the sun and the wind', 'From smoke', 'From rubbish in the river', 'The sun and the wind never run out and pollute nothing.'],
    ['What are wind turbines for?', 'They make electricity from the wind', 'They chase the clouds away', 'They cool the air', 'The wind turns the blades, and a generator inside turns that motion into electricity.'],
    ['What is a solar panel?', 'A device that makes electricity from sunlight', 'A big mirror', 'A roof for cars', 'Solar panels are put on roofs and in fields: they work as long as the sun shines.'],
    ['Why is it better to unplug a charger?', 'It uses electricity even when it is charging nothing', 'It might get lost', 'It hums loudly', 'A plugged-in charger uses a little electricity all the time. There is a lot of such “quiet” waste at home.'],
    ['What is better when it is chilly at home?', 'Put on a sweater first, instead of turning the heater up high', 'Open the window', 'Switch on all the lamps', 'A heater uses a great deal of electricity. Warm clothes keep you warm without any.'],
    ['Why must the fridge not be left open for long?', 'It warms up and uses more electricity', 'Snow flies out of it', 'The food starts to grow', 'Warm air gets inside, and the fridge has to work harder.'],
  ],
};

export const LINES: Lines = {
  waste: `
Where should a candy wrapper go?|In the trash can|A wrapper will not disappear by itself: on the ground it will lie for years.
What can be done with a cardboard box?|Recycle it, or make a toy out of it|Cardboard is made into new paper, and a box makes a wonderful little house.
Why should a juice carton be flattened before it is thrown away?|So that it takes up less room in the bin|Flattened rubbish takes up less room, and the garbage truck can carry more at once.
What will old plastic bottles be made into?|New bottles, toys and even clothes|Plastic is shredded and melted, and warm sweaters are sewn from its threads.
What will a new notebook be made from, if we hand in waste paper?|From old paper|Old paper is soaked, cleaned and made into new sheets.
Why is recycling paper good for the forest?|Because fewer trees are cut down|Paper is made from wood, so every bundle of waste paper handed in saves trees.
What can be made from an empty can?|A new can or a part for a bicycle|Metal can be melted again and again, and it never gets any worse.
What should you do with clothes you have grown out of?|Give them to smaller children|Clothes that somebody will still wear do not become rubbish.
What is the best thing to do with a broken toy?|Try to mend it|A mended thing goes on serving, and there is no need to buy a new one.
Why should a jar be washed before it is recycled?|So that leftover food does not spoil the rest of the material|Dirty containers are harder to recycle, and they smell bad too.
Why is it better to buy one big pack than many small ones?|Because less packaging becomes rubbish|The fewer wrappers, the less rubbish at home.
What can replace a throwaway cup?|Your own mug or water bottle|A reusable bottle lasts for years and does not become rubbish.
Why do throwaway dishes harm nature?|They are used for a few minutes and lie around for hundreds of years|A plastic fork does not disappear in nature for a very long time.
What can a present be wrapped in, to make less rubbish?|In cloth or in paper that has been used before|A pretty scarf or bag can be used many times more.
Why must rubbish not be thrown down the toilet?|Because it blocks the pipes and ends up in the river|The sewers are made for water only, not for rubbish.
Where should a burned-out light bulb go?|To a special collection point|Some bulbs hold harmful substances, so they are collected separately.
Where should an old phone go?|To an electronics collection point|A phone has valuable metals in it that can be taken out and used again.
Why must old medicines not go into the ordinary trash?|Because they can poison water and soil|Medicines are collected separately so that they do not get into nature.
What is compost?|Plant food made from rotted plant leftovers|Peels, leaves and grass rot down and feed the soil.
Who helps turn peels into plant food?|Earthworms and microbes|They eat up plant leftovers and turn them into rich soil.
What is a landfill?|A place where unsorted rubbish is taken|In a landfill rubbish lies for dozens of years and poisons the ground around it.
What does the sign with three arrows in a circle mean?|That this thing can be recycled|The arrows show the way: a thing — raw material — a new thing.
Why is a juice carton hard to recycle?|Because paper, plastic and foil are glued together in it|The layers must be pulled apart, and not every factory can do that.
What can be sewn from old jeans?|A bag or a pencil case|The strong cloth will serve for a long time in a new thing.
What should you do with a book you have already read?|Give it away or take it to the library|Many more children can read the book.
Why is a plastic bag dangerous for the sea?|Turtles mistake it for a jellyfish and swallow it|A swallowed bag can kill an animal.
What is microplastic?|Tiny bits of plastic that can hardly be seen|Plastic does not disappear: it crumbles into specks that get into water and into food.
Why should balloons not be let go into the sky?|They fall to the ground and become rubbish|A bird or an animal can swallow a balloon that has come down.
What should you do if there is no trash can nearby?|Take the rubbish with you|A wrapper can go in your pocket and be thrown away at home.
What is a community cleanup?|When people clean a park or a shore together|Together it can be done quickly — and nature breathes more easily.
How can you take food with you without extra rubbish?|Put it in your own container|A container can be washed and taken along every day.
What should you do with half-used pencils and notebooks at the end of the school year?|Go on using them|New ones are bought when the old ones are really finished.
Which rubbish disappears in nature the fastest?|Leftover food and leaves|Microbes and worms eat up food waste in a few weeks.
Why is broken glass dangerous in the forest?|Both people and animals can cut themselves on it|And a piece of glass in the sun can set dry grass on fire.
What is done at a recycling plant?|Rubbish is sorted and turned into raw material|Old things there become material for new ones.
`,
  air: `
What do we breathe?|Air|Air is everywhere around us, even though we cannot see it.
What do trees give to the air?|Oxygen|Leaves take in carbon dioxide and give out the oxygen we breathe.
What is the best way to travel around a city, to keep the air cleaner?|By bus or by tram|One bus carries as many people as dozens of cars.
How can you get to school without polluting the air?|On foot, by bicycle or by scooter|Legs and bicycles burn no fuel.
Why are filters put on factory chimneys?|To hold back the harmful smoke|A filter catches dust and soot before they get into the air.
Why should a room be aired?|So that there is fresh air in it|Fresh air is easier to breathe, and it clears your head.
Why is it easy to breathe in a forest?|Because trees clean the air|Leaves hold back dust and give lots of oxygen.
Why should a driver turn off the engine during a long stop?|So as not to give off extra gases|An engine pollutes the air even when the car is not moving.
Why is an electric car better for a city?|It gives off no smoke|An electric car has no exhaust pipe.
Why must rubbish not be burned?|It sends poisonous smoke into the air|When plastic burns, very harmful substances are formed.
Why do people wear masks outdoors in some big cities?|Because the air there is very dirty|A mask holds back some of the dust and smoke.
Where does the dust over a city come from?|From cars, factories and building sites|Dust is raised by wheels, wind and smoke.
What does rain do to dust?|It beats it down to the ground|After rain the air is cleaner and fresher.
How do house plants help at home?|They freshen the air|Plants take in carbon dioxide and make the air less dry.
What do leaves take in from the air?|Carbon dioxide|Plants need it in order to grow.
Why are forests called the lungs of the planet?|Because they give the Earth oxygen|Vast forests clean the air for the whole world every day.
Why is tobacco smoke harmful?|It poisons the lungs of everyone nearby|The smoke harms both the one who smokes and those standing near.
Why does the air suffer from fireworks?|They leave smoke and harmful dust behind|And the loud bangs frighten birds and animals.
Why do airplanes pollute the air too?|Because their engines burn a lot of fuel|One flight gives off as many gases as a car does in many months.
Why are bike lanes good for a city?|Because more people switch to bicycles|The fewer cars in the streets, the cleaner the air.
What are exhaust gases?|The smoke that comes out of a car’s pipe|They are formed when an engine burns fuel.
Where in a city is the air the cleanest?|In a park, far from the roads|Trees there hold back dust and gases.
Why is the air clean in the mountains?|There are no factories there and hardly any cars|Mountain air is fresh and clear.
Why does a forest fire harm even faraway cities?|The wind carries the smoke for hundreds of kilometers|Smoke from a big fire can be seen even from space.
Why must stubble not be burned in the fields?|The smoke poisons the air, and useful creatures in the soil die|Fire destroys both insects and birds’ nests.
What is the best thing to heat a house with, so that it smokes less?|Dry firewood, not rubbish|Damp wood and rubbish give off a lot of biting smoke.
Why is the air especially dirty in traffic jams?|Because many cars stand with their engines running|The gases gather over the road and are not blown away.
How does the wind help a city?|It blows the smoke away and brings fresh air|In still weather smoke hangs over the houses.
What is a person’s nose for, when breathing?|It cleans and warms the air|The little hairs in the nose hold back dust.
Which organ helps us breathe?|The lungs|The lungs take oxygen from the air and pass it to the blood.
What can a child do to make the air cleaner?|Plant a tree and walk more|Even one tree cleans the air for dozens of years.
Why should a room be aired after candles or a fire?|Because fire uses up oxygen and gives off smoke|Fresh air brings oxygen back into the room.
Why must spray cans be used with care?|They spray chemicals into the air|Such substances are harmful to breathe in.
What is the layer of air around the Earth called?|The atmosphere|The atmosphere protects everything alive and holds in the warmth.
What protects us from the burning rays of the sun?|The ozone layer|High in the sky it holds back harmful rays.
`,
  water: `
What can neither people, nor plants, nor animals live without?|Water|Everything alive on the Earth needs water.
What should you do with the water while you soap your hands?|Turn off the tap|Several liters of water run out of a tap in a minute.
How can you brush your teeth without wasting water?|Fill a glass with water|A glass is enough, while a whole bucket runs out of an open tap.
What should you do if a tap is dripping?|Tell a grown-up so that it gets fixed|Drop by drop, a whole bucket runs away in a day.
Where does rain come from?|From the clouds|Water rises as vapor, gathers into clouds and comes back down to the ground.
What is best for watering the flowers in the garden?|Rainwater|Rainwater can be collected in a barrel instead of taken from the tap.
When is the best time to water a garden in summer?|In the evening or in the morning|In the heat water dries up quickly and never reaches the roots.
Why must sea water not be drunk?|Because it is very salty|Salty water only makes you thirstier.
Where on the Earth is the most fresh water?|In the glaciers|Almost all the planet’s fresh water is frozen into ice.
Why is clean water in a pond important for frogs?|Because frogs breathe through their skin too|In dirty water frogs fall ill and die.
Why must a car not be washed on a riverbank?|The soap gets into the water and harms the fish|The foam and the dirt run straight into the river.
What are water treatment plants for?|To clean the dirty water from a city|Only after cleaning is the water sent back to the river.
Why is oil spilled in the sea a disaster?|It covers the water with a film and kills birds and fish|A bird’s feathers stick together in oil, and it cannot fly.
Who works as a living filter in a river?|Mussels|A mussel passes water through itself and holds back the dirt.
Why do fertilizers from the fields harm rivers?|They make the water bloom, and the fish run short of air|Water plants spread and use up the oxygen.
How can we do the laundry and save water?|Run the washing machine when it is full|A full machine uses as much water as a half-empty one.
How can we wash the dishes without wasting water?|Not keep the tap running all the time|Dishes can be soaped with the tap turned off.
Why does a toilet tank have two buttons?|To flush with less water when that is enough|The small button uses half as much water.
Why must the forest on riverbanks not be cut down?|Without trees the river runs low and dries up|The roots of trees hold water in the ground.
Who builds dams of branches on rivers?|Beavers|Beaver dams hold back the water, and many animals settle around them.
What does water turn into in the frost?|Ice|Water freezes when the temperature drops below zero.
What does water turn into when it boils?|Steam|Steam is light and rises up to the clouds.
Which river is the longest in the world?|The Nile|The Nile flows across Africa for more than six thousand kilometers.
Which sea does the Nile flow into?|The Mediterranean Sea|The Mediterranean Sea washes the north of Africa and the south of Europe.
Why are there few plants in the desert?|Because there is very little water there|Without water seeds do not sprout.
Why is a plastic bottle dangerous in the sea?|It does not disappear, and crumbles into microplastic|Fish and birds swallow the specks of plastic.
Why must fishing line and nets not be left on the shore?|Birds and fish get tangled in them|An abandoned net goes on catching animals for many years.
What must not be poured down the sink?|Paint, oil and medicines|It is very hard to clean them out of the water.
Why should marshes be protected?|They store water and give a home to birds|A marsh is like a big sponge: it holds water for the rivers.
What is the water cycle?|The journey of water from the sea to the clouds and back|Water rises as vapor, falls as rain and runs down the rivers to the sea.
How much water should a child drink every day?|Several glasses|Water helps the body to work and to think.
What does the sign with a crossed-out tap mean?|That this water must not be drunk|Such water has not been cleaned and can do harm.
Why must glass not be thrown into a river?|Swimmers will cut their feet on it|Glass lies on the bottom for many years and does not get blunt.
What do fish need in the water in order to breathe?|Oxygen dissolved in the water|Fish take oxygen out of the water with their gills.
Where does the water of a forest spring come from?|From under the ground|Rainwater seeps through the soil and comes out as a clean stream.
`,
  climate: `
What warms our planet?|The Sun|The warmth of the Sun gives life to everything on the Earth.
What is the temperature of the air measured with?|A thermometer|The column of a thermometer rises as it gets warmer.
What is global warming?|When the whole planet is getting warmer|Because of gases from factories and cars, the Earth is heating up.
What makes the planet heat up faster?|Gases from cars, factories and power stations|These gases hold in the heat like a blanket.
Why are greenhouse gases compared to a blanket?|Because they do not let the Earth’s heat out|The thicker that blanket, the hotter the planet.
What happens to the level of the sea when ice melts?|It rises|Meltwater runs into the ocean, and it floods low shores.
Who is in danger when the level of the ocean rises?|People on low islands and shores|Some islands may disappear under the water altogether.
Why do penguins need ice?|They raise their chicks on it|Without ice penguins have nowhere to nest.
How do trees help against warming?|They take in carbon dioxide|The more forests, the less of this gas in the air.
How does a bicycle ride help the climate?|A bicycle gives off no gases|Every trip without a car means a little less heat for the planet.
Why are local apples better for the climate than ones brought from far away?|They do not have to travel by plane or by ship|Carrying things burns a lot of fuel.
Why are there more forest fires in summer?|Because the heat dries the forest out|A dry forest catches fire from the smallest spark.
How does warming change the weather?|Storms and downpours get stronger|Warm air and warm water give storms more strength.
What is a drought?|When there is no rain for a very long time|In a drought fields dry out and rivers run low.
Why is a drought dangerous for people?|Because crops do not grow without rain|Wheat and vegetables need water.
Why do corals turn pale?|Because the water in the ocean gets too warm|In overheated water corals fall ill and lose their color.
How do birds feel the change in the climate?|They come back from the south earlier|Spring now often comes sooner than it used to.
Why are winters getting warmer?|Because the whole planet is slowly heating up|In many places less snow falls than it used to.
Why is a train better for the climate than a plane?|It gives off far fewer gases|An electric train hardly pollutes the air at all.
How does a switched-off light help the climate?|Power stations burn less fuel|Less fuel burned means fewer gases in the air.
Why is it worth eating vegetables more often?|Growing them takes less water and energy|Farms with animals need a lot of land and feed.
What is a huge block of ice floating in the sea called?|An iceberg|Most of an iceberg is hidden under the water.
Where do polar bears live?|In the Arctic|They hunt on the ice near the North Pole.
What is climate?|The weather a place has over many years|A desert has a dry climate, and the tropics a warm and wet one.
How is weather different from climate?|Weather changes every day, and climate very slowly|Rain today is weather; a rainy summer every year is climate.
How do scientists keep watch over the ice at the poles?|They photograph it from satellites|Pictures from space show how the ice is shrinking.
Why is it hotter in a city than in a forest?|Pavement and walls heat up a lot in the sun|Trees give shade and cool the air.
What happens to the planet when forests are cut down?|There is more carbon dioxide in the air|Felled trees can no longer take it in.
How should we dress at home in winter to save heat?|Put on a sweater instead of turning the heating up|A warmly dressed person is not cold even with less heating.
Why are houses insulated?|So that the warmth does not escape outside|An insulated house needs less fuel.
Which energy does not heat up the planet?|The energy of the sun, the wind and water|It needs no fuel to be burned.
What can every family do for the climate?|Save energy and drive less|The small steps of many people add up to a big result.
Why do scientists write down the weather every day?|To see how the climate is changing|The records of many years show that the planet is warming.
Why does a warm winter harm bees?|They wake up too early, when there are no flowers yet|Without flowers bees have nothing to eat.
Why are mountain glaciers important for rivers?|Their meltwater feeds the rivers in summer|If a glacier disappears, the river may dry up.
`,
  wildlife: `
What can birds be fed in winter?|Seeds and unsalted fat|Bread is bad for birds, while seeds give them strength.
Why are birdhouses hung up in spring?|So that birds have somewhere to raise their chicks|In a city it is hard for birds to find a hollow in a tree.
What should you do if you find a baby bird under a tree?|Leave it alone: its parents are somewhere near|Baby birds are learning to fly, and their parents feed them on the ground.
Why must we not pick the first spring flowers?|Because very few of them are left|A picked flower gives no seeds, and next spring it will not be there.
Why are bees important?|They pollinate flowers, and fruit grows from them|Without bees there would be no apples and no cherries.
What must a hedgehog never be given?|Milk|Milk gives hedgehogs a stomachache.
Why must squirrels not be fed candy?|Sweet things are bad for their health|Nuts and seeds are good for squirrels.
Why is it better not to feed ducks in the park with bread?|Bread makes them ill|It is better to give ducks grain or chopped vegetables.
Why must anthills not be destroyed?|Ants are the forest’s cleaners|Ants destroy pests and loosen the soil.
What good do spiders do?|They catch flies and mosquitoes|A web is a trap for bothersome insects.
What good do bats do?|In one night they eat hundreds of mosquitoes|Bats hunt harmful insects in the dark.
Why must frogs not be hurt?|They eat mosquitoes and slugs|One frog looks after a whole vegetable bed.
What should you do if you see a snake in the forest?|Calmly walk away and leave it alone|A snake will not attack if it is not frightened.
Why should we be quiet in the forest?|So as not to frighten the animals|Loud noises make animals run away and leave their young.
Why must the branches of trees not be broken?|It makes the tree ill|Diseases get into a tree through a wound.
Why must toadstools not be kicked over?|Forest animals use them as medicine|Elk eat fly agaric toadstools as medicine.
What is the Red List?|A list of rare plants and animals that need protecting|Those of which very few are left are written into it.
Which is the biggest land animal in Europe?|The European bison|A bison weighs almost a ton, and it is a protected animal.
What is a nature reserve?|A place where nature is protected and left alone|Cutting trees, hunting and picking flowers are not allowed there.
Why does a forest need wolves?|They catch weak and sick animals|That way wolves keep diseases from spreading.
What good does an owl do for a field?|It catches mice|Mice eat the grain, and the owl looks after the harvest.
Why is the ladybug a gardener’s friend?|It eats aphids|Aphids drink the sap of plants, and the plants die.
Why do butterflies need flowers?|They drink nectar from them|And as they fly from one to another, butterflies pollinate the plants.
Why must a tortoise not be taken home from the wild?|It is unhappy at home; its home is nature|A wild animal often falls ill in captivity.
How can we help homeless animals?|Take food to a shelter together with a grown-up|At a shelter animals are fed, treated and found a family.
Why do elephants need protecting?|They are hunted for their tusks|Because of poachers there are fewer and fewer elephants.
Why are there so few pandas left on the Earth?|Because bamboo forests are being cut down|Pandas eat almost nothing but bamboo.
Why does the noise of ships harm whales?|It keeps them from hearing one another|Whales talk with sounds over enormous distances.
Why must birds’ nests not be touched?|The birds may abandon the nest|A frightened bird often does not come back to its eggs.
Why leave some flowers unmown in a meadow?|So that bees and bumblebees have something to eat|On a plain lawn insects go hungry.
Why are old fallen trees left lying in the forest?|Beetles, mushrooms and small animals live in them|A rotten trunk is a whole house.
Why must wild animals not be petted?|They may bite, or they may be ill|A wild animal is afraid of people and defends itself.
Why must fish not be caught in spring?|Because that is when fish lay their eggs|Little fish will hatch from the eggs — the fish of the future.
Why do swans fly away in the fall?|Because in winter the water freezes and they cannot find food|In spring they come back home.
Who lives in the hollow of an old tree?|Owls, squirrels and bats|A hollow is a warm little home, ready-made.
`,
  energy: `
Where does the electricity in a socket come from?|From a power station|Electricity runs along wires from the station to every home.
What should you do when you leave a room?|Turn off the light|A lamp that shines for nobody wastes energy.
What should be done with a television nobody is watching?|Turn it off|A television that is on uses electricity even when nobody is looking at it.
What turns sunlight into electricity?|A solar panel|Panels are put on roofs, where there is plenty of sun.
What turns the blades of a wind turbine?|The wind|A turbine turns the force of the wind into electricity.
What makes the electricity at a hydroelectric power station?|Water falling from a dam|The rush of water spins enormous turbines.
Why open the curtains in the daytime?|To use the light of the sun|The sun shines for free and pollutes nothing.
Why must the fridge not be kept open for long?|It warms up and uses more electricity|To cool down again, the fridge has to work harder.
Why are rechargeable batteries better than ordinary ones?|They can be charged many times|One rechargeable battery replaces hundreds of ordinary ones.
What should you do with the charger when the phone is charged?|Pull it out of the socket|A charger in the socket draws electricity even without a phone.
How much water should go into the kettle?|As much as is needed right now|A kettle takes longer to heat extra water and uses more electricity.
Why is a pot covered with a lid?|So that the food comes to the boil sooner|Under a lid the heat does not escape, and the stove works less.
Why should doors and windows be kept shut in winter?|So that the warmth does not leave the house|Through an open window the warmth escapes outside.
What should you do if it is chilly at home?|Put on something warmer first|A sweater keeps you warm and burns no fuel.
What should you do with the computer when you have finished playing?|Turn it off|A sleeping computer uses electricity too.
What is electricity made from at a thermal power station?|From coal or gas|When they burn, a lot of smoke goes into the air.
Why will coal and gas run out one day?|Because their stores under the ground are not renewed|They took millions of years to form.
Which energy is called renewable?|The kind that never runs out: sun, wind and water|The sun and the wind will be there tomorrow and in a thousand years.
How does a solar house have light at night?|In the daytime it stores energy in batteries|The energy stored in the day lasts through the evening.
Where is the best place for wind turbines?|Where the wind often blows: in open fields and by the sea|The stronger the wind, the more electricity.
What energy moves a bicycle?|The strength of your legs|A bicycle needs neither gasoline nor electricity.
What moves a tram and a trolleybus?|Electricity from the wires|That is why they give off no smoke in the streets.
What does an ordinary car burn in order to go?|Gasoline|Gasoline is made from oil.
What is gasoline made from?|From oil|Oil is pumped up from deep under the ground.
How can the laundry be dried without using electricity?|On a line, in the sun and the wind|The sun and the wind dry it for free.
How can you go up one floor and save energy?|By the stairs|An elevator uses electricity, and stairs are good for your health too.
What is the dial on a radiator for?|So as not to heat more than is needed|Extra heat is fuel burned for nothing.
Which flashlight needs no batteries?|One charged by the sun or by a crank|Turn the crank — and there is light.
Why are solar panels put on roofs?|So that the house makes its own electricity|On a sunny day the panels give enough electricity for the whole house.
Where does our body get its energy from?|From food|Food is fuel for a person.
Where do plants get their energy from?|From sunlight|Leaves catch the light and turn it into food.
Why must you never play with a socket?|Electric current is very dangerous|The current can give a strong shock.
What did people light their homes with before there was electricity?|Candles and oil lamps|Electric light appeared only a little more than a hundred years ago.
What is the sticker with the letters from A to G on an appliance for?|It shows how much energy the thing uses|The letter A means the thing is the thriftiest.
Why should the lights in empty offices be turned off at night?|They waste energy and disturb the birds|Bright windows lead migrating birds off their course.
`,
};
