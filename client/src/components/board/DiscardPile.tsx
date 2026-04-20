import type { Card, CardColor } from '@uno/shared';
import UnoCard from '../card/UnoCard';
import { useGameRefs } from '../../context/GameRefsContext';

const COLOR_GLOW: Record<string, string> = {
  red:    'rgba(255,45,78,0.7)',
  green:  'rgba(0,201,107,0.7)',
  blue:   'rgba(26,140,255,0.7)',
  yellow: 'rgba(255,208,0,0.7)',
  wild:   'rgba(150,50,255,0.7)',
};

interface Props {
  topCard: Card;
  currentColor: CardColor;
}

export default function DiscardPile({ topCard, currentColor }: Props) {
  const glow = COLOR_GLOW[currentColor] ?? COLOR_GLOW.wild;
  const { setDiscardPileRef } = useGameRefs();

  return (
    <div ref={setDiscardPileRef} style={{ position: 'relative' }}>
      {/* Glow ring */}
      <div style={{
        position: 'absolute', inset: -6, borderRadius: 20,
        boxShadow: `0 0 0 2px ${glow}, 0 0 20px ${glow}`,
        pointerEvents: 'none',
        transition: 'box-shadow 0.4s ease',
      }} />
      <UnoCard card={topCard} />
    </div>
  );
}
