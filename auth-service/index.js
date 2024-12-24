import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import './routes/passport.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);


// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000, // Increase timeout (5 seconds)
}).then(() => console.log('Auth Service Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));


// Basic test route
app.get('/', (req, res) => {
    res.send('Auth service is running');
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Auth Service running on http://localhost:${PORT}`));
