import pipe from '../utils/pipe.js';

import Model from './Model.js';
import { exists, unique } from './utils/checks.js';
import { hashPassword, verifyPassword } from './utils/passwordUtils.js';

export default class User extends Model {
  #table = 'user';

  #userChatsTable = 'chatUser';

  async #get(by) {
    const data = await this.db.select(this.#table).where(by).run();
    return pipe(exists, unique)(data);
  }

  async #dto(by) {
    const user = await this.#get(by);
    const { passwordHash, ...dto } = user;
    return dto;
  }

  async get(id) {
    return this.#dto({ id });
  }

  async find(tag) {
    return this.#dto({ tag });
  }

  async create({ tag, firstName, lastName, password }) {
    const hash = hashPassword(password);
    return (
      await this.db
        .add(this.#table)
        .fields(['tag', 'firstName', 'lastName', 'passwordHash'])
        .setValues([tag, firstName, lastName, hash])
        .run()
    ).insertId;
  }

  async checkCredentials(tag, password) {
    const { passwordHash } = await this.#get({ tag });
    if (!verifyPassword(password, passwordHash)) {
      throw new Error('password does not match');
    }
  }

  async update(id, data) {
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

    if (Object.keys(newData).length) {
      await this.db
        .update(this.#table)
        .fields(Object.keys(newData))
        .setValues(Object.values(newData))
        .where({ id })
        .run();
    }
  }

  async delete(id) {
    await this.db.delete(this.#table).where({ id }).run();
  }

  async getChatIds(userId) {
    return this.db
      .select(this.#userChatsTable)
      .col('chatId')
      .where({ userId })
      .run();
  }
}
