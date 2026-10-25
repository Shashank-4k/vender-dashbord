import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)
backend_dir = os.path.join(root_dir, "backend")
cwd = os.getcwd()
cwd_backend = os.path.join(cwd, "backend")

for p in [backend_dir, cwd_backend, root_dir, cwd]:
    if os.path.exists(p) and p not in sys.path:
        sys.path.insert(0, p)

from app.main import app
