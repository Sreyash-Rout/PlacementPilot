const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

// Load questions from the JSON file
const { questionBank } = require("./data/questions.json");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());

// Helper: get a random question from the questionBank
function getRandomQuestion() {
  return questionBank[Math.floor(Math.random() * questionBank.length)];
}

// Game object for each pair of players
let waitingPlayer = null;
let games = {};

function startQuestionRound(game) {
  if (game.currentQuestion) return; // Prevent duplicate rounds

  const questionData = getRandomQuestion();
  game.currentQuestion = questionData;
  game.questionAnswered = false;
  game.answeredPlayers = {};

  // Send the question to both players with a 30-second duration
  io.to(game.player1.id).emit("newQuestion", { questionData, duration: 30 });
  io.to(game.player2.id).emit("newQuestion", { questionData, duration: 30 });

  // 30-second timer for the question
  game.questionTimer = setTimeout(() => {
    if (!game.questionAnswered) {
      // Time's up: delay sending questionResult so messages persist
      setTimeout(() => {
        io.to(game.player1.id).emit("questionResult", {
          allowed: false,
          message: "Time's up! No correct answer.",
        });
        io.to(game.player2.id).emit("questionResult", {
          allowed: false,
          message: "Time's up! No correct answer.",
        });
        game.currentQuestion = null;
        game.answeredPlayers = {};
        startQuestionRound(game);
      }, 2000);
    }
  }, 30000);
}

io.on("connection", (socket) => {
  console.log("A player connected:", socket.id);

  socket.on("request_to_play", ({ playerName }) => {
    if (waitingPlayer) {
      const player1 = waitingPlayer;
      const player2 = { id: socket.id, name: playerName };
      const game = {
        player1,
        player2,
        board: [
          ["", "", ""],
          ["", "", ""],
          ["", "", ""],
        ],
        allowedPlayerId: null,
        currentQuestion: null,
        questionAnswered: false,
        answeredPlayers: {},
        questionTimer: null,
        moveTimer: null,
      };
      games[player1.id] = game;
      games[socket.id] = game;

      io.to(player1.id).emit("OpponentFound", {
        opponentName: player2.name,
        playingAs: "circle",
      });
      io.to(player2.id).emit("OpponentFound", {
        opponentName: player1.name,
        playingAs: "cross",
      });

      startQuestionRound(game);
      waitingPlayer = null;
    } else {
      waitingPlayer = { id: socket.id, name: playerName };
    }
  });

  socket.on("questionAnswer", ({ answer }) => {
    const game = games[socket.id];
    if (!game || !game.currentQuestion) return;
    if (!game.answeredPlayers) game.answeredPlayers = {};
    if (game.answeredPlayers[socket.id]) return; // Ignore repeated answers

    if (answer === game.currentQuestion.correct) {
      // Correct answer branch
      game.questionAnswered = true;
      clearTimeout(game.questionTimer);
      game.allowedPlayerId = socket.id; // This player gets to move

      const correctPlayerName = game.player1.id === socket.id ? game.player1.name : game.player2.name;

      io.to(game.player1.id).emit("questionResult", {
        allowed: game.player1.id === socket.id,
        message: `${correctPlayerName} answered correctly and will make a move.`,
      });
      io.to(game.player2.id).emit("questionResult", {
        allowed: game.player2.id === socket.id,
        message: `${correctPlayerName} answered correctly and will make a move.`,
      });
      game.currentQuestion = null;
      game.answeredPlayers = {};

      game.moveTimer = setTimeout(() => {
        game.allowedPlayerId = null;
        startQuestionRound(game);
      }, 30000);
    } else {
      // Wrong answer branch
      game.answeredPlayers[socket.id] = "wrong";
      io.to(socket.id).emit("wrongAnswer", {
        message: "You chose the wrong option. You cannot answer further for this question.",
      });
      if (game.answeredPlayers[game.player1.id] && game.answeredPlayers[game.player2.id]) {
        clearTimeout(game.questionTimer);
        setTimeout(() => {
          io.to(game.player1.id).emit("questionResult", {
            allowed: false,
            message: "Both players answered wrong. New question coming soon.",
          });
          io.to(game.player2.id).emit("questionResult", {
            allowed: false,
            message: "Both players answered wrong. New question coming soon.",
          });
          game.currentQuestion = null;
          game.answeredPlayers = {};
          startQuestionRound(game);
        }, 2000);
      }
    }
  });

  socket.on("makeMove", ({ row, col, player }) => {
    const game = games[socket.id];
    if (!game) return;
    if (game.allowedPlayerId !== socket.id) return;
    if (game.board[row][col] !== "") return;

    if (game.moveTimer) clearTimeout(game.moveTimer);

    game.board[row][col] = player;
    game.allowedPlayerId = null;

    io.to(game.player1.id).emit("gameUpdate", { board: game.board });
    io.to(game.player2.id).emit("gameUpdate", { board: game.board });

    const winner = checkWinner(game.board);
    if (winner) {
      io.to(game.player1.id).emit("gameOver", winner);
      io.to(game.player2.id).emit("gameOver", winner);
      delete games[game.player1.id];
      delete games[game.player2.id];
    } else {
      setTimeout(() => {
        startQuestionRound(game);
      }, 2000);
    }
  });

  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
    const game = games[socket.id];
    if (game) {
      const opponentId = game.player1.id === socket.id ? game.player2.id : game.player1.id;
      io.to(opponentId).emit("opponentLeftMatch");
      delete games[game.player1.id];
      delete games[game.player2.id];
    }
    if (waitingPlayer && waitingPlayer.id === socket.id) {
      waitingPlayer = null;
    }
  });
});

function checkWinner(board) {
  for (let i = 0; i < 3; i++) {
    if (board[i][0] && board[i][0] === board[i][1] && board[i][1] === board[i][2])
      return board[i][0];
    if (board[0][i] && board[0][i] === board[1][i] && board[1][i] === board[2][i])
      return board[0][i];
  }
  if (board[0][0] && board[0][0] === board[1][1] && board[1][1] === board[2][2])
    return board[0][0];
  if (board[0][2] && board[0][2] === board[1][1] && board[1][1] === board[2][0])
    return board[0][2];
  if (board.flat().every((cell) => cell !== "")) return "draw";
  return null;
}

server.listen(5000, () => console.log("Server running on port 5000"));