from http import HTTPStatus

from flask import jsonify, request

from app.api import bp


@bp.get("/health")
def health_check():
    return jsonify({"status": "ok", "service": "hotel-management-api"})


@bp.get("/users")
def get_users():
    users = [
        {
            "name": "User 1",
            "email": "user1@example.com",
        },
        {
            "name": "User 2",
            "email": "user2@example.com",
        },
        {
            "name": "User 3",
            "email": "user3@example.com",
        },
    ]

    return jsonify({"users": users})


@bp.post("/auth/login")
def login():
    credentials = request.get_json(silent=True) or {}
    username = credentials.get("username", "")
    remember_me = bool(credentials.get("rememberMe", False))

    if not username or not credentials.get("password"):
        return (
            jsonify({"message": "Username and password are required."}),
            HTTPStatus.BAD_REQUEST,
        )

    return jsonify(
        {
            "message": "Login request received.",
            "user": {
                "username": username,
                "rememberMe": remember_me,
            },
        }
    )
