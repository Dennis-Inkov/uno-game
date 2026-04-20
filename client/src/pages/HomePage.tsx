import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RoomJoinedAck } from '@uno/shared';
import socket from '../socket';
import { useRoomStore } from '../store/roomStore';
import { useGameStore } from '../store/gameStore';
import { useGameSocket } from '../hooks/useGameSocket';

const BG_CARDS = [
  { color: '#ff2d4e', r: '-15deg', x: '8%',  y: '15%', dur: '7s',  delay: '0s' },
  { color: '#1a8cff', r: '20deg',  x: '82%', y: '8%',  dur: '9s',  delay: '1s' },
  { color: '#00c96b', r: '-8deg',  x: '75%', y: '72%', dur: '8s',  delay: '0.5s' },
  { color: '#ffd000', r: '12deg',  x: '5%',  y: '75%', dur: '10s', delay: '2s' },
  { color: '#ff2d4e', r: '25deg',  x: '45%', y: '5%',  dur: '11s', delay: '1.5s' },
  { color: '#1a8cff', r: '-20deg', x: '88%', y: '42%', dur: '8s',  delay: '3s' },
];

export default function HomePage() {
  const [name, setName] = useState(() => localStorage.getItem('uno-name') ?? '');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setMyId, setMyName, reset: resetRoom } = useRoomStore();
  const { reset: resetGame } = useGameStore();
  const nameRef = useRef<HTMLInputElement>(null);

  useGameSocket();

  // Reset any leftover state from previous game
  useEffect(() => {
    resetRoom();
    resetGame();
  }, []);

  const saveName = (n: string) => {
    setName(n);
    localStorage.setItem('uno-name', n);
  };

  const handleCreate = () => {
    if (!name.trim()) { setError('Введите ваше имя'); nameRef.current?.focus(); return; }
    setLoading(true);
    setError('');
    socket.emit('room:create', { playerName: name.trim() }, (res: RoomJoinedAck) => {
      setLoading(false);
      if (res.success && res.roomCode && res.playerId) {
        setMyId(res.playerId);
        setMyName(name.trim());
        navigate(`/lobby/${res.roomCode}`);
      } else {
        setError(res.error ?? 'Ошибка создания комнаты');
      }
    });
  };

  const handleJoin = () => {
    if (!name.trim()) { setError('Введите ваше имя'); nameRef.current?.focus(); return; }
    if (!joinCode.trim()) { setError('Введите код комнаты'); return; }
    setLoading(true);
    setError('');
    socket.emit('room:join', { playerName: name.trim(), roomCode: joinCode.trim().toUpperCase() }, (res: RoomJoinedAck) => {
      setLoading(false);
      if (res.success && res.roomCode && res.playerId) {
        setMyId(res.playerId);
        setMyName(name.trim());
        navigate(`/lobby/${res.roomCode}`);
      } else {
        setError(res.error ?? 'Ошибка подключения');
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Background floating cards */}
      {BG_CARDS.map((c, i) => (
        <div
          key={i}
          className="bg-card fixed w-20 h-28 rounded-2xl border-2 border-white/20"
          style={{
            background: `linear-gradient(145deg, ${c.color}, ${c.color}88)`,
            left: c.x, top: c.y,
            '--r': c.r, '--dur': c.dur, '--delay': c.delay,
          } as React.CSSProperties}
        />
      ))}

      {/* Radial glow behind form */}
      <div className="fixed inset-0 pointer-events-none"
           style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(212,175,55,0.04) 0%, transparent 70%)' }} />

      {/* Logo */}
      <div className="relative z-10 text-center mb-10 animate-slide-up">
        <h1 className="font-display text-[clamp(5rem,15vw,9rem)] leading-none tracking-widest">
          <span style={{ color: '#ff2d4e', textShadow: '0 0 40px rgba(255,45,78,0.6)' }}>U</span>
          <span style={{ color: '#ffd000', textShadow: '0 0 40px rgba(255,208,0,0.6)' }}>N</span>
          <span style={{ color: '#1a8cff', textShadow: '0 0 40px rgba(26,140,255,0.6)' }}>O</span>
        </h1>
        <p className="font-body text-white/40 text-sm tracking-[0.3em] uppercase mt-1">
          Онлайн · Мультиплеер
        </p>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm animate-slide-up"
           style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
        <div style={{
          background: 'rgba(20,20,35,0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px',
          padding: '36px 32px',
          boxShadow: '0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}>
          {/* Name input */}
          <div className="mb-5">
            <label className="block text-white/50 text-xs font-semibold tracking-widest uppercase mb-2">
              Ваше имя
            </label>
            <input
              ref={nameRef}
              value={name}
              onChange={e => saveName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="Как вас зовут?"
              maxLength={20}
              className="uno-input w-full px-4 py-3 text-base font-body"
            />
          </div>

          {/* Create button */}
          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-body font-bold text-base tracking-wide transition-all active:scale-[0.98] disabled:opacity-50 mb-4"
            style={{
              background: 'linear-gradient(135deg, #ff2d4e, #c00023)',
              boxShadow: '0 4px 20px rgba(255,45,78,0.35)',
              color: '#fff',
            }}
          >
            {loading ? 'Создаём...' : 'Создать комнату'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <span className="text-white/25 text-xs tracking-widest uppercase">или</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Join row */}
          <div className="flex gap-2">
            <input
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              placeholder="ABC123"
              maxLength={6}
              className="uno-input flex-1 px-4 py-3 font-mono text-base tracking-[0.25em] uppercase text-center"
            />
            <button
              onClick={handleJoin}
              disabled={loading}
              className="px-5 py-3 rounded-xl font-body font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #1a8cff, #0050bb)',
                boxShadow: '0 4px 20px rgba(26,140,255,0.3)',
                color: '#fff',
              }}
            >
              Войти
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 px-4 py-2.5 rounded-xl text-sm font-body animate-fade-in"
                 style={{ background: 'rgba(255,45,78,0.12)', border: '1px solid rgba(255,45,78,0.25)', color: '#ff8096' }}>
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
