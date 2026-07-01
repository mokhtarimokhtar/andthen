const composerInput = document.getElementById("sentence-input");

const COMPOSER_ONE_LINE_HEIGHT = 24;
const COMPOSER_MAX_HEIGHT = 120;

function resizeComposer() {
  composerInput.style.height = `${COMPOSER_ONE_LINE_HEIGHT}px`;

  const wantedHeight = composerInput.scrollHeight;

  if (wantedHeight <= COMPOSER_ONE_LINE_HEIGHT + 4) {
    composerInput.style.height = `${COMPOSER_ONE_LINE_HEIGHT}px`;
    composerInput.style.overflowY = "hidden";
    return;
  }

  const nextHeight = Math.min(wantedHeight, COMPOSER_MAX_HEIGHT);

  composerInput.style.height = `${nextHeight}px`;
  composerInput.style.overflowY =
    wantedHeight > COMPOSER_MAX_HEIGHT ? "auto" : "hidden";
}

composerInput.addEventListener("input", resizeComposer);
resizeComposer();