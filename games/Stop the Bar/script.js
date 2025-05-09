const ARCADE_TOKENS_KEY = "arcadeTokens";

function saveTokensToLocalStorage(amount) {
  if (amount <= 0) return;
  let currentTokens = parseInt(localStorage.getItem(ARCADE_TOKENS_KEY)) || 0;
  localStorage.setItem(ARCADE_TOKENS_KEY, currentTokens + amount);
}

document.addEventListener("DOMContentLoaded", () => {
  const track = document.getElementById("track");
  const targetZone = document.getElementById("target-zone");
  const movingBar = document.getElementById("moving-bar");
  const startButton = document.getElementById("start-button");
  const scoreDisplay = document.getElementById("score-display");
  const attemptsLeftDisplay = document.getElementById("attempts-left");
  const resultMessageText = document.getElementById("round-result-text");
  const resultMessageContainer = document.getElementById("result-message");
  const gameOverMessage = document.getElementById("game-over-message");
  const finalScoreDisplay = document.getElementById("final-score-display");
  const tokensEarnedDisplay = document.getElementById("tokens-earned-display");

  // Game settings
  const initialBarSpeed = 2;
  let barSpeed = initialBarSpeed;
  const initialAttempts = 3;
  const targetZoneWidthPercent = 10;
  const movingBarWidthPercent = 4;

  // Score settings for speed bonus
  const basePointsForPerfectHit = 100;

  // Game state
  let currentScore = 0;
  let attemptsLeft = initialAttempts;
  let barPosition = 0;
  let barDirection = 1;
  let animationId = null;
  let gameActive = false;
  let roundActive = false;

  function setupGameElements() {
    const trackWidth = track.offsetWidth;
    const targetWidth = trackWidth * (targetZoneWidthPercent / 100);
    targetZone.style.width = `${targetWidth}px`;
    targetZone.style.left = `${(trackWidth - targetWidth) / 2}px`;
    movingBar.style.width = `${trackWidth * (movingBarWidthPercent / 100)}px`;
    movingBar.style.left = "0px";
  }

  function startGame() {
    currentScore = 0;
    attemptsLeft = initialAttempts;
    barSpeed = initialBarSpeed; // Reset bar speed to initial value
    gameActive = true;
    roundActive = false;
    updateDisplays();
    gameOverMessage.classList.add("hidden");
    resultMessageContainer.classList.add("hidden");
    startButton.textContent = "Stop (SPACE / CLICK)";
    startButton.disabled = false;
    startRound();
  }

  function startRound() {
    if (!gameActive || attemptsLeft <= 0) return;
    roundActive = true;
    barPosition = 0;
    barDirection = 1;
    movingBar.style.left = "0px";
    movingBar.style.backgroundColor = "#e74c3c";
    resultMessageContainer.classList.add("hidden");
    startButton.disabled = false;
    requestAnimationFrame(moveBar);
  }

  function moveBar() {
    if (!roundActive) return;
    barPosition += barSpeed * barDirection;
    const trackWidth = track.offsetWidth;
    const barWidth = movingBar.offsetWidth;
    if (barPosition + barWidth >= trackWidth) {
      barPosition = trackWidth - barWidth;
      barDirection = -1;
    } else if (barPosition <= 0) {
      barPosition = 0;
      barDirection = 1;
    }
    movingBar.style.left = `${barPosition}px`;
    animationId = requestAnimationFrame(moveBar);
  }

  function stopBar() {
    if (!roundActive) return;

    cancelAnimationFrame(animationId);
    roundActive = false;
    attemptsLeft--;

    startButton.disabled = true;

    const barCenter = barPosition + movingBar.offsetWidth / 2;
    const targetLeft = targetZone.offsetLeft;
    const targetRight = targetZone.offsetLeft + targetZone.offsetWidth;
    const targetCenter = targetLeft + targetZone.offsetWidth / 2;

    let roundScore = 0;
    resultMessageContainer.classList.remove("hidden");
    resultMessageContainer.className = "result-message";

    if (barCenter >= targetLeft && barCenter <= targetRight) {
      const distanceFromCenter = Math.abs(barCenter - targetCenter);
      const maxPossibleDistanceInZone = targetZone.offsetWidth / 2;

      // Calculate base accuracy score (0-1, 1 being perfect center)
      const accuracyFactor = Math.max(
        0,
        1 - distanceFromCenter / maxPossibleDistanceInZone
      );

      // Calculate speed multiplier
      // Ensure initialBarSpeed is not zero to avoid division by zero if it were configurable to that
      const speedMultiplier =
        initialBarSpeed > 0 ? barSpeed / initialBarSpeed : 1;

      // Calculate final round score
      roundScore = Math.round(
        basePointsForPerfectHit * accuracyFactor * speedMultiplier
      );

      resultMessageText.textContent = `HIT! +${roundScore} (Speed x${speedMultiplier.toFixed(
        1
      )})`;
      resultMessageContainer.classList.add("hit");
      movingBar.style.backgroundColor = "#2ecc71";
    } else {
      resultMessageText.textContent = "MISS!";
      resultMessageContainer.classList.add("miss");
      movingBar.style.backgroundColor = "#c0392b";
    }
    currentScore += roundScore;
    updateDisplays();

    // Increase speed for the NEXT round, if there is one
    if (attemptsLeft > 0) {
      barSpeed = barSpeed * 2;
      setTimeout(startRound, 1500);
    } else {
      endGame();
    }
  }

  function updateDisplays() {
    scoreDisplay.textContent = currentScore;
    attemptsLeftDisplay.textContent = attemptsLeft;
  }

  function endGame() {
    gameActive = false;
    finalScoreDisplay.textContent = currentScore;
    let tokensEarned = 0;
    if (currentScore > 0) {
      tokensEarned = Math.floor(currentScore / 25);
      tokensEarned = Math.max(0, tokensEarned);
    }
    tokensEarnedDisplay.textContent = tokensEarned;
    if (tokensEarned > 0) {
      saveTokensToLocalStorage(tokensEarned);
    }
    gameOverMessage.classList.remove("hidden");
    startButton.textContent = "Start Game";
    startButton.disabled = false;
  }

  startButton.addEventListener("click", () => {
    if (!gameActive) {
      startGame();
    } else if (roundActive) {
      stopBar();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (
      event.code === "Space" &&
      gameActive &&
      roundActive &&
      !startButton.disabled
    ) {
      event.preventDefault();
      stopBar();
    }
  });

  track.addEventListener("click", () => {
    if (gameActive && roundActive && !startButton.disabled) {
      stopBar();
    }
  });

  window.addEventListener("resize", setupGameElements);
  setupGameElements();
  updateDisplays();
  startButton.disabled = false;
});
