import type { Card, CardColor, GameState, Player, PublicGameState, PublicPlayer, Room } from '@uno/shared';
import { createDeck, shuffle } from './Deck';

export function createInitialGameState(players: Player[]): GameState {
  const deck = createDeck();

  // Deal 7 cards to each player
  for (const player of players) {
    player.hand = deck.splice(0, 7);
    player.handSize = player.hand.length;
    player.saidUno = false;
    player.unoPenaltyPending = false;
    player.status = 'playing';
  }

  // Find first non-wild card for discard pile
  let firstCardIndex = deck.findIndex(c => c.color !== 'wild');
  if (firstCardIndex === -1) firstCardIndex = 0;
  const [firstCard] = deck.splice(firstCardIndex, 1);

  return {
    drawPile: deck,
    discardPile: [firstCard],
    currentPlayerIndex: 0,
    direction: 1,
    currentColor: firstCard.color,
    drawAccumulator: 0,
    winner: null,
    lastHandBeforeWD4: null,
    pendingColorChoice: false,
  };
}

export function isValidPlay(card: Card, state: GameState, player: Player): boolean {
  const top = state.discardPile[state.discardPile.length - 1];
  if (card.value === 'wild') return true;
  if (card.value === 'wild_draw4') {
    // Can only play wild_draw4 if no cards of the current color in hand
    return !player.hand.some(c => c.color === state.currentColor);
  }
  if (card.color === state.currentColor) return true;
  if (card.value === top.value) return true;
  return false;
}

export function calcCardPoints(card: Card): number {
  if (card.value === 'skip' || card.value === 'reverse' || card.value === 'draw2') return 20;
  if (card.value === 'wild' || card.value === 'wild_draw4') return 50;
  return parseInt(card.value, 10);
}

export function calcRoundScore(players: Player[]): number {
  return players
    .filter(p => p.status !== 'won')
    .flatMap(p => p.hand)
    .reduce((sum, c) => sum + calcCardPoints(c), 0);
}

export function drawCards(state: GameState, player: Player, count: number): void {
  for (let i = 0; i < count; i++) {
    if (state.drawPile.length === 0) reshuffleDiscardIntoDraw(state);
    if (state.drawPile.length === 0) break;
    const card = state.drawPile.shift()!;
    player.hand.push(card);
  }
  player.handSize = player.hand.length;
  player.saidUno = false;
}

function reshuffleDiscardIntoDraw(state: GameState): void {
  const top = state.discardPile.pop()!;
  state.drawPile = shuffle(state.discardPile);
  state.discardPile = [top];
}

export function nextPlayerIndex(state: GameState, players: Player[], skip = 0): number {
  let idx = state.currentPlayerIndex;
  for (let i = 0; i <= skip; i++) {
    idx = (idx + state.direction + players.length) % players.length;
  }
  return idx;
}

export function applyCardEffect(
  card: Card,
  chosenColor: CardColor | undefined,
  state: GameState,
  players: Player[],
): { skipExtra: number; pendingColorChoice: boolean } {
  let skipExtra = 0;
  let pendingColorChoice = false;

  state.discardPile.push(card);

  switch (card.value) {
    case 'skip':
      skipExtra = 1;
      state.currentColor = card.color;
      break;

    case 'reverse':
      state.direction = (state.direction * -1) as 1 | -1;
      if (players.length === 2) skipExtra = 1; // reverse acts as skip in 2-player
      state.currentColor = card.color;
      break;

    case 'draw2':
      state.drawAccumulator += 2;
      // skipExtra = 0: victim becomes current player and must decide (stack or draw)
      state.currentColor = card.color;
      break;

    case 'wild':
      if (chosenColor) {
        state.currentColor = chosenColor;
      } else {
        pendingColorChoice = true;
      }
      break;

    case 'wild_draw4':
      state.drawAccumulator += 4;
      // skipExtra = 0: victim becomes current player and can challenge or accept
      if (chosenColor) {
        state.currentColor = chosenColor;
      } else {
        pendingColorChoice = true;
      }
      break;

    default:
      state.currentColor = card.color;
      break;
  }

  state.pendingColorChoice = pendingColorChoice;
  return { skipExtra, pendingColorChoice };
}

export function advanceTurn(state: GameState, players: Player[], skipExtra = 0): void {
  state.currentPlayerIndex = nextPlayerIndex(state, players, skipExtra);
}

export function getPublicState(room: Room): PublicGameState {
  const state = room.game!;
  const top = state.discardPile[state.discardPile.length - 1];
  return {
    discardTopCard: top,
    currentColor: state.currentColor,
    currentPlayerIndex: state.currentPlayerIndex,
    direction: state.direction,
    drawPileCount: state.drawPile.length,
    drawAccumulator: state.drawAccumulator,
    winner: state.winner,
    pendingColorChoice: state.pendingColorChoice,
    challengePending: state.lastHandBeforeWD4 !== null,
    scores: room.scores,
    players: room.players.map(p => toPublicPlayer(p)),
  };
}

export function toPublicPlayer(p: Player): PublicPlayer {
  return {
    id: p.id,
    name: p.name,
    isBot: p.isBot,
    handSize: p.handSize,
    saidUno: p.saidUno,
    status: p.status,
    unoPenaltyPending: p.unoPenaltyPending,
  };
}

export function checkUno(player: Player): boolean {
  return player.hand.length === 1;
}

export function checkWin(player: Player): boolean {
  return player.hand.length === 0;
}
