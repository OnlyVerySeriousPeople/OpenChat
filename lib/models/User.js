/* eslint class-methods-use-this: 0 */

import chatUsers from './staticData/chatUsers.js';
import users from './staticData/users.js';
import exists from './utils/checks.js';
import { hashPassword, verifyPassword } from './utils/passwordUtils.js';

export default class User {
  #get(id) {
    return exists([users.find((user) => user.id === id)])[0];
  }

  #find(tag) {
    return exists([users.find((user) => user.tag === tag)])[0];
  }

  get(id) {
    const { passwordHash, ...dto } = this.#get(id);
    return dto;
  }

  find(tag) {
    const { passwordHash, ...dto } = this.#find(tag);
    return dto;
  }

  create({ tag, firstName, lastName, password }) {
    if (users.some((user) => user.tag === tag)) {
      throw new Error();
    }

    const passwordHash = hashPassword(password);

    const id =
      users.reduce((maxId, user) => (user.id > maxId ? user.id : maxId), 0) + 1;

    users.push({
      id,
      tag,
      firstName,
      ...(lastName && { lastName }),
      passwordHash,
    });
    return id;
  }

  checkCredentials(tag, password) {
    const { passwordHash } = this.#find(tag);

    if (!verifyPassword(password, passwordHash)) {
      throw new Error('password does not match');
    }
  }

  update(id, data) {
    const newData = Object.fromEntries(
      Object.entries(data)
        .filter(
          ([k, v]) =>
            ['tag', 'firstName', 'lastName', 'password'].includes(k) && v,
        )
        .map(([k, v]) =>
          k === 'password' ? ['passwordHash', hashPassword(v)] : [k, v],
        ),
    );

    if (users.some((user) => user.tag === newData.tag)) {
      throw new Error();
    }

    Object.assign(this.#get(id), newData);
  }

  delete(id) {
    // eslint-disable-next-line no-import-assign
    users = users.filter((user) => user.id === id);
  }

  getChatIds(userId) {
    return chatUsers
      .filter((chatUser) => chatUser.userId === userId)
      .map((chatUser) => chatUser.chatId);
  }
}
