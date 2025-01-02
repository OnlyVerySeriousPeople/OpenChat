import querystring from 'node:querystring';

export default class SubRouter {
  #routes = new Map([
    ['GET', new Map()],
    ['PUT', new Map()],
    ['POST', new Map()],
    ['PATCH', new Map()],
    ['DELETE', new Map()],
  ]);

  #currentRoute = '';

  #currentHandlers = [];

  route(str) {
    this.#currentRoute = SubRouter.#validRoute(str);
    return this;
  }

  root() {
    return this.route('/');
  }

  handlers(fnArr) {
    this.#currentHandlers.push(...SubRouter.#validHandlers(fnArr));
    return this;
  }

  #method(method, handlers, route = this.#currentRoute) {
    this.#routes
      .get(method)
      .set(
        SubRouter.#validRoute(route),
        this.#currentHandlers.concat(SubRouter.#validHandlers(handlers)),
      );
    return this;
  }

  get(handlersFnArr, routeStr) {
    return this.#method('GET', handlersFnArr, routeStr);
  }

  put(handlersFnArr, routeStr) {
    return this.#method('PUT', handlersFnArr, routeStr);
  }

  post(handlersFnArr, routeStr) {
    return this.#method('POST', handlersFnArr, routeStr);
  }

  patch(handlersFnArr, routeStr) {
    return this.#method('PATCH', handlersFnArr, routeStr);
  }

  delete(handlersFnArr, routeStr) {
    return this.#method('DELETE', handlersFnArr, routeStr);
  }

  static #validRoute(str) {
    if (typeof str === 'string' && str.startsWith('/')) {
      return str;
    }
    throw new Error("route must be a string that starts with '/'");
  }

  static #validHandlers(fnArr) {
    if (
      Array.isArray(fnArr) &&
      fnArr.length &&
      fnArr.every((fn) => typeof fn === 'function')
    ) {
      return fnArr;
    }
    throw new Error('handlers must be a non-empty array of functions');
  }

  getHandlers(req) {
    const route = this.#parseUrl(req);
    return this.#routes.get(req.method)?.get(route) ?? [];
  }

  #parseUrl(req) {
    const { method, url } = req;
    const [urlPath, urlQuery] = url.split('?');
    req.query = urlQuery ? querystring.parse(urlQuery) : {};
    req.params = {};

    const pathParts = urlPath.split('/');
    const routes = Array.from(this.#routes.get(method).keys());

    const matchedRoute = routes.find((route) => {
      const routeParts = route.split('/');
      return routeParts.every((part, i) =>
        part.startsWith(':') ? true : part === pathParts[i],
      );
    });

    if (matchedRoute) {
      const routeParts = matchedRoute.split('/');
      routeParts.forEach((part, i) => {
        if (part.startsWith(':')) {
          const paramName = part.slice(1);
          req.params[paramName] = pathParts[i];
        }
      });
      return matchedRoute;
    }

    return '';
  }
}
