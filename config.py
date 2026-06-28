import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_PATH = os.path.join(BASE_DIR, "andthen.db")

SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key")