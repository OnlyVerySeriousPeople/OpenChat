import { describe, expect, test } from '@jest/globals';

import Router from '../../../../lib/http/router/Router.js';
import SubRouter from '../../../../lib/http/router/SubRouter.js';

describe('Module `Router`', () => {
  const rootRoutes = new SubRouter();
  rootRoutes.get(
    [
      (req, res) => {
        res.statusCode = 200;
      },
    ],
    '/',
  );

  const appRoutes = new SubRouter();
  appRoutes.get(
    [
      (req, res) => {
        res.body = 'Hello world!';
      },
    ],
    '/',
  );

  const appRouter = new Router(new Map([['/', appRoutes]]));

  const router = new Router(
    new Map([
      ['/', rootRoutes],
      ['/app', appRouter],
    ]),
  );

  test('get handlers directly from `SubRouter`', async () => {
    const req = { method: 'GET', url: '/' };
    const res = {};

    const handlers = router.getHandlers(req);
    handlers.forEach((handler) => handler(req, res));

    expect(res.statusCode).toBe(200);
  });

  test('get handlers indirectly through other `Router`', async () => {
    const req = { method: 'GET', url: '/app' };
    const res = {};

    const handlers = router.getHandlers(req);
    handlers.forEach((handler) => handler(req, res));

    expect(res.body).toBe('Hello world!');
  });

  test('no handlers for such route', () => {
    const req = { method: 'GET', url: '/account' };

    const handlers = router.getHandlers(req);

    expect(handlers).toEqual([]);
  });
});
