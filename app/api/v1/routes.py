from http import HTTPStatus

from flask import current_app, jsonify, request

from app.api.v1 import bp
from app.services.auth import parse_login_payload, validate_login_request
from app.services.users import list_users


@bp.get("/health")
def health_check():
    return jsonify(
        {
            "status": "ok",
            "service": "reference-api",
            "apiVersion": current_app.config["API_VERSION"],
        }
    )


@bp.get("/users")
def get_users():
    return jsonify({"users": list_users()})


@bp.post("/auth/login")
def login():
    login_request = parse_login_payload(request.get_json(silent=True))
    errors = validate_login_request(login_request)

    if errors:
        return (
            jsonify(
                {
                    "message": "Invalid login request.",
                    "errors": errors,
                }
            ),
            HTTPStatus.BAD_REQUEST,
        )

    return jsonify(
        {
            "message": "Login request received.",
            "user": {
                "username": login_request.username,
                "rememberMe": login_request.remember_me,
            },
        }
    )
