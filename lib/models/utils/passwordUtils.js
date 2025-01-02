import crypto from 'node:crypto';

const SALT_LEN = 16;
const ITER_NUM = 100000;
const HASH_LEN = 64;

const generateSalt = () => crypto.randomBytes(SALT_LEN).toString('hex');

const deriveHash = (password, salt) =>
  crypto
    .pbkdf2Sync(password, salt, ITER_NUM, HASH_LEN, 'sha512')
    .toString('hex');

export const hashPassword = (password) => {
  const salt = generateSalt();
  return `${salt}:${deriveHash(password, salt)}`;
};

export const verifyPassword = (password, passwordHash) => {
  const [salt, hash] = passwordHash.split(':');
  if (!salt || !hash) {
    throw new Error('invalid password hash format');
  }

  return hash === deriveHash(password, salt);
};
