import os

from flask import Flask

from app.extensions import db, migrate
from app.security.cors import init_cors
from app.security.headers import init_security_headers
from config import Config, config_by_name


def create_app(config_class=None):
    resolved_config = _resolve_config(config_class)
    validator = getattr(resolved_config, "validate", None)
    if validator:
        validator()

    app = Flask(__name__)
    app.config.from_object(resolved_config)

    db.init_app(app=app)
    migrate.init_app(app=app, db=db)
    init_security_headers(app)
    init_cors(app)
    register_blueprints(app)

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


from app import models
