from flask import abort
from flask import jsonify
from flask import redirect
from flask import render_template
from flask import request
from flask import session
from flask import url_for

import game


def register_routes(app):

    @app.get("/")
    def home():
        return render_template("home.html")


    @app.post("/create")
    def create():
        nickname = request.form["nickname"]
        result = game.create_new_game(nickname)

        session["player_id"] = result["player_id"]

        return redirect(
            url_for(
                "waiting_room",
                pin=result["pin"]
            )
        )


    @app.get("/join")
    def join():
        return render_template("join.html")


    @app.post("/join")
    def join_post():
        pin = request.form["pin"]
        nickname = request.form["nickname"]

        result = game.join_game(pin, nickname)

        session["player_id"] = result["player_id"]

        return redirect(
            url_for(
                "waiting_room",
                pin=result["pin"]
            )
        )


    @app.get("/waiting/<pin>")
    def waiting_room(pin):
        player_id = session.get("player_id")

        if player_id is None:
            return redirect("/")

        room = game.get_waiting_room(pin)
        state = game.get_story_state(pin, player_id) if room["status"] == "playing" else None

        if state is not None and state["status"] == "playing":
            return redirect(
                url_for(
                    "story",
                    pin=pin
                )
            )

        is_host = False

        for player in room["players"]:
            if player["id"] == player_id:
                is_host = player["is_host"]

        return render_template(
            "waiting.html",
            room=room,
            is_host=is_host,
        )


    @app.get("/api/waiting/<pin>")
    def waiting_room_api(pin):
        waiting_room_data = game.get_waiting_room(pin)
        return jsonify(waiting_room_data)


    @app.post("/start/<pin>")
    def start(pin):
        player_id = session.get("player_id")

        if player_id is None:
            abort(403)

        game.start_game(pin, player_id)

        return "", 204


    @app.get("/story/<pin>")
    def story(pin):
        player_id = session.get("player_id")

        if player_id is None:
            return redirect("/")

        state = game.get_story_state(pin, player_id)

        return render_template(
            "story.html",
            state=state,
        )


    @app.get("/api/story/<pin>")
    def story_api(pin):
        player_id = session.get("player_id")

        if player_id is None:
            abort(403)

        state = game.get_story_state(pin, player_id)

        return jsonify(state)


    @app.post("/api/story/<pin>/sentence")
    def add_sentence(pin):
        player_id = session.get("player_id")

        if player_id is None:
            abort(403)

        content = request.form["content"]

        game.add_sentence(pin, player_id, content)

        return "", 204


    @app.post("/api/story/<pin>/typing")
    def typing(pin):
        player_id = session.get("player_id")

        if player_id is None:
            abort(403)

        game.mark_typing(pin, player_id)

        return "", 204
    

    @app.post("/api/story/<pin>/skip")
    def skip_turn(pin):
        player_id = session.get("player_id")

        if player_id is None:
            abort(403)

        game.skip_turn(pin, player_id)

        return "", 204
    

    @app.post("/api/story/<pin>/end")
    def end_story(pin):
        player_id = session.get("player_id")

        if player_id is None:
            abort(403)

        game.end_story(pin, player_id)

        return "", 204
    
    @app.get("/end/<pin>")
    def end(pin):
        final_story = game.get_final_story(pin)

        return render_template(
            "end.html",
            story=final_story,
        )
    