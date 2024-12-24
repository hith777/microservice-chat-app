import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    prompt: { type: String, required: true },
    response: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});


const chatSessionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    title: { type: String }, // e.g., "Chat 1"
    messages: [chatMessageSchema],
    createdAt: { type: Date, default: Date.now },
  });


const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
const ChatSession = mongoose.model('ChatSession', chatSessionSchema);
export { ChatSession, ChatMessage };
