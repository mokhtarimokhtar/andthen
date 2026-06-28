const shareButton = document.getElementById("share-button");

function buildShareText() {
  return `Read our story on AndThen

${window.location.origin}/end/${GAME_PIN}`;
}

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

  // Supprime un éventuel doublon
  stories = stories.filter(story => story.pin !== GAME_PIN);

  // Ajoute en tête
  stories.unshift({
    pin: GAME_PIN,
    title: title || "Untitled story",
    date: new Date().toISOString()
  });

  // Conserve uniquement les 20 dernières histoires
  stories = stories.slice(0, 20);

  localStorage.setItem(
    "recentStories",
    JSON.stringify(stories)
  );
}

saveStory();

shareButton.addEventListener("click", async () => {

  const shareUrl = `${window.location.origin}/end/${GAME_PIN}`;

  if (navigator.share) {

    await navigator.share({
      title: "AndThen",
      text: "Read our story on AndThen",
      url: shareUrl,
    });

    return;

  }

  await navigator.clipboard.writeText(buildShareText());

  shareButton.textContent = "Copied!";

});