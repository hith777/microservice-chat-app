const express = require('express');
const cors = require('cors');
require('dotenv').config();
const axios = require('axios');

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

// Keep existing routes for chat or main as is.
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Gateway running on http://localhost:${PORT}`));
