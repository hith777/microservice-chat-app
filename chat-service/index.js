// index.js in chat-service

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';
import ChatSession from './models/ChatMessage.js';
import authMiddleware from './middleware/auth.js';

dotenv.config();

// Setup OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Init express
const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
}).then(() => console.log('Chat Service connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

/**
 * POST /ask
 * Expects { prompt, sessionId }
 * 1) Finds the session doc by userId & sessionId
 * 2) Adds user message => calls OpenAI => adds assistant message
 * 3) Returns assistant response
 */
app.post('/ask', authMiddleware, async (req, res) => {
  try {
    const { prompt, sessionId } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    // 1. Find the session
    const chatSession = await ChatSession.findOne({
      _id: sessionId,
      userId: req.user.userId
    });
    if (!chatSession) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // 2. Call OpenAI
    const openaiResponse = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: prompt }
      ]
    });
    const aiResponse = openaiResponse.data.choices[0].message.content;

    chatSession.messages.push({
      role: 'user', content: prompt, userId: req.user.userId 
    });

    // 3. Add the assistant message
    chatSession.messages.push({
      role: 'assistant', content: aiResponse, userId: 'assistant'
    });

    // 4. Save session
    await chatSession.save();

    // Return only the assistant response
    res.json({ response: aiResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not process request' });
  }
});

/**
 * POST /new-session
 * 1) Creates a new ChatSession doc for the authenticated user
 * 2) Names it "Chat <count+1>"
 * Returns { sessionId, title }
 */
app.post('/new-session', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    // Count user’s existing sessions to label the new one
    const count = await ChatSession.countDocuments({ userId });
    const newTitle = `Chat ${count + 1}`;

    const newSession = new ChatSession({
      userId,
      title: newTitle,
      messages: []
    });
    await newSession.save();

    res.json({ sessionId: newSession._id, title: newTitle });
  } catch (error) {
    console.error('Error creating a new session:', error);
    res.status(500).json({ error: 'Could not create new session' });
  }
});

/**
 * GET /sessions
 * Returns a list of session docs for the user, sorted by newest first
 */
app.get('/sessions', authMiddleware, async (req, res) => {
  try {
    const userSessions = await ChatSession.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });
    res.json(userSessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not fetch sessions' });
  }
});

/**
 * GET /sessions/:id
 * Returns a single session doc with its messages, if it belongs to the user
 */
app.get('/sessions/:id', authMiddleware, async (req, res) => {
  try {
    const sessionId = req.params.id;
    const chatSession = await ChatSession.findOne({
      _id: sessionId,
      userId: req.user.userId
    });
    if (!chatSession) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json(chatSession);
  } catch (error) {
    console.error('Error fetching single session:', error);
    res.status(500).json({ error: 'Could not fetch session' });
  }
});

// Simple test endpoint
app.get('/', (req, res) => {
  res.send('Chat service is running');
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Chat service running on http://localhost:${PORT}`));
