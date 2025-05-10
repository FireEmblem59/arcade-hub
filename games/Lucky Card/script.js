// arcade-hub/games/Lucky Card/script.js

const ARCADE_TOKENS_KEY = "arcadeTokens";

function saveTokensToLocalStorage(amount) {
  if (amount === 0 && prizeValue === 0) {
    /* Special case for losing exact cost */
  } else if (amount === 0) return;

  let currentTokens = parseInt(localStorage.getItem(ARCADE_TOKENS_KEY)) || 0;
  localStorage.setItem(ARCADE_TOKENS_KEY, currentTokens + amount);
  updateTokenDisplayInGame(currentTokens + amount); // Update display immediately
}

function getCurrentTokens() {
  return parseInt(localStorage.getItem(ARCADE_TOKENS_KEY)) || 0;
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
    display.style.color = "#FFD700"; // Gold color
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
// --- END NEW TOKEN DISPLAY FUNCTIONS ---

document.addEventListener("DOMContentLoaded", () => {
  const cardArea = document.getElementById("card-area");
  const instructionText = document.getElementById("instruction-text");
  const resultDisplayText = document.getElementById("result-text");
  const resultDisplayContainer = document.getElementById("result-display");
  const playAgainButton = document.getElementById("play-again-button");
  const costToPlayText = document.getElementById("cost-to-play-text");
  const playCostSpan = document.getElementById("play-cost");
  const playAgainCostSpan = document.getElementById("play-again-cost");

  // Game Settings
  const numberOfCards = 3;
  const costToPlay = 5;
  const prizeOptions = [
    { value: 0, weight: 55, text: "Try Again!" },
    { value: 2, weight: 20, text: "Small Win!" },
    { value: 5, weight: 10, text: "Nice!" },
    { value: 10, weight: 8, text: "Good Job!" },
    { value: 25, weight: 5, text: "Big Win!" },
    { value: 50, weight: 2, text: "JACKPOT!" },
  ];

  let gameActive = true;
  let pickedCardElement = null;

  function setupGame() {
    updateTokenDisplayInGame(getCurrentTokens());
    createOutcomesList();

    gameActive = true;
    pickedCardElement = null;
    cardArea.innerHTML = "";
    resultDisplayContainer.classList.add("hidden");
    instructionText.textContent = "Pick a card to reveal your prize!";
    playAgainButton.classList.add("hidden");

    if (costToPlay > 0) {
      costToPlayText.classList.remove("hidden");
      playCostSpan.textContent = costToPlay;
      playAgainCostSpan.textContent = costToPlay;
    } else {
      costToPlayText.classList.add("hidden");
    }

    const weightedPrizes = [];
    prizeOptions.forEach((option) => {
      for (let i = 0; i < option.weight; i++) {
        weightedPrizes.push(option);
      }
    });
    shuffleArray(weightedPrizes);

    const cardPrizes = [];
    for (let i = 0; i < numberOfCards; i++) {
      cardPrizes.push(
        weightedPrizes[Math.floor(Math.random() * weightedPrizes.length)]
      );
    }
    shuffleArray(cardPrizes);

    for (let i = 0; i < numberOfCards; i++) {
      const card = document.createElement("div");
      card.classList.add("card");
      card.dataset.prizeValue = cardPrizes[i].value;
      card.dataset.prizeText = cardPrizes[i].text;
      if (cardPrizes[i].jackpot) {
        card.dataset.jackpot = "true";
      }

      const cardBack = document.createElement("div");
      cardBack.classList.add("card-face", "card-back");

      const cardFront = document.createElement("div");
      cardFront.classList.add("card-face", "card-front");

      const prizeAmountSpan = document.createElement("span");
      prizeAmountSpan.classList.add("prize-amount");
      prizeAmountSpan.textContent = cardPrizes[i].value;

      const prizeTextSpan = document.createElement("span");
      prizeTextSpan.classList.add("prize-text");
      prizeTextSpan.textContent = cardPrizes[i].text;

      if (cardPrizes[i].jackpot) {
        cardFront.classList.add("jackpot");
      }

      cardFront.appendChild(prizeAmountSpan);
      cardFront.appendChild(prizeTextSpan);

      card.appendChild(cardBack);
      card.appendChild(cardFront);

      card.addEventListener("click", handleCardPick);
      cardArea.appendChild(card);
    }
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function handleCardPick(event) {
    if (!gameActive) return;

    const currentTokens = getCurrentTokens();
    if (costToPlay > 0 && currentTokens < costToPlay) {
      instructionText.textContent = "Not enough tokens to play!";
      resultDisplayText.textContent = `You need ${costToPlay} tokens.`;
      resultDisplayContainer.classList.remove("hidden");
      playAgainButton.classList.remove("hidden");
      playAgainButton.disabled = true;
      return;
    }

    gameActive = false;
    pickedCardElement = event.currentTarget;
    const prizeValue = parseInt(pickedCardElement.dataset.prizeValue);
    const prizeText = pickedCardElement.dataset.prizeText;

    let netChange = prizeValue;
    if (costToPlay > 0) {
      netChange = prizeValue - costToPlay;
    }
    saveTokensToLocalStorage(netChange);

    revealAllCards();

    // Show result message (based on the picked card)
    if (prizeValue > 0 && costToPlay > 0) {
      resultDisplayText.textContent = `You won ${prizeValue} tokens! (Net: ${
        netChange > 0 ? "+" : ""
      }${netChange})`;
    } else if (prizeValue > 0 && costToPlay === 0) {
      resultDisplayText.textContent = `You won ${prizeValue} tokens!`;
    } else {
      resultDisplayText.textContent = `Sorry! ${prizeText}. (Net: ${netChange})`;
    }

    if (pickedCardElement.dataset.jackpot === "true") {
      resultDisplayText.innerHTML = `🎉 JACKPOT! 🎉<br>You won ${prizeValue} tokens! (Net: ${
        netChange > 0 ? "+" : ""
      }${netChange})`;
    }
    resultDisplayContainer.classList.remove("hidden");
    instructionText.textContent = "Round Over!";

    playAgainButton.classList.remove("hidden");
    playAgainButton.disabled =
      getCurrentTokens() < costToPlay && costToPlay > 0;
  }

  function revealAllCards() {
    const allCards = cardArea.querySelectorAll(".card");
    allCards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add("flipped");
        card.removeEventListener("click", handleCardPick);
        if (card !== pickedCardElement) {
          card.classList.add("disabled");
        } else {
          card.style.boxShadow = "0 0 15px 5px #FFD700";
        }
        if (
          card.dataset.jackpot === "true" &&
          card.querySelector(".card-front.jackpot")
        ) {
          card.style.borderColor = "#FF4500";
        }
      }, index * 150); // Stagger the reveal
    });
  }

  function createOutcomesList() {
    const outcomesList = document.getElementById("outcomes-list");
    outcomesList.innerHTML = "";

    // Get unique prizes (in case of duplicate values)
    const uniquePrizes = prizeOptions.reduce((acc, curr) => {
      if (!acc.find((item) => item.value === curr.value)) {
        acc.push(curr);
      }
      return acc;
    }, []);

    // Sort from highest to lowest
    uniquePrizes.sort((a, b) => b.value - a.value);

    uniquePrizes.forEach((option) => {
      const outcomeItem = document.createElement("div");
      outcomeItem.className = `outcome-item ${
        option.value > 0 ? "win" : "lose"
      }`;
      outcomeItem.innerHTML = `
      <span>${option.text}</span>
      <span>${option.value > 0 ? "+" : ""}${option.value}</span>
    `;
      outcomesList.appendChild(outcomeItem);
    });
  }

  playAgainButton.addEventListener("click", () => {
    const currentTokens = getCurrentTokens();
    if (costToPlay > 0 && currentTokens < costToPlay) {
      instructionText.textContent = "Still not enough tokens to play!";
      playAgainButton.disabled = true;
      return;
    }
    playAgainButton.disabled = false;
    setupGame();
  });

  // Initial Setup
  setupGame();
});
