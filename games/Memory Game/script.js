document.addEventListener("DOMContentLoaded", () => {
  const cardSymbols = ["💀", "👻", "🎃", "👽", "🤖", "👾", "🤡", "👹"];
  const gameSymbols = [...cardSymbols, ...cardSymbols]; // Duplicate for pairs
  const totalPairs = cardSymbols.length;

  let flippedCards = [];
  let matchedPairs = 0;
  let moves = 0;
  let lockBoard = false;

  const gameBoard = document.getElementById("game-board");
  const movesCountElement = document.getElementById("moves-count");
  const matchesCountElement = document.getElementById("matches-count");
  const totalPairsElement = document.getElementById("total-pairs");
  const restartButton = document.getElementById("restart-button");
  const winMessageElement = document.getElementById("win-message");
  const finalMovesElement = document.getElementById("final-moves");
  const collectRewardButton = document.getElementById("collect-reward-button");

  const maxReward = 100; // Maximum reward for optimal moves
  const baseMovesForFullReward = 10; // Number of moves for full reward
  const maxMovesAllowed = 20; // Maximum moves before reward goes to zero

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function createBoard() {
    gameBoard.innerHTML = "";
    winMessageElement.classList.add("hidden");
    matchedPairs = 0;
    moves = 0;
    flippedCards = [];
    lockBoard = false;
    updateGameInfo();

    const shuffledSymbols = shuffle([...gameSymbols]);

    shuffledSymbols.forEach((symbol) => {
      const cardElement = document.createElement("div");
      cardElement.classList.add("card");
      cardElement.dataset.symbol = symbol;

      const cardFaceFront = document.createElement("div");
      cardFaceFront.classList.add("card-face", "card-front");
      cardFaceFront.textContent = symbol;

      const cardFaceBack = document.createElement("div");
      cardFaceBack.classList.add("card-face", "card-back");

      cardElement.appendChild(cardFaceFront);
      cardElement.appendChild(cardFaceBack);

      cardElement.addEventListener("click", handleCardClick);
      gameBoard.appendChild(cardElement);
    });
  }

  function handleCardClick(event) {
    if (lockBoard) return;
    const clickedCard = event.currentTarget;
    if (
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

    if (cardOne.dataset.symbol === cardTwo.dataset.symbol) {
      disableCards();
    } else {
      unflipCards();
    }
  }

  function disableCards() {
    flippedCards.forEach((card) => {
      card.classList.remove("flipped");
      card.classList.add("matched");
    });
    matchedPairs++;
    updateGameInfo();
    resetTurn();
    checkWinCondition();
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

  function updateGameInfo() {
    movesCountElement.textContent = moves;
    matchesCountElement.textContent = matchedPairs;
    totalPairsElement.textContent = totalPairs;
  }

  // Calculate the reward based on moves
  function calculateReward() {
    if (matchedPairs !== totalPairs) return 0; // No reward until game is won

    // If moves are fewer than baseMovesForFullReward, reward is full.
    let reward = maxReward;

    if (moves > baseMovesForFullReward) {
      const excessMoves = moves - baseMovesForFullReward;
      reward -=
        excessMoves * (maxReward / (maxMovesAllowed - baseMovesForFullReward));
    }

    // Cap the reward at zero if it exceeds maxMovesAllowed
    reward = Math.max(reward, 0);

    return Math.round(reward);
  }

  function checkWinCondition() {
    if (matchedPairs === totalPairs) {
      finalMovesElement.textContent = moves;

      // Calculate the dynamic reward based on the number of moves
      const dynamicReward = calculateReward();

      collectRewardButton.href = `../../index.html?reward=${dynamicReward}`;

      if (dynamicReward > 0) {
        collectRewardButton.textContent = `Collect ${dynamicReward} Token${
          dynamicReward === 1 ? "" : "s"
        } & Return to Hub`;
      } else {
        collectRewardButton.textContent = `Return to Hub (No Tokens Earned)`;
      }

      winMessageElement.classList.remove("hidden");
    }
  }

  restartButton.addEventListener("click", createBoard);
  createBoard();
});
