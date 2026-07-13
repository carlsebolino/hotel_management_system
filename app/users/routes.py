from flask import render_template

from app.users import bp


@bp.route("/users")
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

    return render_template(
        template_name_or_list="users-table.html",
        users=users,
    )
