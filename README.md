# AndThen

AndThen is a collaborative storytelling game.

Players create a story together, one sentence at a time.

The goal isn't to win.

The goal is to create something together.

> Together, we made this.

---

## Tech Stack

- Python 3.13
- Flask
- SQLite
- HTML
- CSS
- Vanilla JavaScript

---

## Installation

Create a virtual environment.

```bash
python -m venv .venv
source .venv/bin/activate
```


## Initialize the database
```bash
flask init-db
```

## Reset the database.
```bash
flask reset-db
```

## Run locally
```bash
flask --app app run --debug
```
Application:
http://127.0.0.1:5000


## Project structure
app.py
database.py
game.py
models.py
routes.py

templates/
static/

instance/


## Architecture

Routes
    ↓
Game (business rules)
    ↓
Models (database)
    ↓
SQLite

- Business rules never access Flask directly.
- Routes never access SQLite directly.

## Current MVP
- Create story
- Join story
- Join while playing
- Waiting room
- Turn-based writing
- Typing indicator
- Skip turn
- End story
- Story sharing
- Recent stories (localStorage)

## Not in MVP
- Accounts
- AI
- Notifications
- Rankings
- Themes
- Ads
- PWA
