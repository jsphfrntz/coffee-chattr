import os

from flask import Flask

from .config import config
from .extensions import db, login_manager, migrate


def create_app():
    app = Flask(__name__, static_folder="static", static_url_path="/")

    env = os.getenv("FLASK_ENV", "development")
    app.config.from_object(config[env])

    # Ensure upload directory exists
    os.makedirs(app.config.get("UPLOAD_FOLDER", "uploads"), exist_ok=True)

    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)

    from .routes import api_bp
    from .routes.main import main_bp

    app.register_blueprint(api_bp)
    app.register_blueprint(main_bp)

    return app
