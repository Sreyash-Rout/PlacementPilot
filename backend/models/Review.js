const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  username: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const reviewSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  experience: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  username: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  replies: [replySchema], 
});

module.exports = mongoose.model('Review', reviewSchema);
