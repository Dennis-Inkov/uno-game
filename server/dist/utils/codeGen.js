"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRoomCode = generateRoomCode;
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function generateRoomCode() {
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += CHARS[Math.floor(Math.random() * CHARS.length)];
    }
    return code;
}
