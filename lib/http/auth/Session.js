import generateToken from './utils/generateToken.js';

const TOKEN_LEN = 32;
const TOKEN_MAX_AGE = 60 * 60 * 24 * 30;

const sessionStorage = new Map();

const getTokenFromCookie = (client) => {
  const token = client.cookie?.token;
  if (!token) throw new Error('no session token in cookie');
  return token;
};

export default class Session {
  static async restore(client, db) {
    const token = getTokenFromCookie(client);

    const session = sessionStorage.has(token)
      ? sessionStorage.get(token)
      : await db.session.get(token);
    if (!session) throw new Error('invalid token');

    if (Date.now() - session.createdAt > TOKEN_MAX_AGE) {
      sessionStorage.delete(token);
      db.session.delete(token);
      throw new Error('session expired');
    }

    sessionStorage.set(token, session);
    Object.assign(client, { session: session.data });
  }

  static isActive(client) {
    return !!client.session;
  }

  static async start(client, db, data = {}) {
    if (Session.isActive(client)) {
      throw new Error('session already active');
    }
    const token = generateToken(TOKEN_LEN);
    await Session.#save(client, db, token, data);
    client.setCookie('token', token, {
      'Max-Age': TOKEN_MAX_AGE,
      HttpOnly: true,
    });
  }

  static async update(client, db, data = {}) {
    if (!Session.isActive(client)) {
      throw new Error('no active session');
    }
    await Session.#save(client, db, getTokenFromCookie(client), data);
  }

  static async #save(client, db, token, data = {}) {
    const session = { token, createdAt: Date.now(), data };
    sessionStorage.set(token, session);
    await db.session.save(session);
    Object.assign(client, { session: data });
  }

  static async deactivate(client, db) {
    if (!Session.isActive(client)) throw new Error('no active session');

    const token = getTokenFromCookie(client);

    client.deleteCookie('token');
    sessionStorage.delete(token);
    await db.session.delete(token);
  }
}
