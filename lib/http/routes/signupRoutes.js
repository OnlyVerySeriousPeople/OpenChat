import { createUser } from '../controllers/userControllers.js';
import { notLoggedIn } from '../controllers/utils/loginChecks.js';
import sendHTMLPage from '../controllers/utils/sendHTMLPage.js';
import SubRouter from '../router/SubRouter.js';

const signupRoutes = new SubRouter();

signupRoutes
  .handlers([notLoggedIn])
  .root()
  .get([sendHTMLPage('signup')])
  .post([createUser]);

export default signupRoutes;
