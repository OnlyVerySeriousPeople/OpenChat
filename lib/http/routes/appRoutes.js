import querystring from 'node:querystring';

import {
  createChat,
  searchChat,
  joinChat,
  updateChatInfo,
  exitChat,
} from '../controllers/chatControllers.js';
import { loggedIn } from '../controllers/utils/loginChecks.js';
import sendHTMLPage from '../controllers/utils/sendHTMLPage.js';
import SubRouter from '../router/SubRouter.js';

const HOST = process.env.WS_HOST || 'localhost';
const PORT = process.env.WS_PORT || 8001;

const appRoutes = new SubRouter();

appRoutes
  .handlers([loggedIn])
  .get([sendHTMLPage('app')], '/')
  .get(
    [
      (client) => {
        const query = querystring.stringify(client.session);
        client.data(`ws://${HOST}:${PORT}?${query}`);
      },
    ],
    '/server',
  )
  .post([createChat], '/chat/new')
  .get([searchChat], '/chat')
  .route('/chat/:id')
  .post([joinChat])
  .patch([updateChatInfo])
  .delete([exitChat]);

export default appRoutes;
