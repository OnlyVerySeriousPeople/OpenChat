import HTTP_STATUS from './HTTP_STATUS.js';

export default class HTTPError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
  }

  static BadRequest(message = 'invalid data provided') {
    return new HTTPError(HTTP_STATUS.BAD_REQUEST, message);
  }

  static Unauthorized(message = 'access denied') {
    return new HTTPError(HTTP_STATUS.UNAUTHORIZED, message);
  }

  static Forbidden(message = 'action refused') {
    return new HTTPError(HTTP_STATUS.FORBIDDEN, message);
  }

  static NotFound(message = 'resource not found') {
    return new HTTPError(HTTP_STATUS.NOT_FOUND, message);
  }

  static NotImplemented(message = 'endpoint not implemented') {
    return new HTTPError(HTTP_STATUS.NOT_IMPLEMENTED, message);
  }

  static InternalServerError(message = 'something went wrong') {
    return new HTTPError(HTTP_STATUS.INTERNAL_SERVER_ERROR, message);
  }
}
