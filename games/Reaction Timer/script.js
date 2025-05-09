const ARCADE_TOKENS_KEY = "arcadeTokens";
const BEST_TIME_KEY = "reactionGameBestTime";

function saveTokensToLocalStorage(amount) {
  if (amount <= 0) return; // Don't save zero/negative rewards
  let currentTokens = parseInt(localStorage.getItem(ARCADE_TOKENS_KEY)) || 0;
  localStorage.setItem(ARCADE_TOKENS_KEY, currentTokens + amount);
}

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const reactionBox = document.getElementById("reaction-box");
  const instructionText = document.getElementById("instruction-text");
  const resultText = document.getElementById("result-text");
  const startButton = document.getElementById("start-button");
  const bestTimeElement = document.getElementById("best-time");
  const collectRewardButton = document.getElementById("collect-reward-button");

  // Game State
  let timerId = null;
  let startTime = 0;
  let gameState = "initial"; // 'initial'|'waiting'|'ready'|'result'
  let bestTime = parseFloat(localStorage.getItem(BEST_TIME_KEY)) || Infinity;

  // Initialize
  updateBestTimeDisplay();
  collectRewardButton.classList.add("hidden");

  // Core Game Functions
  function startGame() {
    gameState = "waiting";
    reactionBox.className = "reaction-box state-waiting";
    instructionText.textContent = "Wait for Green...";
    resultText.classList.add("hidden");
    collectRewardButton.classList.add("hidden");
    startButton.disabled = true;

    const randomDelay = Math.random() * 4000 + 1000;
    timerId = setTimeout(() => {
      if (gameState === "waiting") {
        gameState = "ready";
        reactionBox.className = "reaction-box state-ready";
        instructionText.textContent = "CLICK NOW!";
        startTime = performance.now();
      }
    }, randomDelay);
  }

  function handleBoxClick() {
    if (gameState === "waiting") {
      // Clicked too soon
      clearTimeout(timerId);
      endGame(false);
    } else if (gameState === "ready") {
      // Valid click
      const reactionTime = performance.now() - startTime;
      endGame(true, reactionTime);
    }
  }

  function endGame(validClick, reactionTime = 0) {
    gameState = "result";
    clearTimeout(timerId);

    if (validClick) {
      // Save best time if applicable
      if (reactionTime < bestTime) {
        bestTime = reactionTime;
        localStorage.setItem(BEST_TIME_KEY, bestTime);
        updateBestTimeDisplay();
      }

      // Calculate and save reward
      const reward = calculateReward(reactionTime);
      if (reward > 0) saveTokensToLocalStorage(reward);

      // Update UI
      reactionBox.className = "reaction-box state-result";
      instructionText.textContent = "Your Reaction Time:";
      resultText.textContent = `${reactionTime.toFixed(0)} ms`;
      collectRewardButton.textContent = `Return to Hub (Earned ${reward} Token${
        reward === 1 ? "" : "s"
      })`;
    } else {
      // Too soon click
      reactionBox.className = "reaction-box state-clicked-too-soon";
      instructionText.textContent = "Too Soon!";
      resultText.textContent = "Try to wait for green.";
      collectRewardButton.textContent = "Return to Hub";
    }

    resultText.classList.remove("hidden");
    collectRewardButton.classList.remove("hidden");
    resetStartButton();
  }

  // Helper Functions
  function calculateReward(time) {
    if (time <= 150) return 20;
    if (time <= 200) return 15;
    if (time <= 250) return 10;
    if (time <= 350) return 5;
    if (time <= 500) return 2;
    return 0;
  }

  function updateBestTimeDisplay() {
    bestTimeElement.textContent = isFinite(bestTime)
      ? bestTime.toFixed(0)
      : "N/A";
  }

  function resetStartButton() {
    startButton.textContent = "Start Game / Try Again";
    startButton.disabled = false;
  }

  // Event Listeners
  startButton.addEventListener("click", startGame);
  reactionBox.addEventListener("click", handleBoxClick);
  collectRewardButton.addEventListener("click", () => {
    window.location.href = "../../index.html";
  });
});
