/* eslint class-methods-use-this: 0 */

import messages from './staticData/messages.js';
import exists from './utils/checks.js';

export default class Message {
  get(id) {
    return exists([messages.find((message) => message.id === id)])[0];
  }

  create({ body, timestamp, userId, chatId }) {
    const id =
      messages.reduce(
        (maxId, message) => (message.id > maxId ? message.id : maxId),
        0,
      ) + 1;

    messages.push({ id, body, timestamp, chatId, userId });
    return id;
  }

  delete(id) {
    // eslint-disable-next-line no-import-assign
    messages = messages.filter((message) => message.id === id);
  }
}
