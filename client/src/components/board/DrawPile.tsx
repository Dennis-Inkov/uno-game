import { useRef, useState } from 'react';
import CardBack from '../card/CardBack';
import { useGameRefs } from '../../context/GameRefsContext';

interface Props {
  count: number;
  drawAccumulator: number;
  onClick: () => void;
  canDraw: boolean;
}

export default function DrawPile({ count, drawAccumulator, onClick, canDraw }: Props) {
  const [bouncing, setBouncing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { setDrawPileRef } = useGameRefs();

  const handleClick = () => {
    if (!canDraw || bouncing) return;
    setBouncing(true);
    timerRef.current = setTimeout(() => {
      setBouncing(false);
      onClick();
    }, 420);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div ref={setDrawPileRef} style={{ position: 'relative' }}>
        <button
          onClick={handleClick}
          title={canDraw ? 'Добрать карту' : ''}
          className={bouncing ? 'draw-bounce' : ''}
          style={{
            position: 'relative', cursor: canDraw ? 'pointer' : 'default',
            opacity: canDraw ? 1 : 0.55, background: 'none', border: 'none',
            transition: bouncing ? 'none' : 'transform 0.15s ease',
          }}
          onMouseEnter={e => { if (canDraw && !bouncing) (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px) scale(1.04)'; }}
          onMouseLeave={e => { if (!bouncing) (e.currentTarget as HTMLElement).style.transform = ''; }}
        >
          {/* Stack layers */}
          <div style={{ position: 'absolute', top: 4, left: 4, opacity: 0.25 }}><CardBack /></div>
          <div style={{ position: 'absolute', top: 2, left: 2, opacity: 0.5 }}><CardBack /></div>
          <CardBack />
        </button>
      </div>

      <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'Outfit', fontWeight: 600 }}>
        {count} карт
      </span>

      {drawAccumulator > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #ff2d4e, #c00023)',
          color: '#fff', fontFamily: 'Bebas Neue', fontSize: 16, letterSpacing: 1,
          padding: '2px 10px', borderRadius: 20,
          boxShadow: '0 0 15px rgba(255,45,78,0.6)',
          animation: 'uno-pulse 1s ease-in-out infinite',
        }}>
          +{drawAccumulator}
        </div>
      )}
    </div>
  );
}
