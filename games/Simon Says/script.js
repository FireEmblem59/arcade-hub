// arcade-hub/games/Simon Says/script.js

const ARCADE_TOKENS_KEY = "arcadeTokens";

function saveTokensToLocalStorage(amount) {
  if (amount <= 0) return;
  let currentTokens = parseInt(localStorage.getItem(ARCADE_TOKENS_KEY)) || 0;
  localStorage.setItem(ARCADE_TOKENS_KEY, currentTokens + amount);
  updateTokenDisplayInGame(currentTokens + amount);
}
function getCurrentTokens() {
  return parseInt(localStorage.getItem(ARCADE_TOKENS_KEY)) || 0;
}
function createTokenDisplay() {
  let dc = document.getElementById("in-game-token-display-container");
  let d = document.getElementById("in-game-token-display");
  if (!d && dc) {
    d = document.createElement("div");
    d.id = "in-game-token-display";
    dc.appendChild(d);
  } else if (!d && !dc) {
    d = document.createElement("div");
    d.id = "in-game-token-display";
    document.body.appendChild(d);
    console.warn("Token display container missing, appended to body.");
  }
  return d;
}
function updateTokenDisplayInGame(tokens) {
  const d = createTokenDisplay();
  if (d) d.textContent = `Tokens: ${tokens}`;
}

document.addEventListener("DOMContentLoaded", () => {
  const colors = ["green", "red", "yellow", "blue"];
  const buttons = {
    green: document.getElementById("green"),
    red: document.getElementById("red"),
    yellow: document.getElementById("yellow"),
    blue: document.getElementById("blue"),
  };
  const levelDisplay = document.getElementById("level-display");
  const messageDisplay = document.getElementById("message-display");
  const startButton = document.getElementById("start-button");
  const gameOverMessageDiv = document.getElementById("game-over-message");
  const finalLevelDisplay = document.getElementById("final-level-display");
  const tokensEarnedDisplay = document.getElementById("tokens-earned-display");
  const playAgainButton = document.getElementById("play-again-button");

  const originalButtonColors = {
    green: "#00a74a",
    red: "#9f0f17",
    yellow: "#cca707",
    blue: "#094a8f",
  };
  const highlightButtonColors = {
    green: "#32ff99",
    red: "#ff3b47",
    yellow: "#fff700",
    blue: "#339cff",
  };

  // Game Settings
  const flashDuration = 400; // ms for how long a button stays lit
  const pauseBetweenFlashes = 200; // ms pause between flashes in sequence
  const tokensPerLevel = 2; // Example: 2 tokens per level reached

  // Game State
  let sequence = [];
  let playerSequence = [];
  let currentLevel = 0;
  let gameActive = false; // True when game is running (sequence playing or player's turn)
  let playerTurn = false; // True when it's player's turn to click

  function startGame() {
    updateTokenDisplayInGame(getCurrentTokens());
    sequence = [];
    playerSequence = [];
    currentLevel = 0;
    gameActive = true;
    playerTurn = false;

    messageDisplay.textContent = "Watch carefully...";
    gameOverMessageDiv.classList.add("hidden");
    startButton.classList.add("hidden"); // Hide start button during game
    disablePlayerInput(true); // Disable buttons initially

    nextLevel();
  }

  function nextLevel() {
    playerSequence = [];
    currentLevel++;
    levelDisplay.textContent = `Level: ${currentLevel}`;
    messageDisplay.textContent = "Simon's Turn...";
    disablePlayerInput(true);

    // Add a new random color to the sequence
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    sequence.push(randomColor);

    playSequence();
  }

  async function playSequence() {
    for (let i = 0; i < sequence.length; i++) {
      const color = sequence[i];
      await flashButton(color);
      await delay(pauseBetweenFlashes);
    }
    startPlayerTurn();
  }

  function flashButton(color) {
    return new Promise((resolve) => {
      const button = buttons[color];
      if (!button) {
        console.error("Button not found for color:", color);
        resolve(); // Resolve promise even if button not found to not break sequence
        return;
      }

      const originalOpacity =
        button.style.opacity || getComputedStyle(button).opacity;

      button.style.backgroundColor = highlightButtonColors[color];
      button.style.opacity = 1;
      button.classList.add("active");

      setTimeout(() => {
        button.style.backgroundColor = originalButtonColors[color];
        button.style.opacity = originalOpacity;
        button.classList.remove("active");
        resolve();
      }, flashDuration);
    });
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function startPlayerTurn() {
    playerTurn = true;
    messageDisplay.textContent = "Your Turn!";
    disablePlayerInput(false); // Enable buttons for player
  }

  function handlePlayerInput(event) {
    if (!gameActive || !playerTurn) return;

    const clickedColor = event.target.dataset.color;
    if (!clickedColor) return; // Clicked on board but not a button

    flashButton(clickedColor); // Visual feedback for player's click
    playerSequence.push(clickedColor);

    // Check if the current click is correct
    const lastPlayerIndex = playerSequence.length - 1;
    if (playerSequence[lastPlayerIndex] !== sequence[lastPlayerIndex]) {
      gameOver();
      return;
    }

    // If sequence is complete and correct
    if (playerSequence.length === sequence.length) {
      playerTurn = false; // End player's turn
      disablePlayerInput(true);
      messageDisplay.textContent = "Correct! Next level...";
      setTimeout(nextLevel, 1000); // Pause then start next level
    }
  }

  function disablePlayerInput(isDisabled) {
    for (const color in buttons) {
      if (buttons[color]) {
        buttons[color].disabled = isDisabled; // Using disabled property
        if (isDisabled) buttons[color].classList.add("disabled");
        else buttons[color].classList.remove("disabled");
      }
    }
  }

  function gameOver() {
    gameActive = false;
    playerTurn = false;
    disablePlayerInput(true);
    messageDisplay.textContent = "Wrong! Game Over.";

    finalLevelDisplay.textContent = currentLevel - 1; // Level reached is currentLevel - 1
    const tokensEarned = (currentLevel - 1) * tokensPerLevel;
    tokensEarnedDisplay.textContent = tokensEarned;

    if (tokensEarned > 0) {
      saveTokensToLocalStorage(tokensEarned);
    }

    gameOverMessageDiv.classList.remove("hidden");
    startButton.classList.remove("hidden"); // Show start button again
    startButton.textContent = "Start Game"; // Reset start button text
  }

  // Event Listeners
  startButton.addEventListener("click", startGame);
  playAgainButton.addEventListener("click", startGame); // Play again calls startGame

  for (const color in buttons) {
    if (buttons[color]) {
      buttons[color].addEventListener("click", handlePlayerInput);
    }
  }

  // Initial UI State
  updateTokenDisplayInGame(getCurrentTokens());
  levelDisplay.textContent = `Level: 0`;
  messageDisplay.textContent = "Press Start!";
  disablePlayerInput(true); // Buttons disabled until game starts
});
