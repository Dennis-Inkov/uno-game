import { create } from 'zustand';
import type { PublicRoom } from '@uno/shared';

interface RoomStore {
  room: PublicRoom | null;
  myId: string | null;
  myName: string | null;
  setRoom: (room: PublicRoom) => void;
  setMyId: (id: string) => void;
  setMyName: (name: string) => void;
  reset: () => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
  room: null,
  myId: null,
  myName: null,
  setRoom: (room) => set({ room }),
  setMyId: (myId) => set({ myId }),
  setMyName: (myName) => set({ myName }),
  reset: () => set({ room: null, myId: null, myName: null }),
}));
