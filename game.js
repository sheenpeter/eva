// --- Simple adventure data ---
const totalSteps = 50;

const stepPhrases = [
  "You enter a glowing green forest with pink fireflies dancing around you.",
  "A soft pink mist rises from the grass as you follow a narrow path.",
  "You hear a distant waterfall hidden behind bright green leaves.",
  "Glowing pink flowers open as you walk past them.",
  "A friendly bird guides you deeper into the colourful jungle.",
  "You cross a tiny bridge made of green vines and pink crystals.",
  "Strange footprints appear on the soft moss ahead.",
  "Sparkling dust floats in the air like tiny stars.",
  "You discover a small pond that reflects pink and green light.",
  "The trees bend slightly, as if greeting their new hero."
];

const leftChoices = [
  "Walk carefully between the glowing plants.",
  "Follow the pink stones.",
  "Listen closely and move ahead.",
  "Touch a flower gently.",
  "Wave at the bird.",
  "Step lightly on the bridge.",
  "Follow the footprints.",
  "Catch a bit of stardust.",
  "Sit by the pond for a moment.",
  "Whisper a wish to the forest."
];

const rightChoices = [
  "Run along the bright path.",
  "Follow the sound of leaves.",
  "Call out to see who answers.",
  "Smell the sweet scent.",
  "Fly forward with excitement.",
  "Jump across the bridge.",
  "Walk around the footprints.",
  "Spin under the shining dust.",
  "Throw a stone into the pond.",
  "Shout your wish loudly."
];

let currentCharacter = null;
let currentStep = 1;

// DOM elements
const screenSelect = document.getElementById("screen-select");
const screenGame = document.getElementById("screen-game");
const screenGift = document.getElementById("screen-gift");

const charCards = document.querySelectorAll(".char-card");
const btnStart = document.getElementById("btn-start");

const stepLabel = document.getElementById("step-label");
const progressFill = document.getElementById("progress-fill");
const stepText = document.getElementById("step-text");
const choiceLeft = document.getElementById("choice-left");
const choiceRight = document.getElementById("choice-right");
const btnNext = document.getElementById("btn-next");

const btnRestart = document.getElementById("btn-restart");

// --- Character selection ---

charCards.forEach((card) => {
  card.addEventListener("click", () => {
    charCards.forEach((c) => c.classList.remove("selected"));
    card.classList.add("selected");
    currentCharacter = card.dataset.char;
    btnStart.disabled = false;
  });
});

btnStart.addEventListener("click", () => {
  if (!currentCharacter) return;
  screenSelect.classList.add("hidden");
  screenGame.classList.remove("hidden");
  currentStep = 1;
  updateStepUI();
});

// --- Game logic ---

function updateStepUI() {
  stepLabel.textContent = `Step ${currentStep} / ${totalSteps}`;

  const baseIndex = (currentStep - 1) % stepPhrases.length;
  const baseText = stepPhrases[baseIndex];

  let charExtra = "";
  switch (currentCharacter) {
    case "explorer":
      charExtra = " Your explorer senses a hidden path nearby.";
      break;
    case "ninja":
      charExtra = " Your ninja moves are silent and quick.";
      break;
    case "fairy":
      charExtra = " Your fairy wings glow softly in the dark.";
      break;
  }

  stepText.textContent = baseText + charExtra;

  const progressPercent = (currentStep / totalSteps) * 100;
  progressFill.style.width = progressPercent + "%";

  btnNext.textContent =
    currentStep === totalSteps ? "Open Your Gift" : "Next Step";
}

// Choices just change the text slightly for fun
choiceLeft.addEventListener("click", () => {
  const idx = (currentStep - 1) % leftChoices.length;
  stepText.textContent += " " + leftChoices[idx];
});

choiceRight.addEventListener("click", () => {
  const idx = (currentStep - 1) % rightChoices.length;
  stepText.textContent += " " + rightChoices[idx];
});

btnNext.addEventListener("click", () => {
  if (currentStep >= totalSteps) {
    // Show gift
    screenGame.classList.add("hidden");
    screenGift.classList.remove("hidden");
    return;
  }
  currentStep++;
  updateStepUI();
});

// --- Restart ---

btnRestart.addEventListener("click", () => {
  screenGift.classList.add("hidden");
  screenSelect.classList.remove("hidden");
  charCards.forEach((c) => c.classList.remove("selected"));
  btnStart.disabled = true;
  currentCharacter = null;
});
