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
  // Game Configuration
  const cardSymbols = ["💀", "👻", "🎃", "👽", "🤖", "👾", "🤡", "👹"];
  const gameSymbols = [...cardSymbols, ...cardSymbols];
  const totalPairs = cardSymbols.length;

  // Game State
  let flippedCards = [];
  let matchedPairs = 0;
  let moves = 0;
  let lockBoard = false;
  let earnedReward = 0;

  // DOM Elements
  const gameBoard = document.getElementById("game-board");
  const movesCountElement = document.getElementById("moves-count");
  const matchesCountElement = document.getElementById("matches-count");
  const totalPairsElement = document.getElementById("total-pairs");
  const restartButton = document.getElementById("restart-button");
  const winMessageElement = document.getElementById("win-message");
  const finalMovesElement = document.getElementById("final-moves");
  const collectRewardButton = document.getElementById("collect-reward-button");

  // Reward Configuration
  const rewardConfig = {
    maxReward: 100,
    baseMovesForFullReward: 10,
    maxMovesAllowed: 20,
  };

  // Game Initialization
  function initGame() {
    createBoard();
    setupEventListeners();
    updateTokenDisplayInGame(getCurrentTokens());
  }

  function createBoard() {
    gameBoard.innerHTML = "";
    winMessageElement.classList.add("hidden");
    matchedPairs = 0;
    moves = 0;
    earnedReward = 0;
    flippedCards = [];
    lockBoard = false;
    updateGameInfo();

    const shuffledSymbols = shuffle([...gameSymbols]);

    shuffledSymbols.forEach((symbol) => {
      const card = document.createElement("div");
      card.className = "card";
      card.dataset.symbol = symbol;

      card.innerHTML = `
        <div class="card-face card-front">${symbol}</div>
        <div class="card-face card-back"></div>
      `;

      gameBoard.appendChild(card);
    });
  }

  function setupEventListeners() {
    gameBoard.addEventListener("click", handleCardClick);
    restartButton.addEventListener("click", createBoard);
    collectRewardButton.addEventListener("click", () => {
      window.location.href = "../../index.html";
    });
  }

  // Game Logic
  function handleCardClick(event) {
    if (lockBoard) return;

    const clickedCard = event.target.closest(".card");
    if (
      !clickedCard ||
      clickedCard === flippedCards[0] ||
      clickedCard.classList.contains("flipped") ||
      clickedCard.classList.contains("matched")
    )
      return;

    flipCard(clickedCard);

    if (flippedCards.length === 2) {
      moves++;
      updateGameInfo();
      checkForMatch();
    }
  }

  function flipCard(card) {
    card.classList.add("flipped");
    flippedCards.push(card);
  }

  function checkForMatch() {
    lockBoard = true;
    const [cardOne, cardTwo] = flippedCards;

    cardOne.dataset.symbol === cardTwo.dataset.symbol
      ? handleMatch()
      : unflipCards();
  }

  function handleMatch() {
    flippedCards.forEach((card) => {
      card.classList.replace("flipped", "matched");
    });

    matchedPairs++;
    updateGameInfo();
    resetTurn();

    if (matchedPairs === totalPairs) {
      handleWin();
    }
  }

  function unflipCards() {
    setTimeout(() => {
      flippedCards.forEach((card) => card.classList.remove("flipped"));
      resetTurn();
    }, 1000);
  }

  function resetTurn() {
    flippedCards = [];
    lockBoard = false;
  }

  // Reward System
  function calculateReward() {
    if (matchedPairs !== totalPairs) return 0;

    let reward = rewardConfig.maxReward;

    if (moves > rewardConfig.baseMovesForFullReward) {
      const excessMoves = moves - rewardConfig.baseMovesForFullReward;
      const rewardReduction =
        excessMoves *
        (rewardConfig.maxReward /
          (rewardConfig.maxMovesAllowed - rewardConfig.baseMovesForFullReward));
      reward = Math.max(reward - rewardReduction, 0);
    }

    return Math.round(reward);
  }

  function handleWin() {
    earnedReward = calculateReward();
    saveTokensToLocalStorage(earnedReward);

    finalMovesElement.textContent = moves;
    collectRewardButton.textContent =
      earnedReward > 0
        ? `Return to Hub (Earned ${earnedReward} Tokens)`
        : "Return to Hub";

    winMessageElement.classList.remove("hidden");
  }

  // Helper Functions
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function updateGameInfo() {
    movesCountElement.textContent = moves;
    matchesCountElement.textContent = matchedPairs;
    totalPairsElement.textContent = totalPairs;
  }

  // Start the game
  initGame();
});
