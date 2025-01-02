import querystring from 'node:querystring';

const contentParsers = new Map([
  ['application/json', JSON.parse],
  ['application/x-www-form-urlencoded', querystring.parse],
]);

export default function parseReqBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));

    req.on('end', () => {
      try {
        const body = Buffer.concat(chunks).toString();
        const contentType = req.headers['content-type'];
        req.body =
          contentType && contentParsers.has(contentType)
            ? contentParsers.get(contentType)(body)
            : body;
        resolve();
      } catch (err) {
        reject(err);
      }
    });

    req.on('error', (err) => reject(err));
  });
}
