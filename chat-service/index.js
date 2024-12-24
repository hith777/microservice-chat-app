import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';
import {ChatMessage, ChatSession} from './models/ChatMessage.js';
import authMiddleware from'./middleware/auth.js';

dotenv.config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});


const app = express();
app.use(cors());
app.use(express.json());
const openai = new OpenAIApi(configuration);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000, // Increase timeout (5 seconds)
}).then(() => console.log('Chat Service Service Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

app.post('/ask', authMiddleware, async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    try {
        // Call OpenAI API
        const openaiResponse = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }]
        });

        const aiResponse = openaiResponse.data.choices[0].message.content;

        // Save to MongoDB
        const newMessage = new ChatMessage({
            userId: req.user.userId,  // from decoded JWT
            prompt,
            response: aiResponse
        });
        await newMessage.save();

        res.json({ response: aiResponse });
    } catch (error) {
        console.error("Error in /ask endpoint:", error.response?.data || error.message || error);
        res.status(500).json({ error: 'Could not process request' });
    }
});

app.post('/new-session', authMiddleware, async (req, res) => {
    try {
      const userId = req.user.userId;
  
      // Get how many sessions exist to name the next one "Chat <n+1>"
      const count = await ChatSession.countDocuments({ userId });
      const newTitle = `Chat ${count + 1}`;
  
      const newSession = new ChatSession({ userId, title: newTitle });
      await newSession.save();
  
      res.json({ sessionId: newSession._id, title: newTitle });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Could not create a new session' });
    }
  });

// Just a test endpoint for now
app.get('/', (req, res) => {
    res.send('Chat service is running');
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Chat service running on http://localhost:${PORT}`));
