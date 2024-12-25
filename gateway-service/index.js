// index.js in gateway-service
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// These environment variables point to your Auth and Chat services
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3003';
const CHAT_SERVICE_URL = process.env.CHAT_SERVICE_URL || 'http://localhost:3002';

/**
 * POST /auth/signup
 * Forwards signup requests to Auth Service
 */
app.post('/auth/signup', async (req, res) => {
  try {
    const response = await axios.post(`${AUTH_SERVICE_URL}/auth/signup`, req.body);
    res.json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error('Gateway error in /auth/signup:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

/**
 * POST /auth/login
 * Forwards login requests to Auth Service
 */
app.post('/auth/login', async (req, res) => {
  try {
    const response = await axios.post(`${AUTH_SERVICE_URL}/auth/login`, req.body);
    res.json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error('Gateway error in /auth/login:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

/**
 * POST /ask
 * Forwards user chat messages to Chat Service's /ask
 * Expects { prompt, sessionId } in req.body
 */
app.post('/ask', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'] || '';
    const response = await axios.post(`${CHAT_SERVICE_URL}/ask`, req.body, {
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json'
      }
    });
    res.json(response.data);
  } catch (error) {
    if (error.response) {
      console.error('Chat Service error in /ask:', error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error('Gateway error forwarding /ask:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

/**
 * POST /new-session
 * Forwards requests to create a new Chat Session
 */
app.post('/new-session', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'] || '';
    const response = await axios.post(`${CHAT_SERVICE_URL}/new-session`, req.body, {
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json'
      }
    });
    // Return the Chat Service response (e.g. { sessionId, title }) to the frontend
    res.json(response.data);
  } catch (error) {
    if (error.response) {
      console.error('Chat Service error in /new-session:', error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error('Gateway error creating session:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

/**
 * GET /sessions
 * Forwards requests to fetch all chat sessions for the user
 */
app.get('/sessions', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'] || '';
    const response = await axios.get(`${CHAT_SERVICE_URL}/sessions`, {
      headers: { Authorization: authHeader }
    });
    res.json(response.data);
  } catch (error) {
    if (error.response) {
      console.error('Chat Service error in /sessions:', error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error('Gateway error fetching sessions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

/**
 * GET /sessions/:id
 * Forwards request to fetch a single session by ID
 */
app.get('/sessions/:id', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'] || '';
    const { id } = req.params;
    const response = await axios.get(`${CHAT_SERVICE_URL}/sessions/${id}`, {
      headers: { Authorization: authHeader }
    });
    res.json(response.data);
  } catch (error) {
    if (error.response) {
      console.error('Chat Service error in /sessions/:id:', error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error('Gateway error fetching single session:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

/**
 * Google OAuth endpoints
 * We simply redirect user to Auth Service
 */
app.get('/auth/google', (req, res) => {
  res.redirect(`${AUTH_SERVICE_URL}/auth/google`);
});

app.get('/auth/google/callback', (req, res) => {
  res.redirect(`${AUTH_SERVICE_URL}/auth/google/callback?${req.url.split('?')[1]}`);
});

/**
 * GitHub OAuth endpoints
 */
app.get('/auth/github', (req, res) => {
  res.redirect(`${AUTH_SERVICE_URL}/auth/github`);
});

app.get('/auth/github/callback', (req, res) => {
  res.redirect(`${AUTH_SERVICE_URL}/auth/github/callback?${req.url.split('?')[1]}`);
});

// Start the Gateway
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Gateway running on http://localhost:${PORT}`));
