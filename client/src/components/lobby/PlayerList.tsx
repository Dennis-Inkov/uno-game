import type { PublicRoom } from '@uno/shared';

interface Props {
  room: PublicRoom;
  myId: string;
}

export default function PlayerList({ room, myId }: Props) {
  return (
    <div className="flex flex-col gap-2 w-full max-w-xs">
      {room.players.map((p) => (
        <div
          key={p.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl
            ${p.id === myId ? 'bg-white/15 ring-1 ring-white/30' : 'bg-white/5'}`}
        >
          <span className="text-xl">{p.isBot ? '🤖' : '👤'}</span>
          <div className="flex-1">
            <div className="font-bold text-sm text-white">
              {p.name}
              {p.id === myId && <span className="text-white/50 font-normal ml-1">(вы)</span>}
            </div>
            {p.id === room.hostId && (
              <div className="text-yellow-400 text-xs">Хозяин комнаты</div>
            )}
          </div>
          <div className="w-2 h-2 rounded-full bg-green-400"></div>
        </div>
      ))}

      {/* Empty slots */}
      {Array.from({ length: Math.max(0, 2 - room.players.length) }).map((_, i) => (
        <div key={`empty-${i}`} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-dashed border-white/10">
          <span className="text-xl opacity-30">👤</span>
          <div className="text-white/30 text-sm">Ожидание игрока...</div>
        </div>
      ))}
    </div>
  );
}
