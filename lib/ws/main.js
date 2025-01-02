import Logger from '../logger/logger.js';
import createDataModels from '../models/createDataModels.js';

import initServer from './server.js';

initServer(createDataModels(), new Logger({ useConsole: true }));
