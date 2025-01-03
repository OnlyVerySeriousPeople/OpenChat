import 'dotenv/config';

import { WebSocketServer } from 'ws';

import handleChatExit from './eventHandlers/handleChatExit.js';
import handleChatJoining from './eventHandlers/handleChatJoining.js';
import handleNewChat from './eventHandlers/handleNewChat.js';
import handleNewMessage from './eventHandlers/handleNewMessage.js';
import handleUserOffline from './eventHandlers/handleUserOffline.js';
import handleUserOnline from './eventHandlers/handleUserOnline.js';

const HOST = process.env.WS_HOST || 'localhost';
const PORT = process.env.WS_PORT || 8001;
const SHUTDOWN_TIME = 5;

const eventHandlers = {
  USER_ONLINE: handleUserOnline,
  USER_OFFLINE: handleUserOffline,
  NEW_CHAT: handleNewChat,
  CHAT_JOINING: handleChatJoining,
  CHAT_EXIT: handleChatExit,
  NEW_MESSAGE: handleNewMessage,
};

const handleConnection = (ws, chats, users, models) => {
  ws.on('message', (str) => {
    const { event, data } = JSON.parse(str);
    const handler = eventHandlers[event];
    if (handler) handler(ws, data, chats, users, models);
  });
  ws.on('close', async () => {
    const handler = eventHandlers.USER_OFFLINE;
    await handler(ws, {}, chats, users, models);
  });
};

const shutdownServer = async (wss, models, logger) => {
  try {
    await new Promise((resolve, reject) => {
      wss.clients.forEach((client) => {
        client.close(1000, 'The server is shutting down.');
      });
      setTimeout(() => {
        wss.close((err) => {
          if (err) reject(err);
          resolve();
        });
      }, SHUTDOWN_TIME);
    });
    await models.close();
    logger.info('WebSocket server has been shut down successfully');
    logger.close();
  } catch (err) {
    logger.error(`WebSocket server shutdown failed (${err.message})`);
    throw err;
  }
};

export default (models, logger) => {
  const wss = new WebSocketServer({ host: HOST, port: PORT });
  logger.info(`WebSocket server running at [ws://${HOST}:${PORT}]`);

  const users = new Map();
  const chats = new Map();

  wss.on('connection', (ws) => handleConnection(ws, users, chats, models));

  const shutdown = () => shutdownServer(wss, models, logger);
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};
