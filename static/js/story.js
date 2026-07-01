const storyText = document.getElementById("story-container");
const turnIndicator = document.getElementById("turn-message");
const sentenceForm = document.getElementById("sentence-form");
const sentenceInput = document.getElementById("sentence-input");
const submitButton = document.getElementById("send-button");

const skipButton = document.getElementById("skip-button");
const endButton = document.getElementById("end-button");
const copyPinButton = document.getElementById("copy-pin-button");

const storyMenuButton = document.getElementById("story-menu-button");
const storyMenu = document.getElementById("story-menu");
const leaveButton = document.getElementById("leave-button");

const playersBar = document.getElementById("players-bar");
const turnActions = document.getElementById("turn-actions");
const passButton = document.getElementById("pass-button");


localStorage.setItem("currentGame", GAME_PIN);

let typingTimer = null;
let currentTurn = null;
let previousTurnPlayerId = null;


function renderStory(sentences) {
  storyText.replaceChildren();

  sentences
    .filter(sentence => sentence.type === "sentence")
    .forEach(sentence => {
      const p = document.createElement("p");
      p.textContent = sentence.content;
      storyText.appendChild(p);
    });

}

function renderTurn(state) {
  const turn = state.turn;
  currentTurn = turn;

  if (turn.player_id !== previousTurnPlayerId) {

    if (turnActions) {
      turnActions.hidden = true;
    }

    previousTurnPlayerId = turn.player_id;
  }

  document.querySelectorAll(".player-chip").forEach(chip => {
    chip.classList.remove("active", "clickable");
  });

  const activeChip = document.getElementById(`player-${turn.player_id}`);

  if (activeChip) {
    activeChip.classList.add("active");
  }

  if (activeChip) {

    if (turn.is_my_turn && passButton) {
      activeChip.classList.add("clickable");
    }

    if (IS_HOST && !turn.is_my_turn && skipButton) {
      activeChip.classList.add("clickable");
    }
  }

  if (!turn.nickname) {
    turnIndicator.textContent = "";
    return;
  }

  if (turn.is_my_turn) {
    turnIndicator.innerHTML = `
      <span class="material-symbols-rounded">edit_note</span>
      It's your turn.
    `;
  } else if (turn.is_typing) {
    turnIndicator.innerHTML = `
      <span class="material-symbols-rounded">keyboard</span>
      ${turn.nickname} is typing...
    `;
  } else {
    turnIndicator.innerHTML = `
      <span class="material-symbols-rounded">hourglass_top</span>
      Waiting for ${turn.nickname}...
    `;
  }

  sentenceInput.disabled = !turn.is_my_turn;
  submitButton.disabled = !turn.is_my_turn;
}

async function handlePassTurn() {
  const response = await fetch(`/api/story/${GAME_PIN}/pass`, {
    method: "POST",
  });

  if (!response.ok) {
    return;
  }

  sentenceInput.value = "";
  sentenceInput.dispatchEvent(new Event("input"));

  if (turnActions) {
    turnActions.hidden = true;
  }

  await refreshStory();
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
    sentenceInput.dispatchEvent(new Event("input"));

    await refreshStory();

    storyText.scrollTop = storyText.scrollHeight;
  }
});

if (skipButton) {
  skipButton.addEventListener("click", async () => {
    await fetch(`/api/story/${GAME_PIN}/skip`, {
      method: "POST",
    });

    if (turnActions) {
      turnActions.hidden = true;
    }

    await refreshStory();
  });
}

if (passButton) {
  passButton.addEventListener("click", handlePassTurn);
}

if (endButton) {
  endButton.addEventListener("click", async () => {
    await fetch(`/api/story/${GAME_PIN}/end`, {
      method: "POST",
    });

    window.location = `/end/${GAME_PIN}`;
  });
}

if (copyPinButton) {
  copyPinButton.addEventListener("click", async () => {

    await navigator.clipboard.writeText(
      // `Join my story!\n\nPIN: ${GAME_PIN}`
      `${GAME_PIN}`
    );

    copyPinButton.querySelector(".material-symbols-rounded").textContent =
      "check";

    setTimeout(() => {
      copyPinButton.querySelector(".material-symbols-rounded").textContent =
        "content_copy";
    }, 1200);

  });
}

if (storyMenuButton && storyMenu) {
  storyMenuButton.addEventListener("click", (event) => {
    event.stopPropagation();
    storyMenu.hidden = !storyMenu.hidden;
  });

  document.addEventListener("click", () => {
    storyMenu.hidden = true;
  });

  storyMenu.addEventListener("click", (event) => {
    event.stopPropagation();
  });
}

if (leaveButton) {
  leaveButton.addEventListener("click", () => {
    window.location = "/";
  });
}

if (playersBar && turnActions) {
  playersBar.addEventListener("click", (event) => {
    const chip = event.target.closest(".player-chip");

    if (!chip || !chip.classList.contains("active")) {
      return;
    }

    if (!chip.classList.contains("clickable")) {
      return;
    }

    if (passButton) {
      passButton.hidden = !currentTurn.is_my_turn;
    }

    if (skipButton) {
      skipButton.hidden = !(IS_HOST && !currentTurn.is_my_turn);
    }

    turnActions.hidden = !turnActions.hidden;
  });
}

refreshStory();
setInterval(refreshStory, 1000);
