import type { Server, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents, Room } from '@uno/shared';
import { getRoomByPlayerId, getPlayer } from '../game/RoomManager';
import {
  isValidPlay, drawCards, advanceTurn, applyCardEffect,
  getPublicState, checkUno, checkWin, nextPlayerIndex,
  calcRoundScore,
} from '../game/GameEngine';
import { botChooseAction, scheduleUnoCall } from '../game/BotPlayer';

type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type AppServer = Server<ClientToServerEvents, ServerToClientEvents>;

function broadcastState(io: AppServer, room: Room): void {
  const publicState = getPublicState(room);
  io.to(room.code).emit('game:state', publicState);

  for (const player of room.players) {
    if (!player.isBot) {
      io.to(player.id).emit('game:your-hand', player.hand);
    }
  }
}

export function handleRoundWin(io: AppServer, room: Room, winnerId: string): void {
  const state = room.game!;
  const winner = room.players.find(p => p.id === winnerId)!;

  const roundPoints = calcRoundScore(room.players);
  room.scores[winnerId] = (room.scores[winnerId] ?? 0) + roundPoints;

  winner.status = 'won';
  state.winner = winnerId;
  room.status = 'finished';

  const isGameOver = Object.values(room.scores).some(s => s >= 500);
  io.to(room.code).emit('game:event', {
    type: isGameOver ? 'game_over_final' : 'round_over',
    actorName: winner.name,
    detail: String(roundPoints),
    ts: Date.now(),
  });
  broadcastState(io, room);
}

export function scheduleBotTurn(io: AppServer, room: Room): void {
  if (!room.game || room.game.winner) return;

  const botPlayer = room.players[room.game.currentPlayerIndex];
  if (!botPlayer || !botPlayer.isBot) return;

  const delay = 1200 + Math.random() * 600;

  setTimeout(() => {
    if (!room.game || room.game.winner) return;
    if (room.game.pendingColorChoice) return;

    const currentIdx = room.game.currentPlayerIndex;
    const current = room.players[currentIdx];
    if (!current || !current.isBot) return;

    // Bot decides on challenge when wild_draw4 is pending
    if (room.game.lastHandBeforeWD4 !== null && room.game.drawAccumulator >= 4) {
      const savedHand = room.game.lastHandBeforeWD4;
      const prevIdx = (room.game.currentPlayerIndex - room.game.direction + room.players.length) % room.players.length;
      const previousPlayer = room.players[prevIdx];

      if (previousPlayer && Math.random() < 0.3) {
        // Bot challenges
        const couldPlay = savedHand.some(c => c.color === room.game!.currentColor);
        room.game.lastHandBeforeWD4 = null;
        if (couldPlay) {
          drawCards(room.game, previousPlayer, 4);
          room.game.drawAccumulator = 0;
          io.to(room.code).emit('game:event', {
            type: 'challenge_success', actorName: current.name,
            detail: previousPlayer.name, ts: Date.now(),
          });
        } else {
          drawCards(room.game, current, 6);
          room.game.drawAccumulator = 0;
          io.to(room.code).emit('game:event', {
            type: 'challenge_fail', actorName: current.name, ts: Date.now(),
          });
          advanceTurn(room.game, room.players);
        }
        broadcastState(io, room);
        const next = room.players[room.game.currentPlayerIndex];
        if (next?.isBot) scheduleBotTurn(io, room);
        return;
      }
      // Bot accepts: draw the accumulated cards and end turn
      drawCards(room.game, current, room.game.drawAccumulator);
      room.game.drawAccumulator = 0;
      room.game.lastHandBeforeWD4 = null;
      advanceTurn(room.game, room.players);
      broadcastState(io, room);
      const next = room.players[room.game.currentPlayerIndex];
      if (next?.isBot) scheduleBotTurn(io, room);
      return;
    }

    const action = botChooseAction(current.hand, room.game);

    if (action.type === 'draw') {
      if (room.game.drawAccumulator > 0) {
        drawCards(room.game, current, room.game.drawAccumulator);
        room.game.drawAccumulator = 0;
        room.game.lastHandBeforeWD4 = null;
      } else {
        drawCards(room.game, current, 1);
      }
      advanceTurn(room.game, room.players);
    } else {
      const cardIdx = current.hand.findIndex(c => c.id === action.card.id);
      if (cardIdx === -1) { advanceTurn(room.game, room.players); return; }

      room.game.lastHandBeforeWD4 = action.card.value === 'wild_draw4' ? [...current.hand] : null;

      current.unoPenaltyPending = false;
      current.hand.splice(cardIdx, 1);
      current.handSize = current.hand.length;

      if (current.hand.length === 1 && !current.saidUno) {
        current.unoPenaltyPending = true;
      }

      const { skipExtra } = applyCardEffect(action.card, action.chosenColor, room.game, room.players);

      if (checkWin(current)) {
        handleRoundWin(io, room, current.id);
        return;
      }

      if (checkUno(current)) {
        scheduleUnoCall(current, () => {
          current.saidUno = true;
          current.unoPenaltyPending = false;
          io.to(room.code).emit('game:event', {
            type: 'uno_called', actorName: current.name, ts: Date.now(),
          });
        });
      }

      advanceTurn(room.game, room.players, skipExtra);
    }

    broadcastState(io, room);

    const nextCurrent = room.players[room.game.currentPlayerIndex];
    if (nextCurrent?.isBot) scheduleBotTurn(io, room);
  }, delay);
}

export function registerGameHandlers(io: AppServer, socket: AppSocket): void {
  socket.on('game:play-card', ({ cardId, chosenColor }) => {
    const room = getRoomByPlayerId(socket.id);
    if (!room || !room.game || room.game.winner) return;
    if (room.game.pendingColorChoice) return;

    const state = room.game;
    const currentPlayer = room.players[state.currentPlayerIndex];
    if (!currentPlayer || currentPlayer.id !== socket.id) {
      socket.emit('error', { code: 'NOT_YOUR_TURN', message: 'Сейчас не ваш ход' });
      return;
    }

    const cardIdx = currentPlayer.hand.findIndex(c => c.id === cardId);
    if (cardIdx === -1) {
      socket.emit('error', { code: 'CARD_NOT_FOUND', message: 'Карта не найдена' });
      return;
    }

    const card = currentPlayer.hand[cardIdx];

    if (state.drawAccumulator > 0 && card.value !== 'draw2' && card.value !== 'wild_draw4') {
      socket.emit('error', { code: 'MUST_DRAW', message: 'Нужно добрать карты или ответить картой +2/+4' });
      return;
    }

    if (!isValidPlay(card, state, currentPlayer)) {
      socket.emit('error', { code: 'INVALID_PLAY', message: 'Нельзя сыграть эту карту' });
      return;
    }

    state.lastHandBeforeWD4 = card.value === 'wild_draw4' ? [...currentPlayer.hand] : null;

    currentPlayer.unoPenaltyPending = false;
    currentPlayer.hand.splice(cardIdx, 1);
    currentPlayer.handSize = currentPlayer.hand.length;

    if (currentPlayer.hand.length === 1 && !currentPlayer.saidUno) {
      currentPlayer.unoPenaltyPending = true;
    }

    const { skipExtra, pendingColorChoice } = applyCardEffect(card, chosenColor, state, room.players);

    if (checkWin(currentPlayer)) {
      handleRoundWin(io, room, currentPlayer.id);
      return;
    }

    if (!pendingColorChoice) {
      advanceTurn(state, room.players, skipExtra);
    }

    broadcastState(io, room);

    if (!pendingColorChoice) {
      const nextCurrent = room.players[state.currentPlayerIndex];
      if (nextCurrent?.isBot) scheduleBotTurn(io, room);
    }
  });

  socket.on('game:draw-card', () => {
    const room = getRoomByPlayerId(socket.id);
    if (!room || !room.game || room.game.winner) return;

    const state = room.game;
    const currentPlayer = room.players[state.currentPlayerIndex];
    if (!currentPlayer || currentPlayer.id !== socket.id) return;

    const count = state.drawAccumulator > 0 ? state.drawAccumulator : 1;
    state.drawAccumulator = 0;
    state.lastHandBeforeWD4 = null;
    drawCards(state, currentPlayer, count);
    advanceTurn(state, room.players);

    broadcastState(io, room);

    const nextCurrent = room.players[state.currentPlayerIndex];
    if (nextCurrent?.isBot) scheduleBotTurn(io, room);
  });

  socket.on('game:say-uno', () => {
    const room = getRoomByPlayerId(socket.id);
    if (!room || !room.game) return;

    const player = getPlayer(room, socket.id);
    if (!player) return;

    if (player.hand.length === 1) {
      player.saidUno = true;
      player.unoPenaltyPending = false;
      io.to(room.code).emit('game:event', {
        type: 'uno_called', actorName: player.name, ts: Date.now(),
      });
      broadcastState(io, room);
    }
  });

  socket.on('game:catch-uno', () => {
    const room = getRoomByPlayerId(socket.id);
    if (!room || !room.game || room.game.winner) return;

    const catcher = getPlayer(room, socket.id);
    if (!catcher) return;

    const victim = room.players.find(p => p.unoPenaltyPending && p.id !== socket.id);
    if (!victim) return;

    victim.unoPenaltyPending = false;
    drawCards(room.game, victim, 2);

    io.to(room.code).emit('game:event', {
      type: 'catch_uno',
      actorName: catcher.name,
      detail: victim.name,
      ts: Date.now(),
    });
    broadcastState(io, room);
  });

  socket.on('game:challenge-draw4', () => {
    const room = getRoomByPlayerId(socket.id);
    if (!room || !room.game) return;

    const state = room.game;
    const challenger = getPlayer(room, socket.id);
    if (!challenger) return;

    if (state.currentPlayerIndex !== room.players.findIndex(p => p.id === socket.id)) return;
    if (!state.lastHandBeforeWD4) return;

    const prevIdx = (state.currentPlayerIndex - state.direction + room.players.length) % room.players.length;
    const previousPlayer = room.players[prevIdx];
    const savedHand = state.lastHandBeforeWD4;

    if (!previousPlayer) return;

    const couldPlay = savedHand.some(c => c.color === state.currentColor);
    state.lastHandBeforeWD4 = null;

    if (couldPlay) {
      drawCards(state, previousPlayer, 4);
      state.drawAccumulator = 0;
      io.to(room.code).emit('game:event', {
        type: 'challenge_success', actorName: challenger.name,
        detail: previousPlayer.name, ts: Date.now(),
      });
    } else {
      drawCards(state, challenger, 6);
      state.drawAccumulator = 0;
      io.to(room.code).emit('game:event', {
        type: 'challenge_fail', actorName: challenger.name, ts: Date.now(),
      });
      advanceTurn(state, room.players);
    }

    broadcastState(io, room);

    const nextCurrent = room.players[state.currentPlayerIndex];
    if (nextCurrent?.isBot) scheduleBotTurn(io, room);
  });
}
