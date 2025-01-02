import {
  deleteUser,
  updateUserProfile,
} from '../controllers/userControllers.js';
import { loggedIn } from '../controllers/utils/loginChecks.js';
import sendHTMLPage from '../controllers/utils/sendHTMLPage.js';
import SubRouter from '../router/SubRouter.js';

const accountRoutes = new SubRouter();

accountRoutes
  .handlers([loggedIn])
  .root()
  .get([sendHTMLPage('account')])
  .patch([updateUserProfile])
  .delete([deleteUser]);

export default accountRoutes;
