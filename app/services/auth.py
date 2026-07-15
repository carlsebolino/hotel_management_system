from dataclasses import dataclass


@dataclass(frozen=True)
class LoginRequest:
    username: str
    password: str
    remember_me: bool = False


def parse_login_payload(payload):
    payload = payload or {}
    return LoginRequest(
        username=str(payload.get("username", "")).strip(),
        password=str(payload.get("password", "")),
        remember_me=bool(payload.get("rememberMe", False)),
    )


def validate_login_request(login_request):
    errors = {}
    if not login_request.username:
        errors["username"] = "Username is required."
    if not login_request.password:
        errors["password"] = "Password is required."
    return errors
