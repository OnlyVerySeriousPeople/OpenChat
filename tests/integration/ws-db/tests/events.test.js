import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
} from '@jest/globals';
import WebSocket from 'ws';

import { openDBConn, closeDBConn } from './utils/dbConnUtils.js';

const ADDR = `ws://${process.env.WS_HOST}:${process.env.WS_PORT}`;

let db;
let sockets = [];

const waitData = (socket, sendCb) =>
  new Promise((resolve) => {
    socket.on('message', (msg) => {
      resolve(JSON.parse(msg.toString()));
    });
    sendCb(socket);
  });

const sendEvent = (socket, event, data) => {
  socket.send(JSON.stringify({ event, data }));
};

describe('WebSocket server-client communication events', () => {
  beforeAll(async () => {
    db = openDBConn();

    const openWSConn = () =>
      new Promise((resolve) => {
        const socket = new WebSocket(ADDR);
        socket.on('open', () => resolve(socket));
      });

    sockets = await Promise.all([openWSConn(), openWSConn()]);
  });

  afterAll(() => {
    sockets.forEach((socket) => socket.close());
    closeDBConn(db);
  });

  afterEach(() => {
    sockets.forEach((socket) => socket.removeAllListeners('message'));
  });

  let user1;
  let user2;

  it('should handle two new users', async () => {
    const user1Data = {
      tag: 'uncle_bob',
      firstName: 'Bob',
      lastName: 'Martin',
      password: '12345',
    };
    const user2Data = {
      tag: 'johnny',
      firstName: 'John',
      lastName: 'Doe',
      password: 'abcdefg',
    };

    const createUser = async (userData) => {
      const userId = await db.user.create(userData);
      return db.user.get(userId);
    };

    [user1, user2] = await Promise.all([
      createUser(user1Data),
      createUser(user2Data),
    ]);

    const [data1, data2] = await Promise.all([
      waitData(sockets[0], (socket) => {
        sendEvent(socket, 'USER_ONLINE', { user: user1 });
      }),
      waitData(sockets[1], (socket) => {
        sendEvent(socket, 'USER_ONLINE', { user: user2 });
      }),
    ]);

    const expectedData = { event: 'CHATS_HISTORY', data: { history: {} } };
    expect(data1).toEqual(expectedData);
    expect(data2).toEqual(expectedData);
  });

  let chatId;

  it('should handle new chat creation and message sending', async () => {
    const chatData = { tag: 't1', name: 'Chat1' };
    chatId = await db.chat.create(chatData, user1.id);

    const {
      event,
      data: { message },
    } = await waitData(sockets[0], (socket) => {
      sendEvent(socket, 'NEW_CHAT', { chatId });
      sendEvent(socket, 'NEW_MESSAGE', { message: { body: 'Hello!', chatId } });
    });

    expect(event).toBe('NEW_MESSAGE');
    expect(message.body).toBe('Hello!');
    expect(message.chatId).toBe(chatId);
    expect(message.user.id).toBe(user1.id);
  });

  it('should handle chat joining', async () => {
    await db.chat.addUser(chatId, user2.id);

    const {
      event,
      data: {
        history: { messages },
      },
    } = await waitData(sockets[1], (socket) => {
      sendEvent(socket, 'CHAT_JOINING', { chatId });
    });

    expect(event).toBe('CHAT_HISTORY');

    expect(messages.length).toBe(1);
    const [message] = messages;
    expect(message.body).toBe('Hello!');
    expect(message.chatId).toBe(chatId);
  });

  it('should send new message to all chat users', async () => {
    const [data1, data2] = await Promise.all([
      waitData(sockets[0], () => {}),
      waitData(sockets[1], (socket) => {
        sendEvent(socket, 'NEW_MESSAGE', {
          message: { body: 'Hola!', chatId },
        });
      }),
    ]);

    const {
      event,
      data: { message },
    } = data1;

    expect(event).toEqual('NEW_MESSAGE');
    expect(message.body).toBe('Hola!');
    expect(message.chatId).toBe(chatId);
    expect(message.user.id).toBe(user2.id);

    expect(data1).toEqual(data2);
  });

  it('should handle chat exit', async () => {
    await db.chat.removeUser(chatId, user1.id);

    const resolveData = waitData(sockets[1], (socket) => {
      sendEvent(socket, 'NEW_MESSAGE', {
        message: { body: 'Bonjour!', chatId },
      });
    });

    const rejectIfData = new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, 3000);
      waitData(sockets[0], (socket) => {
        sendEvent(socket, 'CHAT_EXIT', { chatId });
      }).then((data) => {
        clearTimeout(timer);
        reject(data);
      });
    });

    const [data] = await Promise.all([resolveData, rejectIfData]);

    const {
      event,
      data: { message },
    } = data;

    expect(event).toEqual('NEW_MESSAGE');
    expect(message.body).toBe('Bonjour!');
    expect(message.chatId).toBe(chatId);
    expect(message.user.id).toBe(user2.id);
  }, 5000);
});
