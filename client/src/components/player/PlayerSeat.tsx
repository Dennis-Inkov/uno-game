import type { PublicPlayer } from '@uno/shared';
import CardBack from '../card/CardBack';

interface Props {
  player: PublicPlayer;
  isCurrentTurn: boolean;
  isMe: boolean;
  onMount?: (el: HTMLElement | null) => void;
}

export default function PlayerSeat({ player, isCurrentTurn, isMe, onMount }: Props) {
  const maxCards = 5;
  const shown = Math.min(player.handSize, maxCards);
  const extra = player.handSize - maxCards;

  return (
    <div ref={onMount} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      padding: '10px 14px', borderRadius: 16,
      background: isCurrentTurn ? 'rgba(255,208,0,0.08)' : 'rgba(255,255,255,0.04)',
      border: isCurrentTurn ? '1px solid rgba(255,208,0,0.35)' : '1px solid rgba(255,255,255,0.06)',
      boxShadow: isCurrentTurn ? '0 0 20px rgba(255,208,0,0.15)' : 'none',
      opacity: player.status === 'disconnected' ? 0.35 : 1,
      transition: 'all 0.3s ease',
      minWidth: 90,
    }}>
      {/* Mini hand */}
      <div style={{ display: 'flex', gap: -4 }}>
        {Array.from({ length: shown }).map((_, i) => (
          <div key={i} style={{ marginLeft: i > 0 ? -12 : 0 }}>
            <CardBack small />
          </div>
        ))}
        {extra > 0 && (
          <span style={{ marginLeft: 4, color: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'Outfit', alignSelf: 'center' }}>
            +{extra}
          </span>
        )}
        {player.handSize === 0 && (
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, fontFamily: 'Outfit' }}>−</span>
        )}
      </div>

      {/* Name row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        {player.isBot && <span style={{ fontSize: 12 }}>🤖</span>}
        <span style={{
          fontFamily: 'Outfit', fontWeight: 700, fontSize: 12,
          color: isMe ? '#ffd000' : 'rgba(255,255,255,0.75)',
        }}>
          {player.name}
        </span>
        {isCurrentTurn && (
          <span style={{ color: '#ffd000', fontSize: 12, animation: 'uno-pulse 1s ease-in-out infinite' }}>▶</span>
        )}
      </div>

      {/* UNO badge */}
      {player.saidUno && player.handSize === 1 && (
        <div style={{
          background: 'linear-gradient(135deg, #ff2d4e, #c00023)',
          color: '#fff', fontFamily: 'Bebas Neue', fontSize: 13, letterSpacing: 2,
          padding: '1px 8px', borderRadius: 10,
          boxShadow: '0 0 10px rgba(255,45,78,0.5)',
        }}>
          UNO!
        </div>
      )}

      {/* Card count badge */}
      <div style={{
        background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)',
        fontFamily: 'Space Mono', fontSize: 10, padding: '1px 6px', borderRadius: 6,
      }}>
        {player.handSize} карт
      </div>
    </div>
  );
}
