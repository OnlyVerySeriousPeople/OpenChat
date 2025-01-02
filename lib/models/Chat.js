/* eslint class-methods-use-this: 0 */

import chatUsers from './staticData/chatUsers.js';
import chats from './staticData/chats.js';
import messages from './staticData/messages.js';
import exists from './utils/checks.js';

export default class Chat {
  get(id) {
    return exists([chats.find((chat) => chat.id === id)])[0];
  }

  find(tag) {
    return exists([chats.find((chat) => chat.tag === tag)])[0];
  }

  create({ tag, name }, userId) {
    if (chats.some((chat) => chat.tag === tag)) {
      throw new Error();
    }

    const id =
      chats.reduce((maxId, chat) => (chat.id > maxId ? chat.id : maxId), 0) + 1;

    chats.push({ id, name, tag });
    this.addUser(id, userId);
    return id;
  }

  update(id, data) {
    const newData = Object.fromEntries(
      Object.entries(data).filter(([k, v]) => ['tag', 'name'].includes(k) && v),
    );

    if (chats.some((chat) => chat.tag === newData.tag)) {
      throw new Error();
    }

    Object.assign(this.get(id), newData);
  }

  addUser(id, userId) {
    const chatUserId =
      chatUsers.reduce(
        (maxId, chatUser) => (chatUser.id > maxId ? chatUser.id : maxId),
        0,
      ) + 1;

    chatUsers.push({ id: chatUserId, chatId: id, userId });
  }

  removeUser(id, userId) {
    // eslint-disable-next-line no-import-assign
    chatUsers = chatUsers.filter((chatUser) => chatUser.userId === userId);

    const chatUsersCount = chatUsers.filter(
      (chatUser) => chatUser.chatId === id,
    ).length;

    if (chatUsersCount === 0) {
      // eslint-disable-next-line no-import-assign
      chats = chats.filter((chat) => chat.id === id);
    }
  }

  getMessages(id) {
    return messages.filter((message) => message.chatId === id);
  }
}
