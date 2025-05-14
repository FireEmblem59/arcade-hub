const ARCADE_TOKENS_KEY = "arcadeTokens";

function saveTokensToLocalStorage(amount) {
  if (amount <= 0) return;
  let currentTokens = parseInt(localStorage.getItem(ARCADE_TOKENS_KEY)) || 0;
  localStorage.setItem(ARCADE_TOKENS_KEY, currentTokens + amount);
  console.log(
    `TypingTest: Awarded ${amount} tokens. New total: ${currentTokens + amount}`
  );
  updateTokenDisplayInGame(currentTokens + amount);
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

document.addEventListener("DOMContentLoaded", () => {
  const textToTypeElement = document.getElementById("text-to-type");
  const typingInputElement = document.getElementById("typing-input");
  const timerDisplay = document.getElementById("timer-display");
  const wpmDisplay = document.getElementById("wpm-display");
  const accuracyDisplay = document.getElementById("accuracy-display");
  const startTestButton = document.getElementById("start-test-button");
  const resultMessage = document.getElementById("result-message"); // For intermediate messages
  const finalSummary = document.getElementById("final-summary");
  const finalWpm = document.getElementById("final-wpm");
  const finalAccuracy = document.getElementById("final-accuracy");
  const tokensEarnedDisplay = document.getElementById("tokens-earned-display");

  const sampleTexts = [
    "The quick brown fox jumps over the lazy dog.",
    "Pack my box with five dozen liquor jugs.",
    "How quickly daft jumping zebras vex.",
    "Programming is thinking, not typing.",
    "A journey of a thousand miles begins with a single step.",
    "To be or not to be, that is the question.",
    "All that glitters is not gold.",
    "Sphinx of black quartz, judge my vow.",
    "The five boxing wizards jump quickly.",
    "Crazy Fredrick bought many very exquisite opal jewels.",
    "Jackdaws love my big sphinx of quartz.",
    "We promptly judged antique ivory buckles for the next prize.",
    "Waltz, bad nymph, for quick jigs vex.",
    "Zany duff jumps quick on vexing wizard path.",
    "Big fjords vex quick waltzing nymph.",
    "Do or do not, there is no try.",
    "Stay hungry, stay foolish.",
    "Talk is cheap. Show me the code.",
    "Simplicity is the ultimate sophistication.",
    "Time is an illusion. Lunchtime doubly so.",
    "Imagination is more important than knowledge.",
    "Knowledge speaks, but wisdom listens.",
    "Not all those who wander are lost.",
    "The only true wisdom is in knowing you know nothing.",
    "Fear is the mind-killer.",
    "Life is what happens when you’re busy making other plans.",
    "The early bird catches the worm.",
    "Better late than never.",
    "Actions speak louder than words.",
    "Every cloud has a silver lining.",
    "Birds of a feather flock together.",
    "A picture is worth a thousand words.",
    "When in Rome, do as the Romans do.",
    "Practice makes perfect.",
    "You miss 100% of the shots you don’t take.",
    "It always seems impossible until it’s done.",
    "Success is not final, failure is not fatal.",
    "The best way out is always through.",
    "Be yourself; everyone else is already taken.",
    "In the middle of difficulty lies opportunity.",
    "Well begun is half done.",
    "Dream big and dare to fail.",
    "What we think, we become.",
    "You must be the change you wish to see in the world.",
    "The purpose of our lives is to be happy.",
    "Don’t cry because it’s over, smile because it happened.",
    "Life is short, and the world is wide.",
    "Happiness is not something ready made.",
    "Adventure is worthwhile in itself.",
  ];

  let targetText = "";
  let typedText = "";
  let startTime = 0;
  let timerInterval = null;
  let testActive = false;
  let errors = 0;

  function startTest() {
    updateTokenDisplayInGame(getCurrentTokens());
    targetText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    textToTypeElement.innerHTML = ""; // Clear previous
    // Create spans for each character to allow individual styling
    targetText.split("").forEach((char) => {
      const charSpan = document.createElement("span");
      charSpan.textContent = char;
      textToTypeElement.appendChild(charSpan);
    });

    typingInputElement.value = "";
    typingInputElement.disabled = false;
    typingInputElement.focus();

    startTime = 0; // Will be set on first input
    clearInterval(timerInterval);
    timerDisplay.textContent = "0";
    wpmDisplay.textContent = "0";
    accuracyDisplay.textContent = "0";
    errors = 0;

    testActive = true;
    startTestButton.textContent = "Test in Progress...";
    startTestButton.disabled = true;
    finalSummary.classList.add("hidden");
    resultMessage.classList.add("hidden");
  }

  function updateTimer() {
    if (!testActive || startTime === 0) return;
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    timerDisplay.textContent = elapsedTime;

    // WPM Calculation (Standard: 5 characters = 1 word)
    const wordsTyped = typingInputElement.value.length / 5;
    const minutes = elapsedTime / 60;
    const wpm = minutes > 0 ? Math.round(wordsTyped / minutes) : 0;
    wpmDisplay.textContent = wpm;
  }

  typingInputElement.addEventListener("input", () => {
    if (!testActive) return;

    if (startTime === 0) {
      // First key press
      startTime = Date.now();
      timerInterval = setInterval(updateTimer, 1000);
    }

    typedText = typingInputElement.value;
    let currentErrors = 0;
    const targetChars = textToTypeElement.querySelectorAll("span");

    targetChars.forEach((charSpan, index) => {
      const typedChar = typedText[index];
      charSpan.className = ""; // Reset class first

      if (typedChar == null) {
        if (index === typedText.length) {
          charSpan.classList.add("current");
        }
      } else if (typedChar === charSpan.textContent) {
        charSpan.classList.add("correct");
      } else {
        charSpan.classList.add("incorrect");
        currentErrors++;
      }
    });
    if (typedText.length === targetText.length && typedText === targetText) {
      if (targetChars[targetText.length - 1]) {
        targetChars[targetText.length - 1].classList.remove("current");
      }
    }
    errors = currentErrors; // Store total errors for final accuracy

    // Accuracy Calculation
    const accuracy =
      typedText.length > 0
        ? Math.round(((typedText.length - errors) / typedText.length) * 100)
        : 0;
    accuracyDisplay.textContent = accuracy < 0 ? 0 : accuracy; // Ensure accuracy isn't negative

    if (typedText === targetText) {
      endTest();
    }
  });

  function endTest() {
    if (!testActive) return;
    testActive = false;
    clearInterval(timerInterval);
    typingInputElement.disabled = true;
    startTestButton.textContent = "Start Test";
    startTestButton.disabled = false;

    const elapsedTimeSeconds = (Date.now() - startTime) / 1000;
    const grossWPM = targetText.length / 5 / (elapsedTimeSeconds / 60);

    // Net WPM = ( (all typed entries - uncorrected errors) / 5 ) / time in minutes
    // For simplicity, let's use gross WPM and a separate accuracy score.
    // A more common Net WPM: ( (typedText.length / 5) - errors ) / (elapsedTimeSeconds / 60)
    // but this can be negative if many errors.

    const finalWPMValue = Math.round(grossWPM);
    const finalAccuracyValue =
      targetText.length > 0
        ? Math.round(((targetText.length - errors) / targetText.length) * 100)
        : 0;

    finalWpm.textContent = finalWPMValue;
    finalAccuracy.textContent = finalAccuracyValue < 0 ? 0 : finalAccuracyValue;

    let tokensEarned = 0;
    if (finalWPMValue >= 20 && finalAccuracyValue >= 80) {
      tokensEarned = Math.floor(finalWPMValue / 10); // 1 token per 10 WPM
      tokensEarned += Math.floor(finalAccuracyValue / 20); // 1 token per 20% accuracy over 80%
      tokensEarned = Math.max(1, tokensEarned); // Min 1 token if conditions met
    }

    tokensEarnedDisplay.textContent = tokensEarned;
    if (tokensEarned > 0) {
      saveTokensToLocalStorage(tokensEarned);
    }

    finalSummary.classList.remove("hidden");
    resultMessage.classList.add("hidden");
  }

  startTestButton.addEventListener("click", startTest);

  // Initial state
  updateTokenDisplayInGame(getCurrentTokens());
});
