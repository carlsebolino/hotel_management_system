import unittest

from app import create_app


class ApiTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()

    def test_health_check_returns_service_status(self):
        response = self.client.get("/api/health")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.get_json(),
            {"service": "hotel-management-api", "status": "ok"},
        )

    def test_users_returns_json_collection(self):
        response = self.client.get("/api/users")
        payload = response.get_json()

        self.assertEqual(response.status_code, 200)
        self.assertIn("users", payload)
        self.assertEqual(len(payload["users"]), 3)

    def test_login_validates_required_credentials(self):
        response = self.client.post("/api/auth/login", json={"username": "demo"})

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.get_json(), {"message": "Username and password are required."}
        )

    def test_login_accepts_valid_credentials(self):
        response = self.client.post(
            "/api/auth/login",
            json={"username": "demo", "password": "secret", "rememberMe": True},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["user"]["username"], "demo")
        self.assertTrue(response.get_json()["user"]["rememberMe"])

    def test_cors_headers_are_limited_to_configured_origins(self):
        response = self.client.get(
            "/api/health", headers={"Origin": "http://localhost:5173"}
        )

        self.assertEqual(
            response.headers.get("Access-Control-Allow-Origin"),
            "http://localhost:5173",
        )
        self.assertEqual(response.headers.get("Vary"), "Origin")

    def test_not_found_errors_are_json(self):
        response = self.client.get("/api/missing")
        payload = response.get_json()

        self.assertEqual(response.status_code, 404)
        self.assertEqual(payload["status"], 404)
        self.assertIn("message", payload)


if __name__ == "__main__":
    unittest.main()
