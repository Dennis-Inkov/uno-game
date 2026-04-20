export type CardColor = 'red' | 'green' | 'blue' | 'yellow' | 'wild';
export type CardValue = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'skip' | 'reverse' | 'draw2' | 'wild' | 'wild_draw4';
export interface Card {
    id: string;
    color: CardColor;
    value: CardValue;
}
export type PlayerStatus = 'waiting' | 'playing' | 'won' | 'disconnected';
export interface Player {
    id: string;
    name: string;
    isBot: boolean;
    hand: Card[];
    handSize: number;
    status: PlayerStatus;
    saidUno: boolean;
    unoPenaltyPending: boolean;
}
export interface PublicPlayer {
    id: string;
    name: string;
    isBot: boolean;
    handSize: number;
    saidUno: boolean;
    status: PlayerStatus;
    unoPenaltyPending: boolean;
}
export type RoomStatus = 'lobby' | 'playing' | 'finished';
export interface Room {
    code: string;
    hostId: string;
    players: Player[];
    status: RoomStatus;
    game: GameState | null;
    scores: Record<string, number>;
    readyPlayerIds: string[];
}
export interface PublicRoom {
    code: string;
    hostId: string;
    players: PublicPlayer[];
    status: RoomStatus;
    readyPlayerIds: string[];
}
export type GameDirection = 1 | -1;
export interface GameState {
    drawPile: Card[];
    discardPile: Card[];
    currentPlayerIndex: number;
    direction: GameDirection;
    currentColor: CardColor;
    drawAccumulator: number;
    winner: string | null;
    lastHandBeforeWD4: Card[] | null;
    pendingColorChoice: boolean;
}
export interface PublicGameState {
    discardTopCard: Card;
    currentColor: CardColor;
    currentPlayerIndex: number;
    direction: GameDirection;
    drawPileCount: number;
    drawAccumulator: number;
    players: PublicPlayer[];
    winner: string | null;
    pendingColorChoice: boolean;
    challengePending: boolean;
    scores: Record<string, number>;
}
export type GameEventType = 'card_played' | 'card_drawn' | 'uno_called' | 'uno_penalty' | 'skip' | 'reverse' | 'draw2' | 'wild_draw4' | 'color_chosen' | 'challenge_success' | 'challenge_fail' | 'turn_changed' | 'game_over' | 'catch_uno' | 'round_over' | 'game_over_final';
export interface GameEvent {
    type: GameEventType;
    actorName: string;
    detail?: string;
    ts: number;
}
