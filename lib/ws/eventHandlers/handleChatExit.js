export default async function handleChatExit(ws, { chatId }, chats) {
  const chatConns = chats.get(chatId);
  chats.set(
    chatId,
    chatConns.filter((conn) => conn !== ws),
  );
  if (!chats.get(chatId).length) chats.delete(chatId);
}
