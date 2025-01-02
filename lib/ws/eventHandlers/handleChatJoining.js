import sendEvent from '../sendEvent.js';

export default async function handleChatJoining(
  ws,
  { chatId },
  chats,
  _,
  models,
) {
  const chatConns = chats.get(chatId) || [];
  chatConns.push(ws);
  chats.set(chatId, chatConns);

  const chat = await models.chat.get(chatId);
  const chatMessages = await models.chat.getMessages(chatId);
  const messages = await Promise.all(
    chatMessages.map(async (msg) => {
      const user = msg.userId ? await models.user.get(msg.userId) : null;
      return { user, ...msg };
    }),
  );

  sendEvent(ws, 'CHAT_HISTORY', { history: { ...chat, messages } });
}
