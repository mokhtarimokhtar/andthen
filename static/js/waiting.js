localStorage.setItem("currentGame", GAME_PIN);
const playersList = document.getElementById("players-list");

async function refreshWaitingRoom() {

    const response = await fetch(`/api/waiting/${GAME_PIN}`);

    const room = await response.json();

    if (room.status === "playing") {

        window.location = `/story/${GAME_PIN}`;
        return;

    }

    playersList.replaceChildren();

    room.players.forEach(player => {

        const li = document.createElement("li");

        li.textContent = player.nickname;

        if (player.is_host) {

            const host = document.createElement("strong");
            host.textContent = " (Host)";
            li.appendChild(host);

        }

        playersList.appendChild(li);

    });

}

if (IS_HOST) {

    document
        .getElementById("start-button")
        .addEventListener("click", async () => {

            await fetch(`/start/${GAME_PIN}`, {
                method: "POST"
            });

        });

}

setInterval(refreshWaitingRoom, 2000);