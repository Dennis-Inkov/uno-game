"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const server = (0, server_1.createApp)();
server.listen(PORT, () => {
    console.log(`[UNO] Server running on port ${PORT}`);
});
