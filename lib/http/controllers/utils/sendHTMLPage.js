import sendStatic from './sendStatic.js';

export default function sendHTMLPage(pageName) {
  return async (client) => {
    const { req } = client;
    req.url += `${pageName}.html`;
    await sendStatic(client);
  };
}
