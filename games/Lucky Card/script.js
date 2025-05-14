// arcade-hub/games/Lucky Card/script.js

const ARCADE_TOKENS_KEY = "arcadeTokens";

function saveTokensToLocalStorage(netChangeAmount) {
  // Only update if there's an actual change in tokens
  if (netChangeAmount === 0) return;

  let currentTokens = parseInt(localStorage.getItem(ARCADE_TOKENS_KEY)) || 0;
  localStorage.setItem(ARCADE_TOKENS_KEY, currentTokens + netChangeAmount);
  console.log(
    `LuckyCard: Tokens changed by ${netChangeAmount}. New total in localStorage: ${
      currentTokens + netChangeAmount
    }`
  );
  updateTokenDisplayInGame(currentTokens + netChangeAmount);
}

function getCurrentTokens() {
  return parseInt(localStorage.getItem(ARCADE_TOKENS_KEY)) || 0;
}

function createTokenDisplay() {
  let displayContainer = document.getElementById(
    "in-game-token-display-container"
  );
  let display = document.getElementById("in-game-token-display");
  if (!display && displayContainer) {
    display = document.createElement("div");
    display.id = "in-game-token-display";
    displayContainer.appendChild(display); // Append to dedicated container
  } else if (!display && !displayContainer) {
    // Fallback
    display = document.createElement("div");
    display.id = "in-game-token-display";
    document.body.appendChild(display);
    console.warn(
      "Token display container missing in Lucky Card HTML, appended to body."
    );
  }
  return display;
}

function updateTokenDisplayInGame(tokens) {
  const display = createTokenDisplay(); // Ensures it exists
  if (display) {
    // Check if display element was successfully created/found
    display.textContent = `Tokens: ${tokens}`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const cardArea = document.getElementById("card-area");
  const instructionText = document.getElementById("instruction-text");
  const resultDisplayText = document.getElementById("result-text");
  const resultDisplayContainer = document.getElementById("result-display");
  const playAgainButton = document.getElementById("play-again-button");
  const costToPlayText = document.getElementById("cost-to-play-text");
  const playCostSpan = document.getElementById("play-cost");
  const playAgainCostSpan = document.getElementById("play-again-cost");
  const outcomesListElement = document.getElementById("outcomes-list");

  const numberOfCards = 3;
  const costToPlay = 5;
  const prizeOptions = [
    // value is the prize BEFORE deducting cost
    { value: 0, weight: 50, text: "Unlucky!", jackpot: false }, // Increased weight for 0
    { value: 2, weight: 25, text: "Small Prize!", jackpot: false },
    { value: 5, weight: 10, text: "Even Steven!", jackpot: false }, // Breaks even
    { value: 10, weight: 8, text: "Nice Win!", jackpot: false },
    { value: 25, weight: 5, text: "Big Winner!", jackpot: false },
    { value: 50, weight: 2, text: "JACKPOT!", jackpot: true },
  ];

  let gameActive = true;
  let pickedCardElement = null;

  function setupGame() {
    updateTokenDisplayInGame(getCurrentTokens());
    populateOutcomesList();

    gameActive = true;
    pickedCardElement = null;
    cardArea.innerHTML = "";
    resultDisplayContainer.classList.add("hidden");
    instructionText.textContent = "Pick a card to reveal your prize!";
    playAgainButton.classList.add("hidden"); // Hide initially, show after a round

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
    shuffleArray(cardPrizes); // Shuffle the chosen set of prizes for the cards

    for (let i = 0; i < numberOfCards; i++) {
      const cardData = cardPrizes[i]; // Current prize for this card
      const card = document.createElement("div");
      card.classList.add("card");
      card.dataset.prizeValue = cardData.value;
      card.dataset.prizeText = cardData.text;
      if (cardData.jackpot) {
        card.dataset.jackpot = "true";
      }

      const cardBack = document.createElement("div");
      cardBack.classList.add("card-face", "card-back");

      const cardFront = document.createElement("div");
      cardFront.classList.add("card-face", "card-front");
      if (cardData.jackpot) cardFront.classList.add("jackpot-card-face"); // For special jackpot styling

      const prizeAmountSpan = document.createElement("span");
      prizeAmountSpan.classList.add("prize-amount");
      prizeAmountSpan.textContent = cardData.value;

      const prizeTextSpan = document.createElement("span");
      prizeTextSpan.classList.add("prize-text");
      prizeTextSpan.textContent = cardData.text;

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
    const isJackpot = pickedCardElement.dataset.jackpot === "true";

    let netChange = prizeValue - costToPlay;
    saveTokensToLocalStorage(netChange);

    revealAllCards();

    let resultMsg = "";
    if (isJackpot) {
      resultMsg = `🎉 JACKPOT! 🎉<br>You won ${prizeValue} tokens!`;
    } else if (prizeValue > 0) {
      resultMsg = `You won ${prizeValue} tokens! (${prizeText})`;
    } else {
      resultMsg = `Sorry! ${prizeText}`;
    }
    resultMsg += `<br>(Net: ${netChange >= 0 ? "+" : ""}${netChange} Tokens)`;

    resultDisplayText.innerHTML = resultMsg;
    resultDisplayContainer.classList.remove("hidden");
    instructionText.textContent = "Round Over! Play again?";

    playAgainButton.classList.remove("hidden");
    playAgainButton.disabled =
      costToPlay > 0 && getCurrentTokens() < costToPlay;
  }

  function revealAllCards() {
    const allCards = cardArea.querySelectorAll(".card");
    allCards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add("flipped");
        card.removeEventListener("click", handleCardPick);
        if (card === pickedCardElement) {
          card.classList.add("picked-card-highlight"); // Highlight picked card
        } else {
          card.classList.add("disabled");
        }
        // Highlight all jackpot cards, picked or not
        if (card.dataset.jackpot === "true") {
          card.classList.add("jackpot-card-revealed");
        }
      }, index * 150 + 200); // Stagger reveal slightly after main flip
    });
  }

  function populateOutcomesList() {
    if (!outcomesListElement) return;
    outcomesListElement.innerHTML = "";

    const uniqueNetPrizes = [];
    prizeOptions.forEach((option) => {
      const net = option.value - costToPlay;
      if (!uniqueNetPrizes.find((item) => item.netValue === net)) {
        uniqueNetPrizes.push({
          netValue: net,
          text: option.text, // Or generate text based on net value
          isJackpot: option.jackpot,
        });
      }
    });

    uniqueNetPrizes.sort((a, b) => b.netValue - a.netValue); // Sort highest net first

    uniqueNetPrizes.forEach((option) => {
      const outcomeItem = document.createElement("div");
      outcomeItem.classList.add("outcome-item");
      if (option.isJackpot) outcomeItem.classList.add("jackpot");
      else if (option.netValue > 0) outcomeItem.classList.add("win");
      else if (option.netValue < 0) outcomeItem.classList.add("lose");
      else outcomeItem.classList.add("even");

      let text = option.isJackpot ? "JACKPOT!" : option.text;
      outcomeItem.innerHTML = `<span>${text}</span> <span>(${
        option.netValue >= 0 ? "+" : ""
      }${option.netValue + 5})</span>`;
      outcomesListElement.appendChild(outcomeItem);
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
