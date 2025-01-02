import logger from '../logger/logger.js';
import createDataModels from '../models/createDataModels.js';

import initServer from './server.js';

initServer(createDataModels(), logger);
