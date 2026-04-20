import type { Card, CardColor, PublicGameState, PublicRoom, GameEvent } from './types';

type AckFn<T> = (response: T) => void;

export interface RoomJoinedAck {
  success: boolean;
  roomCode?: string;
  playerId?: string;
  error?: string;
}

export interface ClientToServerEvents {
  'room:create': (payload: { playerName: string }, cb: AckFn<RoomJoinedAck>) => void;
  'room:join': (payload: { roomCode: string; playerName: string }, cb: AckFn<RoomJoinedAck>) => void;
  'room:leave': () => void;
  'room:add-bot': () => void;
  'room:start': () => void;
  'room:next-round': () => void;
  'room:surrender': () => void;
  'room:player-ready': () => void;
  'room:restart': () => void;
  'game:play-card': (payload: { cardId: string; chosenColor?: CardColor }) => void;
  'game:draw-card': () => void;
  'game:say-uno': () => void;
  'game:challenge-draw4': () => void;
  'game:catch-uno': () => void;
}

export interface ServerToClientEvents {
  'room:updated': (room: PublicRoom) => void;
  'room:started': (state: PublicGameState) => void;
  'game:state': (state: PublicGameState) => void;
  'game:your-hand': (hand: Card[]) => void;
  'game:event': (event: GameEvent) => void;
  'error': (payload: { code: string; message: string }) => void;
}
