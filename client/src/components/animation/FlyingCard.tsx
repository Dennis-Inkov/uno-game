import { useEffect, useRef, useState } from 'react';
import type { Card } from '@uno/shared';
import UnoCard from '../card/UnoCard';
import CardBack from '../card/CardBack';

export interface FlyAnim {
  id: string;
  from: DOMRect;
  to: DOMRect;
  card?: Card;
}

interface Props extends FlyAnim {
  onDone: () => void;
}

const DURATION = 480;

export default function FlyingCard({ from, to, card, onDone }: Props) {
  const [active, setActive] = useState(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    // Double RAF so the initial position renders before transition kicks in
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setActive(true))
    );
    const t = setTimeout(() => onDoneRef.current(), DURATION + 40);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, []);

  const cardW = card ? 64 : 52;
  const cardH = card ? 96 : 72;

  // Anchor at center of `from`, translate to center of `to`
  const anchorX = from.left + from.width / 2 - cardW / 2;
  const anchorY = from.top + from.height / 2 - cardH / 2;

  const dx = active ? to.left + to.width / 2 - (from.left + from.width / 2) : 0;
  const dy = active ? to.top + to.height / 2 - (from.top + from.height / 2) : 0;

  // Arc: card tilts in direction of travel
  const rotate = active ? (dx > 0 ? 14 : -14) : 0;

  return (
    <div
      style={{
        position: 'fixed',
        left: anchorX,
        top: anchorY,
        width: cardW,
        height: cardH,
        transform: `translate(${dx}px, ${dy}px) rotate(${rotate}deg)`,
        transition: active
          ? `transform ${DURATION}ms cubic-bezier(0.25, 1.2, 0.5, 1)`
          : 'none',
        pointerEvents: 'none',
        zIndex: 9999,
        willChange: 'transform',
        filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.6))',
      }}
    >
      {card ? <UnoCard card={card} /> : <CardBack />}
    </div>
  );
}
