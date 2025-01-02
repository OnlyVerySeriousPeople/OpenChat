import { hashPassword } from '../utils/passwordUtils.js';

export default [
  {
    id: 0,
    firstName: 'John',
    lastName: 'Doe',
    tag: 'swiftHawk123',
    passwordHash: hashPassword('password'),
  },
  {
    id: 1,
    firstName: 'Jane',
    lastName: 'Smith',
    tag: 'crimson_phoenix',
    passwordHash: hashPassword('secure_pass'),
  },
  {
    id: 2,
    firstName: 'Alice',
    tag: 'stellarNova99',
    passwordHash: hashPassword('my password'),
  },
  {
    id: 3,
    firstName: 'Bob',
    lastName: 'Brown',
    tag: 'electricFalcon',
    passwordHash: hashPassword('12345'),
  },
  {
    id: 4,
    firstName: 'Charlie',
    tag: 'golden-tiger',
    passwordHash: hashPassword('charlie-pass'),
  },
  {
    id: 5,
    firstName: 'Diana',
    lastName: 'Green',
    tag: 'blaze',
    passwordHash: hashPassword('diana.secure'),
  },
  {
    id: 6,
    firstName: 'Eve',
    tag: 'shadow_wolf',
    passwordHash: hashPassword('secure_pass'),
  },
  {
    id: 7,
    firstName: 'Frank',
    lastName: 'White',
    tag: 'ironEagle88',
    passwordHash: hashPassword('frankie'),
  },
  {
    id: 8,
    firstName: 'Grace',
    tag: 'lunar-queen',
    passwordHash: hashPassword('graceful'),
  },
  {
    id: 9,
    firstName: 'Hank',
    lastName: 'Black',
    tag: 'wildBearX',
    passwordHash: hashPassword('1111'),
  },
];
