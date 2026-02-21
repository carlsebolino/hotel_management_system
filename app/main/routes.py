from flask import render_template

from app.main import bp


@bp.route("/")
@bp.route("/home")
def index():
    return render_template("index.html", title="Home")
