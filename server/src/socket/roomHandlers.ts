import type { Server, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents, Player, PublicRoom } from '@uno/shared';
import { createRoom, getRoom, getRoomByPlayerId, removePlayer, deleteRoom } from '../game/RoomManager';
import { createInitialGameState, getPublicState, toPublicPlayer } from '../game/GameEngine';
import { v4 as uuidv4 } from 'uuid';
import { scheduleBotTurn, handleRoundWin } from './gameHandlers';

type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type AppServer = Server<ClientToServerEvents, ServerToClientEvents>;

function toPublicRoom(room: ReturnType<typeof createRoom>): PublicRoom {
  return {
    code: room.code,
    hostId: room.hostId,
    status: room.status,
    players: room.players.map(p => toPublicPlayer(p)),
    readyPlayerIds: room.readyPlayerIds,
  };
}

function broadcastGameState(io: AppServer, room: ReturnType<typeof createRoom>): void {
  io.to(room.code).emit('game:state', getPublicState(room));
  for (const player of room.players) {
    if (!player.isBot) {
      io.to(player.id).emit('game:your-hand', player.hand);
    }
  }
}

export function registerRoomHandlers(io: AppServer, socket: AppSocket): void {
  socket.on('room:create', ({ playerName }, cb) => {
    const player: Player = {
      id: socket.id,
      name: playerName.trim().slice(0, 20) || 'Player',
      isBot: false,
      hand: [],
      handSize: 0,
      status: 'waiting',
      saidUno: false,
      unoPenaltyPending: false,
    };
    const room = createRoom(player);
    socket.join(room.code);
    cb({ success: true, roomCode: room.code, playerId: socket.id });
    io.to(room.code).emit('room:updated', toPublicRoom(room));
  });

  socket.on('room:join', ({ roomCode, playerName }, cb) => {
    const room = getRoom(roomCode.toUpperCase());
    if (!room) return cb({ success: false, error: 'Комната не найдена' });
    if (room.status !== 'lobby') return cb({ success: false, error: 'Игра уже началась' });
    if (room.players.length >= 6) return cb({ success: false, error: 'Комната заполнена' });

    const player: Player = {
      id: socket.id,
      name: playerName.trim().slice(0, 20) || 'Player',
      isBot: false,
      hand: [],
      handSize: 0,
      status: 'waiting',
      saidUno: false,
      unoPenaltyPending: false,
    };
    room.players.push(player);
    socket.join(room.code);
    cb({ success: true, roomCode: room.code, playerId: socket.id });
    io.to(room.code).emit('room:updated', toPublicRoom(room));
  });

  socket.on('room:add-bot', () => {
    const room = getRoomByPlayerId(socket.id);
    if (!room || room.hostId !== socket.id || room.status !== 'lobby') return;
    if (room.players.length >= 6) return;

    const botNames = ['HAL-9000', 'Deep Blue', 'R2-D2', 'C-3PO', 'GLaDOS', 'WALL-E'];
    const usedNames = room.players.map(p => p.name);
    const available = botNames.filter(n => !usedNames.includes(n));
    const botName = available[0] || `Bot-${room.players.length}`;

    const bot: Player = {
      id: `bot_${uuidv4()}`,
      name: botName,
      isBot: true,
      hand: [],
      handSize: 0,
      status: 'waiting',
      saidUno: false,
      unoPenaltyPending: false,
    };
    room.players.push(bot);
    io.to(room.code).emit('room:updated', toPublicRoom(room));
  });

  socket.on('room:start', () => {
    const room = getRoomByPlayerId(socket.id);
    if (!room || room.hostId !== socket.id || room.status !== 'lobby') return;
    if (room.players.length < 2) return;

    room.status = 'playing';
    room.game = createInitialGameState(room.players);

    const publicState = getPublicState(room);
    io.to(room.code).emit('room:started', publicState);

    // Send private hands
    for (const player of room.players) {
      if (!player.isBot) {
        io.to(player.id).emit('game:your-hand', player.hand);
      }
    }

    // If first player is a bot, schedule bot turn
    const firstPlayer = room.players[room.game.currentPlayerIndex];
    if (firstPlayer.isBot) {
      scheduleBotTurn(io, room);
    }
  });

  socket.on('room:next-round', () => {
    const room = getRoomByPlayerId(socket.id);
    if (!room || room.status !== 'finished') return;
    if (socket.id !== room.hostId) return;
    // Don't start a new round if game is already over (500+ points)
    if (Object.values(room.scores).some(s => s >= 500)) return;

    room.readyPlayerIds = [];

    // Reset players for new round
    room.players.forEach(p => {
      p.status = 'playing';
      p.saidUno = false;
      p.unoPenaltyPending = false;
      p.hand = [];
      p.handSize = 0;
    });

    room.game = createInitialGameState(room.players);
    room.status = 'playing';

    broadcastGameState(io, room);
    io.to(room.code).emit('room:updated', toPublicRoom(room));

    const firstPlayer = room.players[room.game.currentPlayerIndex];
    if (firstPlayer?.isBot) scheduleBotTurn(io, room);
  });

  socket.on('room:surrender', () => {
    const room = getRoomByPlayerId(socket.id);
    if (!room || room.status !== 'playing' || !room.game || room.game.winner) return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    player.status = 'disconnected';

    const activePlayers = room.players.filter(p => p.status !== 'disconnected');
    if (activePlayers.length >= 1) {
      handleRoundWin(io, room, activePlayers[0].id);
    }
  });

  socket.on('room:player-ready', () => {
    const room = getRoomByPlayerId(socket.id);
    if (!room || room.status !== 'finished') return;

    // Toggle ready state
    const idx = room.readyPlayerIds.indexOf(socket.id);
    if (idx >= 0) {
      room.readyPlayerIds.splice(idx, 1);
    } else {
      room.readyPlayerIds.push(socket.id);
    }

    io.to(room.code).emit('room:updated', toPublicRoom(room));

    // Check if all non-bot, non-disconnected human players are ready
    const humanPlayers = room.players.filter(p => !p.isBot && p.status !== 'disconnected');
    const allReady = humanPlayers.length > 0 && humanPlayers.every(p => room.readyPlayerIds.includes(p.id));

    if (allReady) {
      const isGameOver = Object.values(room.scores).some(s => s >= 500);
      room.readyPlayerIds = [];
      if (isGameOver) room.scores = {};

      room.players.forEach(p => {
        p.status = 'playing';
        p.saidUno = false;
        p.unoPenaltyPending = false;
        p.hand = [];
        p.handSize = 0;
      });

      room.game = createInitialGameState(room.players);
      room.status = 'playing';

      broadcastGameState(io, room);
      io.to(room.code).emit('room:updated', toPublicRoom(room));

      const firstPlayer = room.players[room.game.currentPlayerIndex];
      if (firstPlayer?.isBot) scheduleBotTurn(io, room);
    }
  });

  socket.on('room:restart', () => {
    const room = getRoomByPlayerId(socket.id);
    if (!room || room.status !== 'finished' || socket.id !== room.hostId) return;

    room.scores = {};
    room.readyPlayerIds = [];

    room.players.forEach(p => {
      p.status = 'playing';
      p.saidUno = false;
      p.unoPenaltyPending = false;
      p.hand = [];
      p.handSize = 0;
    });

    room.game = createInitialGameState(room.players);
    room.status = 'playing';

    broadcastGameState(io, room);
    io.to(room.code).emit('room:updated', toPublicRoom(room));

    const firstPlayer = room.players[room.game.currentPlayerIndex];
    if (firstPlayer?.isBot) scheduleBotTurn(io, room);
  });

  socket.on('room:leave', () => {
    handleDisconnect(io, socket);
  });

  socket.on('disconnect', () => {
    handleDisconnect(io, socket);
  });
}

function handleDisconnect(io: AppServer, socket: AppSocket): void {
  const room = getRoomByPlayerId(socket.id);
  if (!room) return;

  socket.leave(room.code);

  if (room.status === 'lobby') {
    removePlayer(room, socket.id);
    if (room.players.length === 0) {
      deleteRoom(room.code);
      return;
    }
    // Transfer host if needed
    if (room.hostId === socket.id && room.players.length > 0) {
      const newHost = room.players.find(p => !p.isBot);
      if (newHost) room.hostId = newHost.id;
    }
    io.to(room.code).emit('room:updated', toPublicRoom(room));
  } else if (room.status === 'playing') {
    const player = room.players.find(p => p.id === socket.id);
    if (player) player.status = 'disconnected';
    // Check if game can continue
    const activePlayers = room.players.filter(p => p.status !== 'disconnected');
    if (activePlayers.length < 2) {
      const winner = activePlayers[0];
      if (winner && room.game) {
        room.game.winner = winner.id;
        room.status = 'finished';
        io.to(room.code).emit('game:state', getPublicState(room));
      }
    }
  }
}
