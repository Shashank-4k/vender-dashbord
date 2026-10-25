import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)
backend_dir = os.path.join(root_dir, "backend")

for p in [backend_dir, root_dir, current_dir]:
    if os.path.exists(p) and p not in sys.path:
        sys.path.insert(0, p)

from app.main import app as fastapi_app

async def app(scope, receive, send):
    if scope["type"] == "http":
        headers = dict(scope.get("headers", []))
        matched_path = headers.get(b"x-matched-path", b"").decode("utf-8")
        current_path = scope.get("path", "")
        
        if matched_path and matched_path.startswith("/api"):
            scope["path"] = matched_path
        elif not current_path.startswith("/api") and not current_path.startswith("/docs") and not current_path.startswith("/openapi") and current_path != "/":
            scope["path"] = "/api" + current_path

    await fastapi_app(scope, receive, send)
