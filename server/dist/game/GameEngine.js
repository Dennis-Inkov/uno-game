"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInitialGameState = createInitialGameState;
exports.isValidPlay = isValidPlay;
exports.calcCardPoints = calcCardPoints;
exports.calcRoundScore = calcRoundScore;
exports.drawCards = drawCards;
exports.nextPlayerIndex = nextPlayerIndex;
exports.applyCardEffect = applyCardEffect;
exports.advanceTurn = advanceTurn;
exports.getPublicState = getPublicState;
exports.toPublicPlayer = toPublicPlayer;
exports.checkUno = checkUno;
exports.checkWin = checkWin;
const Deck_1 = require("./Deck");
function createInitialGameState(players) {
    const deck = (0, Deck_1.createDeck)();
    // Deal 7 cards to each player
    for (const player of players) {
        player.hand = deck.splice(0, 7);
        player.handSize = player.hand.length;
        player.saidUno = false;
        player.unoPenaltyPending = false;
        player.status = 'playing';
    }
    // Find first non-wild card for discard pile
    let firstCardIndex = deck.findIndex(c => c.color !== 'wild');
    if (firstCardIndex === -1)
        firstCardIndex = 0;
    const [firstCard] = deck.splice(firstCardIndex, 1);
    return {
        drawPile: deck,
        discardPile: [firstCard],
        currentPlayerIndex: 0,
        direction: 1,
        currentColor: firstCard.color,
        drawAccumulator: 0,
        winner: null,
        lastHandBeforeWD4: null,
        pendingColorChoice: false,
    };
}
function isValidPlay(card, state, player) {
    const top = state.discardPile[state.discardPile.length - 1];
    if (card.value === 'wild')
        return true;
    if (card.value === 'wild_draw4') {
        // Can only play wild_draw4 if no cards of the current color in hand
        return !player.hand.some(c => c.color === state.currentColor);
    }
    if (card.color === state.currentColor)
        return true;
    if (card.value === top.value)
        return true;
    return false;
}
function calcCardPoints(card) {
    if (card.value === 'skip' || card.value === 'reverse' || card.value === 'draw2')
        return 20;
    if (card.value === 'wild' || card.value === 'wild_draw4')
        return 50;
    return parseInt(card.value, 10);
}
function calcRoundScore(players) {
    return players
        .filter(p => p.status !== 'won')
        .flatMap(p => p.hand)
        .reduce((sum, c) => sum + calcCardPoints(c), 0);
}
function drawCards(state, player, count) {
    for (let i = 0; i < count; i++) {
        if (state.drawPile.length === 0)
            reshuffleDiscardIntoDraw(state);
        if (state.drawPile.length === 0)
            break;
        const card = state.drawPile.shift();
        player.hand.push(card);
    }
    player.handSize = player.hand.length;
    player.saidUno = false;
}
function reshuffleDiscardIntoDraw(state) {
    const top = state.discardPile.pop();
    state.drawPile = (0, Deck_1.shuffle)(state.discardPile);
    state.discardPile = [top];
}
function nextPlayerIndex(state, players, skip = 0) {
    let idx = state.currentPlayerIndex;
    for (let i = 0; i <= skip; i++) {
        idx = (idx + state.direction + players.length) % players.length;
    }
    return idx;
}
function applyCardEffect(card, chosenColor, state, players) {
    let skipExtra = 0;
    let pendingColorChoice = false;
    state.discardPile.push(card);
    switch (card.value) {
        case 'skip':
            skipExtra = 1;
            state.currentColor = card.color;
            break;
        case 'reverse':
            state.direction = (state.direction * -1);
            if (players.length === 2)
                skipExtra = 1; // reverse acts as skip in 2-player
            state.currentColor = card.color;
            break;
        case 'draw2':
            state.drawAccumulator += 2;
            // skipExtra = 0: victim becomes current player and must decide (stack or draw)
            state.currentColor = card.color;
            break;
        case 'wild':
            if (chosenColor) {
                state.currentColor = chosenColor;
            }
            else {
                pendingColorChoice = true;
            }
            break;
        case 'wild_draw4':
            state.drawAccumulator += 4;
            // skipExtra = 0: victim becomes current player and can challenge or accept
            if (chosenColor) {
                state.currentColor = chosenColor;
            }
            else {
                pendingColorChoice = true;
            }
            break;
        default:
            state.currentColor = card.color;
            break;
    }
    state.pendingColorChoice = pendingColorChoice;
    return { skipExtra, pendingColorChoice };
}
function advanceTurn(state, players, skipExtra = 0) {
    state.currentPlayerIndex = nextPlayerIndex(state, players, skipExtra);
}
function getPublicState(room) {
    const state = room.game;
    const top = state.discardPile[state.discardPile.length - 1];
    return {
        discardTopCard: top,
        currentColor: state.currentColor,
        currentPlayerIndex: state.currentPlayerIndex,
        direction: state.direction,
        drawPileCount: state.drawPile.length,
        drawAccumulator: state.drawAccumulator,
        winner: state.winner,
        pendingColorChoice: state.pendingColorChoice,
        challengePending: state.lastHandBeforeWD4 !== null,
        scores: room.scores,
        players: room.players.map(p => toPublicPlayer(p)),
    };
}
function toPublicPlayer(p) {
    return {
        id: p.id,
        name: p.name,
        isBot: p.isBot,
        handSize: p.handSize,
        saidUno: p.saidUno,
        status: p.status,
        unoPenaltyPending: p.unoPenaltyPending,
    };
}
function checkUno(player) {
    return player.hand.length === 1;
}
function checkWin(player) {
    return player.hand.length === 0;
}
