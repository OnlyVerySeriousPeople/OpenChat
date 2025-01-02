import HTTPError from '../../HTTPError.js';
import Session from '../../auth/Session.js';

export function loggedIn(client) {
  if (!Session.isActive(client)) {
    throw HTTPError.Unauthorized();
  }
}

export function notLoggedIn(client) {
  if (Session.isActive(client)) {
    throw HTTPError.BadRequest('already logged in');
  }
}
