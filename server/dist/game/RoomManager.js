"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoom = createRoom;
exports.getRoom = getRoom;
exports.getRoomByPlayerId = getRoomByPlayerId;
exports.deleteRoom = deleteRoom;
exports.removePlayer = removePlayer;
exports.getPlayer = getPlayer;
const codeGen_1 = require("../utils/codeGen");
const rooms = new Map();
function createRoom(host) {
    let code;
    do {
        code = (0, codeGen_1.generateRoomCode)();
    } while (rooms.has(code));
    const room = {
        code,
        hostId: host.id,
        players: [host],
        status: 'lobby',
        game: null,
        scores: {},
        readyPlayerIds: [],
    };
    rooms.set(code, room);
    return room;
}
function getRoom(code) {
    return rooms.get(code);
}
function getRoomByPlayerId(playerId) {
    for (const room of rooms.values()) {
        if (room.players.some(p => p.id === playerId))
            return room;
    }
    return undefined;
}
function deleteRoom(code) {
    rooms.delete(code);
}
function removePlayer(room, playerId) {
    room.players = room.players.filter(p => p.id !== playerId);
}
function getPlayer(room, playerId) {
    return room.players.find(p => p.id === playerId);
}
