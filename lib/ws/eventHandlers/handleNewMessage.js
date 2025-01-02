import sendEvent from '../sendEvent.js';

export default async function handleNewMessage(
  ws,
  { message },
  chats,
  users,
  models,
) {
  const { body, chatId } = message;
  const user = users.get(ws);
  const timestamp = Date.now();

  const messageId = await models.message.create({
    body,
    timestamp,
    chatId,
    userId: user.id,
  });
  const createdMessage = await models.message.get(messageId);
  const msgUser = await models.user.get(user.id);

  chats.get(chatId).forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      sendEvent(client, 'CHAT_MESSAGE', {
        message: { ...createdMessage, msgUser },
      });
    }
  });
}
