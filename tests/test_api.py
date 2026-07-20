import unittest
from pathlib import Path
from tempfile import TemporaryDirectory

from app import create_app
from config import TestingConfig


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


class FrontendServingTestCase(unittest.TestCase):
    def setUp(self):
        self.temp_dir = TemporaryDirectory()
        frontend_dist = Path(self.temp_dir.name)
        (frontend_dist / "assets").mkdir()
        (frontend_dist / "index.html").write_text('<div id="root">Hotel UI</div>')
        (frontend_dist / "assets" / "app.js").write_text("console.log('hotel')")

        class FrontendTestingConfig(TestingConfig):
            FRONTEND_DIST_DIR = str(frontend_dist)

        self.app = create_app(FrontendTestingConfig)
        self.client = self.app.test_client()

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_serves_frontend_index_at_root(self):
        response = self.client.get("/")

        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Hotel UI", response.data)
        response.close()

    def test_serves_compiled_frontend_assets(self):
        response = self.client.get("/assets/app.js")

        self.assertEqual(response.status_code, 200)
        self.assertIn(b"console.log", response.data)
        response.close()

    def test_frontend_routes_fall_back_to_index(self):
        response = self.client.get("/reservations/123")

        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Hotel UI", response.data)
        response.close()

    def test_unknown_api_routes_remain_json_not_found_responses(self):
        response = self.client.get("/api/v1/missing")

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.get_json()["status"], 404)


if __name__ == "__main__":
    unittest.main()
