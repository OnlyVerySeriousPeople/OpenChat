import { loginUser } from '../controllers/userControllers.js';
import { notLoggedIn } from '../controllers/utils/loginChecks.js';
import sendHTMLPage from '../controllers/utils/sendHTMLPage.js';
import SubRouter from '../router/SubRouter.js';

const loginRoutes = new SubRouter();

loginRoutes
  .handlers([notLoggedIn])
  .root()
  .get([sendHTMLPage('login')])
  .post([loginUser]);

export default loginRoutes;
