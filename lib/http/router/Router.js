export default class Router {
  #routes;

  constructor(routes) {
    this.#routes = Router.#sortRoutes(routes);
  }

  getHandlers(req) {
    const { url } = req;
    const baseUrl = this.#findBaseUrl(url);
    const subRouter = this.#routes.get(baseUrl);

    const newUrl = url.slice(baseUrl.length);
    req.url = newUrl.startsWith('/') ? newUrl : `/${newUrl}`;

    const handlers = subRouter.getHandlers(req);
    if (!handlers.length) {
      req.url = url;
    }
    return handlers;
  }

  static #sortRoutes(routes) {
    // The more parts the base URL has,
    // the higher the corresponding route will be in the map
    return new Map(
      [...routes.entries()].sort(([baseUrlA], [baseUrlB]) => {
        const aPartsCount = baseUrlA.split('/').filter(Boolean).length;
        const bPartsCount = baseUrlB.split('/').filter(Boolean).length;
        return bPartsCount - aPartsCount;
      }),
    );
  }

  #findBaseUrl(url) {
    return Array.from(this.#routes.keys()).find((baseUrl) =>
      url.startsWith(baseUrl),
    );
  }
}
