import EventEmitter from './utils/EventEmitter.js';
import formatDateFromTimestamp from './utils/formatDateFromTimestamp.js';

const ee = new EventEmitter();

const elements = {
  chatMessages: document.querySelector('.chat-messages'),
  chatPanel: document.querySelector('.chat-panel'),
  chatsHistory: document.querySelector('.chats-history'),
  chatRooms: document.querySelector('.chat-rooms'),
  msgToChooseRoom: document.querySelector('.no-room-msg'),
  btnSend: document.getElementById('send-msg'),
  msgInput: document.getElementById('write-msg'),
  bntAccount: document.getElementById('go-to-acc'),
  btnNewChat: document.getElementById('btn-new-chat'),
  searchPanel: document.querySelector('.search-room'),
  searchInput: document.getElementById('search-input'),
  searchButton: document.getElementById('search-btn'),
  modal: document.getElementById('get-chat-data'),
  createChatBtn: document.getElementById('btn-create-chat'),
  chatExitBtn: document.getElementById('exit-chat'),
};

const createMessageElement = ({ user, timestamp, body }, isOwnMessage) => {
  const msgContainer = document.createElement('div');
  const msgText = document.createElement('p');
  msgText.className = 'msg-text';
  msgText.textContent = body;
  const msgAuthor = document.createElement('p');
  msgAuthor.className = 'msg-author';
  if (user) {
    msgAuthor.textContent = user.firstName;
    if (user.lastName) msgAuthor.textContent += ` ${user.lastName}`;
  } else {
    msgAuthor.textContent = '???';
  }
  const msgTime = document.createElement('p');
  msgTime.className = 'msg-time';
  msgTime.textContent = formatDateFromTimestamp(timestamp);
  msgContainer.append(msgAuthor, msgText, msgTime);
  msgContainer.className = isOwnMessage ? 'own-message' : 'other-message';
  elements.chatMessages.appendChild(msgContainer);
  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
};

const outputMessage = (message, isOwnMessage) =>
  createMessageElement(message, isOwnMessage);

const getChatData = () =>
  new Promise((resolve, reject) => {
    elements.modal.style.display = 'flex';
    window.onclick = (event) => {
      if (event.target === elements.modal) {
        elements.modal.style.display = 'none';
        reject(new Error('Window is closed'));
      }
    };
    elements.createChatBtn.addEventListener('click', () => {
      const chatName = document.getElementById('chatName').value;
      const chatTag = document.getElementById('chatTag').value;
      if (chatName && chatTag) {
        elements.modal.style.display = 'none';
        resolve({ chatName, chatTag });
      }
    });
  });

const handleFindPressed = () => {
  elements.searchPanel.style.setProperty('display', 'none');
  const backBtn = document.createElement('button');
  backBtn.className = 'back-btn';
  backBtn.textContent = '< Back';
  elements.chatsHistory.prepend(backBtn);
  backBtn.addEventListener('click', () => {
    elements.searchPanel.style.setProperty('display', 'flex');
    backBtn.remove();
    const notInRoom = document.querySelector('.not-in-room');
    if (notInRoom) notInRoom.remove();
    const reminder = document.querySelector('.in-room p');
    if (reminder) reminder.remove();
    const inRooms = document.querySelectorAll('.in-room');
    inRooms.forEach((room) => {
      room.style.setProperty('display', 'flex');
    });
  });
};

(async () => {
  try {
    const res = await fetch('/app/server');
    const url = await res.text();
    const [server, query] = url.split('?');

    const user = Object.fromEntries(
      Array.from(new URLSearchParams(query), ([key, value]) =>
        key === 'id' ? ['id', parseInt(value, 10)] : [key, value],
      ),
    );
    const isOwnMessage = (message) =>
      message.user && message.user.id === user.id;

    const socket = new WebSocket(server);
    const sendEvent = (event, data) => {
      socket.send(JSON.stringify({ event, data }));
    };

    let chats;
    let currentChatId;

    socket.addEventListener('open', () => {
      sendEvent('USER_ONLINE', { user });
    });

    const showChatMessages = (chat) => {
      if (!currentChatId) {
        elements.msgToChooseRoom.style.setProperty('display', 'none');
        elements.chatPanel.style.setProperty('visibility', 'visible');
      }
      currentChatId = parseInt(chat.id, 10);
      elements.chatMessages.innerHTML = '';
      const { messages } = chats[chat.id];
      messages.forEach((message) =>
        outputMessage(message, isOwnMessage(message)),
      );
    };

    ee.onEvent('CHATS_HISTORY', ({ history }) => {
      chats = history;

      console.log(chats);

      Object.keys(chats).forEach((chatId) => {
        const chat = chats[chatId];
        const chatCell = document.createElement('div');
        chatCell.id = chatId;
        chatCell.textContent = chat.name;
        chatCell.classList.add('room', 'in-room');
        elements.chatRooms.appendChild(chatCell);
        chatCell.addEventListener('click', () => showChatMessages(chatCell));
      });
    });

    ee.onEvent('CHAT_HISTORY', ({ history }) => {
      const { id: chatId, messages } = history;
      chats[chatId] = history;
      messages.forEach((message) =>
        outputMessage(message, isOwnMessage(message)),
      );
    });

    ee.onEvent('NEW_MESSAGE', ({ message }) => {
      chats[message.chatId].messages.push(message);
      if (message.chatId === currentChatId) {
        outputMessage(message, isOwnMessage(message));
      }
    });

    socket.addEventListener('message', (msg) => {
      const { event, data } = JSON.parse(msg.data);

      console.log({ event, data });

      ee.emitEvent(event, data);
    });

    socket.addEventListener('close', (obj) => {
      alert(`Connection lost${obj.reason ? `: ${obj.reason}` : ''}`);
    });

    socket.addEventListener('error', (err) => {
      alert(`Server error occurred: ${err.message}`);
    });

    elements.btnSend.addEventListener('click', () => {
      const body = elements.msgInput.value;
      if (body) {
        sendEvent('NEW_MESSAGE', { message: { body, chatId: currentChatId } });
        elements.msgInput.value = '';
      }
    });

    elements.bntAccount.addEventListener('click', () => {
      socket.close();
      window.location.href = '/account';
    });

    elements.btnNewChat.addEventListener('click', async () => {
      try {
        const { chatName, chatTag } = await getChatData();
        const newChat = document.createElement('div');
        newChat.textContent = chatName;
        newChat.classList.add('room', 'in-room');
        elements.chatRooms.appendChild(newChat);
        newChat.addEventListener('click', () => showChatMessages(newChat));

        const response = await fetch(
          `/app/chat/new?tag=${chatTag}&name=${chatName}`,
          { method: 'POST' },
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const { chat } = await response.json();

        console.log({ chat });

        newChat.id = chat.id;
        chats[chat.id] = { ...chat, messages: [] };
        sendEvent('NEW_CHAT', { chatId: chat.id });
      } catch (err) {
        console.error(err);
      }
    });

    const fetchChatJoining = async (roomEl, roomId) => {
      try {
        const response = await fetch(`/app/chat/${roomId}`, { method: 'POST' });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        chats[roomEl.id] = { messages: [] };
        currentChatId = parseInt(roomId, 10);
        sendEvent('CHAT_JOINING', { chatId: roomId });
      } catch (err) {
        console.error(err);
      }
    };

    const handleRoomJoining = (roomName, roomId) => {
      const room = document.createElement('div');
      room.textContent = roomName;
      room.classList.add('room', 'in-room');
      elements.chatRooms.appendChild(room);
      const availableRooms = document.querySelectorAll('.in-room');
      availableRooms.forEach((chat) => {
        chat.style.setProperty('display', 'flex');
      });
      if (!currentChatId) {
        elements.msgToChooseRoom.style.setProperty('display', 'none');
        elements.chatPanel.style.setProperty('visibility', 'visible');
      }
      room.id = roomId;
      fetchChatJoining(room, roomId);
      room.addEventListener('click', () => showChatMessages(room));
      elements.chatMessages.innerHTML = '';
    };

    const startRoomSearch = async (roomName) => {
      try {
        const response = await fetch(`/app/chat?tag=${roomName}`);
        if (!response.ok) {
          alert('There is no room with this name');
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const { chat } = await response.json();
        handleFindPressed();
        const availableRooms = document.querySelectorAll('.in-room');
        availableRooms.forEach((room) => {
          room.style.setProperty('display', 'none');
        });
        const reminder = document.createElement('p');
        if (chat.id in chats) {
          const room = document.getElementById(chat.id);
          room.style.setProperty('display', 'flex');
          reminder.textContent = "You're already in";
          room.appendChild(reminder);
        } else {
          const room = document.createElement('div');
          room.textContent = roomName;
          room.classList.add('room', 'not-in-room');
          reminder.textContent = 'You can join';
          room.appendChild(reminder);
          elements.chatRooms.appendChild(room);
          room.addEventListener('click', () => {
            room.remove();
            handleRoomJoining(roomName, chat.id);
          });
        }
      } catch (err) {
        console.error(err);
      }
    };

    elements.searchButton.addEventListener('click', async () => {
      const roomName = elements.searchInput.value;
      await startRoomSearch(roomName);
    });

    const handleChatExit = (chatId) => {
      const room = document.getElementById(chatId.toString());
      if (room && room.classList.contains('room')) room.remove();
    };

    elements.chatExitBtn.addEventListener('click', async () => {
      try {
        await fetch(`/app/chat/${currentChatId}`, {
          method: 'DELETE',
        });
        sendEvent('CHAT_EXIT', { chatId: currentChatId });
        handleChatExit(currentChatId);
      } catch (err) {
        console.error(err);
      }
    });
  } catch (err) {
    console.error(err);
  }
})();
