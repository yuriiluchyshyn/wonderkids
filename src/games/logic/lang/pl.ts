import type { LogicTexts } from './types';

/** The Logic galaxy in Polish. */

const UNIT_SIZE = ['', '', 'dwóch', 'trzech', 'czterech'];

export const pl: LogicTexts = {
  cards: {
    title: 'Logika',
    games: {
      patterns: {
        label: 'Rytm i wzory',
        blurb: 'Odgadnij zasadę i dokończ wzór',
        intro: 'Obrazki stoją w rzędzie według zasady i powtarzają się. Odgadnij tę zasadę i powiedz, co powinno być w miejscu znaku zapytania!',
      },
      shadows: {
        label: 'Lotto z cieniami',
        blurb: 'Znajdź cień każdego obrazka',
        intro: 'Każdy przedmiot ma cień — czarny kształt dokładnie taki sam jak on. Przeciągnij każdy obrazek na jego cień!',
      },
      mirror: {
        label: 'Lustro',
        blurb: 'Dorysuj drugą połówkę — jak w lustrze',
        intro: 'Narysowana jest tu tylko lewa połówka obrazka. Prawa ma być taka sama, tylko odbita jak w lustrze. Znajdź ją!',
      },
      riddles: {
        label: 'Zagadki logiczne',
        blurb: 'Małe historyjki, w których trzeba nie liczyć, tylko pomyśleć',
        intro: 'Posłuchaj krótkiej historyjki i pomyśl. Tu nie trzeba długo liczyć — trzeba się domyślić! Jeśli chcesz, naciśnij głośnik, a przeczytam zagadkę jeszcze raz.',
      },
    },
  },
  introFor: {
    patterns: (step) => {
      if (step === 3) return 'Teraz znak zapytania stoi w środku rzędu. Zobacz, co powtarza się przed nim i po nim.';
      if (step === 4) return 'Wzory robią się dłuższe: teraz powtarzają się trzy różne obrazki.';
      if (step === 7) return 'Uwaga: teraz obrazki mogą stać parami — dwa takie same obok siebie.';
      return undefined;
    },
    shadows: (step) => {
      if (step === 4) return 'Teraz na planszy są rzeczy jednego rodzaju — ich cienie są do siebie bardziej podobne. Przyglądaj się szczegółom!';
      if (step === 7) return 'Teraz cienie chodzą parami: dwa bardzo podobne i jeszcze dwa bardzo podobne. Nie pomyl ich!';
      if (step === 9) return 'Najtrudniejsze: wszystkie cienie są prawie takie same, jak u psa, wilka i lisa. Patrz bardzo uważnie!';
      return undefined;
    },
    mirror: (step) => {
      if (step === 3) return 'A teraz połówki prawdziwych obrazków: motyla, serduszka, choinki. Znajdź drugą połówkę!';
      if (step === 7) return 'Teraz połówki są do siebie bardzo podobne: różnią się jedną albo dwiema kratkami. Sprawdzaj każdą!';
      return undefined;
    },
    riddles: (step) => {
      if (step === 11) return 'Teraz szukamy reguły: według jakiego prawa idą liczby? I uczymy się nie zapominać o tym, o kim jest mowa.';
      if (step === 21) return 'Nowe zagadki — o dniach tygodnia, o cięciach i kawałkach oraz o tym, co powtarza się w kółko.';
      if (step === 31) return 'Teraz do odpowiedzi prowadzą dwa kroki: najpierw dowiedz się jednego, a potem — drugiego.';
      if (step === 41) return 'Najtrudniejsze: kilka wskazówek naraz. Skreślaj to, czego być nie może — i zostanie odpowiedź.';
      return undefined;
    },
  },
  patterns: {
    prompt: 'Który obrazek powinien być w miejscu znaku zapytania?',
    hint: (unit) => `Nazywaj obrazki na głos po kolei. Powtarza się tu kawałek z ${UNIT_SIZE[unit]} obrazków.`,
  },
  shadows: {
    prompt: 'Znajdź cień każdego obrazka.',
    hint: 'Przyjrzyj się kształtom: uszy, ogon, koła. Cień ma taki sam kształt jak obrazek.',
  },
  mirror: {
    prompt: 'To lewa połówka obrazka. Znajdź prawą — taką jak w lustrze.',
    hint: 'Wyobraź sobie lustro pośrodku. Kratka, która stoi przy lustrze z lewej strony, będzie przy nim także z prawej.',
    figures: ['Motyl', 'Serduszko', 'Choinka', 'Domek', 'Rakieta', 'Grzyb', 'Puchar', 'Korona', 'Robot', 'Klucz'],
  },
};
