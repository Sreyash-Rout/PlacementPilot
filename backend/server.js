const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

// Load questions from the JSON file
const { questionBank } = require("./data/questions.json");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Helper: get a random question from the questionBank
function getRandomQuestion() {
  return questionBank[Math.floor(Math.random() * questionBank.length)];
}

// Game object for each pair of players
let waitingPlayer = null;
let games = {};

function startQuestionRound(game) {
  if (game.currentQuestion) return; // already active

  const questionData = getRandomQuestion();
  game.currentQuestion = questionData;
  game.questionAnswered = false;

  // Send the question to both players with a 30-second duration
  io.to(game.player1.id).emit("newQuestion", { questionData, duration: 30 });
  io.to(game.player2.id).emit("newQuestion", { questionData, duration: 30 });

  // Set a timer for 30 seconds for the question round
  game.questionTimer = setTimeout(() => {
    if (!game.questionAnswered) {
      // No one answered correctly in time; notify both players they're not allowed to move.
      io.to(game.player1.id).emit("questionResult", { allowed: false });
      io.to(game.player2.id).emit("questionResult", { allowed: false });
      game.currentQuestion = null;
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
          ["", "", ""]
        ],
        allowedPlayerId: null, // Will be set after a correct answer
        currentQuestion: null,
        questionAnswered: false,
        questionTimer: null,
        moveTimer: null, // Timer waiting for allowed move
      };
      games[player1.id] = game;
      games[socket.id] = game;

      // Notify both players that an opponent was found.
      // Assigning playingAs: player1 gets "circle", player2 gets "cross".
      io.to(player1.id).emit("OpponentFound", { opponentName: player2.name, playingAs: "circle" });
      io.to(player2.id).emit("OpponentFound", { opponentName: player1.name, playingAs: "cross" });

      // Start the first question round
      startQuestionRound(game);
      waitingPlayer = null;
    } else {
      waitingPlayer = { id: socket.id, name: playerName };
    }
  });

  socket.on("questionAnswer", ({ answer }) => {
    const game = games[socket.id];
    if (!game || !game.currentQuestion || game.questionAnswered) return;

    if (answer === game.currentQuestion.correct) {
      game.questionAnswered = true;
      clearTimeout(game.questionTimer);
      game.allowedPlayerId = socket.id; // This player gets to move

      // Emit a "questionResult" to each player with an explicit allowed flag.
      io.to(game.player1.id).emit("questionResult", { allowed: game.player1.id === socket.id });
      io.to(game.player2.id).emit("questionResult", { allowed: game.player2.id === socket.id });
      game.currentQuestion = null;

      // Start a move timer: if the allowed player doesn't move within 30 seconds, restart question round.
      game.moveTimer = setTimeout(() => {
        game.allowedPlayerId = null;
        startQuestionRound(game);
      }, 30000);
    }
  });

  socket.on("makeMove", ({ row, col, player }) => {
    const game = games[socket.id];
    if (!game) return;
    // Only allow move if this socket is allowed
    if (game.allowedPlayerId !== socket.id) return;
    // Validate move: cell must be empty
    if (game.board[row][col] !== "") return;

    // Clear the move timer since a move was made
    if (game.moveTimer) clearTimeout(game.moveTimer);

    game.board[row][col] = player;
    game.allowedPlayerId = null; // Reset until next question round

    // Send updated board to both players
    io.to(game.player1.id).emit("gameUpdate", { board: game.board });
    io.to(game.player2.id).emit("gameUpdate", { board: game.board });

    const winner = checkWinner(game.board);
    if (winner) {
      io.to(game.player1.id).emit("gameOver", winner);
      io.to(game.player2.id).emit("gameOver", winner);
      delete games[game.player1.id];
      delete games[game.player2.id];
    } else {
      // Start a new question round for the next move
      startQuestionRound(game);
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

// Winner checking function
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