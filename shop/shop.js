// arcade-hub/shop/shop.js

const ARCADE_TOKENS_KEY = "arcadeTokens";
const PURCHASED_ITEMS_KEY = "arcadePlayerInventory";
const ACTIVE_THEME_KEY = "arcadeTheme";
const ACTIVE_CARD_BACK_KEY = "memoryGameCardBack";
const ACTIVE_SOUND_PACK_KEY = "arcadeSoundPack";
const DEFAULT_THEME_ID = "modern";

const THEME_CONTAINER_ID = "theme-items-container";
const CARD_BACK_CONTAINER_ID = "card-back-items-container";
const SOUND_PACK_CONTAINER_ID = "sound-pack-items-container";

// --- TOKEN DISPLAY FUNCTIONS ---
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
    displayContainer.appendChild(display);
  } else if (!display && !displayContainer) {
    display = document.createElement("div");
    display.id = "in-game-token-display";
    document.body.appendChild(display); // Fallback: styles applied by shop.css or theme.css
    console.warn(
      "Token display container missing in shop.html, appended to body."
    );
  }
  return display;
}
function updateTokenDisplayInShop(tokens) {
  const displayElement = createTokenDisplay();
  if (displayElement) displayElement.textContent = `Tokens: ${tokens}`;
}

// --- INVENTORY MANAGEMENT ---
function getPlayerInventory() {
  const inventory = localStorage.getItem(PURCHASED_ITEMS_KEY);
  const defaultInventory = { themes: [], memoryCardBacks: [], soundPacks: [] };
  const parsedInventory = inventory
    ? JSON.parse(inventory)
    : { ...defaultInventory };
  for (const key in defaultInventory) {
    if (!parsedInventory.hasOwnProperty(key)) parsedInventory[key] = [];
  }
  return parsedInventory;
}
function savePlayerInventory(inventory) {
  localStorage.setItem(PURCHASED_ITEMS_KEY, JSON.stringify(inventory));
}
function addItemToInventory(itemTypeKey, itemId) {
  const inventory = getPlayerInventory();
  if (!inventory[itemTypeKey]) inventory[itemTypeKey] = [];
  if (!inventory[itemTypeKey].includes(itemId)) {
    inventory[itemTypeKey].push(itemId);
    savePlayerInventory(inventory);
    return true;
  }
  return false;
}

// --- SHOP LOGIC ---
let allShopItems = {};

async function fetchShopItems() {
  try {
    const response = await fetch("shop-items.json"); // Path relative to shop.html/shop.js
    if (!response.ok)
      throw new Error(
        `HTTP error! status: ${response.status} (shop-items.json)`
      );
    allShopItems = await response.json();
    return true;
  } catch (error) {
    console.error("Could not load shop items:", error);
    const shopContainer = document.querySelector(".shop-container");
    if (shopContainer)
      shopContainer.innerHTML = `<p style="color:var(--color-danger, red); text-align:center;">Error loading shop items. Ensure shop-items.json is in the 'shop' folder.</p>`;
    return false;
  }
}

function applyShopTheme(themeId) {
  const themeStylesheet = document.getElementById("theme-stylesheet");
  if (themeStylesheet) {
    themeStylesheet.href = `../themes/${themeId}.css`;
    console.log(`Shop: Applied theme ${themeId}.css dynamically.`);
  } else {
    console.error(
      "Theme stylesheet link element 'theme-stylesheet' not found."
    );
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  updateTokenDisplayInShop(getCurrentTokens());
  const itemsLoaded = await fetchShopItems();
  if (itemsLoaded) {
    initializeDefaultInventory();
    loadShopSection(
      "themes",
      THEME_CONTAINER_ID,
      handleThemeAction,
      ACTIVE_THEME_KEY
    );
    loadShopSection(
      "memoryCardBacks",
      CARD_BACK_CONTAINER_ID,
      handleCardBackAction,
      ACTIVE_CARD_BACK_KEY
    );
    loadShopSection(
      "soundPacks",
      SOUND_PACK_CONTAINER_ID,
      handleSoundPackAction,
      ACTIVE_SOUND_PACK_KEY
    );
  }
  const currentYearElement = document.getElementById("current-year");
  if (currentYearElement)
    currentYearElement.textContent = new Date().getFullYear();
});

function initializeDefaultInventory() {
  const inventory = getPlayerInventory();
  let inventoryUpdated = false;
  for (const itemTypeKey in allShopItems) {
    if (!inventory.hasOwnProperty(itemTypeKey)) {
      inventory[itemTypeKey] = [];
      inventoryUpdated = true;
    }
    if (allShopItems.hasOwnProperty(itemTypeKey)) {
      allShopItems[itemTypeKey].forEach((item) => {
        if (item.ownedByDefault && !inventory[itemTypeKey].includes(item.id)) {
          inventory[itemTypeKey].push(item.id);
          inventoryUpdated = true;
        }
      });
    }
  }
  if (inventoryUpdated) savePlayerInventory(inventory);

  const setDefaultActiveItem = (storageKey, itemTypeKey, defaultItemId) => {
    if (!localStorage.getItem(storageKey)) {
      const defaultItem = allShopItems[itemTypeKey]?.find(
        (it) => it.id === defaultItemId && it.ownedByDefault
      );
      if (defaultItem) localStorage.setItem(storageKey, defaultItemId);
      else {
        const firstOwnedDefault = allShopItems[itemTypeKey]?.find(
          (it) => it.ownedByDefault
        );
        if (firstOwnedDefault)
          localStorage.setItem(storageKey, firstOwnedDefault.id);
      }
    }
  };
  setDefaultActiveItem(ACTIVE_THEME_KEY, "themes", DEFAULT_THEME_ID);
  setDefaultActiveItem(ACTIVE_CARD_BACK_KEY, "memoryCardBacks", "default");
  setDefaultActiveItem(ACTIVE_SOUND_PACK_KEY, "soundPacks", "default_sounds");
}

function loadShopSection(
  itemTypeKey,
  containerIdString,
  actionHandler,
  activeItemStorageKey
) {
  const container = document.getElementById(containerIdString);
  if (!container) {
    console.warn(
      `Shop: Container '${containerIdString}' not found for '${itemTypeKey}'.`
    );
    const sectionElement = document.getElementById(`${itemTypeKey}-section`);
    if (sectionElement) sectionElement.style.display = "none";
    return;
  }
  if (!allShopItems[itemTypeKey] || allShopItems[itemTypeKey].length === 0) {
    container.innerHTML = `<p style="color: var(--color-text-muted);">No items in category.</p>`;
    return;
  }

  container.innerHTML = "";
  const items = allShopItems[itemTypeKey];
  const inventory = getPlayerInventory();
  const defaultActive = items.find((i) => i.ownedByDefault)?.id;
  const activeItem =
    localStorage.getItem(activeItemStorageKey) || defaultActive;

  items.forEach((item) => {
    const itemOwned =
      inventory[itemTypeKey] && inventory[itemTypeKey].includes(item.id);
    const itemElement = document.createElement("div");
    itemElement.classList.add("shop-item");
    itemElement.dataset.itemId = item.id;
    itemElement.dataset.itemTypeKey = itemTypeKey;

    const previewElement = document.createElement("div");
    previewElement.classList.add("item-preview");

    if (item.imagePreview && itemTypeKey === "themes") {
      // Use imagePreview for themes
      const img = document.createElement("img");
      img.src = `../${item.imagePreview}`; // Path from shop/ to root img/
      img.alt = `${item.name} Preview`;
      previewElement.appendChild(img); // Styling for img inside .item-preview done by CSS
    } else if (item.previewClass) {
      // Fallback to class-based previews for others
      previewElement.classList.add(item.previewClass);
      if (itemTypeKey === "memoryCardBacks") {
        // Specifically for memoryCardBacks
        const miniCard = document.createElement("div");
        miniCard.classList.add("mini-card-back");
        previewElement.appendChild(miniCard);
      } else if (itemTypeKey === "soundPacks") {
        // Specifically for soundPacks
        previewElement.textContent = ""; // Let CSS ::before handle content like speaker icon
      } else {
        // Generic text fallback for other class-based previews
        previewElement.textContent = item.name;
      }
    } else {
      previewElement.textContent = "Preview N/A";
    }

    const nameElement = document.createElement("h3");
    nameElement.classList.add("item-name");
    nameElement.textContent = item.name;
    const descElement = document.createElement("p");
    descElement.classList.add("item-description");
    descElement.textContent = item.description;
    const priceElement = document.createElement("p");
    priceElement.classList.add("item-price");
    priceElement.textContent = item.price;
    const actionButton = document.createElement("button");
    actionButton.classList.add("arcade-button"); // Base theme class

    if (itemOwned) {
      if (activeItem === item.id) {
        actionButton.classList.add("equipped-button");
        actionButton.textContent = "Equipped";
        actionButton.disabled = true;
      } else {
        actionButton.classList.add("select-button");
        actionButton.textContent = "Select";
      }
    } else {
      actionButton.classList.add("buy-button");
      actionButton.textContent = "Buy";
      if (getCurrentTokens() < item.price) actionButton.disabled = true;
    }
    actionButton.addEventListener("click", () =>
      actionHandler(
        item,
        actionButton,
        itemOwned,
        itemTypeKey,
        activeItemStorageKey
      )
    );

    itemElement.appendChild(previewElement);
    itemElement.appendChild(nameElement);
    itemElement.appendChild(descElement);
    if (!itemOwned && item.price > 0) itemElement.appendChild(priceElement);
    else if (item.price === 0 && !itemOwned) {
      /* Optional "Free" display logic */
    }
    itemElement.appendChild(actionButton);
    container.appendChild(itemElement);
  });
}

function handlePurchase(
  item,
  clickedBtn,
  itemTypeKey,
  activeKey,
  actionHandlerCb,
  containerIdReload
) {
  const currentTokens = getCurrentTokens();
  if (currentTokens >= item.price) {
    const newTokens = currentTokens - item.price;
    localStorage.setItem(ARCADE_TOKENS_KEY, newTokens);
    updateTokenDisplayInShop(newTokens);
    addItemToInventory(itemTypeKey, item.id);
    alert(`${item.name} purchased!`);
    if (itemTypeKey === "themes") {
      localStorage.setItem(activeKey, item.id);
      applyShopTheme(item.id);
    } else if (
      itemTypeKey === "memoryCardBacks" ||
      itemTypeKey === "soundPacks"
    ) {
      localStorage.setItem(activeKey, item.id); // Auto-select other purchased items
    }
    loadShopSection(itemTypeKey, containerIdReload, actionHandlerCb, activeKey);
  } else {
    alert("Not enough tokens!");
  }
}

function handleThemeAction(item, btn, isOwned, typeKey, activeKey) {
  if (!isOwned)
    handlePurchase(
      item,
      btn,
      typeKey,
      activeKey,
      handleThemeAction,
      THEME_CONTAINER_ID
    );
  else {
    localStorage.setItem(activeKey, item.id);
    applyShopTheme(item.id);
    loadShopSection(typeKey, THEME_CONTAINER_ID, handleThemeAction, activeKey);
  }
}
function handleCardBackAction(item, btn, isOwned, typeKey, activeKey) {
  if (!isOwned)
    handlePurchase(
      item,
      btn,
      typeKey,
      activeKey,
      handleCardBackAction,
      CARD_BACK_CONTAINER_ID
    );
  else {
    localStorage.setItem(activeKey, item.id);
    loadShopSection(
      typeKey,
      CARD_BACK_CONTAINER_ID,
      handleCardBackAction,
      activeKey
    );
  }
}
function handleSoundPackAction(item, btn, isOwned, typeKey, activeKey) {
  if (!isOwned)
    handlePurchase(
      item,
      btn,
      typeKey,
      activeKey,
      handleSoundPackAction,
      SOUND_PACK_CONTAINER_ID
    );
  else {
    localStorage.setItem(activeKey, item.id);
    loadShopSection(
      typeKey,
      SOUND_PACK_CONTAINER_ID,
      handleSoundPackAction,
      activeKey
    );
  }
}
