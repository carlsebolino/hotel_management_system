from http import HTTPStatus

from flask import current_app, jsonify
from werkzeug.exceptions import HTTPException

from app import db
from app.errors import bp


@bp.app_errorhandler(HTTPException)
def http_error(error):
    return (
        jsonify(
            {
                "error": error.name,
                "message": error.description,
                "status": error.code,
            }
        ),
        error.code,
    )


@bp.app_errorhandler(Exception)
def internal_error(error):
    current_app.logger.exception("Unhandled application error", exc_info=error)
    db.session.rollback()
    return (
        jsonify(
            {
                "error": HTTPStatus.INTERNAL_SERVER_ERROR.phrase,
                "message": "The server encountered an unexpected error.",
                "status": HTTPStatus.INTERNAL_SERVER_ERROR.value,
            }
        ),
        HTTPStatus.INTERNAL_SERVER_ERROR.value,
    )
