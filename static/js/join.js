const pinInput = document.getElementById("pin-input");
const nicknameInput = document.getElementById("nickname-input");
const joinButton = document.getElementById("join-button");

function updateButtonState() {
  const pin = pinInput.value.trim();
  const nickname = nicknameInput.value.trim();

  joinButton.disabled =
    pin.length !== 4 || nickname.length === 0;
}

pinInput.addEventListener("input", updateButtonState);
nicknameInput.addEventListener("input", updateButtonState);

updateButtonState();