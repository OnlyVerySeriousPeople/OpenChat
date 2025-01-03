import Model from './Model.js';
import { unique } from './utils/checks.js';

export default class Session extends Model {
  #table = 'session';

  async get(token) {
    const data = await this.db.select(this.#table).where({ token }).run();
    return unique(data);
  }

  async save({ token, createdAt, data }) {
    await this.db
      .replace(this.#table)
      .fields(['token', 'createdAt', 'data'])
      .setValues([token, createdAt, data])
      .run();
  }

  async delete(token) {
    await this.db.delete(this.#table).where({ token }).run();
  }
}
