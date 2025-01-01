# OpenChat

## 📖 Overview

OpenChat is a lightweight and dependency-minimized web application designed to provide a real-time communication platform. The primary objective during development was to reduce reliance on external libraries and frameworks, achieving a streamlined and efficient architecture. The application incorporates an HTTP server, a WebSocket server, and a database to deliver a full-featured chat system.

### ✨ Key Features

1. 🔐 **User Authentication:**

   - Supports user registration (Sign up) and login (Log in).
   - User credentials are stored in the database.

2. 🏠 **Chat Rooms:**

   - Users can create custom chat rooms by specifying a room name.
   - Users can browse existing chat rooms and join them.
   - Each user maintains a list of rooms they are a member of, enabling quick access to ongoing conversations.

3. ⚡ **Real-Time Messaging:**

   - Messages within a room are exchanged in real-time using WebSocket communication.
   - Message history is maintained for each room.

4. 👤 **Profile Management:**

   - Users can update their nickname and password.
   - Options to log out or delete the account are available.

5. 📦 **Dependency-Minimized Architecture:**
   - HTTP server handles static assets, authentication, and room management.
   - WebSocket server facilitates real-time message exchange.
   - Database stores user credentials, chat rooms, membership data, and message history.

## 🔄 Application Workflow

### 1. 🆕 **User Registration and Login**

- **Sign Up:** A new user fills out a registration form with essential details (e.g., username, password).
- **Log In:** Existing users provide their credentials to access their account.

Upon successful authentication, the user is redirected to the main chat interface.

### 2. 🏠 **Chat Room Management**

- Users can:
  - **Create a Room:** Provide a name to establish a new chat room.
  - **Join a Room:** Browse and join available rooms created by other users.

### 3. ✉️ **Messaging**

- Users within a chat room can:
  - Send messages.
  - Receive messages in real-time from other members.
- Message history is displayed when entering a room, enabling context for ongoing discussions.

### 4. 🛠️ **Profile Management**

- Accessible via a dedicated settings button on the main chat interface.
- Users can:
  - Change their nickname.
  - Update their password.
  - Log out from their account.
  - Delete their account, removing all associated data.

## 🏗️ Technical Architecture

### 1. 🌐 **HTTP Server**

- Serves static assets (HTML, CSS, JavaScript).
- Handles user authentication (Sign up, Log in, and profile management).
- Manages API endpoints for room creation, joining, and membership.

### 2. 🔄 **WebSocket Server**

- Manages real-time message exchange between users.
- Ensures low-latency communication within chat rooms.

### 3. 🗄️ **Database**

- Stores user data:
  - Credentials (username, password).
  - Profile settings (nickname).
- Maintains chat room details:
  - Room names.
  - Membership information.
- Preserves message history for each room.

## 💻 Technologies Used

### Core Technologies:

- 🚀 **Node.js:** A scalable and efficient runtime for server-side operations.
- 💾 **MySQL:** A relational database management system for structured and persistent data storage.
- 📡 **WebSockets:** A communication protocol enabling real-time, bidirectional messaging.

### Libraries and Tools:

- 🔒 **dotenv:** Facilitates secure management of environment variables.
- 📂 **mysql2:** Simplifies interaction with the MySQL database, providing asynchronous queries.
- ⚡ **ws:** Implements WebSocket-based real-time communication.

### Development and Quality Assurance:

- ⚙️ **Babel:** Enables compatibility by transpiling modern JavaScript and TypeScript.
- ✅ **Jest:** A robust testing framework ensuring application reliability.
- 📏 **ESLint:** Maintains high code quality through linting.
- 🎨 **Prettier:** Automatically formats code for readability and consistency.
- 🐶 **Husky:** Integrates Git hooks for automated pre-commit checks.
