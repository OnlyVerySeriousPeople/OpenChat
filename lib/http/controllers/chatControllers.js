import HTTP_STATUS from '../HTTP_STATUS.js';

export async function createChat(client, db) {
  try {
    const { id: userId } = client.session;
    const newChatId = await db.chat.create(client.req.query, userId);
    const newChat = await db.chat.get(newChatId);

    client.send(HTTP_STATUS.CREATED, { chat: newChat });
  } catch (err) {
    client.err(err);
  }
}

export async function searchChat(client, db) {
  try {
    const { tag: chatTag } = client.req.query;
    const chat = await db.chat.find(chatTag);

    client.send(HTTP_STATUS.OK, { chat });
  } catch (err) {
    client.err(err);
  }
}

export async function joinChat(client, db) {
  try {
    const { id: chatId } = client.req.params;
    const { id: userId } = client.session;
    await db.chat.addUser(chatId, userId);

    client.status(HTTP_STATUS.OK);
  } catch (err) {
    client.err(err);
  }
}

export async function updateChatInfo(client, db) {
  try {
    const { id: chatId } = client.req.params;
    await db.chat.update(chatId, client.req.query);

    client.status(HTTP_STATUS.ACCEPTED);
  } catch (err) {
    client.err(err);
  }
}

export async function exitChat(client, db) {
  try {
    const { id: chatId } = client.req.params;
    const { id: userId } = client.session;
    await db.chat.removeUser(chatId, userId);

    client.status(HTTP_STATUS.OK);
  } catch (err) {
    client.err(err);
  }
}
