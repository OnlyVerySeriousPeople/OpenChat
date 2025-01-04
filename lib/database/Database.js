import promiseMysql from 'mysql2/promise';

import Creator from './Creator.js';
import Remover from './Remover.js';
import Replacer from './Replacer.js';
import Selector from './Selector.js';
import Updater from './Updater.js';

class Database {
  constructor(config, logger) {
    this.pool = promiseMysql.createPool(config);
    this.logger = logger;
    this.logger.info('The database is running');
  }

  async execute(sql, values) {
    let connection;
    try {
      connection = await this.pool.getConnection();
      const [res] = await connection.execute(sql, values);
      return res;
    } catch (err) {
      const { message } = err;
      this.logger.error(`cannot execute SQL-script (${message})`);
      throw err;
    } finally {
      if (connection) await connection.release();
    }
  }

  async safeExecute(sql, values) {
    let connection = null;
    try {
      connection = await this.pool.getConnection();
      await connection.beginTransaction();
      const [res] = await connection.execute(sql, values);
      await connection.commit();
      return res;
    } catch (err) {
      const { message } = err;
      this.logger.error(`cannot execute SQL-script (${message})`);
      throw err;
    } finally {
      if (connection) await connection.release();
    }
  }

  select(table) {
    return new Selector(this, table);
  }

  add(table) {
    return new Creator(this, table);
  }

  update(table) {
    return new Updater(this, table);
  }

  replace(table) {
    return new Replacer(this, table);
  }

  delete(table) {
    return new Remover(this, table);
  }

  async close() {
    await this.pool.end();
    this.logger.info('The database is closed');
  }
}

export default Database;
