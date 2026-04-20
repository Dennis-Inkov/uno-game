import { create } from 'zustand';
import type { PublicGameState, Card, GameEvent } from '@uno/shared';

interface GameStore {
  gameState: PublicGameState | null;
  myHand: Card[];
  events: GameEvent[];
  setGameState: (state: PublicGameState) => void;
  setMyHand: (hand: Card[]) => void;
  addEvent: (event: GameEvent) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: null,
  myHand: [],
  events: [],
  setGameState: (gameState) => set(s => ({
    gameState,
    // Clear events log when a new round starts (previous state had winner, new doesn't)
    events: s.gameState?.winner && !gameState.winner ? [] : s.events,
  })),
  setMyHand: (myHand) => set({ myHand }),
  addEvent: (event) => set((s) => ({ events: [...s.events.slice(-19), event] })),
  reset: () => set({ gameState: null, myHand: [], events: [] }),
}));
