import unittest

from app import create_app


class ApiTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app("testing")
        self.client = self.app.test_client()

    def test_health_check_returns_service_status(self):
        response = self.client.get("/api/v1/health")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.get_json(),
            {"apiVersion": "v1", "service": "hotel-management-api", "status": "ok"},
        )

    def test_users_returns_json_collection(self):
        response = self.client.get("/api/v1/users")
        payload = response.get_json()

        self.assertEqual(response.status_code, 200)
        self.assertIn("users", payload)
        self.assertEqual(len(payload["users"]), 3)

    def test_login_validates_required_credentials(self):
        response = self.client.post("/api/v1/auth/login", json={"username": "demo"})

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.get_json()["errors"], {"password": "Password is required."}
        )

    def test_login_accepts_valid_credentials(self):
        response = self.client.post(
            "/api/v1/auth/login",
            json={"username": "demo", "password": "secret", "rememberMe": True},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["user"]["username"], "demo")
        self.assertTrue(response.get_json()["user"]["rememberMe"])

    def test_cors_headers_are_limited_to_configured_origins(self):
        response = self.client.get(
            "/api/v1/health", headers={"Origin": "http://localhost:5173"}
        )

        self.assertEqual(
            response.headers.get("Access-Control-Allow-Origin"),
            "http://localhost:5173",
        )
        self.assertEqual(response.headers.get("Vary"), "Origin")

    def test_legacy_api_prefix_remains_available(self):
        response = self.client.get("/api/health")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["apiVersion"], "v1")

    def test_security_headers_are_applied(self):
        response = self.client.get("/api/v1/health")

        self.assertEqual(response.headers.get("X-Content-Type-Options"), "nosniff")
        self.assertEqual(response.headers.get("X-Frame-Options"), "DENY")

    def test_not_found_errors_are_json(self):
        response = self.client.get("/api/v1/missing")
        payload = response.get_json()

        self.assertEqual(response.status_code, 404)
        self.assertEqual(payload["status"], 404)
        self.assertIn("message", payload)


if __name__ == "__main__":
    unittest.main()
