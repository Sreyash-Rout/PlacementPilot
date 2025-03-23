import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Swal from "sweetalert2";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Square from "./square";
import "./gaming.css";

const initialBoard = [
  ["", "", ""],
  ["", "", ""],
  ["", "", ""],
];

const MultiplayerGaming = () => {
  const [gameState, setGameState] = useState(initialBoard);
  const [finishedState, setFinishedState] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [opponentName, setOpponentName] = useState(null);
  const [playingAs, setPlayingAs] = useState(null);
  const [socket, setSocket] = useState(null);
  const [playOnline, setPlayOnline] = useState(false);

  // Question mechanism states:
  const [currentQuestion, setCurrentQuestion] = useState(null); // { question, options, correct }
  const [countdown, setCountdown] = useState(0);
  const [allowedToMove, setAllowedToMove] = useState(false);
  const [questionLocked, setQuestionLocked] = useState(false); // Prevent further answer attempts if wrong
  // Separate messages:
  const [globalMessage, setGlobalMessage] = useState(""); // For correct–answer announcements (displayed on main interface)
  const [questionMessage, setQuestionMessage] = useState(""); // For wrong answers/time–up (displayed in question overlay)

  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.backgroundColor = "#1f1f2f";
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  // Winner checking
  const checkWinner = useCallback(() => {
    for (let row = 0; row < 3; row++) {
      if (
        gameState[row][0] &&
        gameState[row][0] === gameState[row][1] &&
        gameState[row][1] === gameState[row][2]
      ) {
        return gameState[row][0];
      }
    }
    for (let col = 0; col < 3; col++) {
      if (
        gameState[0][col] &&
        gameState[0][col] === gameState[1][col] &&
        gameState[1][col] === gameState[2][col]
      ) {
        return gameState[0][col];
      }
    }
    if (
      gameState[0][0] &&
      gameState[0][0] === gameState[1][1] &&
      gameState[1][1] === gameState[2][2]
    ) {
      return gameState[0][0];
    }
    if (
      gameState[0][2] &&
      gameState[0][2] === gameState[1][1] &&
      gameState[1][1] === gameState[2][0]
    ) {
      return gameState[0][2];
    }
    if (gameState.flat().every((cell) => cell !== "")) return "draw";
    return null;
  }, [gameState]);

  useEffect(() => {
    const winner = checkWinner();
    if (winner) {
      setFinishedState(winner);
    }
  }, [gameState, checkWinner]);

  const takePlayerName = async () => {
    const result = await Swal.fire({
      title: "Enter your name",
      input: "text",
      showCancelButton: true,
      inputValidator: (value) =>
        value ? undefined : "You need to write something!",
    });
    return result;
  };

  // Socket event listeners
  useEffect(() => {
    if (socket) {
      socket.on("opponentLeftMatch", () => {
        alert("Opponent left the match :(");
        setFinishedState("opponentLeftMatch");
      });

      socket.on("gameUpdate", (data) => {
        setGameState(data.board);
      });

      socket.on("gameOver", (winner) => {
        setFinishedState(winner);
      });

      socket.on("OpponentNotFound", () => {
        setOpponentName(false);
      });

      socket.on("OpponentFound", (data) => {
        setPlayingAs(data.playingAs);
        setOpponentName(data.opponentName);
      });

      // New question event:
      socket.on("newQuestion", (data) => {
        console.log("New question received:", data);
        setCurrentQuestion(data.questionData);
        setCountdown(data.duration);
        setAllowedToMove(false);
        setQuestionLocked(false);
        setQuestionMessage(""); // Clear any prior question message
        // Optionally clear the global message for a fresh start:
        // setGlobalMessage("");
      });

      // Wrong answer event: show message in question overlay
      socket.on("wrongAnswer", (data) => {
        setQuestionMessage(data.message);
        setQuestionLocked(true);
      });

      // Question result event:
      socket.on("questionResult", (data) => {
        console.log("Question result received:", data);
        setAllowedToMove(data.allowed);
        // Check if the message indicates a correct answer.
        if (data.allowed || (data.message && data.message.includes("answered correctly"))) {
          // Correct answer: display message globally and clear the overlay on both ends.
          setGlobalMessage(data.message);
          setCurrentQuestion(null);
          setCountdown(0);
        } else {
          // For time-up or both-wrong, display the message in the question overlay.
          setQuestionMessage(data.message || "");
          // The overlay will be replaced by the next newQuestion event.
        }
      });

      return () => socket.disconnect();
    }
  }, [socket]);

  // Countdown timer for questions
  useEffect(() => {
    if (currentQuestion && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentQuestion, countdown]);

  const playOnlineClick = async () => {
    const result = await takePlayerName();
    if (!result.isConfirmed || !result.value) return;

    setPlayerName(result.value);
    const newSocket = io("http://localhost:5001", { autoConnect: true });
    newSocket.emit("request_to_play", { playerName: result.value });
    setSocket(newSocket);
    setPlayOnline(true);
  };

  // Handle answering a question (only if not locked)
  const handleAnswer = (answer) => {
    if (socket && currentQuestion && !questionLocked) {
      socket.emit("questionAnswer", { answer });
    }
  };

  // Handle making a move (only if allowed)
  const makeMove = (row, col) => {
    if (!socket || !allowedToMove || finishedState || gameState[row][col] !== "") return;
    socket.emit("makeMove", { row, col, player: playingAs });
    setAllowedToMove(false);
  };

  const handleBackToOptionsPage = () => navigate("/options");

  return (
    <div className="page-container">
      <Navbar />
      <div className="main-div">
        {!playOnline ? (
          <button onClick={playOnlineClick} className="playOnline">
            Play Online
          </button>
        ) : !opponentName ? (
          <p className="waiting">Waiting for opponent...</p>
        ) : (
          <div className="water-background">
            <div className="move-detection">
              <div className={`left ${allowedToMove ? "current-move-" + playingAs : ""}`}>
                {playerName}
              </div>
              <div className={`right ${!allowedToMove ? "current-move-" + playingAs : ""}`}>
                {opponentName}
              </div>
            </div>
            <h1 className="game-heading">Tic Tac Toe</h1>

            {/* Global message displayed on the main interface (for correct answers) */}
            {globalMessage && <div className="global-message">{globalMessage}</div>}

            <div className="square-wrapper">
              {gameState.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <Square
                    key={rowIndex * 3 + colIndex}
                    makeMove={() => makeMove(rowIndex, colIndex)}
                    finishedState={finishedState}
                    currentElement={cell}
                  />
                ))
              )}
            </div>

            {finishedState && (
              <>
                <h3 className="finished-state">
                  {finishedState === "draw"
                    ? "It's a Draw!"
                    : finishedState === "opponentLeftMatch"
                    ? "Opponent Left, You Win"
                    : `${finishedState} won the game`}
                </h3>
                <button className="back-to-OptionPage-button" onClick={handleBackToOptionsPage}>
                  Exit Game
                </button>
              </>
            )}

            {/* Question overlay (displays question and question message for wrong/time-up) */}
            {currentQuestion && (
              <div className="question-overlay">
                <div className="question-box">
                  <h2>{currentQuestion.question}</h2>
                  {questionMessage && <p className="question-message">{questionMessage}</p>}
                  <div className="options">
                    {currentQuestion.options.map((opt, idx) => (
                      <button key={idx} onClick={() => handleAnswer(opt)} disabled={questionLocked}>
                        {opt}
                      </button>
                    ))}
                  </div>
                  <p>Time remaining: {countdown} seconds</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MultiplayerGaming;