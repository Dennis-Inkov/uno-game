interface Props {
  small?: boolean;
}

export default function CardBack({ small = false }: Props) {
  const w = small ? 38 : 52;
  const h = small ? 52 : 72;

  return (
    <div style={{
      width: w, height: h, flexShrink: 0,
      borderRadius: 10,
      background: 'linear-gradient(145deg, #1a1a2e, #0d0d18)',
      border: '2px solid rgba(255,255,255,0.1)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: '72%', height: '72%',
        borderRadius: 6,
        background: 'conic-gradient(#ff2d4e 0deg 90deg, #ffd000 90deg 180deg, #00c96b 180deg 270deg, #1a8cff 270deg 360deg)',
        opacity: 0.7,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1.5px solid rgba(255,255,255,0.2)',
      }}>
        <span style={{ fontFamily: 'Bebas Neue', fontSize: small ? 9 : 11, color: '#fff', letterSpacing: 1 }}>
          UNO
        </span>
      </div>
    </div>
  );
}
