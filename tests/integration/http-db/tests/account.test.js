import * as queryString from 'node:querystring';

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

import { openDbConn, closeDbConn } from './utils/dbConnUtils.js';
import sendReq from './utils/sendReq.js';

const ADDR = `http://${process.env.HTTP_HOST}:${process.env.HTTP_PORT}`;

let db;
let cookie;

describe('User account management', () => {
  beforeAll(async () => {
    db = openDbConn();

    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    };
    const body = queryString.stringify({
      tag: 'some_user',
      firstName: 'Bob',
      password: '12345',
    });
    const { headers } = await sendReq(`${ADDR}/signup`, options, body);
    cookie = headers['set-cookie'];
  });

  afterAll(() => closeDbConn(db));

  it('should be able to rename user', async () => {
    const firstName = 'John';
    const options = {
      method: 'PATCH',
      headers: {
        Cookie: cookie,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
    const body = queryString.stringify({ firstName, passwordConfirm: '12345' });

    const { statusCode } = await sendReq(`${ADDR}/account`, options, body);
    expect(statusCode).toBe(202);

    const [updatedUser] = await db.select('user').where({ firstName }).run();
    expect(updatedUser).toBeDefined();

    const [oldUser] = await db.select('user').where({ firstName: 'Bob' }).run();
    expect(oldUser).toBeUndefined();
  });

  it('should be able to delete user', async () => {
    const options = {
      method: 'DELETE',
      headers: { Cookie: cookie },
    };

    const { statusCode } = await sendReq(`${ADDR}/account`, options);
    expect(statusCode).toBe(200);

    const [user] = await db.select('user').where({ tag: 'some_user' }).run();
    expect(user).toBeUndefined();
  });
});
