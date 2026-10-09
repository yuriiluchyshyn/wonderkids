import type { LogicTexts } from './types';

/** The Logic galaxy in English. */

const UNIT_SIZE = ['', '', 'two', 'three', 'four'];

export const en: LogicTexts = {
  cards: {
    title: 'Logic',
    games: {
      patterns: {
        label: 'Rhythm and Patterns',
        blurb: 'Work out the rule and carry the pattern on',
        intro: 'The pictures stand in a row by a rule, and they repeat. Work out the rule and say what should stand in place of the question mark!',
      },
      shadows: {
        label: 'Shadow Lotto',
        blurb: 'Find the shadow of each picture',
        intro: 'Every thing has a shadow — a black outline of the very same shape. Drag each picture onto its shadow!',
      },
      mirror: {
        label: 'The Mirror',
        blurb: 'Finish the other half — as in a mirror',
        intro: 'Only the left half of a picture is drawn here. The right half must be the same, only mirrored. Find it!',
      },
      riddles: {
        label: 'Logic Riddles',
        blurb: 'Little stories where you have to think, not count',
        intro: 'Listen to a short story and think. There is no need to count for long here — you have to work it out! If you need to, tap the speaker and I will read the riddle again.',
      },
    },
  },
  introFor: {
    patterns: (step) => {
      if (step === 3) return 'Now the question mark stands in the middle of the row. Look at what repeats before it and after it.';
      if (step === 4) return 'The patterns are getting longer: now three different pictures repeat.';
      if (step === 7) return 'Careful: now pictures can stand in pairs — two of the same in a row.';
      return undefined;
    },
    shadows: (step) => {
      if (step === 4) return 'Now the things on the board are of one kind — their shadows look more alike. Watch the little details!';
      if (step === 7) return 'Now the shadows come in pairs: two that look very alike, and two more that look very alike. Don’t mix them up!';
      if (step === 9) return 'The hardest part: all the shadows are almost the same, like those of a dog, a wolf and a fox. Look very carefully!';
      return undefined;
    },
    mirror: (step) => {
      if (step === 3) return 'And now the halves of real pictures: a butterfly, a heart, a fir tree. Find the other half!';
      if (step === 7) return 'Now the halves look very much alike: they differ by one or two squares. Check each one!';
      return undefined;
    },
    riddles: (step) => {
      if (step === 11) return 'Now we look for the rule: by what law do the numbers go? And we learn not to forget to count the one the story is about.';
      if (step === 21) return 'New riddles — about the days of the week, about cuts and pieces, and about what repeats in a circle.';
      if (step === 31) return 'Now the answer takes two steps: first find out one thing, and then the other.';
      if (step === 41) return 'The hardest of all: several clues at once. Cross out what cannot be — and the answer is left.';
      return undefined;
    },
  },
  patterns: {
    prompt: 'Which picture should stand in place of the question mark?',
    hint: (unit) => `Say the pictures out loud in order. A piece of ${UNIT_SIZE[unit]} pictures repeats here.`,
  },
  shadows: {
    prompt: 'Find the shadow of each picture.',
    hint: 'Look closely at the outlines: ears, a tail, wheels. A shadow has the same shape as the picture.',
  },
  mirror: {
    prompt: 'This is the left half of a picture. Find the right one — just as in a mirror.',
    hint: 'Imagine a mirror in the middle. A square that stands next to the mirror on the left will stand next to it on the right too.',
    figures: ['Butterfly', 'Heart', 'Fir tree', 'House', 'Rocket', 'Mushroom', 'Trophy', 'Crown', 'Robot', 'Key'],
  },
};
