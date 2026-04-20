import type { GameEvent } from '@uno/shared';

const EVENT_ICONS: Record<string, string> = {
  card_played: '🃏', card_drawn: '⬇', uno_called: '⚡', uno_penalty: '💀',
  skip: '⊘', reverse: '↺', draw2: '✚', wild_draw4: '💥',
  color_chosen: '🎨', challenge_success: '✓', challenge_fail: '✗',
  turn_changed: '→', game_over: '🏆',
  catch_uno: '🚨', round_over: '🎯', game_over_final: '🏆',
};

const EVENT_LABELS: Record<string, string> = {
  card_played: 'ход', card_drawn: 'добрал', uno_called: 'UNO!',
  uno_penalty: 'штраф', skip: 'пропуск', reverse: 'реверс',
  draw2: '+2', wild_draw4: '+4', color_chosen: 'цвет',
  challenge_success: 'оспорил ✓', challenge_fail: 'оспорил ✗',
  turn_changed: 'ход', game_over: 'победа!',
  catch_uno: 'поймал UNO', round_over: 'выиграл раунд', game_over_final: 'победил в игре!',
};

interface Props {
  events: GameEvent[];
}

export default function GameLog({ events }: Props) {
  const recent = [...events].reverse().slice(0, 7);

  return (
    <div style={{
      background: 'rgba(10,10,20,0.7)', backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 16, padding: '12px 14px', width: 170, maxHeight: 240,
      overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 2,
    }}>
      <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'Outfit', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
        Лог событий
      </div>
      {recent.map((e, i) => (
        <div key={i} className="log-entry" style={{
          display: 'flex', alignItems: 'flex-start', gap: 6,
          opacity: 1 - i * 0.13,
        }}>
          <span style={{ fontSize: 11 }}>{EVENT_ICONS[e.type] ?? '•'}</span>
          <div style={{ fontSize: 11, fontFamily: 'Outfit', lineHeight: 1.4 }}>
            <span style={{ fontWeight: 700, color: i === 0 ? '#fff' : 'rgba(255,255,255,0.6)' }}>
              {e.actorName}
            </span>
            {' '}
            <span style={{ color: i === 0 ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)' }}>
              {EVENT_LABELS[e.type] ?? e.type}
            </span>
            {e.detail && (
              <span style={{ color: 'rgba(255,255,255,0.25)', marginLeft: 3 }}>({e.detail})</span>
            )}
          </div>
        </div>
      ))}
      {recent.length === 0 && (
        <div style={{ color: 'rgba(255,255,255,0.15)', fontSize: 11, fontFamily: 'Outfit' }}>
          Игра идёт...
        </div>
      )}
    </div>
  );
}
