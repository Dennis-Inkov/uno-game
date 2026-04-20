import type { Server } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '@uno/shared';
import { registerRoomHandlers } from './roomHandlers';
import { registerGameHandlers } from './gameHandlers';

type AppServer = Server<ClientToServerEvents, ServerToClientEvents>;

export function setupSocketHandlers(io: AppServer): void {
  io.on('connection', (socket) => {
    registerRoomHandlers(io, socket);
    registerGameHandlers(io, socket);
  });
}
