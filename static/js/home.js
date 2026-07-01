const storiesContainer = document.getElementById("recent-stories");
const resumeContainer = document.getElementById("resume-container");
const resumeButton = document.getElementById("resume-button");

function loadRecentStories() {

    const stories = JSON.parse(
        localStorage.getItem("recentStories") || "[]"
    );

    if (stories.length === 0) {
        return;
    }

    storiesContainer.hidden = false;

    const list = document.getElementById("stories-list");

    stories.forEach(story => {

        const link = document.createElement("a");

        link.href = `/end/${story.pin}`;
        link.textContent = story.title;

        const li = document.createElement("li");
        li.appendChild(link);

        list.appendChild(li);

    });

}

async function loadCurrentGame() {

    const pin = localStorage.getItem("currentGame");

    if (!pin) {
        return;
    }

    const response = await fetch(`/api/game/${pin}`);

    if (!response.ok) {
        localStorage.removeItem("currentGame");
        return;
    }

    const game = await response.json();

    if (game.status === "ended") {
        localStorage.removeItem("currentGame");
        return;
    }

    resumeContainer.hidden = false;

    if (game.status === "waiting") {
        resumeButton.href = `/waiting/${pin}`;
    } else {
        resumeButton.href = `/story/${pin}`;
    }

}

loadRecentStories();

document
    .getElementById("join-button")
    .addEventListener("click", () => {

        window.location = "/join";

    });

loadCurrentGame();