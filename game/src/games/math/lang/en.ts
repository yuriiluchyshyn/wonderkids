import { LANGUAGES } from '@/core/lang';
import { numberWords } from '@/core/lang/en';
import type { CurrencyId } from '@/core/game/content/currency';
import { MATH_SUB } from '../ids';
import type { MathTexts, MeasureWords, Shape } from './types';

/** The Math galaxy in English. */

const { fraction, sign } = LANGUAGES.en;
const s = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const measure = (big: string, bigOne: string, small: string, smallMany: string, rule: string, bigMany = `${bigOne}s`): MeasureWords => ({
  big,
  bigSaid: (n) => s(n, bigOne, bigMany),
  small,
  smallSaid: (n) => `${n} ${smallMany}`,
  rule,
});

const SHAPES: Record<Shape, string> = { triangle: 'triangles', square: 'squares', circle: 'circles', rect: 'rectangles' };
const OPS = { '+': 'plus', '-': 'minus', '×': 'times', '÷': 'divided by' } as const;

const heaps = (n: number): string => (n === 1 ? '1 heap' : `${n} equal heaps`);

/** What each currency is called, its price tag, its small change. */
export const MONEY: Record<CurrencyId, { short: string; one: string; many: string; small: string; smallMany: string; rule: string }> = {
  UAH: { short: 'UAH', one: 'hryvnia', many: 'hryvnias', small: 'kop.', smallMany: 'kopiykas', rule: 'One hryvnia is one hundred kopiykas.' },
  EUR: { short: '€', one: 'euro', many: 'euros', small: 'ct', smallMany: 'cents', rule: 'One euro is one hundred cents.' },
  USD: { short: '$', one: 'dollar', many: 'dollars', small: '¢', smallMany: 'cents', rule: 'One dollar is one hundred cents.' },
  GBP: { short: '£', one: 'pound', many: 'pounds', small: 'p', smallMany: 'pence', rule: 'One pound is one hundred pence.' },
  PLN: { short: 'zł', one: 'zloty', many: 'zlotys', small: 'gr', smallMany: 'groszy', rule: 'One zloty is one hundred groszy.' },
};

export const en: MathTexts = {
  cards: {
    title: 'Math',
    games: {
      [MATH_SUB.add]: { label: 'Addition', blurb: 'Putting it all together' },
      [MATH_SUB.sub]: { label: 'Subtraction', blurb: 'Taking away bit by bit' },
      [MATH_SUB.mul]: { label: 'Multiplication', blurb: 'Equal heaps together', demoCaption: '2 times 2' },
      [MATH_SUB.div]: { label: 'Division', blurb: 'Sharing equally', demoCaption: '4 shared equally by 2' },
      [MATH_SUB.mixed]: { label: 'Mental Math', blurb: 'All together: +, −, ×, ÷' },
      [MATH_SUB.fractions]: { label: 'Tasty Fractions', blurb: 'Finding a piece of a treat' },
      [MATH_SUB.fractionOps]: { label: 'Fractions: Operations', blurb: 'Adding, subtracting, multiplying and dividing fractions' },
      [MATH_SUB.balance]: {
        label: 'Math Scales',
        blurb: 'Find the weight that balances',
        intro: 'Scales love balance! There is a sum on the left. Drag onto the right pan the weight that weighs just as much.',
      },
      [MATH_SUB.geometry]: { label: 'Shape Builder', blurb: 'Building shapes, counting area and perimeter' },
      [MATH_SUB.maze]: {
        label: 'Number Maze',
        blurb: 'Run only on the right numbers',
        intro: 'Help your friend run through the maze! You may only step on numbers that fit the rule. Take a step onto a neighboring square.',
      },
      [MATH_SUB.shop]: {
        label: 'The Shop',
        blurb: 'Counting pocket money',
        intro: 'Welcome to the shop! Look at the price tag and put on the counter as much money as the toy costs.',
      },
      [MATH_SUB.wordProblems]: {
        label: 'Story Problems',
        blurb: 'Stories from life: the shop, friends, the road',
        intro: 'Listen to a little story and answer the question. The pictures show what we know and what is asked. If you need to, tap the speaker and I will read the problem again.',
      },
      [MATH_SUB.compare]: {
        label: 'Greater, Less, Equal',
        blurb: 'Comparing numbers, sums and measures',
        intro:
          'Let’s compare! The “greater than” and “less than” sign looks like a bird’s beak: it is always open toward the bigger number. And if both sides are the same, we put “equals”.',
      },
      [MATH_SUB.clock]: { label: 'What Time Is It?', blurb: 'Learning to read a clock with hands' },
    },
  },

  intro: {
    add: (it) => `Adding means putting things together! Take ${it}${it} and one more ${it}. Count: one, two, three. That makes three ${it}!`,
    sub: (it) => `Subtracting means taking away. There were ${it}${it}${it}, one ${it} was taken — two are left. Count how many are left!`,
    mul: (it) => `Multiplying means taking equal heaps. We take ${it}${it} two times: ${it}${it} and ${it}${it} again — four ${it} altogether!`,
    div: (it) => `Dividing means sharing equally. We have ${it}${it}${it}${it} and put them into two baskets equally — two in each. How many are in one?`,
    mixed: 'Here the sums are mixed. Look at the sign: “plus” means we put together, “minus” means we take away. Count carefully!',
    fractions: 'Fractions are equal slices. Picture a pizza 🍕: it was cut into four slices and one was taken — that is one quarter. Find the colored slice!',
    other: 'Ready for an adventure? Let’s count together!',
  },

  heaps,

  mental: {
    prompt: (a, b, op) => `What is ${a} ${OPS[op]} ${b}?`,
    hint: (a, b, op) => {
      if (op === '×') return `That is ${heaps(a)}, with ${b} in each. Tap the dots one by one and count them all.`;
      if (op === '÷') return `Share ${a} dots equally into ${s(b, 'row')}. Count how many end up in one row.`;
      if (op === '-') return `There were ${a}. Take away ${b} — remove the dots one at a time. How many are left?`;
      return `Count the dots one by one: first ${a}, then add ${b} more. How many are there altogether?`;
    },
  },

  balance: {
    prompt: 'Balance the scales! Which weight weighs the same?',
    reduce: (n, d, simpleN, simpleD) => `Simplify the fraction: divide the top and the bottom by the same number. ${n} out of ${d} is the same as ${simpleN} out of ${simpleD}.`,
    add: (a, b) => `Count all the dots together: ${a} and ${b} more.`,
    sub: (a, b) => `There were ${a}, and ${b} were taken away. Count how many dots are left.`,
    mul: (a, b) => `That is ${heaps(a)} of ${b}. Count all the dots.`,
  },

  fractions: {
    foods: ['the pizza', 'the cake', 'the apple', 'the watermelon', 'the orange', 'the pie', 'the chocolate bar'],
    prompt: (food) => `What part of ${food} is colored in?`,
    hint: (filled, denom) =>
      `Let’s count the colored slices: ${Array.from({ length: filled }, (_, i) => numberWords(i + 1)).join(', ')}. There are ${denom} slices in all. So it is ${filled} out of ${denom}!`,
  },

  fractionOps: {
    intro: {
      addSame:
        'When the bottom numbers are the same, the slices are the same size. Just add the top numbers and keep the bottom one as it is: one quarter plus two quarters is three quarters.',
      subSame:
        'We subtract the same way: the slices are equal, so we take the top number away from the top number and leave the bottom one alone. Three quarters minus one quarter is two quarters.',
      unlike:
        'Now the bottom numbers are different — the slices are different sizes. First make them the same: find a common denominator, then add or subtract the top numbers. One half is the same as two quarters!',
      mul: 'To multiply fractions, multiply top by top and bottom by bottom. One half of one third is one sixth.',
      div: 'To divide by a fraction, flip the second fraction and multiply. Dividing by one half is the same as multiplying by two.',
      mixed: 'All the operations are here together. Look carefully at the sign and remember the rule for each one!',
    },
    prompt: (a, op, b) => `Work it out: ${fraction(a.n, a.d)} ${sign(op)} ${fraction(b.n, b.d)}`,
  },

  compare: {
    plus: (a, b) => `${a} plus ${b}`,
    minus: (a, b) => `${a} minus ${b}`,
    times: (a, b) => `${a} times ${b}`,
    units: [
      measure('m', 'meter', 'cm', 'centimeters', 'One meter is one hundred centimeters.'),
      measure('kg', 'kilogram', 'g', 'grams', 'One kilogram is one thousand grams.'),
      measure('h', 'hour', 'min', 'minutes', 'One hour is sixty minutes.'),
      measure('cm', 'centimeter', 'mm', 'millimeters', 'One centimeter is ten millimeters.'),
      measure('l', 'liter', 'ml', 'milliliters', 'One liter is one thousand milliliters.'),
    ],
    signs: { lt: 'less', eq: 'equal', gt: 'greater' },
    rule: 'The sign looks like a bird’s beak: it is always open toward the bigger number.',
    verdict: (left, right, sign) => (sign === 'eq' ? `${left} equals ${right}` : `${left} is ${sign === 'lt' ? 'less' : 'greater'} than ${right}`),
    prompt: (left, right) => `Compare ${left} and ${right}. Which sign goes between them?`,
    yes: (verdict) => `Yes! ${verdict[0].toUpperCase()}${verdict.slice(1)}.`,
    hint: (rule, left, right) => `${rule} Work out how much is on the left and how much on the right: ${left} on the left, ${right} on the right.`,
  },

  clock: {
    say: ({ h, m }) => {
      const next = numberWords((h % 12) + 1);
      if (m === 0) return `${numberWords(h)} o’clock`;
      if (m === 30) return `half past ${numberWords(h)}`;
      if (m === 15) return `a quarter past ${numberWords(h)}`;
      if (m === 45) return `a quarter to ${next}`;
      return `${numberWords(h)} ${m < 10 ? `oh ${numberWords(m)}` : numberWords(m)}`;
    },
    intro: {
      hours: 'A clock has two hands. The short one shows the hours. When the long hand points straight up, at twelve, it is exactly on the hour. Look where the short hand is pointing!',
      half: 'When the long hand points down, at six, half an hour has passed. The short hand is then between two numbers.',
      quarter: 'The long hand on three means a quarter of an hour has passed. And when it is on nine, there is a quarter left until the next hour.',
      minutes: 'The long hand shows the minutes. Each number on the clock is five more minutes: one is five, two is ten, three is fifteen.',
    },
    hint: ({ h, m }) => {
      const long = m === 0 ? 'points up, at twelve' : `points at ${m / 5}`;
      const short = m === 0 ? `points at ${h}` : `has already passed ${h}`;
      return `The short hand ${short}, and the long hand ${long}. The short one is for hours, the long one for minutes.`;
    },
    yes: (time) => `Yes, it is ${time}!`,
    find: (time) => `Find the clock that shows ${time}.`,
    read: 'What time is it on the clock?',
  },

  maze: {
    negatives: ' Now there are negative numbers here too — with a minus sign. They divide in just the same way: minus twelve can be divided by three, because twelve can be divided by three.',
    deadEnds: ' The maze has grown, and it has dead ends: if the road stops, go back and try another way.',
    table: (k) => `Run along the ${k} times table: ${k}, ${k * 2}, ${k * 3} and so on`,
    divisible: (k) => `Step only on numbers that can be divided by ${k}`,
    hint: (k, deadEnds, negative) =>
      `Look for a neighboring square with a number that divides by ${k} with nothing left over. I will light up the next step.` +
      (deadEnds ? ' If you walk into a dead end, go back.' : '') +
      (negative ? ' The minus sign does not matter: look at the number itself.' : ''),
  },

  shop: {
    toys: ['teddy bear', 'toy car', 'yo-yo', 'ball', 'kite', 'paint set', 'jigsaw puzzle', 'dinosaur', 'train', 'piñata'],
    change: (toy, price, paid) => `The ${toy} costs ${price}. You pay ${paid}. What is the change?`,
    buy: (toy, price) => `Buy a toy: the ${toy}. The price is ${price}. Put the money on the counter.`,
    changeHint: (paid, price) => `Take ${price} away from ${paid}. You can count on from ${price} up to ${paid}.`,
    payHint: (price) => `Start with the biggest money that is not more than ${price}, then add smaller ones.`,
  },

  geometry: {
    figures: [
      ['an ice cream', 'This is an ice cream: a round scoop and a triangle cone.'],
      ['a mushroom', 'This is a mushroom: a triangle cap and a square stem.'],
      ['a lollipop', 'This is a lollipop: a round treat on a stick.'],
      ['a house', 'This is a house: square walls and a triangle roof.'],
      ['a snowman', 'This is a snowman: three circles — a small one, a middle one and a big one.'],
      ['a candy', 'This is a candy: a round middle and two little triangle tails.'],
      ['a fir tree', 'This is a fir tree: two triangles and a small trunk.'],
      ['a fish', 'This is a fish: a round body and a triangle tail.'],
      ['a boat', 'This is a boat: a rectangle hull and a triangle sail.'],
      ['a cat', 'This is a cat: a round head, triangle ears and a square body.'],
      ['a truck', 'This is a truck: a long trailer, a square cab and two wheels.'],
      ['a flower', 'This is a flower: three round petals on a stem.'],
      ['a rocket', 'This is a rocket: a pointed nose, two squares and triangle wings.'],
      ['a train', 'This is a train: a long car, a cab and three wheels.'],
      ['a butterfly', 'This is a butterfly: a round body, a little head and two triangle wings.'],
      ['a robot', 'This is a robot: a square head, a body, two arms and two legs.'],
      ['a castle', 'This is a castle: a long wall, three towers and two pointed roofs.'],
      ['a teddy bear', 'This is a teddy bear — it is made of circles all over: head, ears, body and paws.'],
      ['a duckling', 'This is a duckling: a round body and head, a beak, a tail and feet.'],
      ['a bus', 'This is a bus: a long body, three wheels and two suitcases on the roof.'],
      ['a little man', 'This is a little man: a round head, a square body, arms and legs.'],
      ['a palace', 'This is a palace: a wall, three towers, two roofs and a flag on top.'],
      ['a steam engine', 'This is a steam engine: a car, a cab, three wheels, a funnel and a puff of smoke.'],
      ['a dinosaur', 'This is a dinosaur: a long body, a neck, a head, a tail, legs and spikes on its back.'],
    ],
    build: (name) => `Build this from the shapes: ${name}`,
    buildHint: 'Find the outline of the same shape and the same size.',
    count: (name, shape) => `Look at the picture: ${name}. How many ${SHAPES[shape]} are there?`,
    countHint: (shape) => `Look only for the ${SHAPES[shape]}. Touch each one with your finger and count out loud.`,
    areaRead: 'What is the area of this shape? Count the colored squares.',
    areaIs: (area) => `Yes! The area of the shape is ${area}: it has exactly that many squares.`,
    areaHint: 'Area is the number of squares a shape takes up. Touch each colored square and count.',
    pens: ['the sheep', 'the rabbit', 'the chicks', 'the piglet', 'the little goat', 'the foal'],
    pen: (animal, area) => `Build a pen for ${animal} with an area of ${s(area, 'square')}.`,
    penDone: (area) => `A great pen! Its area is ${s(area, 'square')}.`,
    penHint: (area) => `Area is the number of squares. Color in exactly ${s(area, 'square')} next to one another.`,
    perimeterRead: 'What is the perimeter of this shape? Go around its edge and count the sides of the squares.',
    perimeterIs: (length) => `Yes! The perimeter is ${length}: that is how many square sides there are along the edge of the shape.`,
    perimeterHint: 'Perimeter is the length of a fence around the shape. Run your finger along the edge and count each side of a square.',
    longest: 'Find the shape with the biggest perimeter',
    longestIs: (length) => `Yes! Its perimeter is ${length}: that is how many square sides you have to walk around.`,
    longestHint: 'Perimeter is the length of a fence around the shape. Go around each shape with your finger and count the square sides along the edge.',
    intro: {
      figures: 'Build a picture from shapes! Drag each shape onto the outline of the same form. And we will also count which shapes the picture is made of.',
      area: 'Area is how many squares a shape takes up. Count the colored squares, or color in as many as you are asked.',
      perimeter: 'Perimeter is the length of a fence around a shape. Go around the edge of the shape and count the sides of the squares.',
    },
  },

  money: (id) => {
    const m = MONEY[id];
    return { short: m.short, sum: (n) => s(n, m.one, m.many), measure: measure(m.short, m.one, m.small, m.smallMany, m.rule, m.many) };
  },
};
