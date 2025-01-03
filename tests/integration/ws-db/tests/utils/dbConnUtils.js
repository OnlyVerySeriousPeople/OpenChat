import 'dotenv/config';

import Database from '../../../../../lib/database/Database.js';
import Logger from '../../../../../lib/logger/logger.js';
import createDataModels from '../../../../../lib/models/createDataModels.js';

export const openDBConn = () => {
  const logger = new Logger({ useConsole: true });
  const database = new Database(
    {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      password: process.env.DB_PASS,
    },
    logger,
  );
  return {
    ...createDataModels(database),
    async close() {
      await database.close();
    },
  };
};

export const closeDBConn = async (db) => {
  await db.close();
};
