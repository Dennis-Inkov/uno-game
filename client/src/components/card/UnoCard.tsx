import type { Card } from '@uno/shared';

const COLOR_CLASS: Record<string, string> = {
  red: 'card-red',
  green: 'card-green',
  blue: 'card-blue',
  yellow: 'card-yellow',
  wild: 'card-wild',
};

const LABEL: Record<string, string> = {
  skip: '⊘',
  reverse: '↺',
  draw2: '+2',
  wild: '★',
  wild_draw4: '+4',
};

const LABEL_SIZE: Record<string, string> = {
  skip: 'text-3xl',
  reverse: 'text-3xl',
  draw2: 'text-2xl',
  wild: 'text-3xl',
  wild_draw4: 'text-2xl',
};

interface Props {
  card: Card;
  playable?: boolean;
  onClick?: () => void;
  small?: boolean;
  className?: string;
}

export default function UnoCard({ card, playable = false, onClick, small = false, className }: Props) {
  const colorClass = COLOR_CLASS[card.color] ?? 'card-wild';
  const label = LABEL[card.value] ?? card.value;
  const isWild = card.color === 'wild';
  const isAction = card.value in LABEL;

  const w = small ? 38 : 64;
  const h = small ? 52 : 96;

  return (
    <div
      onClick={playable && onClick ? onClick : undefined}
      className={`card-base ${colorClass} ${playable && onClick ? 'card-playable' : ''} ${!playable && onClick ? 'card-dim' : ''} ${className ?? ''}`}
      style={{ width: w, height: h, flexShrink: 0 }}
      title={`${card.color !== 'wild' ? card.color + ' ' : ''}${card.value}`}
    >
      {/* Top-left corner */}
      <div className="absolute top-1 left-1.5 leading-none">
        <div className="font-mono font-bold text-white/80" style={{ fontSize: small ? 9 : 11 }}>
          {label}
        </div>
      </div>

      {/* Center design */}
      <div className="absolute inset-0 flex items-center justify-center">
        {isWild ? (
          /* Rainbow pinwheel for wild */
          <div className="relative" style={{ width: small ? 20 : 36, height: small ? 20 : 36 }}>
            <div style={{
              width: '100%', height: '100%', borderRadius: '50%',
              background: 'conic-gradient(#ff2d4e 0deg 90deg, #ffd000 90deg 180deg, #00c96b 180deg 270deg, #1a8cff 270deg 360deg)',
              boxShadow: '0 0 12px rgba(255,255,255,0.3)',
            }} />
          </div>
        ) : (
          <div className="relative flex items-center justify-center"
               style={{
                 width: small ? 22 : 42, height: small ? 30 : 58,
                 borderRadius: '50%',
                 background: 'rgba(255,255,255,0.15)',
                 border: '2px solid rgba(255,255,255,0.25)',
                 transform: 'rotate(-25deg)',
               }}>
            <span className={`font-body font-black text-white ${small ? 'text-base' : (isAction ? LABEL_SIZE[card.value] : 'text-2xl')}`}
                  style={{ transform: 'rotate(25deg)', lineHeight: 1, textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>
              {label}
            </span>
          </div>
        )}
      </div>

      {/* Bottom-right corner (rotated) */}
      <div className="absolute bottom-1 right-1.5 leading-none rotate-180">
        <div className="font-mono font-bold text-white/80" style={{ fontSize: small ? 9 : 11 }}>
          {label}
        </div>
      </div>
    </div>
  );
}
