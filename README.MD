
# My Microservice Chat App

## Overview

This application is composed of four main parts:

1. **Frontend (React + Next.js + TypeScript)**
   - Runs on **http://localhost:3000**.  
   - Users can input queries and view responses from the AI.

2. **Gateway Service (Express)**
   - Runs on **http://localhost:3001**.  
   - This service receives requests from the frontend and routes them to the appropriate backend service (Auth or Chat).

3. **Auth Service (Express + MongoDB)**
   - Runs on **http://localhost:3003**.  
   - Handles user signup/login, issues JWT tokens for secure routes.

4. **Chat Service (Express + MongoDB + OpenAI)**
   - Runs on **http://localhost:3002**.  
   - Interacts with the OpenAI API, stores/retrieves chat messages in MongoDB, and supports multi-session chat.

```
+----------+           +-------------+           +-----------------+
| Frontend |   -->     |   Gateway   |   -->     |  Chat Service   |
| (Next.js)|           |  (Express)  |           | (Express +      |
|          |           |             |           |  MongoDB +      |
|          |           |             |           |  OpenAI)        |
+----------+           +-------------+           +-----------------+

                    (Also) --->  Auth Service (issues JWT, runs on http://localhost:3003)
```

- **User Flow**:  
  The **Frontend** talks only to the **Gateway** (e.g., `/ask`, `/auth/login`).  
  The **Gateway** proxies requests to the **Auth Service** (for signup/login, etc.) or the **Chat Service** (for chatting with OpenAI).

---

## Running Locally

You’ll need **four separate terminals** (or processes), one for each service:

### 1. Clone the Repo & Create `.env` Files

```bash
git clone https://github.com/your-username/microservice-chat-app.git
cd microservice-chat-app
```

**Important**: We do **not** commit `.env` files to Git. You must create a `.env` file in each service folder (gateway, auth, chat, and optionally frontend) for secrets like DB URIs, JWT secrets, and OpenAI keys. For example:

- **`chat-service/.env`**:
  ```
  MONGODB_URI="mongodb+srv://..."
  OPENAI_API_KEY="sk-..."
  JWT_SECRET="some-secret-jwt-key"
  ```
- **`auth-service/.env`**:
  ```
  MONGODB_URI="mongodb+srv://..."
  JWT_SECRET="some-other-secret-key"
  ```
- **`gateway-service/.env`** (if needed):
  ```
  AUTH_SERVICE_URL="http://localhost:3003"
  CHAT_SERVICE_URL="http://localhost:3002"
  ```
- **`frontend/.env`** (if needed).

Add `*.env` to each `.gitignore` so you don’t push these files.

### 2. Install and Run Each Service

#### A) **Frontend** (`http://localhost:3000`)

```bash
cd frontend
npm install
npm run dev
```

#### B) **Gateway Service** (`http://localhost:3001`)

```bash
cd gateway-service
npm install
node index.js
```

#### C) **Auth Service** (`http://localhost:3003`)

```bash
cd auth-service
npm install
node index.js
```

#### D) **Chat Service** (`http://localhost:3002`)

```bash
cd chat-service
npm install
node index.js
```

Open your browser at **http://localhost:3000** to see the frontend. The gateway is at port `3001`, the Auth Service at `3003`, and Chat Service at `3002`.

---

## Auth Service (Endpoints & Notes)

- **`POST /auth/signup`**: Register a new user with email+password, returns JWT.  
- **`POST /auth/login`**: Login with email+password, returns JWT.  

**Flow**:  
Frontend calls (via Gateway) `POST /auth/signup` or `/auth/login`. The Gateway proxies it to Auth (`http://localhost:3003`). The Auth Service returns a JWT, which the frontend stores (e.g., localStorage). This token is used on protected routes (like `/ask`).

---

## Chat Service (Endpoints & Notes)

- **`POST /new-session`**: Creates a new chat session doc in MongoDB, returns `{ sessionId, title }`.  
- **`POST /ask`**: Takes `{ prompt, sessionId }`, calls OpenAI, stores user+assistant messages, returns AI response.  
- **`GET /sessions`**: Lists all sessions for the authenticated user.  
- **`GET /sessions/:id`**: Returns a single session doc (including messages).

**Storage**:  
A `ChatSession` model with fields:
```js
{
  userId: String,
  title: String,
  messages: [
    { role: 'user'|'assistant', content: '...', timestamp... }
  ],
  createdAt: Date
}
```
Allows multi-session chats. The user can pick previous sessions to continue.

---

## Gateway (Routes & Notes)

- **Auth**:  
  - `POST /auth/signup` → forwards to `Auth Service /auth/signup`.  
  - `POST /auth/login` → forwards to `Auth Service /auth/login`.  
- **Chat**:  
  - `POST /new-session`, `POST /ask`, `GET /sessions`, `GET /sessions/:id` → forwards to Chat Service.  
- **OAuth** (if used):  
  - `/auth/google`, `/auth/google/callback` → proxies to Auth Service’s Google OAuth.  
  - `/auth/github`, `/auth/github/callback` → proxies to Auth Service’s GitHub OAuth.

The gateway ensures the frontend never directly talks to the Auth or Chat service. All traffic is centralized.

---

## Frontend (Next.js + TypeScript)

- **Runs on http://localhost:3000**  
- Might have a login page (`/login`) that calls `POST /auth/login` (via gateway).  
- A chat page (e.g. `/chat`) that references `POST /ask` or `POST /new-session`.  
- A sidebar listing sessions (fetched via `GET /sessions`), and a main chat area storing messages in local state.  

**State**:  
When a user enters the first message, the code calls `POST /new-session` if no session exists, then `POST /ask` with `sessionId`. The user message is appended locally first, so they see it immediately, then the AI response is appended on success.

---

## Removing `.env` from Git

If you ever accidentally committed `.env`:
1. **Add** `.env` to each `.gitignore`.  
2. `git rm --cached .env`, then `git commit -m "Remove .env from tracked files"`  
3. Push the changes. If you want to fully remove them from Git history, you can use [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/) or `git filter-branch`.

---

## Major Logs/Changes (Days 1–X)

1. **Day 1**: Basic skeleton:
   - `frontend`, `gateway-service`, `auth-service`, `chat-service`.  
   - Minimal Next.js + Express structure.

2. **Day 2**: Auth Service integration:
   - `POST /auth/signup`, `POST /auth/login`.  
   - JWT issuance + user validation.

3. **Days 3–5**: Chat integration & UI improvements:
   - `POST /ask` in Chat Service calls OpenAI, stores messages.  
   - Multi-session logic (`POST /new-session`, `/sessions`).  
   - Frontend chat page with local state.  
   - OAuth (Google/GitHub) in Auth Service.  
   - Basic sidebar in Next.js showing chat sessions.

4. **.env Removal**:
   - We removed `.env` from Git to hide OpenAI keys, JWT secrets, etc.  
   - Added instructions for users to create local `.env` files in each service.

---

## Future Plans

- More robust error handling and logging.  
- Dockerizing each service for production.  
- Possibly streaming AI responses for a real-time “typing” effect.  

---
