"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const socket_1 = require("./socket");
function createApp() {
    const app = (0, express_1.default)();
    const allowedOrigins = [/^http:\/\/localhost:\d+$/];
    if (process.env.CLIENT_URL)
        allowedOrigins.push(process.env.CLIENT_URL);
    app.use((0, cors_1.default)({ origin: allowedOrigins }));
    app.use(express_1.default.json());
    const httpServer = (0, http_1.createServer)(app);
    const io = new socket_io_1.Server(httpServer, {
        cors: { origin: allowedOrigins },
    });
    (0, socket_1.setupSocketHandlers)(io);
    return httpServer;
}
