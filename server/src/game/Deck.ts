import type { Card, CardColor, CardValue } from '@uno/shared';

const COLORS: CardColor[] = ['red', 'green', 'blue', 'yellow'];
const NUMBERS: CardValue[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const ACTIONS: CardValue[] = ['skip', 'reverse', 'draw2'];

let cardCounter = 0;

function makeCard(color: CardColor, value: CardValue): Card {
  return { id: `${color}_${value}_${cardCounter++}`, color, value };
}

export function createDeck(): Card[] {
  const deck: Card[] = [];

  for (const color of COLORS) {
    // One 0 per color
    deck.push(makeCard(color, '0'));
    // Two of each 1-9 and action cards
    for (const val of [...NUMBERS.slice(1), ...ACTIONS]) {
      deck.push(makeCard(color, val));
      deck.push(makeCard(color, val));
    }
  }

  // 4 Wild + 4 Wild Draw 4
  for (let i = 0; i < 4; i++) {
    deck.push(makeCard('wild', 'wild'));
    deck.push(makeCard('wild', 'wild_draw4'));
  }

  return shuffle(deck);
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
