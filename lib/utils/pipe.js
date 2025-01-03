export default function pipe(...fns) {
  return (x) => fns.reduce((y, fn) => fn(y), x);
}
