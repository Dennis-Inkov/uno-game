import type { PublicGameState } from '@uno/shared';
import socket from '../../socket';
import { useRoomStore } from '../../store/roomStore';

interface Props {
  gameState: PublicGameState;
  myId: string;
  isHost: boolean;
  isGameOver: boolean;
  roundPoints: number | null;
  onNextRound: () => void;
  onLeave: () => void;
}

export default function WinnerModal({ gameState, myId, isGameOver, roundPoints, onLeave }: Props) {
  const { room } = useRoomStore();
  const readyIds = room?.readyPlayerIds ?? [];
  const humanPlayers = gameState.players.filter(p => !p.isBot);
  const readyCount = readyIds.filter(id => humanPlayers.some(p => p.id === id)).length;
  const iAmReady = readyIds.includes(myId);

  const handleReady = () => { socket.emit('room:player-ready'); };
  const winner = gameState.players.find(p => p.id === gameState.winner);
  const isMe = gameState.winner === myId;

  const ranked = [...gameState.players].sort((a, b) => {
    const sa = gameState.scores[a.id] ?? 0;
    const sb = gameState.scores[b.id] ?? 0;
    return sb - sa;
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, backdropFilter: 'blur(12px)',
    }}>
      <div className="modal-in" style={{
        background: 'rgba(14,14,24,0.98)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 28,
        padding: '40px 36px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        boxShadow: '0 50px 100px rgba(0,0,0,0.7)',
        textAlign: 'center', maxWidth: 360, width: '90%',
      }}>
        <div style={{ fontSize: 56, lineHeight: 1 }}>
          {isGameOver ? '🏆' : isMe ? '🎉' : winner?.isBot ? '🤖' : '😮'}
        </div>

        <div>
          <h2 style={{
            fontFamily: 'Bebas Neue', fontSize: 38, letterSpacing: 4,
            color: isMe ? '#ffd000' : '#ff2d4e',
            textShadow: isMe ? '0 0 30px rgba(255,208,0,0.5)' : '0 0 30px rgba(255,45,78,0.5)',
            lineHeight: 1,
          }}>
            {isGameOver
              ? (isMe ? 'ПОБЕДА В ИГРЕ!' : 'ИГРА ОКОНЧЕНА')
              : (isMe ? 'РАУНД ВЫИГРАН!' : 'РАУНД ПРОИГРАН')}
          </h2>
          {roundPoints !== null && (
            <p style={{ fontFamily: 'Outfit', fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>
              {winner?.name ?? 'Игрок'} получает <span style={{ color: '#ffd000', fontWeight: 700 }}>+{roundPoints}</span> очков
            </p>
          )}
        </div>

        <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.08)' }} />

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'Outfit', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 2 }}>
            {isGameOver ? 'Финальный счёт' : 'Счёт (до 500)'}
          </div>
          {ranked.map((p, i) => {
            const score = gameState.scores[p.id] ?? 0;
            const isRoundWinner = p.id === gameState.winner;
            const isCurrentUser = p.id === myId;
            return (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '7px 12px', borderRadius: 10,
                background: isRoundWinner ? 'rgba(255,208,0,0.1)' : 'rgba(255,255,255,0.04)',
                border: isRoundWinner ? '1px solid rgba(255,208,0,0.25)' : '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'Space Mono', fontSize: 11, color: 'rgba(255,255,255,0.25)', width: 16 }}>{i + 1}.</span>
                  {p.isBot && <span style={{ fontSize: 12 }}>🤖</span>}
                  <span style={{
                    fontFamily: 'Outfit', fontWeight: 700, fontSize: 13,
                    color: isCurrentUser ? '#ffd000' : isRoundWinner ? '#ffd000' : 'rgba(255,255,255,0.8)',
                  }}>
                    {p.name}{isCurrentUser ? ' (вы)' : ''}
                  </span>
                </div>
                <span style={{ fontFamily: 'Space Mono', fontSize: 14, fontWeight: 700, color: score >= 500 ? '#ffd000' : 'rgba(255,255,255,0.7)' }}>
                  {score}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.08)' }} />

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Ready button — all players */}
          <button onClick={handleReady} style={{
            width: '100%', padding: '13px 0', borderRadius: 14,
            fontFamily: 'Outfit', fontWeight: 800, fontSize: 15,
            background: iAmReady
              ? 'rgba(0,201,107,0.15)'
              : 'linear-gradient(135deg, #00c96b, #007a3d)',
            color: iAmReady ? 'rgba(0,201,107,0.8)' : '#fff',
            border: iAmReady ? '1px solid rgba(0,201,107,0.35)' : '1px solid rgba(0,201,107,0.3)',
            boxShadow: iAmReady ? 'none' : '0 4px 20px rgba(0,201,107,0.3)',
            cursor: 'pointer', transition: 'transform 0.15s ease', letterSpacing: '0.05em',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}
          >
            {iAmReady
              ? 'Отменить'
              : isGameOver ? 'Новая игра' : 'Готов к следующему раунду'}
          </button>

          {/* Ready count indicator */}
          {humanPlayers.length > 1 && (
            <div style={{
              fontFamily: 'Outfit', fontSize: 12,
              color: readyCount > 0 ? 'rgba(0,201,107,0.7)' : 'rgba(255,255,255,0.25)',
              textAlign: 'center', marginTop: -4,
            }}>
              {readyCount} / {humanPlayers.length} игроков готовы
            </div>
          )}

          <button onClick={onLeave} style={{
            width: '100%', padding: '13px 0', borderRadius: 14,
            fontFamily: 'Outfit', fontWeight: 800, fontSize: 15,
            background: 'rgba(255,255,255,0.07)', color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer', transition: 'transform 0.15s ease', letterSpacing: '0.05em',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}
          >
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
}
