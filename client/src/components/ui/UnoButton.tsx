interface Props {
  handSize: number;
  saidUno: boolean;
  onUno: () => void;
}

export default function UnoButton({ handSize, saidUno, onUno }: Props) {
  const shouldPulse = handSize <= 2 && !saidUno;
  const canCall = handSize === 1 && !saidUno;

  if (handSize > 3) return null;

  return (
    <button
      onClick={onUno}
      disabled={!canCall}
      className={shouldPulse ? 'uno-pulse' : ''}
      style={{
        fontFamily: 'Bebas Neue',
        fontSize: 22,
        letterSpacing: 3,
        color: '#fff',
        padding: '10px 22px',
        borderRadius: 50,
        background: saidUno
          ? 'linear-gradient(135deg, #00c96b, #007a3d)'
          : 'linear-gradient(135deg, #ff2d4e, #c00023)',
        border: '2px solid rgba(255,255,255,0.2)',
        boxShadow: saidUno
          ? '0 0 20px rgba(0,201,107,0.5)'
          : '0 0 20px rgba(255,45,78,0.5)',
        cursor: canCall ? 'pointer' : 'not-allowed',
        opacity: canCall || shouldPulse ? 1 : 0.5,
        transition: 'all 0.2s ease',
      }}
    >
      {saidUno ? 'UNO! ✓' : 'UNO!'}
    </button>
  );
}
