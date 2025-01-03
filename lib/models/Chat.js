import pipe from '../utils/pipe.js';

import Model from './Model.js';
import { exists, unique } from './utils/checks.js';

export default class Chat extends Model {
  #table = 'chat';

  #chatUsersTable = 'chatUser';

  #messagesTable = 'message';

  async #get(by) {
    const data = await this.db.select(this.#table).where(by).run();
    return pipe(exists, unique)(data);
  }

  async get(id) {
    return this.#get({ id });
  }

  async find(tag) {
    return this.#get({ tag });
  }

  async create({ tag, name }, userId) {
    const id = (
      await this.db
        .add(this.#table)
        .fields(['tag', 'name'])
        .setValues([tag, name])
        .run()
    ).insertId;
    await this.addUser(id, userId);
    return id;
  }

  async update(id, data) {
    const newData = Object.fromEntries(
      Object.entries(data).filter(([k, v]) => ['tag', 'name'].includes(k) && v),
    );

    if (Object.keys(newData).length) {
      await this.db
        .update(this.#table)
        .fields(Object.keys(newData))
        .setValues(Object.values(newData))
        .where({ id })
        .run();
    }
  }

  async addUser(id, userId) {
    await this.db
      .add(this.#chatUsersTable)
      .fields(['chatId', 'userId'])
      .setValues([id, userId])
      .run();
  }

  async removeUser(id, userId) {
    await this.db
      .delete(this.#chatUsersTable)
      .where({ chatId: id, userId })
      .run();

    const chatUsersCount = await this.db
      .select(this.#chatUsersTable)
      .count()
      .where({ chatId: id })
      .run();

    if (chatUsersCount === 0) {
      await this.db.delete(this.#chatUsersTable).where({ chatId: id }).run();
    }
  }

  async getMessages(id) {
    return this.db.select(this.#messagesTable).where({ chatId: id }).run();
  }
}
