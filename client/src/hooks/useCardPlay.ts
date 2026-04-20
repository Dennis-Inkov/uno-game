import type { Card, PublicGameState } from '@uno/shared';

export function isCardPlayable(card: Card, state: PublicGameState, myHand: Card[]): boolean {
  if (card.value === 'wild') return true;
  if (card.value === 'wild_draw4') {
    // Can only play wild_draw4 if no cards of the current color in hand
    return !myHand.some(c => c.color === state.currentColor);
  }
  if (card.color === state.currentColor) return true;
  if (card.value === state.discardTopCard.value) return true;
  return false;
}
