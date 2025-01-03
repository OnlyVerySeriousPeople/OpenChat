import 'dotenv/config';

import http from 'node:http';

import promisify from '../utils/promisify.js';

import handleReq from './handleReq.js';

const HOST = process.env.HTTP_HOST || 'localhost';
const PORT = process.env.HTTP_PORT || 8000;

const close = async (server, db, log) => {
  try {
    await promisify(server.close)();
    await db.close();
    log.info('HTTP server has been shut down successfully');
    log.close();
  } catch (err) {
    log.error(`HTTP server shutdown failed: ${err.message}`);
    throw err;
  }
};

export default (db, log) => {
  const server = http.createServer((req, res) => handleReq(req, res, db, log));
  server.listen(PORT, HOST, () => {
    log.info(`HTTP server running at http://${HOST}:${PORT}`);
  });

  const shutdown = () => close(server, db, log);
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};
