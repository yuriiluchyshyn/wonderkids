import { say } from '@/core/lang/marks';
import type { RiddleWords, Rule } from './types';

/**
 * «Логічні задачі» in English. Every list keeps the order of the skins in
 * `content/riddles.ts`. Numbers are written as digits: the English voice reads
 * a digit right wherever it stands.
 */

const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
/** «a ball» → «ball»: a thing as it stands on a card. */
const bare = (thing: string) => thing.replace(/^(an?|the) /, '');
const list = (items: string[], last = 'and') => (items.length > 1 ? `${items.slice(0, -1).join(', ')} ${last} ${items[items.length - 1]}` : items[0]);

const BOYS = ['Tom', 'Mark', 'Oscar', 'Nate', 'Daniel', 'Max', 'Andrew', 'Victor'];
const GIRLS = ['Olivia', 'Sophie', 'Zoe', 'Lucy', 'Mary', 'Stella', 'Hannah', 'Daria'];

const ORDINALS = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth'];
const ordinal = (n: number) => say(`${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'}`, ORDINALS[n]);

const ONE_OF: [string, string, string[]][] = [
  ['In the box there is', 'What is in the box?', ['a ball', 'a doll', 'a block', 'a toy car']],
  ['In the basket there is', 'What is in the basket?', ['an apple', 'a pear', 'a banana', 'a lemon']],
  ['Hiding in the doghouse is', 'Who is hiding in the doghouse?', ['a cat', 'a dog', 'a hedgehog', 'a rabbit']],
  ['On the plate there is', 'What is on the plate?', ['a croissant', 'a dumpling', 'a pancake', 'a bagel']],
  ['In the pencil case there is', 'What is in the pencil case?', ['a pencil', 'a pen', 'a paintbrush', 'a ruler']],
  ['Standing behind the door is', 'Who is standing behind the door?', ['Dad', 'Mom', 'Grandpa', 'Grandma']],
  ['Hanging in the closet is', 'What is hanging in the closet?', ['a jacket', 'a dress', 'a shirt', 'a scarf']],
  ['In the garage there is', 'What is in the garage?', ['a bicycle', 'a scooter', 'a motorcycle', 'a tractor']],
  ['Sitting on the branch is', 'Who is sitting on the branch?', ['an owl', 'a parrot', 'a squirrel', 'a crow']],
  ['In the present there is', 'What is in the present?', ['a book', 'a robot', 'a puzzle', 'a teddy bear']],
];

const ROWS_OF_THREE: [verb: string, what: string, three: string[]][] = [
  ['is sitting', 'Who', ['cat', 'dog', 'mouse']],
  ['is standing', 'Who', ['elephant', 'giraffe', 'zebra']],
  ['is sitting', 'Who', ['owl', 'parrot', 'dove']],
  ['is swimming', 'Who', ['duck', 'swan', 'frog']],
  ['is lying', 'Who', ['lion', 'tiger', 'bear']],
  ['is standing', 'Who', ['cow', 'horse', 'sheep']],
  ['is sitting', 'Who', ['hedgehog', 'squirrel', 'hare']],
  ['is standing', 'What', ['robot', 'doll', 'teddy bear']],
  ['is growing', 'What', ['oak', 'fir tree', 'palm tree']],
  ['is standing', 'What', ['bus', 'streetcar', 'truck']],
];

/** «taller», «the tallest», «the shortest» */
const COMPARE: [string, string, string][] = [
  ['taller', 'the tallest', 'the shortest'],
  ['older', 'the oldest', 'the youngest'],
  ['stronger', 'the strongest', 'the weakest'],
  ['faster', 'the fastest', 'the slowest'],
  ['heavier', 'the heaviest', 'the lightest'],
  ['more cheerful', 'the most cheerful', 'the saddest'],
  ['more nimble', 'the most nimble', 'the least nimble'],
  ['braver', 'the bravest', 'the least brave'],
  ['more patient', 'the most patient', 'the least patient'],
  ['more careful', 'the most careful', 'the least careful'],
];

const rule = (r: Rule): string => {
  switch (r.kind) {
    case 'add':
      return `${r.by} is added every time`;
    case 'sub':
      return `${r.by} is taken away every time`;
    case 'alt':
      return `first ${r.by} is added, then ${r.then} — in turn`;
    case 'double':
      return 'every number is twice as big as the one before';
    case 'triple':
      return 'every number is three times as big as the one before';
    case 'half':
      return 'every number is half of the one before';
    case 'grow':
      return 'first 1 is added, then 2, then 3, and after that — 4';
    case 'shrink':
      return 'first 1 is taken away, then 2, then 3, and after that — 4';
    case 'two':
      return 'two rows are woven together here — look at every other number';
  }
};

/** Someone with `a` in front and `b` behind; from the sixth on the place is told from both ends. */
const QUEUES: ((a: number, b: number) => string)[] = [
  (a, b) => `Mark is standing in line for ice cream. There are ${a} people in front of him and ${b} behind him. How many people are in the line altogether?`,
  (a, b) => `Olivia is standing in a row in gym class. There are ${a} children in front of her and ${b} behind her. How many children are in the row altogether?`,
  (a, b) => `A red car is part of a train. There are ${a} cars in front of it and ${b} behind it. How many cars does the train have altogether?`,
  (a, b) => `A blue car is stuck in a traffic jam. There are ${a} cars in front of it and ${b} behind it. How many cars are in the traffic jam altogether?`,
  (a, b) => `Lucy is standing in line at the checkout. There are ${a} people in front of her and ${b} behind her. How many people are in the line altogether?`,
  (a, b) => `In the line for tickets Tom is ${ordinal(a + 1)} from the front and ${ordinal(b + 1)} from the back. How many people are in the line altogether?`,
  (a, b) => `In the row Nate is ${ordinal(a + 1)} from the front and ${ordinal(b + 1)} from the back. How many children are in the row altogether?`,
  (a, b) => `In the row of books on the shelf the dictionary is ${ordinal(a + 1)} from the front and ${ordinal(b + 1)} from the back. How many books are in the row altogether?`,
  (a, b) => `In the train the dining car is ${ordinal(a + 1)} from the front and ${ordinal(b + 1)} from the back. How many cars does the train have altogether?`,
  (a, b) => `In the column of ants the biggest ant is ${ordinal(a + 1)} from the front and ${ordinal(b + 1)} from the back. How many ants are in the column altogether?`,
];

const LEGS: [text: (a: number, b: number) => string, first: string, legs: number, second: string, legsToo: number][] = [
  [(a, b) => `There are ${a} hens and ${b} dogs walking in the yard. How many legs do they have altogether?`, 'Hens', 2, 'Dogs', 4],
  [(a, b) => `There are ${a} geese and ${b} cows grazing in the meadow. How many legs do they have altogether?`, 'Geese', 2, 'Cows', 4],
  [(a, b) => `There are ${a} roosters and ${b} horses standing in the farmyard. How many legs do they have altogether?`, 'Roosters', 2, 'Horses', 4],
  [(a, b) => `There are ${a} pigeons and ${b} cats sitting by the house. How many legs and paws do they have altogether?`, 'Pigeons', 2, 'Cats', 4],
  [(a, b) => `${a} ducks and ${b} sheep have met in the clearing. How many legs do they have altogether?`, 'Ducks', 2, 'Sheep', 4],
  [(a, b) => `There are ${a} bicycles and ${b} cars in the parking lot. How many wheels do they have altogether?`, 'Bicycles', 2, 'Cars', 4],
  [(a, b) => `There are ${a} scooters and ${b} tricycles standing in the yard. How many wheels do they have altogether?`, 'Scooters', 2, 'Tricycles', 3],
  [(a, b) => `There are ${a} stools with three legs and ${b} chairs with four standing in the room. How many legs do they have altogether?`, 'Stools', 3, 'Chairs', 4],
  [(a, b) => `There are ${a} beetles and ${b} little birds sitting on a flower. How many legs do they have altogether?`, 'Beetles', 6, 'Birds', 2],
  [(a, b) => `${a} spiders and ${b} flies have gathered in a corner. How many legs do they have altogether?`, 'Spiders', 8, 'Flies', 6],
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_ASKS: [tells: (day: string) => string, question: string, note: string][] = [
  [(d) => `Today is ${d}.`, 'What day of the week will it be tomorrow?', 'today'],
  [(d) => `Today is ${d}.`, 'What day of the week was it yesterday?', 'today'],
  [(d) => `Today is ${d}.`, 'What day of the week will it be the day after tomorrow?', 'today'],
  [(d) => `Today is ${d}.`, 'What day of the week was it the day before yesterday?', 'today'],
  [(d) => `Today is ${d}.`, 'What day of the week will it be in three days?', 'today'],
  [(d) => `Today is ${d}.`, 'What day of the week will it be in five days?', 'today'],
  [(d) => `Tomorrow will be ${d}.`, 'What day of the week was it yesterday?', 'tomorrow'],
  [(d) => `Yesterday was ${d}.`, 'What day of the week will it be tomorrow?', 'yesterday'],
  [(d) => `The day before yesterday was ${d}.`, 'What day of the week is it today?', 'two days ago'],
  [(d) => `The day after tomorrow will be ${d}.`, 'What day of the week is it today?', 'in two days'],
];

const CUTS: [text: (n: number) => string, find: 'cuts' | 'pieces'][] = [
  [(n) => `A log was sawn into ${n} parts. How many cuts were made?`, 'cuts'],
  [(n) => `A rope was cut into ${n} pieces. How many cuts were made?`, 'cuts'],
  [(n) => `A baguette was cut into ${n} pieces. How many cuts were made?`, 'cuts'],
  [(n) => `A ribbon was cut into ${n} parts. How many cuts were made?`, 'cuts'],
  [(n) => `${n} trees were planted in one row along a path. How many gaps are there between them?`, 'cuts'],
  [(n) => `${n} cuts were made in a board. How many parts did the board fall into?`, 'pieces'],
  [(n) => `${n} cuts were made in a sausage. How many pieces came out?`, 'pieces'],
  [(n) => `${n} cuts were made in a wire. How many pieces of wire came out?`, 'pieces'],
  [(n) => `A chocolate bar was broken in ${n} places. How many pieces came out?`, 'pieces'],
  [(n) => `There are ${n} gaps between the posts of a fence. How many posts does the fence have?`, 'pieces'],
];

const REPEATS: [string, string, string[]][] = [
  ['The beads on the string go like this', 'bead', ['red', 'blue', 'yellow']],
  ['The flags on the garland hang like this', 'flag', ['green', 'yellow', 'blue']],
  ['The balloons at the party hang like this', 'balloon', ['red', 'white', 'blue']],
  ['The tiles on the floor lie like this', 'tile', ['black', 'white', 'gray']],
  ['The blocks in the tower stand like this', 'block', ['yellow', 'red', 'green']],
  ['The lights on the Christmas tree shine like this', 'light', ['blue', 'yellow', 'red']],
  ['The flowers in the flower bed grow like this', 'flower', ['white', 'yellow', 'purple']],
  ['The cars of the toy train go like this', 'car', ['green', 'blue', 'orange']],
  ['The stripes on the scarf go like this', 'stripe', ['red', 'yellow', 'green']],
  ['The buttons on the ribbon are sewn like this', 'button', ['black', 'red', 'white']],
];

const RACES = ['reached the finish line', 'woke up', 'got to school', 'finished his drawing', 'finished breakfast', 'put the puzzle together', 'swam to the shore', 'climbed the slide', 'solved the problem', 'went to bed'];

const HAVE = ['apples', 'stickers', 'nuts', 'balloons', 'pencils', 'candies', 'shells', 'stamps', 'blocks', 'coins'];

/** What three boys have: how it is said, what one is called («pet»), the things in a list and in a sentence. */
const OWNERS: [does: string, kind: string, listed: string[], named: string[], ask?: (kid: string) => string][] = [
  ['have pets', 'pet', ['a cat', 'a dog', 'a parrot'], ['the cat', 'the dog', 'the parrot']],
  ['are eating fruit', 'fruit', ['an apple', 'a pear', 'a banana'], ['the apple', 'the pear', 'the banana']],
  ['do sports', 'sport', ['soccer', 'swimming', 'tennis'], ['soccer', 'swimming', 'tennis']],
  ['play instruments', 'instrument', ['a violin', 'a drum', 'a guitar'], ['the violin', 'the drum', 'the guitar']],
  ['got presents', 'present', ['a book', 'a robot', 'a puzzle'], ['the book', 'the robot', 'the puzzle']],
  ['came to school', 'ride', ['a bicycle', 'a scooter', 'a bus'], ['the bicycle', 'the scooter', 'the bus']],
  ['put on hats', 'hat', ['a red one', 'a blue one', 'a green one'], ['red', 'blue', 'green'], (kid) => `What color is ${kid}’s hat?`],
  ['are drawing', 'drawing', ['a house', 'a tree', 'a ship'], ['the house', 'the tree', 'the ship']],
  ['ordered drinks', 'drink', ['juice', 'tea', 'milk'], ['juice', 'tea', 'milk']],
  ['chose ice cream', 'ice cream', ['chocolate', 'strawberry', 'vanilla'], ['chocolate', 'strawberry', 'vanilla']],
];

const MEETINGS: [who: string, did: string, ask: string, both: boolean][] = [
  ['friends', 'met, and each shook hands with each of the others', 'How many handshakes were there?', false],
  ['teams', 'played one another: each with each, one time', 'How many games were there?', false],
  ['towns', 'were joined by roads: between every two towns there is a road of its own', 'How many roads were built?', false],
  ['girls', 'gave one another cards: each one to each of the others', 'How many cards were given?', true],
  ['chess players', 'played one another: each with each, one game', 'How many games were there?', false],
];
const COUNT = ['Three', 'Four', 'Five', 'Six'];

export const en: RiddleWords = {
  cap,
  boys: BOYS,
  girls: GIRLS,
  note: { mark: 'Mark', sister: 'sister', brother: 'brother', olia: 'Olivia', now: 'now', later: 'later', then: 'then', son: 'Son', mum: 'Mom', olderSister: 'Sister', thought: 'my number', tens: 'tens', ones: 'ones' },

  oneOf: (skin) => {
    const [lead, ask, things] = ONE_OF[skin];
    return {
      things: things.map(bare),
      tell: (set, out) => ({
        text: `${lead} ${list(set.map((i) => things[i]), 'or')}. It is ${list(out.map((i) => `not ${things[i]}`))}. ${ask}`,
        how: `Cross out what is not there: ${out.map((i) => things[i]).join(', ')}. Only one is left.`,
      }),
    };
  },

  row: (skin) => {
    const [verb, what, three] = ROWS_OF_THREE[skin];
    return {
      names: three,
      ends: ['left', 'right'],
      tell: (l, m, r, asked, leftFirst) => ({
        text: `${
          leftFirst
            ? `The ${three[l]} ${verb} to the left of the ${three[m]}, and the ${three[r]} is to the right of the ${three[m]}.`
            : `The ${three[r]} ${verb} to the right of the ${three[m]}, and the ${three[l]} is to the left of the ${three[m]}.`
        } ${what} ${verb} ${['in the middle', 'on the far left', 'on the far right'][asked]}?`,
        how: `Line them up in your mind: on the left — the ${three[l]}, then the ${three[m]}, on the right — the ${three[r]}.`,
      }),
    };
  },

  chain: (skin, girls) => {
    const [more, top, bottom] = COMPARE[skin];
    const names = girls ? GIRLS : BOYS;
    return {
      tell: (row, order, low) => {
        const links = row.slice(0, -1).map((who, i) => `${names[who]} is ${more} than ${names[row[i + 1]]}`);
        const told = order.map((i) => links[i]);
        return {
          text: `${told.slice(0, -1).join(', ')}, and ${told[told.length - 1]}. Who is ${low ? bottom : top}?`,
          how: `Line them up: ${row.map((w) => names[w]).join(', ')}. The first name is ${top}, the last is ${bottom}.`,
        };
      },
    };
  },

  next: (row, r) => ({ text: `Which number comes next? ${row.join(', ')}, …`, how: `Work out the rule: ${rule(r)}.` }),

  queue: (skin) => ({
    ends: ['in front', 'behind'],
    tell: (a, b) => ({
      text: QUEUES[skin](a, b),
      how:
        skin >= 5
          ? `There are ${a} in front and ${b} behind. Add them and don’t forget the one in between: count that one once, not twice.`
          : `Add those in front and those behind: ${a} and ${b}. And don’t forget to count one more — the one the riddle is about.`,
    }),
  }),

  legs: (skin) => {
    const [text, first, legs, second, legsToo] = LEGS[skin];
    return { labels: [first, second], tell: (a, b) => ({ text: text(a, b), how: `Count them separately: ${a} times ${legs} and ${b} times ${legsToo}. Then add.` }) };
  },

  days: {
    names: DAYS,
    short: DAYS.map((d) => d.slice(0, 3)),
    tell: (ask, given) => ({
      text: `${DAY_ASKS[ask][0](DAYS[given])} ${DAY_ASKS[ask][1]}`,
      how: `Say the days in order: ${DAYS.join(', ')}. First find what day it is today, and then count to the one you need.`,
    }),
    note: (ask) => DAY_ASKS[ask][2],
  },

  cuts: (skin) => ({
    tell: (n) => ({
      text: CUTS[skin][0](n),
      how: `Try it small: to get two pieces you need one cut, and to get three — two cuts. It is the same with trees and the gaps between them. ${CUTS[skin][1] === 'cuts' ? 'Here the answer is one less.' : 'Here the answer is one more.'}`,
    }),
  }),

  repeats: (skin) => {
    const [lead, thing, colours] = REPEATS[skin];
    return {
      colours,
      tell: (unit, place) => ({
        text: `${lead}: ${[...unit, ...unit].map((c) => colours[c]).join(', ')} — and so on. What color will the ${ordinal(place)} ${thing} be?`,
        how: `The colors repeat every ${unit.length}. Count around: ${unit.map((c) => colours[c]).join(', ')} — and again from the start, up to the place you need.`,
      }),
    };
  },

  race: (skin) => {
    const did = RACES[skin];
    return {
      ends: ['earlier', 'later'],
      tell: (f, s, t, last, told) => {
        const [first, second, third] = [BOYS[f], BOYS[s], BOYS[t]];
        const tells = [
          `${second} ${did} earlier than ${third} but later than ${first}`,
          `${second} ${did} later than ${first} but earlier than ${third}`,
          `${first} ${did} earlier than ${second}, and ${third} — later than ${second}`,
        ][told];
        return { text: `${tells}. Who ${did} ${last ? 'last' : 'first'}?`, how: `Put them in order of time: first ${first}, then ${second}, last of all ${third}.` };
      },
    };
  },

  more: (skin) => {
    const many = HAVE[skin];
    return {
      names: ['Lucy', 'Tom', 'Olivia'],
      tell: (c, b, a, fewer) => ({
        text: fewer
          ? `Lucy has ${c + a + b} ${many}. Tom has ${b} fewer than Lucy, and Olivia has ${a} fewer than Tom. How many ${many} does Olivia have?`
          : `Lucy has ${c} ${many}. Tom has ${b} more than Lucy, and Olivia has ${a} more than Tom. How many ${many} does Olivia have?`,
        how: 'Go along the chain: first find out how many Tom has, and then how many Olivia has.',
      }),
    };
  },

  family: (at, [a, b]) =>
    [
      () => ({ text: `Mark has ${a} ${a === 1 ? 'sister' : 'sisters'} and ${b} ${b === 1 ? 'brother' : 'brothers'}. How many children are there in this family altogether?`, how: 'Count the sisters, the brothers — and don’t forget Mark himself.' }),
      () => ({ text: `There are ${a} brothers in a family. Each of them has one sister. How many children are there in the family altogether?`, how: 'All the brothers have one and the same sister. Count the brothers and add her alone.' }),
      () => ({ text: `There are ${a} sisters in a family. Each of them has one brother. How many children are there in the family altogether?`, how: 'All the sisters have one and the same brother. Count the sisters and add him alone.' }),
      () => ({ text: `Olivia has as many brothers as sisters: ${a} of each. How many children are there in this family altogether?`, how: 'Count the brothers, just as many sisters — and don’t forget Olivia herself.' }),
      () => ({ text: `Grandma has ${a} daughters. Each daughter has two children. How many grandchildren does Grandma have?`, how: 'Each daughter has two children. Count by twos as many times as there are daughters.' }),
    ][at](),

  ages: (at, [a, d, e]) =>
    [
      () => ({ text: `Olivia is ${a} years old. Her brother is ${d} years older. How old is her brother?`, how: '“Older” means more years. Add.' }),
      () => ({ text: `In ${d} years Mark will be ${a + d} years old. How old is Mark now?`, how: 'Now he is younger than he will be later. Take away the years that have not passed yet.' }),
      () => ({ text: `The sister is twice as old as Olivia. Olivia is ${a} years old. How old is the sister?`, how: '“Twice as old” means two times as many.' }),
      () => ({ text: `${d === 2 ? 'Two' : 'Three'} years ago Daniel was ${a - d} years old. How old will he be in ${e} ${e === 1 ? 'year' : 'years'}?`, how: 'First find out how old he is now, and then add the years that are still to pass.' }),
      () => ({ text: `Mom is ${d} years old, and her son is ${a}. How old was Mom when her son was born?`, how: 'When the son was born, Mom was younger by exactly as many years as the son is now. Take away.' }),
    ][at](),

  hidden: (at, [a, b]) =>
    [
      () => ({ text: `I am thinking of a number. It is bigger than ${a} but smaller than ${b}, and it is even — it can be divided by two. What is the number?`, how: `Say all the numbers between ${a} and ${b}. The even one among them is the one that can be divided by two.` }),
      () => ({ text: `I am thinking of a number. It is bigger than ${a} but smaller than ${b}, and it is odd. What is the number?`, how: `Say all the numbers between ${a} and ${b}. The odd one is the one that cannot be divided by two evenly.` }),
      () => ({ text: `I am thinking of a number. It is bigger than ${a} but smaller than ${b}, and it can be divided by five. What is the number?`, how: 'Numbers that can be divided by five end in zero or in five.' }),
      () => ({ text: `In a two-digit number the tens digit is ${a}, and the ones digit is ${b} bigger. What is the number?`, how: `First find the ones digit: add ${b} to ${a}. Then write the two digits side by side.` }),
      () => ({ text: `I thought of a number, added ${b} to it and got as much as ${a} and ${a} more. What number did I think of?`, how: `First work out how much came out: ${a} and ${a} more. Then take away ${b}.` }),
    ][at](),

  owners: (skin) => {
    const [does, kind, listed, named, ask] = OWNERS[skin];
    return {
      things: named.map(bare),
      tell: (who, has, hard) => {
        const kids = who.map((k) => BOYS[k]);
        const not = (kid: string, things: number[]) => `${kid}’s ${kind} is ${things.map((t) => `not ${named[t]}`).join(' and ')}.`;
        const asked = kids[hard ? 1 : 0];
        return {
          text: `${list(kids)} ${does}. Each has his own: ${listed.join(', ')}. ${not(kids[0], [has[1], has[2]])}${hard ? ` ${not(kids[2], [has[1]])}` : ''} ${ask ? ask(asked) : `What is ${asked}’s ${kind}?`}`,
          how: hard
            ? `First find ${kids[0]}’s ${kind}: only one is left. Then look at what ${kids[2]}’s ${kind} is not — and you will find out what is left for ${kids[1]}.`
            : 'Cross out what is surely not there. Only one is left.',
        };
      },
    };
  },

  meetings: (skin) => {
    const [who, did, ask, both] = MEETINGS[skin];
    return {
      tell: (n) => ({
        text: `${COUNT[n - 3]} ${who} ${did}. ${ask}`,
        how: both
          ? 'Each girl gives a card to everyone but herself. Count how many one girl gives, and multiply by the number of girls.'
          : `The first meets all the others, the second — all but the first, and so on. Add: ${Array.from({ length: n - 1 }, (_, i) => n - 1 - i).join(' + ')}.`,
      }),
    };
  },
};
