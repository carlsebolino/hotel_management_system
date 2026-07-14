from flask import Flask, request
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy

from config import Config

db = SQLAlchemy()
migrate = Migrate()


def _normalize_origins(origins):
    return [origin.strip() for origin in origins if origin.strip()]


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    app.config["CORS_ORIGINS"] = _normalize_origins(app.config["CORS_ORIGINS"])

    @app.after_request
    def add_cors_headers(response):
        if not request.path.startswith("/api/"):
            return response

        origin = request.headers.get("Origin")
        allowed_origins = app.config["CORS_ORIGINS"]
        if "*" in allowed_origins:
            response.headers["Access-Control-Allow-Origin"] = "*"
        elif origin in allowed_origins:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Vary"] = "Origin"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Methods"] = (
            "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        )
        return response

    db.init_app(app=app)
    migrate.init_app(app=app, db=db)

    from app.api import bp as api_bp

    app.register_blueprint(blueprint=api_bp)

    from app.errors import bp as errors_bp

    app.register_blueprint(blueprint=errors_bp)

    return app


from app import models
