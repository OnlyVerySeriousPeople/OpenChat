import 'dotenv/config';

import Database from '../../../../../lib/database/Database.js';
import Logger from '../../../../../lib/logger/logger.js';

export const openDbConn = () => {
  const logger = new Logger({ useConsole: true });
  return new Database(
    {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      password: process.env.DB_PASS,
    },
    logger,
  );
};

export const closeDbConn = async (db) => {
  await db.close();
};
