import random
import time

import models


typing_players = {}


def generate_pin():
    return str(random.randint(1000, 9999))


def generate_unique_pin():
    for _ in range(20):
        pin = generate_pin()
        existing_game = models.get_game_by_pin(pin)

        if existing_game is None:
            return pin

    raise RuntimeError("Could not generate a unique PIN")


def clean_nickname(nickname):
    nickname = nickname.strip()

    if not nickname:
        raise ValueError("Nickname is required")

    if len(nickname) > 20:
        raise ValueError("Nickname is too long")

    return nickname


def clean_pin(pin):
    pin = pin.strip()

    if not pin:
        raise ValueError("PIN is required")

    return pin


def clean_sentence(content):
    content = content.strip()

    if not content:
        raise ValueError("Sentence is required")

    return content


def serialize_player(player):
    return {
        "id": player["id"],
        "nickname": player["nickname"],
        "is_host": bool(player["is_host"]),
        "join_order": player["join_order"],
    }


def serialize_sentence(sentence):
    return {
        "id": sentence["id"],
        "player_id": sentence["player_id"],
        "nickname": sentence["nickname"],
        "turn_number": sentence["turn_number"],
        "type": sentence["type"],
        "content": sentence["content"],
    }


def get_current_player(players, sentence_count):
    if not players:
        return None

    index = sentence_count % len(players)
    return players[index]


def load_game(pin):
    current_game = models.get_game_by_pin(pin)

    if current_game is None:
        raise ValueError("Game not found")

    return current_game


def load_player_for_game(game_id, player_id):
    player = models.get_player(player_id)

    if player is None:
        raise ValueError("Player not found")

    if player["game_id"] != game_id:
        raise ValueError("Wrong game")

    return player


def set_player_typing(player_id):
    typing_players[player_id] = time.time()


def is_player_typing(player_id):
    last_typing_at = typing_players.get(player_id)

    if last_typing_at is None:
        return False

    return time.time() - last_typing_at < 3


def create_new_game(nickname):
    nickname = clean_nickname(nickname)

    pin = generate_unique_pin()
    game_id = models.create_game(pin)

    player_id = models.create_player(
        game_id=game_id,
        nickname=nickname,
        join_order=1,
        is_host=True,
    )

    return {
        "pin": pin,
        "player_id": player_id,
    }


def join_game(pin, nickname):
    pin = clean_pin(pin)
    nickname = clean_nickname(nickname)

    current_game = models.get_game_by_pin(pin)

    if current_game is None:
        raise ValueError("Game not found")

    if current_game["status"] == "ended":
        raise ValueError("Game already ended")

    join_order = models.count_players(current_game["id"]) + 1

    player_id = models.create_player(
        game_id=current_game["id"],
        nickname=nickname,
        join_order=join_order,
        is_host=False,
    )

    return {
        "pin": pin,
        "player_id": player_id,
    }


def get_waiting_room(pin):
    current_game = models.get_game_by_pin(pin)

    if current_game is None:
        raise ValueError("Game not found")

    players = [
        serialize_player(player)
        for player in models.list_players(current_game["id"])
    ]

    return {
        "pin": current_game["pin"],
        "status": current_game["status"],
        "players": players,
    }


def start_game(pin, player_id):
    
    current_game = load_game(pin)

    if current_game is None:
        raise ValueError("Game not found")

    
    player = load_player_for_game(current_game["id"], player_id)

    if player is None:
        raise ValueError("Player not found")

    if player["game_id"] != current_game["id"]:
        raise ValueError("Wrong game")

    if not player["is_host"]:
        raise ValueError("Only host can start")

    models.start_game(current_game["id"])


def get_story_state(pin, player_id):
    
    current_game = load_game(pin)

    if current_game is None:
        raise ValueError("Game not found")

    
    player = load_player_for_game(current_game["id"], player_id)

    if player is None:
        raise ValueError("Player not found")

    if player["game_id"] != current_game["id"]:
        raise ValueError("Wrong game")

    players = [
        serialize_player(player_row)
        for player_row in models.list_players(current_game["id"])
    ]

    sentences = [
        serialize_sentence(sentence)
        for sentence in models.list_sentences(current_game["id"])
    ]

    current_player = get_current_player(
        players=players,
        sentence_count=len(sentences),
    )

    is_my_turn = current_player is not None and current_player["id"] == player_id

    return {
        "pin": current_game["pin"],
        "status": current_game["status"],
        "me": serialize_player(player),
        "players": players,
        "sentences": sentences,
        "turn": {
            "player_id": current_player["id"] if current_player else None,
            "nickname": current_player["nickname"] if current_player else None,
            "is_my_turn": is_my_turn,
            "is_typing": (
                current_player is not None
                and not is_my_turn
                and is_player_typing(current_player["id"])
            ),
        },
    }


def add_sentence(pin, player_id, content):
    content = clean_sentence(content)

    
    current_game = load_game(pin)

    if current_game is None:
        raise ValueError("Game not found")

    if current_game["status"] != "playing":
        raise ValueError("Game is not playing")

    
    player = load_player_for_game(current_game["id"], player_id)

    if player is None:
        raise ValueError("Player not found")

    if player["game_id"] != current_game["id"]:
        raise ValueError("Wrong game")

    players = [
        serialize_player(player_row)
        for player_row in models.list_players(current_game["id"])
    ]

    sentence_count = models.count_sentences(current_game["id"])
    current_player = get_current_player(players, sentence_count)

    if current_player["id"] != player_id:
        raise ValueError("Not your turn")

    turn_number = sentence_count + 1

    models.create_sentence(
        game_id=current_game["id"],
        player_id=player_id,
        turn_number=turn_number,
        content=content,
    )


def mark_typing(pin, player_id):
    
    current_game = load_game(pin)

    if current_game is None:
        raise ValueError("Game not found")

    
    player = load_player_for_game(current_game["id"], player_id)

    if player is None:
        raise ValueError("Player not found")

    if player["game_id"] != current_game["id"]:
        raise ValueError("Wrong game")

    set_player_typing(player_id)


def skip_turn(pin, player_id):
    
    current_game = load_game(pin)

    if current_game is None:
        raise ValueError("Game not found")

    if current_game["status"] != "playing":
        raise ValueError("Game is not playing")

    # host = models.get_player(player_id)
    host = load_player_for_game(current_game["id"], player_id)

    if host is None:
        raise ValueError("Player not found")

    if host["game_id"] != current_game["id"]:
        raise ValueError("Wrong game")

    if not host["is_host"]:
        raise ValueError("Only host can skip")

    players = [
        serialize_player(player_row)
        for player_row in models.list_players(current_game["id"])
    ]

    sentence_count = models.count_sentences(current_game["id"])
    current_player = get_current_player(players, sentence_count)

    turn_number = sentence_count + 1

    models.create_sentence(
        game_id=current_game["id"],
        player_id=current_player["id"],
        turn_number=turn_number,
        content="",
        type="skip",
    )


def end_story(pin, player_id):
    
    current_game = load_game(pin)

    if current_game is None:
        raise ValueError("Game not found")

    if current_game["status"] != "playing":
        raise ValueError("Game is not playing")

    
    player = load_player_for_game(current_game["id"], player_id)

    if player is None:
        raise ValueError("Player not found")

    if player["game_id"] != current_game["id"]:
        raise ValueError("Wrong game")

    if not player["is_host"]:
        raise ValueError("Only host can end story")

    models.end_game(current_game["id"])


def get_final_story(pin):
    current_game = load_game(pin)

    if current_game["status"] != "ended":
        raise ValueError("Game not ended")

    sentences = [
        serialize_sentence(sentence)
        for sentence in models.list_sentences(current_game["id"])
        if sentence["type"] == "sentence"
    ]

    return {
        "pin": current_game["pin"],
        "sentences": sentences,
        "text": " ".join(sentence["content"] for sentence in sentences),
    }
