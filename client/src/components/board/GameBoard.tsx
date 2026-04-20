import type { PublicGameState } from '@uno/shared';
import DiscardPile from './DiscardPile';
import DrawPile from './DrawPile';

interface Props {
  gameState: PublicGameState;
  myId: string;
  onDraw: () => void;
}

export default function GameBoard({ gameState, myId, onDraw }: Props) {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isMyTurn = currentPlayer?.id === myId;
  const canDraw = isMyTurn && !gameState.winner && !gameState.pendingColorChoice;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      {/* Turn indicator */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: '6px 14px',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          {gameState.direction === 1 ? '→' : '←'} ход:
        </span>
        <span style={{ fontSize: 13, color: isMyTurn ? '#ffd000' : 'rgba(255,255,255,0.7)', fontFamily: 'Outfit', fontWeight: 700 }}>
          {isMyTurn ? 'Ваш ход!' : (currentPlayer?.name ?? '...')}
        </span>
      </div>

      {/* Felt table */}
      <div className="table-felt" style={{
        width: 260, height: 180,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32,
      }}>
        <DrawPile
          count={gameState.drawPileCount}
          drawAccumulator={gameState.drawAccumulator}
          onClick={onDraw}
          canDraw={canDraw}
        />
        <DiscardPile topCard={gameState.discardTopCard} currentColor={gameState.currentColor} />
      </div>
    </div>
  );
}
