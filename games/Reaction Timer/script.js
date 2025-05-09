document.addEventListener("DOMContentLoaded", () => {
  const reactionBox = document.getElementById("reaction-box");
  const instructionText = document.getElementById("instruction-text");
  const resultText = document.getElementById("result-text");
  const startButton = document.getElementById("start-button");
  const bestTimeElement = document.getElementById("best-time");
  const collectRewardButton = document.getElementById("collect-reward-button");

  const BEST_TIME_KEY = "reactionGameBestTime";

  let timerId = null;
  let startTime = 0;
  let gameState = "initial"; // 'initial', 'waiting', 'ready', 'result'
  let bestTime = localStorage.getItem(BEST_TIME_KEY)
    ? parseFloat(localStorage.getItem(BEST_TIME_KEY))
    : Infinity;

  function updateBestTimeDisplay() {
    if (bestTime === Infinity || isNaN(bestTime)) {
      bestTimeElement.textContent = "N/A";
    } else {
      bestTimeElement.textContent = bestTime.toFixed(0);
    }
  }

  function startGame() {
    gameState = "waiting";
    reactionBox.className = "reaction-box state-waiting"; // Reset classes
    instructionText.textContent = "Wait for Green...";
    resultText.classList.add("hidden");
    collectRewardButton.classList.add("hidden");
    startButton.textContent = "Game in Progress...";
    startButton.disabled = true;

    // Random delay between 1 and 5 seconds (adjust as needed)
    const randomDelay = Math.random() * 4000 + 1000;

    timerId = setTimeout(() => {
      if (gameState === "waiting") {
        // Ensure game hasn't been reset or clicked too soon
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
      gameState = "result";
      reactionBox.className = "reaction-box state-clicked-too-soon";
      instructionText.textContent = "Too Soon!";
      resultText.textContent = "Try to wait for green.";
      resultText.classList.remove("hidden");
      resetStartButton();
      collectRewardButton.classList.add("hidden"); // No reward if too soon
    } else if (gameState === "ready") {
      // Clicked on time
      const endTime = performance.now();
      const reactionTime = endTime - startTime;
      gameState = "result";

      reactionBox.className = "reaction-box state-result";
      instructionText.textContent = "Your Reaction Time:";
      resultText.textContent = `${reactionTime.toFixed(0)} ms`;
      resultText.classList.remove("hidden");
      resetStartButton();

      if (reactionTime < bestTime) {
        bestTime = reactionTime;
        localStorage.setItem(BEST_TIME_KEY, bestTime);
      }
      updateBestTimeDisplay();
      prepareReward(reactionTime);
    }
    // If gameState is 'initial' or 'result', clicking the box does nothing until Start is pressed.
  }

  function calculateReward(time) {
    // Reward tiers (example)
    if (time <= 150) return 20; // Excellent
    if (time <= 200) return 15; // Great
    if (time <= 250) return 10; // Good
    if (time <= 350) return 5; // Okay
    if (time <= 500) return 2; // Fair
    return 0; // Slower than 500ms or too soon
  }

  function prepareReward(reactionTime) {
    const reward = calculateReward(reactionTime);
    if (reward > 0) {
      collectRewardButton.href = `../../index.html?reward=${reward}`;
      collectRewardButton.textContent = `Collect ${reward} Token${
        reward === 1 ? "" : "s"
      } & Return`;
      collectRewardButton.classList.remove("hidden");
    } else {
      collectRewardButton.classList.add("hidden");
      // Optionally, show a message like "No tokens for this time."
    }
  }

  function resetStartButton() {
    startButton.textContent = "Start Game / Try Again";
    startButton.disabled = false;
  }

  // Event Listeners
  startButton.addEventListener("click", startGame);
  reactionBox.addEventListener("click", handleBoxClick);

  // Initial Setup
  updateBestTimeDisplay();
  collectRewardButton.classList.add("hidden"); // Ensure it's hidden initially
});
