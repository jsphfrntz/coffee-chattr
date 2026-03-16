from flask import Blueprint
from flask_restx import Api

api_bp = Blueprint("api", __name__, url_prefix="/api")

api = Api(
    api_bp,
    version="1.0",
    title="CoffeeChattr API",
    description="AI-native agentic CRM for CBS students",
    doc="/docs",
)

from .auth import ns as auth_ns  # noqa: E402
from .career_goals import ns as career_goals_ns  # noqa: E402
from .dashboard import ns as dashboard_ns  # noqa: E402
from .firms import ns as firms_ns  # noqa: E402
from .jobs import ns as jobs_ns  # noqa: E402
from .resumes import ns as resumes_ns  # noqa: E402
from .chat import ns as chat_ns  # noqa: E402
from .alumni import ns as alumni_ns  # noqa: E402

api.add_namespace(auth_ns)
api.add_namespace(career_goals_ns)
api.add_namespace(jobs_ns)
api.add_namespace(resumes_ns)
api.add_namespace(firms_ns)
api.add_namespace(dashboard_ns)
api.add_namespace(chat_ns)
api.add_namespace(alumni_ns)
