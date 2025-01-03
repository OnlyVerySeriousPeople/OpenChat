import * as queryString from 'node:querystring';

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

import { openDbConn, closeDbConn } from './utils/dbConnUtils.js';
import sendReq from './utils/sendReq.js';

const ADDR = `http://${process.env.HTTP_HOST}:${process.env.HTTP_PORT}`;

let db;

describe('User authentication', () => {
  beforeAll(() => {
    db = openDbConn();
  });
  afterAll(() => closeDbConn(db));

  it('should sign up because no such user', async () => {
    const userData = {
      firstName: 'Bob',
      lastName: 'Martin',
      tag: 'uncle_bob',
      password: '12345',
    };
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    };
    const body = queryString.stringify(userData);

    const { statusCode } = await sendReq(`${ADDR}/signup`, options, body);

    expect(statusCode).toBe(201);

    const [createdUser] = await db
      .select('user')
      .where({ tag: userData.tag })
      .run();

    expect(createdUser).toBeDefined();
  });

  it('should not sign up because such user already exists', async () => {
    const userData = {
      firstName: 'John',
      tag: 'uncle_bob',
      password: '12345',
    };
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    };
    const body = queryString.stringify(userData);

    const { statusCode } = await sendReq(`${ADDR}/signup`, options, body);

    expect(statusCode).toBe(400);
  });

  it('should log in because valid credentials', async () => {
    const userData = { tag: 'uncle_bob', password: '12345' };
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    };
    const body = queryString.stringify(userData);

    const { statusCode, headers } = await sendReq(
      `${ADDR}/login`,
      options,
      body,
    );

    expect(statusCode).toBe(200);
    expect(headers['set-cookie']).toBeDefined();
  });

  it('should not log in because user does not exist', async () => {
    const userData = { tag: 'some-user', password: 'abcde' };
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    };
    const body = queryString.stringify(userData);

    const { statusCode } = await sendReq(`${ADDR}/login`, options, body);

    expect(statusCode).toBe(400);
  });

  it('should handle cookies', async () => {
    let cookies;
    // Log in to get cookies
    {
      const userData = { tag: 'uncle_bob', password: '12345' };
      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      };
      const body = queryString.stringify(userData);

      const { headers } = await sendReq(`${ADDR}/login`, options, body);
      cookies = headers['set-cookie'];
    }

    const options = { method: 'GET', headers: { Cookie: cookies } };

    const { statusCode } = await sendReq(`${ADDR}/app/server`, options);

    expect(statusCode).toBe(200);
  });

  it('should log out', async () => {
    let cookies;
    // Log in to get cookies
    {
      const userData = { tag: 'uncle_bob', password: '12345' };
      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      };
      const body = queryString.stringify(userData);

      const { headers } = await sendReq(`${ADDR}/login`, options, body);
      cookies = headers['set-cookie'];
    }

    // Log out
    {
      const options = { method: 'DELETE', headers: { Cookie: cookies } };

      const { statusCode } = await sendReq(`${ADDR}/logout`, options);

      expect(statusCode).toBe(200);
    }

    // Check if /chat is inaccessible
    {
      const options = { method: 'GET', headers: { Cookie: cookies } };

      const { statusCode } = await sendReq(`${ADDR}/app/server`, options);

      expect(statusCode).toBe(401);
    }
  });
});
