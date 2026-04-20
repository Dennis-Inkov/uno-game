import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Card, CardColor } from '@uno/shared';
import socket from '../socket';
import { useRoomStore } from '../store/roomStore';
import { useGameStore } from '../store/gameStore';
import { useGameSocket } from '../hooks/useGameSocket';
import { useGameAnimations } from '../hooks/useGameAnimations';
import { GameRefsProvider, useGameRefs } from '../context/GameRefsContext';
import GameBoard from '../components/board/GameBoard';
import CardHand from '../components/card/CardHand';
import PlayerSeat from '../components/player/PlayerSeat';
import ColorPicker from '../components/ui/ColorPicker';
import UnoButton from '../components/ui/UnoButton';
import GameLog from '../components/ui/GameLog';
import WinnerModal from '../components/ui/WinnerModal';
import FlyingCard, { type FlyAnim } from '../components/animation/FlyingCard';

function GamePageInner() {
  const navigate = useNavigate();
  const { myId, room, reset: resetRoom } = useRoomStore();
  const { gameState, myHand, events, reset: resetGame } = useGameStore();
  const [pendingCard, setPendingCard] = useState<Card | null>(null);
  const [flyAnims, setFlyAnims] = useState<FlyAnim[]>([]);
  const { refs, setPlayerSeatRef } = useGameRefs();

  useGameSocket();

  const addFlyAnim = useCallback((anim: FlyAnim) => {
    setFlyAnims(prev => [...prev, anim]);
  }, []);

  const removeFlyAnim = useCallback((id: string) => {
    setFlyAnims(prev => prev.filter(a => a.id !== id));
  }, []);

  useGameAnimations(gameState, myId ?? null, refs, addFlyAnim);

  if (!gameState || !myId) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'rgba(255,255,255,0.3)', fontFamily: 'Outfit',
      }}>
        Загрузка...
      </div>
    );
  }

  const myIndex = gameState.players.findIndex(p => p.id === myId);
  const isMyTurn = gameState.players[gameState.currentPlayerIndex]?.id === myId;
  const myPublicPlayer = gameState.players[myIndex];
  const opponents = gameState.players.filter(p => p.id !== myId);
  const isHost = room?.hostId === myId;

  // Can the current user catch someone who forgot UNO?
  const unoCatchTarget = gameState.players.find(p => p.unoPenaltyPending && p.id !== myId);

  // Is there a round/game over event with points?
  const roundEvent = [...events].reverse().find(e => e.type === 'round_over' || e.type === 'game_over_final');
  const roundPoints = roundEvent?.detail ? parseInt(roundEvent.detail, 10) : null;
  const isGameOver = gameState.players.some(p => (gameState.scores[p.id] ?? 0) >= 500);

  const handlePlayCard = (card: Card) => {
    if (card.value === 'wild' || card.value === 'wild_draw4') {
      setPendingCard(card);
    } else {
      socket.emit('game:play-card', { cardId: card.id });
    }
  };

  const handleColorChosen = (color: CardColor) => {
    if (pendingCard) {
      socket.emit('game:play-card', { cardId: pendingCard.id, chosenColor: color });
      setPendingCard(null);
    } else if (gameState.pendingColorChoice) {
      socket.emit('game:play-card', { cardId: gameState.discardTopCard.id, chosenColor: color });
    }
  };

  const handleDraw = () => { socket.emit('game:draw-card'); };
  const handleUno = () => { socket.emit('game:say-uno'); };
  const handleChallenge = () => { socket.emit('game:challenge-draw4'); };
  const handleCatchUno = () => { socket.emit('game:catch-uno'); };

  const handleNextRound = () => { socket.emit('room:next-round'); };

  const handleLeave = () => {
    socket.emit('room:leave');
    resetRoom();
    resetGame();
    navigate('/');
  };

  const handleExitClick = () => {
    if (window.confirm('Выйти из игры? Противник получит победу в раунде.')) {
      handleLeave();
    }
  };

  const handleSurrenderClick = () => {
    if (window.confirm('Сдаться и завершить раунд?')) {
      socket.emit('room:surrender');
    }
  };

  const showColorPicker = pendingCard !== null || (gameState.pendingColorChoice && isMyTurn);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#080810' }}>
      {/* Background ambient glow */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 70% 50% at 50% 40%, rgba(0,50,20,0.3) 0%, transparent 70%)',
      }} />

      {/* Top-right game controls */}
      {!gameState.winner && (
        <div style={{
          position: 'fixed', top: 14, right: 16, zIndex: 50,
          display: 'flex', gap: 8,
        }}>
          <button
            onClick={handleSurrenderClick}
            style={{
              padding: '6px 14px', borderRadius: 12,
              fontFamily: 'Outfit', fontWeight: 700, fontSize: 12,
              background: 'rgba(255,45,78,0.15)', color: 'rgba(255,100,120,0.9)',
              border: '1px solid rgba(255,45,78,0.3)', cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,45,78,0.28)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,45,78,0.15)'; }}
          >
            Сдаться
          </button>
          <button
            onClick={handleExitClick}
            style={{
              padding: '6px 14px', borderRadius: 12,
              fontFamily: 'Outfit', fontWeight: 700, fontSize: 12,
              background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)',
              border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
          >
            Выйти
          </button>
        </div>
      )}

      {/* Opponents row */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
        gap: 10, padding: '16px 16px 8px', position: 'relative', zIndex: 1,
      }}>
        {opponents.map((player) => (
          <PlayerSeat
            key={player.id}
            player={player}
            isCurrentTurn={gameState.players[gameState.currentPlayerIndex]?.id === player.id}
            isMe={false}
            onMount={(el) => setPlayerSeatRef(player.id, el)}
          />
        ))}
      </div>

      {/* Center: log + board + action buttons */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 24, padding: '0 16px', position: 'relative', zIndex: 1,
      }}>
        <GameLog events={events} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <GameBoard gameState={gameState} myId={myId} onDraw={handleDraw} />

          {/* Challenge wild_draw4 button */}
          {isMyTurn && gameState.challengePending && (
            <button
              onClick={handleChallenge}
              style={{
                padding: '8px 20px', borderRadius: 20,
                fontFamily: 'Outfit', fontWeight: 800, fontSize: 13,
                background: 'linear-gradient(135deg, #ff2d4e, #c00023)',
                color: '#fff', border: 'none', cursor: 'pointer',
                boxShadow: '0 0 20px rgba(255,45,78,0.5)',
                animation: 'uno-pulse 1s ease-in-out infinite',
              }}
            >
              Оспорить +4?
            </button>
          )}
        </div>

        {/* Catch UNO button + spacer */}
        <div style={{ width: 170, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
          {unoCatchTarget && (
            <button
              onClick={handleCatchUno}
              style={{
                padding: '8px 16px', borderRadius: 20,
                fontFamily: 'Outfit', fontWeight: 800, fontSize: 12,
                background: 'linear-gradient(135deg, #ffd000, #b08b00)',
                color: '#1a1a00', border: 'none', cursor: 'pointer',
                boxShadow: '0 0 20px rgba(255,208,0,0.5)',
                animation: 'uno-pulse 1s ease-in-out infinite',
                whiteSpace: 'nowrap',
              }}
            >
              Поймать {unoCatchTarget.name}!
            </button>
          )}
        </div>
      </div>

      {/* My info bar */}
      {myPublicPlayer && (
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          gap: 16, padding: '8px 16px', position: 'relative', zIndex: 1,
        }}>
          <PlayerSeat player={myPublicPlayer} isCurrentTurn={isMyTurn} isMe />
          <UnoButton handSize={myHand.length} saidUno={myPublicPlayer.saidUno} onUno={handleUno} />
        </div>
      )}

      {/* My hand */}
      <div style={{ paddingBottom: 20, position: 'relative', zIndex: 1, overflowX: 'auto' }}>
        <CardHand
          hand={myHand}
          gameState={gameState}
          myId={myId}
          onPlayCard={handlePlayCard}
          isMyTurn={isMyTurn}
        />
      </div>

      {/* Modals */}
      {showColorPicker && <ColorPicker onChoose={handleColorChosen} />}
      {gameState.winner && (
        <WinnerModal
          gameState={gameState}
          myId={myId}
          isHost={isHost}
          isGameOver={isGameOver}
          roundPoints={roundPoints}
          onNextRound={handleNextRound}
          onLeave={handleLeave}
        />
      )}

      {/* Flying card overlay */}
      {flyAnims.map(anim => (
        <FlyingCard key={anim.id} {...anim} onDone={() => removeFlyAnim(anim.id)} />
      ))}
    </div>
  );
}

export default function GamePage() {
  return (
    <GameRefsProvider>
      <GamePageInner />
    </GameRefsProvider>
  );
}
