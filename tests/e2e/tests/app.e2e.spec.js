// @ts-check
import { test, expect } from '@playwright/test';

const ADDR = 'http://http:8080/';

const firstUser = {
  firstName: 'John',
  lastName: 'Big',
  tag: 'bigjohn777',
  password: 'passwd123',
  changedFirstName: 'Johnny',
};

const secondUser = {
  firstName: 'Diana',
  lastName: 'Eagle',
  tag: 'diana123',
  password: 'secure321',
};

const roomName = 'test room';
const roomTag = 'tr123';

test.describe.configure({ mode: 'serial' });
/** @type {import('@playwright/test').Page} */
let page1;
/** @type {import('@playwright/test').Page} */
let page2;

test.beforeAll(async ({ browser }) => {
  const context1 = await browser.newContext();
  const context2 = await browser.newContext();
  page1 = await context1.newPage();
  page2 = await context2.newPage();
});

test.afterAll(async () => {
  await page1.close();
  await page2.close();
});

test('should have all required elements', async () => {
  await page1.goto(ADDR);
  await expect(page1).toHaveTitle(/OpenChat/);
  await expect(page1.getByText('OpenChat')).toBeVisible();
  await expect(page1.getByText('Log in')).toBeVisible();
  await expect(page1.getByText('Sign up')).toBeVisible();
});

test('should redirect to signup page', async () => {
  await page1.getByText('Sign up').click();
  await expect(page1).toHaveURL(`${ADDR}signup`);
});

test('should do not change the page', async () => {
  await page1.locator('input[type="submit"]:has-text("Sign up")').click();
  await expect(page1).toHaveURL(`${ADDR}signup`);
});

test('should redirect user to app main page (successful registration)', async () => {
  await page1.fill('input[name="firstName"]', firstUser.firstName);
  await page1.fill('input[name="lastName"]', firstUser.lastName);
  await page1.fill('input[name="tag"]', firstUser.tag);
  await page1.fill('input[name="password"]', firstUser.password);
  await page1.fill('input[name="passwordConfirm"]', firstUser.password);
  await page1.locator('input[type="submit"]:has-text("Sign up")').click();
  await expect(page1).toHaveURL(`${ADDR}app`);
});

test('should show message to select room', async () => {
  await expect(page1.getByText('Choose a room first')).toBeVisible();
  await expect(
    page1.locator('input[placeholder="Write a message"]'),
  ).not.toBeVisible();
});

test('should create new room and show it', async () => {
  await page1.locator('button:has-text("New chat")').click();
  await page1.fill('input[placeholder="Chat name"]', roomName);
  await page1.fill('input[placeholder="Chat tag"]', roomTag);
  await page1.locator('button:has-text("Create")').click();
  await expect(page1.locator(`.room:has-text("${roomName}")`)).toBeVisible();
  await page1.fill('input[placeholder="Write a room name"]', roomTag);
  await page1.locator('button:has-text("Find")').click();
  await expect(page1.locator(`.room:has-text("${roomName}")`)).toBeVisible();
  await expect(page1.locator('.room p')).toHaveText("You're already in");
  await page1.reload();
  await expect(page1.locator(`.room:has-text("${roomName}")`)).toBeVisible();
});

test('should display a message for the owner after it has been written', async () => {
  await page1.locator(`.room:has-text("${roomName}")`).click();
  await page1
    .locator('input[placeholder="Write a message"]')
    .fill('test message');
  await page1.locator('button:has-text("Send")').click();
  await expect(
    page1.locator('.own-message:has-text("test message")'),
  ).toBeVisible();
  await page1.reload();
  await page1.locator(`.room:has-text("${roomName}")`).click();
  await expect(
    page1.locator('.own-message:has-text("test message")'),
  ).toBeVisible();
});

test('new user registration', async () => {
  await page2.goto(ADDR);
  await page2.getByText('Sign up').click();
  await page2.fill('input[name="firstName"]', secondUser.firstName);
  await page2.fill('input[name="lastName"]', secondUser.lastName);
  await page2.fill('input[name="tag"]', secondUser.tag);
  await page2.fill('input[name="password"]', secondUser.password);
  await page2.fill('input[name="passwordConfirm"]', secondUser.password);
  await page2.locator('input[type="submit"]:has-text("Sign up")').click();
  await expect(page2).toHaveURL(`${ADDR}app`);
});

test('new user should be able to find the room created by another user', async () => {
  await page2.fill('input[placeholder="Write a room name"]', roomTag);
  await page2.locator('button:has-text("Find")').click();
  await expect(page2.locator(`.room:has-text("${roomName}")`)).toBeVisible();
  await expect(page2.locator('button:has-text("Back")')).toBeVisible();
});

test('new user should be able to join the room created by another user and see existing messages', async () => {
  await expect(page2.locator('.room p')).toHaveText('You can join');
  await page2.locator(`.room:has-text("${roomName}")`).click();
  await expect(
    page2.locator('.other-message:has-text("test message")'),
  ).toBeVisible();
});

test('users in the same chat should be able to see messages from each other', async () => {
  await page1.fill(
    'input[placeholder="Write a message"]',
    `Hello, ${secondUser.firstName}!`,
  );
  await page1.locator('button:has-text("Send")').click();
  await expect(
    page2.locator(`.other-message:has-text("Hello, ${secondUser.firstName}!")`),
  ).toBeVisible();
  await page2.fill(
    'input[placeholder="Write a message"]',
    `Hello, ${firstUser.firstName}!`,
  );
  await page2.locator('button:has-text("Send")').click();
  await expect(
    page1.locator(`.other-message:has-text("Hello, ${firstUser.firstName}!")`),
  ).toBeVisible();
});

test('should redirect to profile management page', async () => {
  await page1.locator('button:has-text("Account")').click();
  await expect(page1).toHaveURL(`${ADDR}account`);
});

test('should change user name', async () => {
  await page1.fill('input[name="firstName"]', firstUser.changedFirstName);
  await page1.fill('input[name="passwordConfirm"]', firstUser.password);
  await page1.locator('input[type="submit"]').click();
  await page2.reload();
  await page2.locator(`.room:has-text("${roomName}")`).click();
  await expect(
    page2.locator('.other-message > .msg-author').first(),
  ).toHaveText(`${firstUser.changedFirstName} ${firstUser.lastName}`);
});

test('should log out from account', async () => {
  await page1.locator('button:has-text("Log out")').click();
  await expect(page1).toHaveURL(ADDR);
  await page1.reload();
  await expect(page1).toHaveURL(ADDR);
  await expect(page1.getByText('Log in')).toBeVisible();
  await expect(page1.getByText('Sign up')).toBeVisible();
});

test('user should be logged in', async () => {
  await page1.getByText('Log in').click();
  await page1.fill('input[name="tag"]', firstUser.tag);
  await page1.fill('input[name="password"]', firstUser.password);
  await page1.locator('input[type="Submit"]').click();
  await expect(page1).toHaveURL(`${ADDR}app`);
});

test('should delete user`s account', async () => {
  await page1.locator('button:has-text("Account")').click();
  await page1.locator('button:has-text("Delete account")').click();
  await expect(page1).toHaveURL(ADDR);
  await expect(page1.getByText('Log in')).toBeVisible();
  await expect(page1.getByText('Sign up')).toBeVisible();
  await page2.reload();
  await page2.locator(`.room:has-text("${roomName}")`).click();
  await expect(
    page2.locator('.other-message > .msg-author').first(),
  ).toHaveText('???');
});

test('user should be able to exit room', async () => {
  await page2.locator('button:has-text("Exit")').click();
  await expect(page2.getByText('Choose a room')).toBeVisible();
  await expect(
    page2.locator('input[placeholder="Write a message"]'),
  ).not.toBeVisible();
  await expect(page2.getByText(roomName)).not.toBeVisible();
  await page2.fill('input[placeholder="Write a room name"]', roomTag);
  await page2.locator('button:has-text("Find")').click();
  await expect(page2.locator(`.room:has-text("${roomName}")`)).toBeVisible();
  await expect(page2.locator('.room p')).toHaveText('You can join');
});
