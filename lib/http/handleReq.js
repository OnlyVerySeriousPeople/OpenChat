import { extname } from 'node:path';

import Client from './Client.js';
import HTTPError from './HTTPError.js';
import Session from './auth/Session.js';
import sendStatic from './controllers/utils/sendStatic.js';
import Router from './router/Router.js';
import routes from './routes/index.js';

const router = new Router(
  new Map([
    ['/', routes.root],
    ['/signup', routes.signup],
    ['/login', routes.login],
    ['/account', routes.account],
    ['/logout', routes.logout],
    ['/app', routes.app],
  ]),
);

export default async function handleReq(req, res, db, log) {
  try {
    const client = await Client.create(req, res);
    await Session.restore(client, db).catch(() => {});

    const handlers = router.getHandlers(req);
    if (handlers.length > 0) {
      await handlers.reduce(
        (promise, handler) => promise.then(() => handler(client, db, log)),
        Promise.resolve(),
      );
    } else if (req.method === 'GET' && extname(req.url)) {
      await sendStatic(client);
    } else {
      throw HTTPError.NotImplemented();
    }

    client.end();
  } catch (err) {
    const defaults = HTTPError.InternalServerError();
    res
      .writeHead(err.statusCode || defaults.statusCode)
      .end(err.message || defaults.message);
  }
}
