import Database from './database/Database.js';
import Logger from './logger/logger.js';
import createDataModels from './models/createDataModels.js';

export const log = new Logger({ useConsole: true });

const database = new Database(
  {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    database: process.env.DB_NAME || 'db',
    password: process.env.DB_PASS || '',
  },
  log,
);

export const db = {
  ...createDataModels(database),
  async close() {
    await database.close();
  },
};
