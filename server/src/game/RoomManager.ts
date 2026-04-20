import type { Room, Player } from '@uno/shared';
import { generateRoomCode } from '../utils/codeGen';

const rooms = new Map<string, Room>();

export function createRoom(host: Player): Room {
  let code: string;
  do {
    code = generateRoomCode();
  } while (rooms.has(code));

  const room: Room = {
    code,
    hostId: host.id,
    players: [host],
    status: 'lobby',
    game: null,
    scores: {},
    readyPlayerIds: [],
  };
  rooms.set(code, room);
  return room;
}

export function getRoom(code: string): Room | undefined {
  return rooms.get(code);
}

export function getRoomByPlayerId(playerId: string): Room | undefined {
  for (const room of rooms.values()) {
    if (room.players.some(p => p.id === playerId)) return room;
  }
  return undefined;
}

export function deleteRoom(code: string): void {
  rooms.delete(code);
}

export function removePlayer(room: Room, playerId: string): void {
  room.players = room.players.filter(p => p.id !== playerId);
}

export function getPlayer(room: Room, playerId: string): Player | undefined {
  return room.players.find(p => p.id === playerId);
}
