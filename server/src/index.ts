import { createApp } from './server';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const server = createApp();

server.listen(PORT, () => {
  console.log(`[UNO] Server running on port ${PORT}`);
});
