import http from 'node:http';

const options = {
  hostname: process.env.HTTP_HOST,
  port: process.env.HTTP_PORT,
  timeout: 3000,
};

const req = http.get(options, (res) => {
  if (res.statusCode < 400) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

req.on('error', () => {
  process.exit(1);
});

req.on('timeout', () => {
  req.destroy();
  process.exit(1);
});

req.end();
