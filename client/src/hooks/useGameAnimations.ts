import { useCallback, useEffect, useRef } from 'react';
import type { PublicGameState } from '@uno/shared';
import type { FlyAnim } from '../components/animation/FlyingCard';
import type { GameRefs } from '../context/GameRefsContext';

export function useGameAnimations(
  gameState: PublicGameState | null,
  myId: string | null,
  refs: React.MutableRefObject<GameRefs>,
  addFlyAnim: (anim: FlyAnim) => void,
) {
  const prevState = useRef<PublicGameState | null>(null);
  const addFly = useCallback(addFlyAnim, [addFlyAnim]);

  useEffect(() => {
    if (!gameState || !myId) {
      prevState.current = gameState;
      return;
    }

    const prev = prevState.current;
    prevState.current = gameState;
    if (!prev) return;

    const drawEl = refs.current.drawPile;
    const discardEl = refs.current.discardPile;

    // ── Card played: discard top changed ──────────────────────────────
    if (prev.discardTopCard.id !== gameState.discardTopCard.id && discardEl) {
      const toRect = discardEl.getBoundingClientRect();
      const prevPlayer = prev.players[prev.currentPlayerIndex];

      if (prevPlayer) {
        const fromEl =
          prevPlayer.id === myId
            ? refs.current.myHand
            : (refs.current.playerSeats.get(prevPlayer.id) ?? null);

        if (fromEl) {
          addFly({
            id: `play-${Date.now()}`,
            from: fromEl.getBoundingClientRect(),
            to: toRect,
            card: gameState.discardTopCard,
          });
        }
      }
    }

    // ── Card(s) drawn: handSize increased, discard unchanged ───────────
    if (prev.discardTopCard.id === gameState.discardTopCard.id && drawEl) {
      const drawRect = drawEl.getBoundingClientRect();

      gameState.players.forEach((player, i) => {
        const prevPlayer = prev.players[i];
        if (!prevPlayer) return;
        const diff = player.handSize - prevPlayer.handSize;
        if (diff <= 0) return;

        const toEl =
          player.id === myId
            ? refs.current.myHand
            : (refs.current.playerSeats.get(player.id) ?? null);
        if (!toEl) return;
        const toRect = toEl.getBoundingClientRect();

        const count = Math.min(diff, 6);
        for (let j = 0; j < count; j++) {
          setTimeout(() => {
            addFly({
              id: `draw-${player.id}-${Date.now()}-${j}`,
              from: drawRect,
              to: toRect,
              // No card face: we don't know the exact card (only server does)
            });
          }, j * 140);
        }
      });
    }
  }, [gameState, myId, refs, addFly]);
}
