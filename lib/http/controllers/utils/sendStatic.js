import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import HTTPError from '../../HTTPError.js';
import HTTP_STATUS from '../../HTTP_STATUS.js';

const dir = path.dirname(fileURLToPath(import.meta.url));
const PATH_TO_STATICS = path.join(dir, '../../../../public');

const fileTypes = new Map([
  ['.html', 'text/html'],
  ['.ico', 'image/x-icon'],
  ['.css', 'text/css'],
  ['.js', 'text/javascript'],
]);

export default async function sendStatic(client) {
  const fullPath = path.join(PATH_TO_STATICS, client.req.url);

  try {
    const fileContent = await fs.readFile(fullPath, 'utf-8');
    const contentType = fileTypes.get(path.extname(fullPath));
    if (contentType) client.head('Content-Type', contentType);
    client.send(HTTP_STATUS.OK, fileContent);
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw HTTPError.NotFound(`file ${path.basename(fullPath)} not found`);
    }
    throw err;
  }
}
