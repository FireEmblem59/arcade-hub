// arcade-hub/games/Click Target/script.js

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
  const gameArea = document.getElementById("game-area");
  const targetElement = document.getElementById("target");
  const scoreDisplay = document.getElementById("score-display");
  const timeLeftDisplay = document.getElementById("time-left-display");
  const startGameButton = document.getElementById("start-game-button");
  const startMessageDiv = document.getElementById("start-message");
  const gameOverMessageDiv = document.getElementById("game-over-message");
  const finalScoreDisplay = document.getElementById("final-score-display");
  const tokensEarnedDisplay = document.getElementById("tokens-earned-display");
  const playAgainButton = document.getElementById("play-again-button");

  // Game Settings
  const gameDuration = 30; // seconds
  const pointsPerTarget = 100;
  const tokensPerScorePoint = 0.1; // e.g., 1 token for every 10 score points (1000 score = 100 tokens)

  // Game State
  let score = 0;
  let timeLeft = gameDuration;
  let gameTimerId = null;
  let targetTimeoutId = null;
  let gameActive = false;

  function initGameUI() {
    updateTokenDisplayInGame(getCurrentTokens());
    score = 0;
    timeLeft = gameDuration;
    scoreDisplay.textContent = score;
    timeLeftDisplay.textContent = timeLeft;
    targetElement.classList.add("hidden");
    gameOverMessageDiv.classList.add("hidden");
    startMessageDiv.classList.remove("hidden");
    startGameButton.disabled = false;
    gameActive = false;
  }

  function startGame() {
    if (gameActive) return;
    gameActive = true;
    score = 0;
    timeLeft = gameDuration;
    updateTokenDisplayInGame(getCurrentTokens()); // Refresh token display
    scoreDisplay.textContent = score;
    timeLeftDisplay.textContent = timeLeft;

    startMessageDiv.classList.add("hidden");
    gameOverMessageDiv.classList.add("hidden");
    targetElement.classList.remove("hidden");
    startGameButton.disabled = true; // Disable while game is in progress

    spawnTarget();
    gameTimerId = setInterval(updateGameTimer, 1000);
  }

  function updateGameTimer() {
    timeLeft--;
    timeLeftDisplay.textContent = timeLeft;
    if (timeLeft <= 0) {
      endGame();
    }
  }

  function spawnTarget() {
    if (!gameActive) return;
    clearTimeout(targetTimeoutId); // Clear previous timeout if any

    // Ensure target is visible and reset clicked state
    targetElement.classList.remove("hidden", "clicked");
    targetElement.style.opacity = 1;

    const gameAreaRect = gameArea.getBoundingClientRect();
    const targetSize = targetElement.offsetWidth; // Assuming width and height are same

    // Calculate max positions ensuring target stays fully within gameArea
    const maxX = gameAreaRect.width - targetSize;
    const maxY = gameAreaRect.height - targetSize;

    const randomX = Math.max(0, Math.floor(Math.random() * maxX));
    const randomY = Math.max(0, Math.floor(Math.random() * maxY));

    targetElement.style.left = `${randomX}px`;
    targetElement.style.top = `${randomY}px`;
  }

  function handleTargetClick() {
    if (!gameActive || targetElement.classList.contains("clicked")) return;

    score += pointsPerTarget;
    scoreDisplay.textContent = score;

    targetElement.classList.add("clicked"); // Visual feedback

    setTimeout(() => {
      if (gameActive) spawnTarget();
    }, 150);
  }

  function endGame() {
    gameActive = false;
    clearInterval(gameTimerId);
    clearTimeout(targetTimeoutId);
    targetElement.classList.add("hidden");
    gameArea.classList.add("hidden");

    finalScoreDisplay.textContent = score;
    const tokensEarned = Math.floor(score * tokensPerScorePoint) / 10;
    tokensEarnedDisplay.textContent = tokensEarned;

    if (tokensEarned > 0) {
      saveTokensToLocalStorage(tokensEarned);
    }

    gameOverMessageDiv.classList.remove("hidden");
    startGameButton.disabled = true;
    playAgainButton.classList.remove("hidden");
  }

  // Event Listeners
  startGameButton.addEventListener("click", startGame);
  targetElement.addEventListener("click", handleTargetClick);
  playAgainButton.addEventListener("click", () => {
    gameOverMessageDiv.classList.add("hidden");
    playAgainButton.classList.add("hidden");
    startGame();
  });

  // Initial Page Setup
  initGameUI();
});
