const shareButton = document.getElementById("share-button");

function saveStory() {
  const firstSentence =
    document
      .querySelector("#final-story p")
      ?.textContent
      ?.trim() || "";

  const title = firstSentence.substring(0, 50);

  let stories = JSON.parse(
    localStorage.getItem("recentStories") || "[]"
  );

  stories = stories.filter(story => story.pin !== GAME_PIN);

  stories.unshift({
    pin: GAME_PIN,
    title: title || "Untitled story",
    date: new Date().toISOString()
  });

  stories = stories.slice(0, 20);

  localStorage.setItem(
    "recentStories",
    JSON.stringify(stories)
  );
}

async function copyStoryLink() {
  const url = `${window.location.origin}/end/${GAME_PIN}`;

  await navigator.clipboard.writeText(
    `Read our story on AndThen\n\n${url}`
  );

  shareButton.textContent = "Copied";

  setTimeout(() => {
    shareButton.textContent = "Share Story";
  }, 1200);
}

saveStory();
localStorage.removeItem("currentGame");

shareButton.addEventListener("click", copyStoryLink);