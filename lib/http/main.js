import Logger from '../logger/logger.js';
import createDataModels from '../models/createDataModels.js';

import init from './server.js';

init(createDataModels(), new Logger({ useConsole: true }));
