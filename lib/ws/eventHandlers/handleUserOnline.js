import sendEvent from '../sendEvent.js';

export default async function handleUserOnline(
  ws,
  { user },
  chats,
  users,
  models,
) {
  users.set(ws, user);
  const chatIds = await models.user.getChatIds(user.id);
  chatIds.forEach((id) => {
    const chatConns = chats.get(id) || [];
    chatConns.push(ws);
    chats.set(id, chatConns);
  });

  const rooms = await Promise.all(
    chatIds.map(async (id) => {
      const chat = await models.chat.get(id);
      const chatMessages = await models.chat.getMessages(id);
      return [
        id,
        {
          ...chat,
          messages: await Promise.all(
            chatMessages.map(async (msg) => {
              const msgUser = msg.userId
                ? await models.user.get(msg.userId)
                : null;
              return { user: msgUser, ...msg };
            }),
          ),
        },
      ];
    }),
  );

  sendEvent(ws, 'CHATS_HISTORY', { history: Object.fromEntries(rooms) });
}
