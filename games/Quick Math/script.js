const ARCADE_TOKENS_KEY = "arcadeTokens";

function saveTokensToLocalStorage(amount) {
  if (amount <= 0) return;
  let currentTokens = parseInt(localStorage.getItem(ARCADE_TOKENS_KEY)) || 0;
  localStorage.setItem(ARCADE_TOKENS_KEY, currentTokens + amount);
}

function createTokenDisplay() {
  let display = document.getElementById("in-game-token-display");
  if (!display) {
    display = document.createElement("div");
    display.id = "in-game-token-display";
    display.style.position = "fixed";
    display.style.top = "10px";
    display.style.right = "10px";
    display.style.padding = "8px 12px";
    display.style.backgroundColor = "rgba(0,0,0,0.7)";
    display.style.color = "#FFD700"; // Gold for consistency, or theme later
    display.style.borderRadius = "5px";
    display.style.fontFamily = "'Press Start 2P', cursive";
    display.style.fontSize = "0.9em";
    display.style.zIndex = "1000";
    document.body.appendChild(display);
  }
  return display;
}

function updateTokenDisplayInGame(tokens) {
  const display = createTokenDisplay();
  display.textContent = `Tokens: ${tokens}`;
}

function getCurrentTokens() {
  // Helper if not already in this game's script
  return parseInt(localStorage.getItem(ARCADE_TOKENS_KEY)) || 0;
}

document.addEventListener("DOMContentLoaded", () => {
  const problemDisplay = document.getElementById("problem-display");
  const answerInput = document.getElementById("answer-input");
  const submitButton = document.getElementById("submit-button");
  const feedbackMessage = document.getElementById("feedback-message");
  const scoreDisplay = document.getElementById("score-display");
  const questionsLeftDisplay = document.getElementById(
    "questions-left-display"
  );
  const startGameButton = document.getElementById("start-game-button");
  const timerDisplay = document.getElementById("time-left");
  const gameOverMessage = document.getElementById("game-over-message");
  const finalScoreDisplay = document.getElementById("final-score-display");
  const tokensEarnedDisplay = document.getElementById("tokens-earned-display");

  // Game Settings
  const totalQuestions = 10;

  updateTokenDisplayInGame(getCurrentTokens());

  // --- DIFFICULTY SETTINGS ---
  let currentDifficultyLevel = 1;
  const maxDifficultyLevel = 5;

  function getDifficultySettings(level) {
    switch (level) {
      case 1: // Easiest
        return {
          maxNum: 10,
          operations: ["+", "-"],
          time: 10,
          baseToken: 1,
          timeBonusFactor: 0.1,
        };
      case 2:
        return {
          maxNum: 15,
          operations: ["+", "-", "*"],
          time: 9,
          baseToken: 1,
          timeBonusFactor: 0.15,
        };
      case 3:
        return {
          maxNum: 20,
          operations: ["+", "-", "*"],
          time: 8,
          baseToken: 2,
          timeBonusFactor: 0.2,
        };
      case 4:
        return {
          maxNum: 25,
          operations: ["+", "-", "*", "/"],
          time: 7,
          baseToken: 2,
          timeBonusFactor: 0.25,
        };
      case 5: // Hardest
        return {
          maxNum: 30,
          operations: ["+", "-", "*", "/"],
          time: 6,
          baseToken: 3,
          timeBonusFactor: 0.3,
        };
      default:
        return {
          maxNum: 10,
          operations: ["+", "-"],
          time: 10,
          baseToken: 1,
          timeBonusFactor: 0.1,
        };
    }
  }
  // --- END DIFFICULTY SETTINGS ---

  // Game State
  let currentScore = 0;
  let questionsAnswered = 0;
  let correctAnswers = 0;
  let currentProblem = null;
  let timeLeft = getDifficultySettings(currentDifficultyLevel).time;
  let timerInterval = null;
  let gameActive = false;

  function generateProblem() {
    const difficulty = getDifficultySettings(currentDifficultyLevel);
    const { maxNum, operations } = difficulty; // time is not needed here

    let num1 = Math.floor(Math.random() * maxNum) + 1;
    let num2 = Math.floor(Math.random() * maxNum) + 1;
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let answer;

    if (operation === "-") {
      if (num1 < num2) {
        [num1, num2] = [num2, num1];
      }
      answer = num1 - num2;
    } else if (operation === "+") {
      answer = num1 + num2;
    } else if (operation === "*") {
      if (currentDifficultyLevel < 3 && maxNum > 10) {
        // Keep mult numbers small for early '*'
        num1 =
          Math.floor(Math.random() * (maxNum / 2 > 5 ? maxNum / 2 : 5)) + 1;
        num2 =
          Math.floor(Math.random() * (maxNum / 2 > 5 ? maxNum / 2 : 5)) + 1;
      }
      answer = num1 * num2;
    } else if (operation === "/") {
      if (num2 === 0 || num1 % num2 !== 0 || num2 === 1 || num1 === num2)
        return generateProblem();
      if (num1 < num2) {
        [num1, num2] = [num2, num1];
        if (num1 % num2 !== 0 || num2 === 1 || num1 === num2)
          return generateProblem();
      }
      answer = num1 / num2;
    }
    return { text: `${num1} ${operation} ${num2} = ?`, answer: answer };
  }

  function displayNewProblem() {
    if (questionsAnswered >= totalQuestions) {
      endGame();
      return;
    }

    if (questionsAnswered > 0 && questionsAnswered % 2 === 0) {
      if (currentDifficultyLevel < maxDifficultyLevel) {
        currentDifficultyLevel++;
        console.log("Difficulty increased to level:", currentDifficultyLevel);
      }
    }

    currentProblem = generateProblem();
    problemDisplay.textContent = currentProblem.text;
    answerInput.value = "";
    answerInput.focus();
    feedbackMessage.textContent = "";
    feedbackMessage.className = "feedback-message";
    questionsLeftDisplay.textContent = totalQuestions - questionsAnswered;

    const currentDifficultySettings = getDifficultySettings(
      currentDifficultyLevel
    );
    timeLeft = currentDifficultySettings.time;
    timerDisplay.textContent = timeLeft;
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);

    submitButton.disabled = false;
    answerInput.disabled = false;
  }

  function updateTimer() {
    timeLeft--;
    timerDisplay.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      feedbackMessage.textContent = "Time's up!";
      feedbackMessage.classList.add("timeup");
      questionsAnswered++; // Count as an answered (incorrect) question
      submitButton.disabled = true;
      answerInput.disabled = true;
      updateDisplays(); // Update questions left display
      setTimeout(displayNewProblem, 2000);
    }
  }

  function handleSubmit() {
    if (!gameActive || timeLeft <= 0) return;

    clearInterval(timerInterval);
    const userAnswer = parseInt(answerInput.value);
    submitButton.disabled = true;
    answerInput.disabled = true;

    let tokensForThisRound = 0;
    const difficultySettings = getDifficultySettings(currentDifficultyLevel);

    if (!isNaN(userAnswer) && userAnswer === currentProblem.answer) {
      correctAnswers++; // Increment count of correct answers
      tokensForThisRound = difficultySettings.baseToken;

      const timeBonus = parseFloat(
        (timeLeft * difficultySettings.timeBonusFactor).toFixed(2) * 2
      );
      tokensForThisRound += timeBonus;

      tokensForThisRound = Math.round(tokensForThisRound * 100) / 100;

      currentScore += tokensForThisRound;
      currentScore = Math.round(currentScore);

      feedbackMessage.textContent = `Correct! +${tokensForThisRound.toFixed(
        0
      )} Tokens`; // Show rounded tokens
      feedbackMessage.classList.add("correct");
    } else {
      feedbackMessage.textContent = `Incorrect. The answer was ${currentProblem.answer}.`;
      feedbackMessage.classList.add("incorrect");
    }
    questionsAnswered++;
    updateDisplays();
    setTimeout(displayNewProblem, 2000);
  }

  function updateDisplays() {
    scoreDisplay.textContent = Math.round(currentScore); // Display rounded score (tokens)
    questionsLeftDisplay.textContent = Math.max(
      0,
      totalQuestions - questionsAnswered
    );
  }

  function startGame() {
    gameActive = true;
    currentScore = 0; // This now represents total tokens earned in this game session
    questionsAnswered = 0;
    correctAnswers = 0;
    currentDifficultyLevel = 1;
    startGameButton.classList.add("hidden");
    submitButton.classList.remove("hidden");
    answerInput.classList.remove("hidden");
    problemDisplay.classList.remove("hidden");
    document.getElementById("timer-display").classList.remove("hidden");

    gameOverMessage.classList.add("hidden");
    updateDisplays();
    displayNewProblem();
  }

  function endGame() {
    gameActive = false;
    clearInterval(timerInterval);
    problemDisplay.textContent = "Challenge Over!";
    submitButton.classList.add("hidden");
    answerInput.classList.add("hidden");
    document.getElementById("timer-display").classList.add("hidden");
    feedbackMessage.textContent = "";

    const finalTokensEarned = Math.round(currentScore); // Total accumulated tokens, rounded

    finalScoreDisplay.textContent = correctAnswers; // Show number of correct answers as "score"
    tokensEarnedDisplay.textContent = finalTokensEarned; // Show actual tokens earned

    if (finalTokensEarned > 0) {
      saveTokensToLocalStorage(finalTokensEarned);
    }
    gameOverMessage.classList.remove("hidden");
    startGameButton.textContent = "Play Again";
    startGameButton.classList.remove("hidden");
  }

  // Event Listeners
  startGameButton.addEventListener("click", startGame);
  submitButton.addEventListener("click", handleSubmit);
  answerInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter" && gameActive && !submitButton.disabled) {
      handleSubmit();
    }
  });

  // Initial UI State
  submitButton.classList.add("hidden");
  answerInput.classList.add("hidden");
  problemDisplay.classList.add("hidden");
  document.getElementById("timer-display").classList.add("hidden");
  feedbackMessage.textContent = "Press Start to Begin!";
  scoreDisplay.textContent = 0;
  questionsLeftDisplay.textContent = totalQuestions;
});
