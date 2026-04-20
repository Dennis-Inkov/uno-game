"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.botChooseAction = botChooseAction;
exports.scheduleUnoCall = scheduleUnoCall;
const GameEngine_1 = require("./GameEngine");
function botChooseAction(hand, state) {
    const fakePlayer = { hand };
    let playable = hand.filter(c => (0, GameEngine_1.isValidPlay)(c, state, fakePlayer));
    // When draw is accumulated, bot can only stack +2/+4 or draw
    if (state.drawAccumulator > 0) {
        playable = playable.filter(c => c.value === 'draw2' || c.value === 'wild_draw4');
    }
    if (playable.length === 0)
        return { type: 'draw' };
    // Priority: action cards > number cards > wild > wild_draw4
    const priority = (c) => {
        if (c.value === 'wild_draw4')
            return 0;
        if (c.value === 'wild')
            return 1;
        if (c.value === 'draw2' || c.value === 'skip' || c.value === 'reverse')
            return 3;
        return 2;
    };
    playable.sort((a, b) => priority(b) - priority(a));
    const pick = playable[0];
    let chosenColor;
    if (pick.color === 'wild') {
        chosenColor = mostCommonColor(hand);
    }
    return { type: 'play', card: pick, chosenColor };
}
function mostCommonColor(hand) {
    const counts = { red: 0, green: 0, blue: 0, yellow: 0 };
    for (const c of hand) {
        if (c.color !== 'wild')
            counts[c.color]++;
    }
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0][0] || 'red';
}
function scheduleUnoCall(player, onUno) {
    const delay = 300 + Math.random() * (600000 - 300);
    setTimeout(onUno, delay);
}
