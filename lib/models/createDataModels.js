import Chat from './Chat.js';
import Message from './Message.js';
import Session from './Session.js';
import User from './User.js';

export default function createDataModels(database) {
  return {
    user: new User(database),
    chat: new Chat(database),
    message: new Message(database),
    session: new Session(database),
  };
}
