import pipe from '../utils/pipe.js';

import Model from './Model.js';
import { exists, unique } from './utils/checks.js';

export default class Message extends Model {
  #table = 'message';

  async get(id) {
    const data = await this.db.select(this.#table).where({ id }).run();
    return pipe(exists, unique)(data);
  }

  async create({ body, timestamp, userId, chatId }) {
    return (
      await this.db
        .add(this.#table)
        .fields(['body', 'timestamp', 'userId', 'chatId'])
        .setValues([body, timestamp, userId, chatId])
        .run()
    ).insertId;
  }

  async delete(id) {
    await this.db.delete(this.#table).where({ id }).run();
  }
}
