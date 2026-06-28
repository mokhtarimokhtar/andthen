from db import get_db


def create_game(pin):
    db = get_db()
    cursor = db.execute(
        """
        INSERT INTO games (pin, status)
        VALUES (?, 'waiting')
        """,
        (pin,),
    )
    db.commit()
    return cursor.lastrowid


def get_game_by_pin(pin):
    db = get_db()
    return db.execute(
        """
        SELECT *
        FROM games
        WHERE pin = ?
        """,
        (pin,),
    ).fetchone()


def create_player(game_id, nickname, join_order, is_host=False):
    db = get_db()
    cursor = db.execute(
        """
        INSERT INTO players (game_id, nickname, join_order, is_host)
        VALUES (?, ?, ?, ?)
        """,
        (game_id, nickname, join_order, 1 if is_host else 0),
    )
    db.commit()
    return cursor.lastrowid


def get_player(player_id):
    db = get_db()
    return db.execute(
        """
        SELECT *
        FROM players
        WHERE id = ?
        """,
        (player_id,),
    ).fetchone()


def count_players(game_id):
    db = get_db()
    row = db.execute(
        """
        SELECT COUNT(*) AS count
        FROM players
        WHERE game_id = ?
        """,
        (game_id,),
    ).fetchone()
    return row["count"]


def list_players(game_id):
    db = get_db()
    return db.execute(
        """
        SELECT *
        FROM players
        WHERE game_id = ?
        ORDER BY join_order ASC
        """,
        (game_id,),
    ).fetchall()


def start_game(game_id):
    db = get_db()
    db.execute(
        """
        UPDATE games
        SET status = 'playing'
        WHERE id = ?
        """,
        (game_id,),
    )
    db.commit()


def list_sentences(game_id):
    db = get_db()
    return db.execute(
        """
        SELECT sentences.*, players.nickname
        FROM sentences
        JOIN players ON players.id = sentences.player_id
        WHERE sentences.game_id = ?
        ORDER BY sentences.turn_number ASC
        """,
        (game_id,),
    ).fetchall()


def count_sentences(game_id):
    db = get_db()
    row = db.execute(
        """
        SELECT COUNT(*) AS count
        FROM sentences
        WHERE game_id = ?
        """,
        (game_id,),
    ).fetchone()
    return row["count"]


def create_sentence(game_id, player_id, turn_number, content, type="sentence"):
    db = get_db()
    cursor = db.execute(
        """
        INSERT INTO sentences (game_id, player_id, turn_number, content, type)
        VALUES (?, ?, ?, ?, ?)
        """,
        (game_id, player_id, turn_number, content, type),
    )
    db.commit()
    return cursor.lastrowid


def end_game(game_id):
    db = get_db()
    db.execute(
        """
        UPDATE games
        SET status = 'ended',
            ended_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """,
        (game_id,),
    )
    db.commit()
