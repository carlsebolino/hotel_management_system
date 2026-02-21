from http import HTTPMethod

from flask import flash, redirect, render_template, url_for

from app.auth import bp
from app.forms import LoginForm


@bp.route("/login", methods=[HTTPMethod.GET, HTTPMethod.POST])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        flash(
            f"Login requested for user={form.username.data}, remember_me={form.remember_me.data}"
        )
        return redirect(url_for("main.index"))
    return render_template(
        template_name_or_list="login.html",
        title="Sign in",
        form=form,
    )
