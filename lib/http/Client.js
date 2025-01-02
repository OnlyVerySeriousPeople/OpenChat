import HTTPError from './HTTPError.js';
import HTTP_STATUS from './HTTP_STATUS.js';
import parseReqBody from './utils/parseReqBody.js';

const parseHost = (host) => {
  if (!host) return 'no-host-name-in-http-headers';
  const portOffset = host.indexOf(':');
  return portOffset > -1 ? host.substring(0, portOffset) : host;
};

const parseCookie = (cookie) => {
  if (!cookie) return {};
  return Object.fromEntries(
    cookie.split(';').map((item) => item.split('=').map((str) => str.trim())),
  );
};

export default class Client {
  #reqCookie;

  #resCookie = [];

  #resStatus = HTTP_STATUS.OK;

  #resHeaders = new Map();

  #resData = [];

  constructor(req, res) {
    this.req = req;
    this.res = res;
    this.#reqCookie = parseCookie(req.headers.cookie);
  }

  static async create(req, res) {
    await parseReqBody(req);
    return new Client(req, res);
  }

  get cookie() {
    return this.#reqCookie;
  }

  setCookie(name, value, options = {}) {
    const cookie = {
      [name]: value,
      ...options,
      Domain: parseHost(this.req.headers.host),
      Path: '/',
    };

    this.#resCookie.push(
      Object.entries(cookie)
        .map(([k, v]) => (v === true ? k : `${k}=${v}`))
        .join('; '),
    );

    if (!this.res.headersSent) {
      this.head('Set-Cookie', this.#resCookie);
    }

    return this;
  }

  deleteCookie(name) {
    this.setCookie(name, '', { 'Max-Age': 0 });
    return this;
  }

  status(code) {
    this.#resStatus = code;
    return this;
  }

  head(name, value) {
    this.#resHeaders.set(name, value);
    return this;
  }

  data(data) {
    this.#resData.push(typeof data === 'string' ? data : JSON.stringify(data));
    return this;
  }

  err(err, message = '') {
    const defaults = HTTPError.BadRequest();
    this.status(err.statusCode || defaults.statusCode);
    this.data(message || err.message || defaults.message);
    return this;
  }

  send(statusCode, data = '', headers = {}) {
    this.status(statusCode);
    this.data(data);
    Object.entries(headers).forEach(([name, value]) => this.head(name, value));
    return this;
  }

  end() {
    this.res
      .writeHead(
        this.#resStatus,
        Object.fromEntries(this.#resHeaders.entries()),
      )
      .end(this.#resData.join(''));
  }
}
