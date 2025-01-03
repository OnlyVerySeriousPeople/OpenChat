import { describe, expect, test } from '@jest/globals';

import SubRouter from '../../../../lib/http/router/SubRouter.js';

describe('Module `SubRouter`', () => {
  test('add GET-handler', () => {
    const subRouter = new SubRouter();
    subRouter.get(
      [
        (req, res) => {
          res.statusCode = 200;
        },
      ],
      '/',
    );
    const req = { method: 'GET', url: '/' };
    const res = {};

    const handlers = subRouter.getHandlers(req);

    expect(handlers.length).toEqual(1);

    handlers.forEach((handler) => handler(req, res));

    expect(res.statusCode).toBe(200);
  });

  test('add POST-handler using chaining syntax', () => {
    const subRouter = new SubRouter();
    subRouter.route('/').post([
      (req, res) => {
        res.statusCode = 201;
      },
    ]);
    const req = { method: 'POST', url: '/' };
    const res = {};

    const handlers = subRouter.getHandlers(req);

    expect(handlers.length).toEqual(1);

    handlers.forEach((handler) => handler(req, res));

    expect(res.statusCode).toBe(201);
  });

  test("add PATCH-handler for route '/'", () => {
    const subRouter = new SubRouter();
    subRouter.root().patch([
      (req, res) => {
        res.statusCode = 202;
      },
    ]);
    const req = { method: 'PATCH', url: '/' };
    const res = {};

    const handlers = subRouter.getHandlers(req);

    expect(handlers.length).toEqual(1);

    handlers.forEach((handler) => handler(req, res));

    expect(res.statusCode).toBe(202);
  });

  test('add default handler and DELETE-handler', () => {
    const subRouter = new SubRouter();
    subRouter
      .handlers([
        (req, res) => {
          res.body = 'Hello world!';
        },
      ])
      .route('/resource')
      .delete([
        (req, res) => {
          res.statusCode = 200;
        },
      ]);
    const req = { method: 'DELETE', url: '/resource' };
    const res = {};

    const handlers = subRouter.getHandlers(req);

    expect(handlers.length).toEqual(2);

    handlers.forEach((handler) => handler(req, res));

    expect(res.body).toBe('Hello world!');
    expect(res.statusCode).toBe(200);
  });

  test('add handlers for same method but different routes', () => {
    const subRouter = new SubRouter();
    subRouter
      .get(
        [
          (req, res) => {
            res.statusCode = 200;
          },
        ],
        '/path1',
      )
      .get(
        [
          (req, res) => {
            res.body = 'some HTML';
          },
        ],
        '/path2',
      );
    const req = { method: 'GET', url: '/path1' };
    const res = {};

    const handlers = subRouter.getHandlers(req);

    expect(handlers.length).toEqual(1);

    handlers.forEach((handler) => handler(req, res));

    expect(res.statusCode).toBe(200);
    expect(res.body).toBeUndefined();
  });

  test('add handlers for same route but different methods', () => {
    const subRouter = new SubRouter();
    subRouter
      .root()
      .get([
        (req, res) => {
          res.body = 'some HTML';
        },
      ])
      .post([
        (req, res) => {
          res.statusCode = 201;
        },
      ]);
    const req = { method: 'GET', url: '/' };
    const res = {};

    const handlers = subRouter.getHandlers(req);

    expect(handlers.length).toEqual(1);

    handlers.forEach((handler) => handler(req, res));

    expect(res.body).toBe('some HTML');
    expect(res.statusCode).toBeUndefined();
  });

  test('add multiple handlers', () => {
    const subRouter = new SubRouter();
    subRouter
      .handlers([
        (req, res) => {
          res.body = 'Hello';
        },
      ])
      .root()
      .post([
        (req, res) => {
          res.statusCode = 201;
        },
      ])
      .put(
        [
          (req, res) => {
            res.body += ' world!';
          },
        ],
        '/greeting',
      );
    const req = { method: 'PUT', url: '/greeting' };
    const res = {};

    const handlers = subRouter.getHandlers(req);

    expect(handlers.length).toEqual(2);

    handlers.forEach((handler) => handler(req, res));

    expect(res.body).toBe('Hello world!');
    expect(res.statusCode).toBeUndefined();
  });

  test('no handlers provided', () => {
    const subRouter = new SubRouter();
    const req = { method: 'GET', url: '/index.html' };

    const handlers = subRouter.getHandlers(req);

    expect(handlers).toEqual([]);
  });

  test('several `handlers([...])` calls', () => {
    const subRouter = new SubRouter();
    subRouter
      .handlers([
        (req, res) => {
          res.body = 'Hello';
        },
      ])
      .handlers([
        (req, res) => {
          res.body += ' world!';
        },
      ])
      .get(
        [
          (req, res) => {
            res.statusCode = 200;
          },
        ],
        '/',
      );
    const req = { method: 'GET', url: '/' };
    const res = {};

    const handlers = subRouter.getHandlers(req);

    expect(handlers.length).toEqual(3);

    handlers.forEach((handler) => handler(req, res));

    expect(res.body).toBe('Hello world!');
    expect(res.statusCode).toBe(200);
  });

  test('parse URL params and query', async () => {
    const subRouter = new SubRouter();
    subRouter.get(
      [
        (req, res) => {
          res.body = `${req.params.id} ${req.query.foo}`;
        },
      ],
      '/data/private/:id/action',
    );
    const req = { method: 'GET', url: '/data/private/12345/action?foo=baz' };
    const res = {};

    const handlers = subRouter.getHandlers(req);
    handlers.forEach((handler) => handler(req, res));

    expect(res.body).toBe('12345 baz');
  });
});
