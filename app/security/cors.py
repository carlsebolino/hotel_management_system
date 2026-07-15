from flask import request


def init_cors(app):
    @app.after_request
    def add_cors_headers(response):
        if not request.path.startswith("/api/"):
            return response

        origin = request.headers.get("Origin")
        allowed_origins = app.config["CORS_ORIGINS"]
        if "*" in allowed_origins:
            response.headers["Access-Control-Allow-Origin"] = "*"
        elif origin in allowed_origins:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers.add("Vary", "Origin")

        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Methods"] = (
            "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        )
        response.headers["Access-Control-Max-Age"] = str(
            app.config.get("CORS_MAX_AGE", 600)
        )
        return response
