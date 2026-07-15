DEMO_USERS = (
    {"name": "User 1", "email": "user1@example.com"},
    {"name": "User 2", "email": "user2@example.com"},
    {"name": "User 3", "email": "user3@example.com"},
)


def list_users():
    """Return public user records for API consumers."""
    return [dict(user) for user in DEMO_USERS]
