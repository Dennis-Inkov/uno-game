import { useRef } from 'react';
import type { Card, PublicGameState } from '@uno/shared';
import UnoCard from './UnoCard';
import { isCardPlayable } from '../../hooks/useCardPlay';
import { useGameRefs } from '../../context/GameRefsContext';

interface Props {
  hand: Card[];
  gameState: PublicGameState;
  myId: string;
  onPlayCard: (card: Card) => void;
  isMyTurn: boolean;
}

export default function CardHand({ hand, gameState, myId, onPlayCard, isMyTurn }: Props) {
  const prevIds = useRef<Set<string>>(new Set());
  const isFirst = useRef(true);
  const { setMyHandRef } = useGameRefs();

  const newIds = isFirst.current
    ? new Set<string>()
    : new Set(hand.map(c => c.id).filter(id => !prevIds.current.has(id)));
  isFirst.current = false;
  prevIds.current = new Set(hand.map(c => c.id));
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isActuallyMyTurn = isMyTurn && currentPlayer?.id === myId && !gameState.winner && !gameState.pendingColorChoice;

  if (hand.length === 0) {
    return <div className="h-24 flex items-center justify-center text-white/20 text-sm font-body">Нет карт</div>;
  }

  const overlap = hand.length > 10 ? Math.max(8, 64 - hand.length * 3) : 72;

  return (
    <div ref={setMyHandRef} className="flex items-end justify-center px-4 py-2"
         style={{ minHeight: 104 }}>
      <div className="relative flex items-end" style={{ height: 96 }}>
        {hand.map((card, i) => {
          const playable = isActuallyMyTurn && isCardPlayable(card, gameState, hand) &&
            (gameState.drawAccumulator === 0 || card.value === 'draw2' || card.value === 'wild_draw4');

          // Fan angle
          const mid = (hand.length - 1) / 2;
          const angle = (i - mid) * (hand.length > 8 ? 1.5 : 2.5);
          const yOffset = Math.abs(i - mid) * (hand.length > 8 ? 1.5 : 2);

          return (
            <div
              key={card.id}
              style={{
                position: 'absolute',
                left: i * overlap,
                bottom: yOffset,
                transform: `rotate(${angle}deg)`,
                transformOrigin: 'bottom center',
                zIndex: i,
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={e => {
                if (playable) (e.currentTarget as HTMLElement).style.zIndex = '50';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.zIndex = String(i);
              }}
            >
              <UnoCard
                card={card}
                playable={playable}
                onClick={playable ? () => onPlayCard(card) : undefined}
                className={newIds.has(card.id) ? 'card-appear' : ''}
              />
            </div>
          );
        })}
        {/* Invisible spacer to set container width */}
        <div style={{ width: (hand.length - 1) * overlap + 64, height: 1 }} />
      </div>
    </div>
  );
}
