export default function promisify(fn) {
  return (...args) =>
    new Promise((resolve, reject) => {
      args.push((err, data) => {
        if (err) reject(err);
        resolve(data);
      });
      fn(...args);
    });
}
