const nicknameInput = document.getElementById("nickname-input");
const createButton = document.getElementById("create-button");

function updateButtonState() {
    createButton.disabled = nicknameInput.value.trim().length === 0;
}

nicknameInput.addEventListener("input", updateButtonState);

updateButtonState();