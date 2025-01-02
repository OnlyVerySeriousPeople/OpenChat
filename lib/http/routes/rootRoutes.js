import HTTP_STATUS from '../HTTP_STATUS.js';
import Session from '../auth/Session.js';
import sendHTMLPage from '../controllers/utils/sendHTMLPage.js';
import SubRouter from '../router/SubRouter.js';

const rootRoutes = new SubRouter();

rootRoutes.get(
  [
    async (client) => {
      if (!Session.isActive(client)) {
        await sendHTMLPage('index')(client);
      } else {
        client.send(HTTP_STATUS.MOVED_PERMANENTLY, 'redirecting to app page', {
          Location: '/app',
        });
      }
    },
  ],
  '/',
);

export default rootRoutes;
