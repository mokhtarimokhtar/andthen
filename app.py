from flask import Flask

from config import SECRET_KEY
from db import init_app as init_db_app
from routes import register_routes


def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = SECRET_KEY

    init_db_app(app)
    register_routes(app)

    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=True)