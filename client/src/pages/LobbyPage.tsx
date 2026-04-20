import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import socket from '../socket';
import { useRoomStore } from '../store/roomStore';
import { useGameStore } from '../store/gameStore';
import { useGameSocket } from '../hooks/useGameSocket';

export default function LobbyPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { room, myId } = useRoomStore();
  const { gameState } = useGameStore();

  useGameSocket();

  // Only redirect to game if the room is actually in playing state (not leftover from old game)
  useEffect(() => {
    if (gameState && room?.status === 'playing') {
      navigate(`/game/${room.code}`);
    }
  }, [gameState, room, navigate]);

  useEffect(() => {
    if (!myId) navigate('/');
  }, [myId, navigate]);

  const isHost = room?.hostId === myId;
  const canStart = (room?.players.length ?? 0) >= 2;
  const isFull = (room?.players.length ?? 0) >= 6;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 gap-8">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none"
           style={{ background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(212,175,55,0.05) 0%, transparent 70%)' }} />

      {/* Header */}
      <div className="relative z-10 text-center animate-slide-up">
        <h1 className="font-display text-5xl tracking-widest" style={{ color: '#d4af37', textShadow: '0 0 30px rgba(212,175,55,0.4)' }}>
          ЛОББИ
        </h1>
        <p className="text-white/30 text-xs tracking-widest uppercase font-body mt-1">
          Ожидание игроков
        </p>
      </div>

      {/* Room code */}
      {code && (
        <div className="relative z-10 animate-slide-up text-center" style={{ animationDelay: '0.05s', animationFillMode: 'both' }}>
          <p className="text-white/30 text-xs tracking-widest uppercase font-body mb-2">Код комнаты</p>
          <RoomCode code={code} />
        </div>
      )}

      {/* Players */}
      <div className="relative z-10 w-full max-w-sm animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
        <div style={{ background: 'rgba(20,20,35,0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '20px' }}>
          <p className="text-white/30 text-xs tracking-widest uppercase font-body mb-3">Игроки {room?.players.length ?? 0}/6</p>
          <div className="flex flex-col gap-2">
            {room?.players.map((p) => (
              <div key={p.id}
                   className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                   style={{
                     background: p.id === myId ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.04)',
                     border: p.id === myId ? '1px solid rgba(212,175,55,0.25)' : '1px solid rgba(255,255,255,0.06)',
                   }}>
                <span className="text-lg">{p.isBot ? '🤖' : '🎴'}</span>
                <div className="flex-1">
                  <span className="font-body font-semibold text-sm text-white">
                    {p.name}
                    {p.id === myId && <span className="text-white/35 font-normal ml-1 text-xs">(вы)</span>}
                  </span>
                  {p.id === room?.hostId && (
                    <span className="ml-2 text-xs font-body" style={{ color: '#d4af37' }}>★ Хост</span>
                  )}
                </div>
                <span className="w-2 h-2 rounded-full bg-green-400 opacity-80"></span>
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: Math.max(0, 2 - (room?.players.length ?? 0)) }).map((_, i) => (
              <div key={`e${i}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                   style={{ border: '1px dashed rgba(255,255,255,0.08)' }}>
                <span className="text-lg opacity-20">👤</span>
                <span className="text-white/20 text-sm font-body">Ожидание...</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="relative z-10 w-full max-w-sm flex flex-col gap-3 animate-slide-up" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
        {isHost && (
          <>
            <button
              onClick={() => socket.emit('room:add-bot')}
              disabled={isFull}
              className="w-full py-3 rounded-xl font-body font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-40"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              🤖 Добавить бота
            </button>
            <button
              onClick={() => socket.emit('room:start')}
              disabled={!canStart}
              className="w-full py-3.5 rounded-xl font-body font-bold text-base transition-all active:scale-[0.98] disabled:opacity-40"
              style={{
                background: canStart ? 'linear-gradient(135deg, #00c96b, #007a3d)' : 'rgba(255,255,255,0.07)',
                boxShadow: canStart ? '0 4px 20px rgba(0,201,107,0.35)' : 'none',
                color: '#fff',
                border: canStart ? 'none' : '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {canStart ? '▶ Начать игру' : 'Нужно минимум 2 игрока'}
            </button>
          </>
        )}

        {!isHost && (
          <div className="text-center py-3 text-white/30 text-sm font-body flex items-center justify-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
            Ожидание хоста...
          </div>
        )}

        <button
          onClick={() => { socket.emit('room:leave'); navigate('/'); }}
          className="w-full py-2.5 rounded-xl font-body text-sm transition-all hover:text-white/70 active:scale-[0.98]"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          Покинуть комнату
        </button>
      </div>
    </div>
  );
}

function RoomCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button onClick={copy} className="group flex items-center gap-3 transition-all active:scale-95">
      <span className="font-mono font-bold text-4xl tracking-[0.35em]"
            style={{ color: '#fff', textShadow: '0 0 20px rgba(255,255,255,0.2)' }}>
        {code}
      </span>
      <span className="text-xs font-body transition-all"
            style={{ color: copied ? '#00c96b' : 'rgba(255,255,255,0.3)' }}>
        {copied ? '✓ скопировано' : '⎘ копировать'}
      </span>
    </button>
  );
}

import { useState } from 'react';
