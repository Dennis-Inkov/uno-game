import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '@uno/shared';
import { setupSocketHandlers } from './socket';

export function createApp() {
  const app = express();
  const allowedOrigins: (string | RegExp)[] = [/^http:\/\/localhost:\d+$/];
  if (process.env.CLIENT_URL) allowedOrigins.push(process.env.CLIENT_URL);

  app.use(cors({ origin: allowedOrigins }));
  app.use(express.json());

  const httpServer = createServer(app);
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: { origin: allowedOrigins },
  });

  setupSocketHandlers(io);

  return httpServer;
}
