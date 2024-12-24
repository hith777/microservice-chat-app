import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3003';
const CHAT_SERVICE_URL = process.env.CHAT_SERVICE_URL || 'http://localhost:3002';

app.post('/auth/signup', async (req, res) => {
    try {
        const response = await axios.post(`${AUTH_SERVICE_URL}/auth/signup`, req.body);
        res.json(response.data);
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

app.post('/auth/login', async (req, res) => {
    try {
        const response = await axios.post(`${AUTH_SERVICE_URL}/auth/login`, req.body);
        res.json(response.data);
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

app.post('/ask', async (req, res) => {
    try {
        // Forward request and headers to the Chat Service
        const response = await axios.post(`${CHAT_SERVICE_URL}/ask`, req.body, {
            headers: {
                'Authorization': req.headers['authorization'] || '',
                'Content-Type': 'application/json'
            }
        });
        res.json(response.data);
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

app.get('/history', async (req, res) => {
    try {
      const authHeader = req.headers['authorization'] || '';
      const response = await axios.get(`${CHAT_SERVICE_URL}/history`, {
        headers: { 'Authorization': authHeader }
      });
      res.json(response.data);
    } catch (error) {
      if (error.response) {
        // If Chat Service responds with an error
        res.status(error.response.status).json(error.response.data);
      } else {
        // Network or other internal error
        console.error("Internal server error:", error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

// For Google
app.get('/auth/google', async (req, res) => {
    // Forward to Auth Service
    res.redirect(`${AUTH_SERVICE_URL}/auth/google`);
});

app.get('/auth/google/callback', async (req, res) => {
    // Forward to Auth Service callback
    // Alternatively, you can directly proxy using axios, but redirecting is simpler for OAuth.
    res.redirect(`${AUTH_SERVICE_URL}/auth/google/callback?${req.url.split('?')[1]}`);
});

// For GitHub
app.get('/auth/github', async (req, res) => {
    res.redirect(`${AUTH_SERVICE_URL}/auth/github`);
});

app.get('/auth/github/callback', async (req, res) => {
    res.redirect(`${AUTH_SERVICE_URL}/auth/github/callback?${req.url.split('?')[1]}`);
});


// Keep existing routes for chat or main as is.
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Gateway running on http://localhost:${PORT}`));
