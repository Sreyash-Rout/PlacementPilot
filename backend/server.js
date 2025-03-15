const mongoose = require('mongoose');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const reviewRouter = require('./routes/reviewRoute');
const { questionBank } = require('./data/questions.json');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/experienceDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Experience Routes
app.use('/api/experiences', reviewRouter);

// Helper: Get a random question
function getRandomQuestion() {
  return questionBank[Math.floor(Math.random() * questionBank.length)];
}

let waitingPlayer = null;
let games = {};

function startQuestionRound(game) {
  if (game.currentQuestion) return;

  const questionData = getRandomQuestion();
  game.currentQuestion = questionData;
  game.questionAnswered = false;
  game.answeredPlayers = {};

  io.to(game.player1.id).emit('newQuestion', { questionData, duration: 30 });
  io.to(game.player2.id).emit('newQuestion', { questionData, duration: 30 });

  game.questionTimer = setTimeout(() => {
    if (!game.questionAnswered) {
      setTimeout(() => {
        io.to(game.player1.id).emit('questionResult', { allowed: false, message: "Time's up! No correct answer." });
        io.to(game.player2.id).emit('questionResult', { allowed: false, message: "Time's up! No correct answer." });
        game.currentQuestion = null;
        game.answeredPlayers = {};
        startQuestionRound(game);
      }, 2000);
    }
  }, 30000);
}

io.on('connection', (socket) => {
  console.log('A player connected:', socket.id);

  socket.on('request_to_play', ({ playerName }) => {
    if (waitingPlayer) {
      const player1 = waitingPlayer;
      const player2 = { id: socket.id, name: playerName };
      const game = {
        player1,
        player2,
        board: [['', '', ''], ['', '', ''], ['', '', '']],
        allowedPlayerId: null,
        currentQuestion: null,
        questionAnswered: false,
        answeredPlayers: {},
        questionTimer: null,
        moveTimer: null,
      };
      games[player1.id] = game;
      games[socket.id] = game;

      io.to(player1.id).emit('OpponentFound', { opponentName: player2.name, playingAs: 'circle' });
      io.to(player2.id).emit('OpponentFound', { opponentName: player1.name, playingAs: 'cross' });

      startQuestionRound(game);
      waitingPlayer = null;
    } else {
      waitingPlayer = { id: socket.id, name: playerName };
    }
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    const game = games[socket.id];
    if (game) {
      const opponentId = game.player1.id === socket.id ? game.player2.id : game.player1.id;
      io.to(opponentId).emit('opponentLeftMatch');
      delete games[game.player1.id];
      delete games[game.player2.id];
    }
    if (waitingPlayer && waitingPlayer.id === socket.id) {
      waitingPlayer = null;
    }
  });
});

server.listen(5000, () => console.log('Server running on port 5000'));
