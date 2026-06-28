const storyText = document.getElementById("story-text");
const turnIndicator = document.getElementById("turn-indicator");
const sentenceForm = document.getElementById("sentence-form");
const sentenceInput = document.getElementById("sentence-input");
const submitButton = document.getElementById("submit-button");
const charCounter = document.getElementById("char-counter");
const skipButton = document.getElementById("skip-button");
const endButton = document.getElementById("end-button");

let typingTimer = null;

function renderStory(sentences) {
  storyText.replaceChildren();

  sentences.forEach(sentence => {

    const p = document.createElement("p");

    if (sentence.type === "skip") {

      p.textContent = `— ${sentence.nickname}'s turn was skipped. —`;

    } else {

      const strong = document.createElement("strong");
      strong.textContent = sentence.nickname + " ";

      const span = document.createElement("span");
      span.textContent = sentence.content;

      p.appendChild(strong);
      p.appendChild(span);

    }

    storyText.appendChild(p);

  });
}

function renderTurn(state) {
  const turn = state.turn;
  if (skipButton) {
    skipButton.hidden = turn.is_my_turn;
  }

  if (!turn.nickname) {
    turnIndicator.textContent = "";
    return;
  }

  if (turn.is_my_turn) {
    turnIndicator.textContent = "👉 It's your turn.";
  } else if (turn.is_typing) {
    turnIndicator.textContent = `${turn.nickname} is typing...`;
  } else {
    turnIndicator.textContent = `Waiting for ${turn.nickname}...`;
  }

  sentenceInput.disabled = !turn.is_my_turn;
  submitButton.disabled = !turn.is_my_turn;
}

async function refreshStory() {
  const response = await fetch(`/api/story/${GAME_PIN}`);
  const state = await response.json();

  if (state.status === "ended") {
    window.location = `/end/${GAME_PIN}`;
    return;
  }

  renderStory(state.sentences);
  renderTurn(state);
}

async function sendTyping() {
  await fetch(`/api/story/${GAME_PIN}/typing`, {
    method: "POST",
  });
}

sentenceInput.addEventListener("input", () => {
  charCounter.textContent = `${sentenceInput.value.length} / 140`;

  clearTimeout(typingTimer);

  typingTimer = setTimeout(() => {
    if (sentenceInput.value.trim().length > 0 && !sentenceInput.disabled) {
      sendTyping();
    }
  }, 300);
});

sentenceForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData();
  formData.append("content", sentenceInput.value);

  const response = await fetch(`/api/story/${GAME_PIN}/sentence`, {
    method: "POST",
    body: formData,
  });

  if (response.ok) {
    sentenceInput.value = "";
    charCounter.textContent = "0 / 140";
    await refreshStory();
  }
});

if (skipButton) {
  skipButton.addEventListener("click", async () => {
    await fetch(`/api/story/${GAME_PIN}/skip`, {
      method: "POST",
    });

    await refreshStory();
  });
}

if (endButton) {
  endButton.addEventListener("click", async () => {
    await fetch(`/api/story/${GAME_PIN}/end`, {
      method: "POST",
    });

    window.location = `/end/${GAME_PIN}`;
  });
}

setInterval(refreshStory, 1000);