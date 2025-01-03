import HTTP_STATUS from '../HTTP_STATUS.js';
import Session from '../auth/Session.js';

export async function createUser(client, db) {
  try {
    const newUserId = await db.user.create(client.req.body);
    const newUser = await db.user.get(newUserId);

    await Session.start(client, db, newUser);
    client.status(HTTP_STATUS.CREATED);
  } catch (err) {
    client.err(err);
  }
}

export async function updateUserProfile(client, db) {
  try {
    const { id: userId, tag: userTag } = client.session;

    const { passwordConfirm } = client.req.body;
    await db.user.checkCredentials(userTag, passwordConfirm);

    await db.user.update(userId, client.req.body);
    const updatedUser = await db.user.get(userId);

    await Session.update(client, db, updatedUser);
    client.status(HTTP_STATUS.ACCEPTED);
  } catch (err) {
    client.err(err);
  }
}

export async function loginUser(client, db) {
  try {
    const { tag, password } = client.req.body;
    await db.user.checkCredentials(tag, password);

    const user = await db.user.find(tag);
    await Session.start(client, db, user);
    client.status(HTTP_STATUS.OK);
  } catch (err) {
    client.err(err);
  }
}

export async function logoutUser(client, db) {
  try {
    await Session.deactivate(client, db);
    client.status(HTTP_STATUS.OK);
  } catch (err) {
    client.err(err);
  }
}

export async function deleteUser(client, db) {
  try {
    const { id: userId } = client.session;
    await db.user.delete(userId);

    await Session.deactivate(client, db);
    client.status(HTTP_STATUS.OK);
  } catch (err) {
    client.err(err);
  }
}
