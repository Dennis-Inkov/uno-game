import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PublicRoom, PublicGameState, Card, GameEvent } from '@uno/shared';
import socket from '../socket';
import { useRoomStore } from '../store/roomStore';
import { useGameStore } from '../store/gameStore';

export function useGameSocket() {
  const navigate = useNavigate();
  const { setRoom } = useRoomStore();
  const { setGameState, setMyHand, addEvent } = useGameStore();

  useEffect(() => {
    if (!socket.connected) socket.connect();

    socket.on('room:updated', (room: PublicRoom) => {
      setRoom(room);
    });

    socket.on('room:started', (state: PublicGameState) => {
      setGameState(state);
      navigate(`/game/${useRoomStore.getState().room?.code}`);
    });

    socket.on('game:state', (state: PublicGameState) => {
      setGameState(state);
    });

    socket.on('game:your-hand', (hand: Card[]) => {
      setMyHand(hand);
    });

    socket.on('game:event', (event: GameEvent) => {
      addEvent(event);
    });

    return () => {
      socket.off('room:updated');
      socket.off('room:started');
      socket.off('game:state');
      socket.off('game:your-hand');
      socket.off('game:event');
    };
  }, [navigate, setRoom, setGameState, setMyHand, addEvent]);
}
