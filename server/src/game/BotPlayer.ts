import type { Card, CardColor, GameState, Player } from '@uno/shared';
import { isValidPlay } from './GameEngine';

export type BotAction =
  | { type: 'play'; card: Card; chosenColor?: CardColor }
  | { type: 'draw' };

export function botChooseAction(hand: Card[], state: GameState): BotAction {
  const fakePlayer = { hand } as Player;
  let playable = hand.filter(c => isValidPlay(c, state, fakePlayer));

  // When draw is accumulated, bot can only stack +2/+4 or draw
  if (state.drawAccumulator > 0) {
    playable = playable.filter(c => c.value === 'draw2' || c.value === 'wild_draw4');
  }

  if (playable.length === 0) return { type: 'draw' };

  // Priority: action cards > number cards > wild > wild_draw4
  const priority = (c: Card): number => {
    if (c.value === 'wild_draw4') return 0;
    if (c.value === 'wild') return 1;
    if (c.value === 'draw2' || c.value === 'skip' || c.value === 'reverse') return 3;
    return 2;
  };

  playable.sort((a, b) => priority(b) - priority(a));
  const pick = playable[0];

  let chosenColor: CardColor | undefined;
  if (pick.color === 'wild') {
    chosenColor = mostCommonColor(hand);
  }

  return { type: 'play', card: pick, chosenColor };
}

function mostCommonColor(hand: Card[]): CardColor {
  const counts: Record<string, number> = { red: 0, green: 0, blue: 0, yellow: 0 };
  for (const c of hand) {
    if (c.color !== 'wild') counts[c.color]++;
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return (sorted[0][0] as CardColor) || 'red';
}

export function scheduleUnoCall(player: Player, onUno: () => void): void {
  const delay = 300 + Math.random() * (600000 - 300);
  setTimeout(onUno, delay);
}
