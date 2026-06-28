const storiesContainer = document.getElementById("recent-stories");

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

loadRecentStories();

document
    .getElementById("join-button")
    .addEventListener("click", () => {

        window.location = "/join";

    });