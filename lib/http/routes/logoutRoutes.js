import { logoutUser } from '../controllers/userControllers.js';
import { loggedIn } from '../controllers/utils/loginChecks.js';
import SubRouter from '../router/SubRouter.js';

const logoutRoutes = new SubRouter();

logoutRoutes.handlers([loggedIn]).delete([logoutUser], '/');

export default logoutRoutes;
