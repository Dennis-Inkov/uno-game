import { createContext, useContext, useRef, useCallback, type ReactNode } from 'react';

export interface GameRefs {
  drawPile: HTMLElement | null;
  discardPile: HTMLElement | null;
  myHand: HTMLElement | null;
  playerSeats: Map<string, HTMLElement>;
}

interface Ctx {
  refs: React.MutableRefObject<GameRefs>;
  setDrawPileRef: (el: HTMLElement | null) => void;
  setDiscardPileRef: (el: HTMLElement | null) => void;
  setMyHandRef: (el: HTMLElement | null) => void;
  setPlayerSeatRef: (id: string, el: HTMLElement | null) => void;
}

const GameRefsCtx = createContext<Ctx>(null!);

export function GameRefsProvider({ children }: { children: ReactNode }) {
  const refs = useRef<GameRefs>({
    drawPile: null,
    discardPile: null,
    myHand: null,
    playerSeats: new Map(),
  });

  const setDrawPileRef = useCallback((el: HTMLElement | null) => {
    refs.current.drawPile = el;
  }, []);

  const setDiscardPileRef = useCallback((el: HTMLElement | null) => {
    refs.current.discardPile = el;
  }, []);

  const setMyHandRef = useCallback((el: HTMLElement | null) => {
    refs.current.myHand = el;
  }, []);

  const setPlayerSeatRef = useCallback((id: string, el: HTMLElement | null) => {
    if (el) refs.current.playerSeats.set(id, el);
    else refs.current.playerSeats.delete(id);
  }, []);

  return (
    <GameRefsCtx.Provider value={{ refs, setDrawPileRef, setDiscardPileRef, setMyHandRef, setPlayerSeatRef }}>
      {children}
    </GameRefsCtx.Provider>
  );
}

export const useGameRefs = () => useContext(GameRefsCtx);
