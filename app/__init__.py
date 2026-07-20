import os
from pathlib import Path

from flask import Flask, abort, send_from_directory

from app.extensions import db, migrate
from app.security.cors import init_cors
from app.security.headers import init_security_headers
from config import Config, config_by_name


def create_app(config_class=None):
    resolved_config = _resolve_config(config_class)
    validator = getattr(resolved_config, "validate", None)
    if validator:
        validator()

    # Vite's build output is packaged beside ``app`` for App Service. Disable
    # Flask's package-local static route so the same directory can serve both
    # hashed assets and SPA routes from the deployment root.
    app = Flask(__name__, static_folder=None)
    app.config.from_object(resolved_config)

    db.init_app(app=app)
    migrate.init_app(app=app, db=db)
    init_security_headers(app)
    init_cors(app)
    register_blueprints(app)
    register_frontend_routes(app)

    return app


def _resolve_config(config_class):
    if config_class is None:
        return config_by_name.get(os.environ.get("FLASK_ENV", "development"), Config)
    if isinstance(config_class, str):
        return config_by_name[config_class]
    return config_class


def register_blueprints(app):
    from app.api.v1 import bp as api_v1_bp
    from app.errors import bp as errors_bp

    app.register_blueprint(api_v1_bp)
    app.register_blueprint(api_v1_bp, name="api_legacy", url_prefix="/api")
    app.register_blueprint(errors_bp)


def register_frontend_routes(app):
    """Serve the compiled Vite application without intercepting API failures."""
    frontend_dist = Path(app.config["FRONTEND_DIST_DIR"])

    @app.get("/")
    @app.get("/<path:path>")
    def frontend(path=""):
        # Unknown API URLs must retain the API's JSON 404 response rather than
        # returning the client application's HTML fallback.
        if path == "api" or path.startswith("api/"):
            abort(404)

        requested_file = frontend_dist / path
        if path and requested_file.is_file():
            return send_from_directory(frontend_dist, path)

        index_file = frontend_dist / "index.html"
        if index_file.is_file():
            return send_from_directory(frontend_dist, "index.html")

        abort(404)


from app import models as models
