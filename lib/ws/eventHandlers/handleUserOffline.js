export default async function handleUserOffline(ws, _, chats, users) {
  chats.forEach((conns, chatId) => {
    chats.set(
      chatId,
      conns.filter((conn) => conn !== ws),
    );
    if (chats.get(chatId).length === 0) chats.delete(chatId);
  });
  users.delete(ws);
}
