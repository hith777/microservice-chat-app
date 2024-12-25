import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const chatSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String },
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now }
});


const ChatSession = mongoose.model('ChatSession', chatSessionSchema);
export default ChatSession;
