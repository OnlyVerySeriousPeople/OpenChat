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
  static async restore(client) {
    const token = getTokenFromCookie(client);

    const session = sessionStorage.get(token);
    if (!session) throw new Error('invalid token');

    if (Date.now() - session.createdAt > TOKEN_MAX_AGE) {
      sessionStorage.delete(token);
      throw new Error('session expired');
    }

    sessionStorage.set(token, session);
    Object.assign(client, { session: session.data });
  }

  static isActive(client) {
    return !!client.session;
  }

  static start(client, data = {}) {
    if (Session.isActive(client)) {
      throw new Error('session already active');
    }
    const token = generateToken(TOKEN_LEN);
    Session.#save(client, token, data);
    client.setCookie('token', token, {
      'Max-Age': TOKEN_MAX_AGE,
      HttpOnly: true,
    });
  }

  static update(client, data = {}) {
    if (!Session.isActive(client)) {
      throw new Error('no active session');
    }
    Session.#save(client, getTokenFromCookie(client), data);
  }

  static #save(client, token, data = {}) {
    const session = { token, createdAt: Date.now(), data };
    sessionStorage.set(token, session);

    Object.assign(client, { session: data });
  }

  static deactivate(client) {
    if (!Session.isActive(client)) throw new Error('no active session');

    const token = getTokenFromCookie(client);

    client.deleteCookie('token');
    sessionStorage.delete(token);
  }
}
