import type { CardColor } from '@uno/shared';

const COLORS: { value: CardColor; label: string; hex: string; glow: string }[] = [
  { value: 'red',    label: 'Красный',  hex: '#ff2d4e', glow: 'rgba(255,45,78,0.6)' },
  { value: 'green',  label: 'Зелёный',  hex: '#00c96b', glow: 'rgba(0,201,107,0.6)' },
  { value: 'blue',   label: 'Синий',    hex: '#1a8cff', glow: 'rgba(26,140,255,0.6)' },
  { value: 'yellow', label: 'Жёлтый',   hex: '#ffd000', glow: 'rgba(255,208,0,0.6)' },
];

interface Props {
  onChoose: (color: CardColor) => void;
}

export default function ColorPicker({ onChoose }: Props) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, backdropFilter: 'blur(8px)',
    }}>
      <div className="modal-in" style={{
        background: 'rgba(18,18,30,0.95)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 24,
        padding: '36px 32px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
        boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
      }}>
        <div>
          <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 32, letterSpacing: 4, color: '#fff', textAlign: 'center' }}>
            ВЫБЕРИТЕ ЦВЕТ
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, fontFamily: 'Outfit', textAlign: 'center', marginTop: 4 }}>
            Джокер — ваш выбор
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {COLORS.map(({ value, label, hex, glow }) => (
            <button
              key={value}
              onClick={() => onChoose(value)}
              style={{
                width: 120, height: 100, borderRadius: 16,
                background: `linear-gradient(145deg, ${hex}, ${hex}aa)`,
                border: '2px solid rgba(255,255,255,0.15)',
                color: '#fff', fontFamily: 'Outfit', fontWeight: 800, fontSize: 15,
                cursor: 'pointer', transition: 'all 0.15s ease',
                boxShadow: `0 4px 20px ${glow}`,
                textShadow: '0 2px 4px rgba(0,0,0,0.4)',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = 'scale(1.08)';
                el.style.boxShadow = `0 8px 30px ${glow}`;
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = '';
                el.style.boxShadow = `0 4px 20px ${glow}`;
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
