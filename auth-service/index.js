const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());
const authRoutes = require('./routes/auth');//integrating auth.js from routers to index.js
app.use('/auth', authRoutes);


// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Auth Service connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error in Auth Service:", err));

// Basic test route
app.get('/', (req, res) => {
    res.send('Auth service is running');
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Auth Service running on http://localhost:${PORT}`));
