"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketHandlers = setupSocketHandlers;
const roomHandlers_1 = require("./roomHandlers");
const gameHandlers_1 = require("./gameHandlers");
function setupSocketHandlers(io) {
    io.on('connection', (socket) => {
        (0, roomHandlers_1.registerRoomHandlers)(io, socket);
        (0, gameHandlers_1.registerGameHandlers)(io, socket);
    });
}
