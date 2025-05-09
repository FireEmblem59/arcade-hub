document.addEventListener("DOMContentLoaded", () => {
  // --- CONSTANTS ---
  const THEME_STORAGE_KEY = "arcadeTheme";
  const COIN_STORAGE_KEY = "arcadeTokens";

  // --- DOM ELEMENTS ---
  const coinBalanceElement = document.getElementById("coin-balance");
  const gameListContainer = document.getElementById("game-list");
  const currentYearElement = document.getElementById("current-year");
  const retroButton = document.getElementById("theme-retro-btn");
  const modernButton = document.getElementById("theme-modern-btn");

  // --- STATE VARIABLES ---
  let currentTheme = getStoredTheme();

  // --- THEME FUNCTIONS ---
  function getStoredTheme() {
    // Default theme is 'modern'
    return localStorage.getItem(THEME_STORAGE_KEY) || "modern";
  }

  function setTheme(themeName) {
    currentTheme = themeName;
    localStorage.setItem(THEME_STORAGE_KEY, themeName);
    applyThemeToBody(themeName);
    loadGames(); // Reload games to update thumbnails
  }

  function applyThemeToBody(themeName) {
    document.body.className = ""; // Clear all existing classes from body
    document.body.classList.add(`theme-${themeName}`);
  }

  function getThemedImagePath(basePath, theme) {
    if (!basePath) return null;

    const lastDotIndex = basePath.lastIndexOf(".");
    if (lastDotIndex === -1) {
      return `${basePath}_${theme}`; // No extension found
    }
    const name = basePath.substring(0, lastDotIndex);
    const extension = basePath.substring(lastDotIndex); // e.g., ".png"
    return `${name}_${theme}${extension}`;
  }

  // --- COIN/XP FUNCTIONS ---
  function getCoins() {
    return parseInt(localStorage.getItem(COIN_STORAGE_KEY)) || 0;
  }

  function saveCoins(amount) {
    localStorage.setItem(COIN_STORAGE_KEY, amount);
  }

  function updateCoinDisplay() {
    if (coinBalanceElement) {
      coinBalanceElement.textContent = getCoins();
    }
  }

  // --- GAME LOADING FUNCTION ---
  async function loadGames() {
    if (!gameListContainer) {
      console.error("Game list container (#game-list) not found!");
      return;
    }
    try {
      const response = await fetch("games.json");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const games = await response.json();
      gameListContainer.innerHTML = "";

      if (games.length === 0) {
        gameListContainer.innerHTML =
          "<p>No games available at the moment. Check back soon!</p>";
        return;
      }

      games.forEach((game) => {
        const card = document.createElement("div");
        card.className = "game-card";

        const gameLink = `games/${game.folderName}/${
          game.entryPoint || "index.html"
        }`;

        const baseThumbnail = game.thumbnail; // Path from games.json
        let themedThumbnailUrl = getThemedImagePath(
          baseThumbnail,
          currentTheme
        );

        const defaultThemedThumbnailPath = getThemedImagePath(
          "img/default-thumb.png",
          currentTheme
        );

        if (!themedThumbnailUrl) {
          // If game.thumbnail was missing or path construction failed
          themedThumbnailUrl = defaultThemedThumbnailPath;
        }

        const onErrorFallbackImage = "img/default-thumb_modern.png";

        card.innerHTML = `
                    <img src="${themedThumbnailUrl}" alt="${
          game.name
        } Thumbnail"
                         onerror="this.onerror=null; this.src='${onErrorFallbackImage}';">
                    <div class="card-content">
                        <h3>${game.name}</h3>
                        <p>${
                          game.description || "No description available."
                        }</p>
                        <a href="${gameLink}" class="play-button">Play Now</a>
                    </div>
                `;
        gameListContainer.appendChild(card);
      });
    } catch (error) {
      console.error("Could not load games.json or render games:", error);
      gameListContainer.innerHTML =
        "<p>Error loading games. Please check the console for details and try again later.</p>";
    }
  }

  // --- THEME SWITCHER SETUP ---
  function setupThemeSwitcher() {
    if (retroButton) {
      retroButton.addEventListener("click", () => setTheme("retro"));
    } else {
      console.warn("Retro theme button (#theme-retro-btn) not found.");
    }

    if (modernButton) {
      modernButton.addEventListener("click", () => setTheme("modern"));
    } else {
      console.warn("Modern theme button (#theme-modern-btn) not found.");
    }
  }

  // --- INITIALIZATION FUNCTION ---
  function initializeArcade() {
    if (currentYearElement) {
      currentYearElement.textContent = new Date().getFullYear();
    } else {
      console.warn("Current year element (#current-year) not found.");
    }

    applyThemeToBody(currentTheme);
    updateCoinDisplay();
    loadGames();
    setupThemeSwitcher();
  }

  // --- START THE ARCADE ---
  initializeArcade();
}); // End of DOMContentLoaded
