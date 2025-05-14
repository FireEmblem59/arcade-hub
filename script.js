// arcade-hub/script.js

document.addEventListener("DOMContentLoaded", () => {
  const COIN_STORAGE_KEY = "arcadeTokens";
  const GAMES_OWNED_KEY = "arcadePlayerGamesOwned"; // For purchased games
  const ACTIVE_THEME_KEY = "arcadeTheme";
  const DEFAULT_THEME = "modern";

  const coinBalanceElement = document.getElementById("coin-balance");
  const gameListContainer = document.getElementById("game-list");
  const currentYearElement = document.getElementById("current-year");

  // --- Game Ownership Functions ---
  function getPlayerGamesOwned() {
    const owned = localStorage.getItem(GAMES_OWNED_KEY);
    return owned ? JSON.parse(owned) : [];
  }

  function savePlayerGamesOwned(ownedArray) {
    localStorage.setItem(GAMES_OWNED_KEY, JSON.stringify(ownedArray));
  }

  function addGameToOwned(gameId) {
    const owned = getPlayerGamesOwned();
    if (!owned.includes(gameId)) {
      owned.push(gameId);
      savePlayerGamesOwned(owned);
      return true;
    }
    return false; // Already owned
  }

  async function initializeDefaultOwnedGames(gamesData) {
    if (!gamesData) return; // Should not happen if games.json loaded
    const ownedGames = getPlayerGamesOwned();
    let updated = false;
    gamesData.forEach((game) => {
      if (game.ownedByDefault && !ownedGames.includes(game.id)) {
        ownedGames.push(game.id);
        updated = true;
      }
    });
    if (updated) {
      savePlayerGamesOwned(ownedGames);
    }
  }
  // --- End Game Ownership ---

  function applyBodyThemeClass() {
    const currentTheme =
      localStorage.getItem(ACTIVE_THEME_KEY) || DEFAULT_THEME;
    document.body.className = "";
    document.body.classList.add(`theme-${currentTheme}`);
    console.log(`Hub: Applied body class theme-${currentTheme}`);
  }

  async function initializeArcade() {
    applyBodyThemeClass();
    checkForReward(); // Process URL rewards first
    updateCoinDisplay(); // Update based on potentially new coin total

    const gamesData = await fetchGamesData(); // Fetch game data once
    if (gamesData) {
      await initializeDefaultOwnedGames(gamesData); // Set up default owned games
      loadGameCards(gamesData); // Then load cards based on ownership
    }
    updateFooterYear();
  }

  function getCoins() {
    return parseInt(localStorage.getItem(COIN_STORAGE_KEY)) || 10000;
  }

  function saveCoins(amount) {
    localStorage.setItem(COIN_STORAGE_KEY, amount.toString());
  }

  function updateCoinDisplay() {
    if (coinBalanceElement) {
      coinBalanceElement.textContent = getCoins();
    } else {
      console.warn("Hub: Coin balance element not found.");
    }
  }

  function checkForReward() {
    const urlParams = new URLSearchParams(window.location.search);
    const reward = parseInt(urlParams.get("reward"));
    if (!isNaN(reward) && reward > 0) {
      let currentCoins = getCoins();
      currentCoins += reward;
      saveCoins(currentCoins);
      // updateCoinDisplay(); // Called after this in initializeArcade
      const newUrl = window.location.pathname + window.location.hash;
      history.replaceState(null, "", newUrl);
    }
  }

  async function fetchGamesData() {
    try {
      const response = await fetch("games.json");
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Hub: Could not load games.json:", error);
      if (gameListContainer)
        gameListContainer.innerHTML =
          "<p>Error loading game data. Please try again later.</p>";
      return null;
    }
  }

  function loadGameCards(gamesData) {
    // Now takes gamesData as argument
    if (!gameListContainer) {
      console.error("Hub: Game list container (#game-list) not found!");
      return;
    }
    if (!gamesData) {
      // Should have been handled by fetchGamesData error
      if (gameListContainer)
        gameListContainer.innerHTML = "<p>Game data unavailable.</p>";
      return;
    }

    gameListContainer.innerHTML = "";
    if (gamesData.length === 0) {
      gameListContainer.innerHTML =
        "<p>No games available. Check back soon!</p>";
      return;
    }

    const currentThemeForThumbs =
      localStorage.getItem(ACTIVE_THEME_KEY) || DEFAULT_THEME;
    const ownedGames = getPlayerGamesOwned();
    const currentTokens = getCoins();

    gamesData.forEach((game) => {
      const card = document.createElement("div");
      card.className = "game-card";

      const gameLink = `games/${game.folderName}/${
        game.entryPoint || "index.html"
      }`;
      let thumbnailUrl = `img/default-thumb_${currentThemeForThumbs}.png`;
      if (game.thumbnail) {
        const lastDot = game.thumbnail.lastIndexOf(".");
        if (lastDot !== -1) {
          thumbnailUrl = `${game.thumbnail.substring(
            0,
            lastDot
          )}_${currentThemeForThumbs}${game.thumbnail.substring(lastDot)}`;
        } else {
          thumbnailUrl = `${game.thumbnail}_${currentThemeForThumbs}.png`;
        }
      }
      const absoluteDefaultOnError = `img/default-thumb_${DEFAULT_THEME}.png`;

      const isOwned = game.ownedByDefault || ownedGames.includes(game.id);
      if (!isOwned && game.price > 0) {
        // Add class if not owned and has a price
        card.classList.add("locked-game");
      }

      let actionButtonHTML = "";
      if (isOwned || game.price === 0) {
        // If owned OR free (even if not "ownedByDefault")
        actionButtonHTML = `<a href="${gameLink}" class="play-button arcade-button pixel-button">Play</a>`;
      } else {
        const canAfford = currentTokens >= game.price;
        actionButtonHTML = `
                  <button class="buy-game-button arcade-button" 
                          data-game-id="${game.id}" 
                          data-game-price="${game.price}"
                          ${canAfford ? "" : "disabled"}>
                      Buy (${game.price} Tokens)
                  </button>`;
      }

      card.innerHTML = `
              <img src="${thumbnailUrl}" alt="${game.name} Thumbnail" 
                   onerror="this.onerror=null; this.src='${absoluteDefaultOnError}';">
              <div class="card-content">
                  <h3>${game.name}</h3>
                  <p>${game.description || "No description available."}</p>
                  <div class="game-card-action">
                      ${actionButtonHTML}
                  </div>
              </div>
          `;
      gameListContainer.appendChild(card);
    });

    // Add event listeners to new buy buttons
    document.querySelectorAll(".buy-game-button").forEach((button) => {
      button.addEventListener("click", handleGamePurchase);
    });
  }

  function handleGamePurchase(event) {
    const button = event.currentTarget;
    const gameId = button.dataset.gameId;
    const gameName =
      allShopItems.games.find((g) => g.id === gameId)?.name || gameId; // Get game name for alert
    const gamePrice = parseInt(button.dataset.gamePrice);
    const currentTokens = getCoins();

    if (currentTokens >= gamePrice) {
      if (confirm(`Purchase "${gameName}" for ${gamePrice} tokens?`)) {
        saveCoins(currentTokens - gamePrice);
        addGameToOwned(gameId);
        updateCoinDisplay();
        // Reload game cards to reflect new ownership
        fetchGamesData().then((gamesData) => {
          // Re-fetch or use stored if you cache it
          if (gamesData) loadGameCards(gamesData);
        });
        alert(`"${gameName}" purchased successfully!`);
      }
    } else {
      alert("Not enough tokens to purchase this game!");
    }
  }

  // Store allShopItems globally after first fetch from shop, or fetch games.json here
  // For simplicity, let's assume games.json data is sufficient for game name in purchase confirmation.
  // If you need detailed game data (like name for alert) not present in button dataset, fetch it.
  // We'll use gamesData from the initial fetchGamesData for the re-render.

  let allGamesData = null; // Cache game data

  async function initialLoadAndSetup() {
    applyBodyThemeClass();
    checkForReward();
    updateCoinDisplay();

    allGamesData = await fetchGamesData();
    if (allGamesData) {
      await initializeDefaultOwnedGames(allGamesData);
      loadGameCards(allGamesData);
    }
    updateFooterYear();
  }

  function handleGamePurchase(event) {
    const button = event.currentTarget;
    const gameId = button.dataset.gameId;
    const gamePrice = parseInt(button.dataset.gamePrice);
    const currentTokens = getCoins();

    const gameToBuy = allGamesData?.find((g) => g.id === gameId);
    const gameName = gameToBuy ? gameToBuy.name : gameId;

    if (currentTokens >= gamePrice) {
      saveCoins(currentTokens - gamePrice);
      addGameToOwned(gameId);
      updateCoinDisplay();
      if (allGamesData) loadGameCards(allGamesData); // Re-render cards
    } else {
      alert("Not enough tokens to purchase this game!");
    }
  }

  function updateFooterYear() {
    if (currentYearElement) {
      currentYearElement.textContent = new Date().getFullYear();
    } else {
      console.warn("Hub: Current year element for footer not found.");
    }
  }

  initialLoadAndSetup(); // Call the main initialization
});
