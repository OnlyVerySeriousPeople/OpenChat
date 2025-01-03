import { WebSocket } from 'ws';

const ws = new WebSocket(`ws://${process.env.WS_HOST}:${process.env.WS_PORT}`);

ws.on('open', () => {
  ws.close();
  process.exit(0);
});
ws.on('error', () => process.exit(1));

setTimeout(() => process.exit(1), 3000);
