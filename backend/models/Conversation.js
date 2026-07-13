const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'model'], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  liked: { type: Boolean, default: null } // null = no reaction, true = liked, false = disliked
});

const ConversationSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  title: { type: String, default: 'New Conversation' },
  messages: [MessageSchema]
}, { timestamps: true });

module.exports = mongoose.model('Conversation', ConversationSchema);
