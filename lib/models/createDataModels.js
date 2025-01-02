import Chat from './Chat.js';
import Message from './Message.js';
import User from './User.js';

export default function createDataModels() {
  return {
    user: new User(),
    chat: new Chat(),
    message: new Message(),
  };
}
