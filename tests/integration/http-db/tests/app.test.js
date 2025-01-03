import * as queryString from 'node:querystring';

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

import { openDbConn, closeDbConn } from './utils/dbConnUtils.js';
import sendReq from './utils/sendReq.js';

const ADDR = `http://${process.env.HTTP_HOST}:${process.env.HTTP_PORT}`;

let db;
let user1Cookie;
let user2Cookie;

describe('User chat rooms management', () => {
  beforeAll(async () => {
    db = openDbConn();

    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    };

    const req1Body = queryString.stringify({
      tag: 'bobby',
      firstName: 'Bob',
      password: '12345',
    });
    const { headers: res1Headers } = await sendReq(
      `${ADDR}/signup`,
      options,
      req1Body,
    );
    user1Cookie = res1Headers['set-cookie'];

    const req2Body = queryString.stringify({
      tag: 'johnny',
      firstName: 'John',
      password: 'abcde',
    });
    const { headers: res2Headers } = await sendReq(
      `${ADDR}/signup`,
      options,
      req2Body,
    );
    user2Cookie = res2Headers['set-cookie'];
  });

  afterAll(() => closeDbConn(db));

  it('should create chat rooms for both users', async () => {
    const { statusCode: statusCode1 } = await sendReq(
      `${ADDR}/app/chat/new?tag=t1&name=Chat1`,
      { method: 'POST', headers: { Cookie: user1Cookie } },
    );

    expect(statusCode1).toBe(201);

    const [chat1] = await db.select('chat').where({ tag: 't1' }).run();
    expect(chat1).toBeDefined();

    const { statusCode: statusCode2 } = await sendReq(
      `${ADDR}/app/chat/new?tag=t2&name=Chat2`,
      { method: 'POST', headers: { Cookie: user2Cookie } },
    );

    expect(statusCode2).toBe(201);

    const [chat2] = await db.select('chat').where({ tag: 't2' }).run();
    expect(chat2).toBeDefined();
  });

  it('should be able to rename user chat room', async () => {
    const [{ id: chatId }] = await db.select('chat').where({ tag: 't1' }).run();

    const { statusCode } = await sendReq(
      `${ADDR}/app/chat/${chatId}?name=ChatOne`,
      {
        method: 'PATCH',
        headers: { Cookie: user1Cookie },
      },
    );

    expect(statusCode).toBe(202);

    const [updatedChat] = await db.select('chat').where({ tag: 't1' }).run();
    expect(updatedChat).toBeDefined();
    expect(updatedChat.name).toBe('ChatOne');

    const [oldChat] = await db.select('chat').where({ name: 'Chat1' }).run();
    expect(oldChat).toBeUndefined();
  });

  it('should be able to find user chat room', async () => {
    const { statusCode, data } = await sendReq(`${ADDR}/app/chat?tag=t2`, {
      method: 'GET',
      headers: { Cookie: user1Cookie },
    });

    expect(statusCode).toBe(200);

    const { chat } = JSON.parse(data);
    expect(chat).toBeDefined();
    expect(chat.name).toBe('Chat2');
  });

  it('should be able to join user chat room', async () => {
    const [{ id: chatId }] = await db.select('chat').where({ tag: 't2' }).run();

    const { statusCode } = await sendReq(`${ADDR}/app/chat/${chatId}`, {
      method: 'POST',
      headers: { Cookie: user1Cookie },
    });

    expect(statusCode).toBe(200);

    const chatsUsers = await db.select('chatUser').where({ chatId }).run();
    expect(chatsUsers.length).toBe(2);
  });

  it('should be able to exit user chat room', async () => {
    const [{ id: chatId }] = await db.select('chat').where({ tag: 't2' }).run();

    const { statusCode } = await sendReq(`${ADDR}/app/chat/${chatId}`, {
      method: 'DELETE',
      headers: { Cookie: user1Cookie },
    });

    expect(statusCode).toBe(200);

    const chatsUsers = await db.select('chatUser').where({ chatId }).run();
    expect(chatsUsers.length).toBe(1);
  });
});
