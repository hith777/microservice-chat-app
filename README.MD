# My Microservice Chat App

## Overview
This application is composed of three main parts:
- **Frontend (React + Next.js + TypeScript)**: Runs on `http://localhost:3000`. Users can input queries and view responses from the AI.
- **Gateway Service (Express)**: Runs on `http://localhost:3001`. This service receives requests from the frontend and routes them to the appropriate backend service.
- **Chat Service (Express + MongoDB + OpenAI)**: Runs on `http://localhost:3002`. This handles the logic of interacting with the OpenAI API and storing/retrieving chat messages from MongoDB.

## Architecture Diagram
+----------+ +-------------+ +-------------+ | Frontend | --> | Gateway | --> | Chat Service| | (Next.js)| | (Express) | | (Express + | | | | | | MongoDB + | | | | | | OpenAI) | +----------+ +-------------+ +-------------+


The frontend communicates only with the gateway. The gateway then forwards requests (like `/ask`) to the chat service, which in turn calls the OpenAI API and MongoDB. This setup allows for easy scaling and adding more services later if needed.

## Running Locally
1. Frontend:
   ```bash
   cd frontend
   npm run dev
   
2. Gateway Service:
   ```bash
   cd gateway-service
   node index.js

3. Auth Service:
   ```bash
   cd auth-service
   node index.js

4. Chat Service:
   ```bash
   cd chat-service
   node index.js

### Auth Service (Day 2 Updates)
- **Endpoints:**
   - `POST /auth/signup`: Register a new user with email and password. Returns a JWT.
   - `POST /auth/login`: Login with email and password. Returns a JWT.

- **Data Flow:**
  The frontend will eventually call `POST /auth/signup` or `POST /auth/login` through the gateway (`http://localhost:3001`) to register or login. The gateway then proxies these requests to the Auth Service (`http://localhost:3003`).

- **Next Steps:**
  In future days, we’ll integrate OAuth (Google/GitHub), secure Chat endpoints using the JWT token, and update the frontend UI to handle login and token storage.
