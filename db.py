import os
import sqlite3
from pathlib import Path

import click
from flask import g

BASE_DIR = Path(__file__).resolve().parent
DATABASE = BASE_DIR / "andthen.db"
SCHEMA = BASE_DIR / "schema.sql"


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DATABASE)
        g.db.row_factory = sqlite3.Row
    return g.db


def close_db(error=None):
    db = g.pop("db", None)

    if db is not None:
        db.close()


def init_db():
    db = sqlite3.connect(DATABASE)

    with open(SCHEMA, "r", encoding="utf-8") as f:
        db.executescript(f.read())

    db.commit()
    db.close()


def reset_db():
    if DATABASE.exists():
        os.remove(DATABASE)

    init_db()

def ensure_db():
    db = sqlite3.connect(DATABASE)

    try:
        table = db.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='games'"
        ).fetchone()

        if table is None:
            with open(SCHEMA, "r", encoding="utf-8") as f:
                db.executescript(f.read())

            db.commit()

    finally:
        db.close()

@click.command("init-db")
def init_db_command():
    init_db()
    click.echo("Database initialized.")


@click.command("reset-db")
def reset_db_command():
    reset_db()
    click.echo("Database reset.")


def init_app(app):
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)
    app.cli.add_command(reset_db_command)
