from flask_login import current_user, login_required, login_user, logout_user
from flask_restx import Namespace, Resource, fields

from ..extensions import db
from ..models.user import User

ns = Namespace("auth", description="Authentication")

credentials_model = ns.model(
    "Credentials",
    {
        "email": fields.String(required=True, description="User email"),
        "password": fields.String(required=True, description="User password"),
    },
)

register_model = ns.model(
    "Register",
    {
        "email": fields.String(required=True),
        "password": fields.String(required=True),
        "full_name": fields.String(required=False),
        "graduation_year": fields.Integer(required=False),
    },
)

user_model = ns.model(
    "User",
    {
        "id": fields.Integer(),
        "email": fields.String(),
        "full_name": fields.String(),
        "graduation_year": fields.Integer(),
        "onboarding_complete": fields.Boolean(),
        "created_at": fields.DateTime(),
    },
)

error_model = ns.model(
    "Error", {"error": fields.String(description="Error message")}
)

message_model = ns.model(
    "Message", {"message": fields.String(description="Status message")}
)


@ns.route("/register")
class Register(Resource):
    @ns.expect(register_model)
    @ns.response(201, "User created", user_model)
    @ns.response(400, "Validation error", error_model)
    @ns.response(409, "Email already registered", error_model)
    def post(self):
        """Register a new user."""
        data = ns.payload
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return {"error": "Email and password are required"}, 400

        if User.query.filter_by(email=email).first():
            return {"error": "Email already registered"}, 409

        user = User(
            email=email,
            full_name=data.get("full_name"),
            graduation_year=data.get("graduation_year"),
        )
        user.set_password(password)

        if user.full_name and user.graduation_year:
            user.onboarding_complete = True

        db.session.add(user)
        db.session.commit()
        login_user(user)

        return user.to_dict(), 201


@ns.route("/login")
class Login(Resource):
    @ns.expect(credentials_model)
    @ns.response(200, "Login successful", user_model)
    @ns.response(401, "Invalid credentials", error_model)
    def post(self):
        """Log in with email and password."""
        data = ns.payload
        email = data.get("email")
        password = data.get("password")

        user = User.query.filter_by(email=email).first()

        if user is None or not user.check_password(password):
            return {"error": "Invalid email or password"}, 401

        login_user(user)
        return user.to_dict(), 200


@ns.route("/logout")
class Logout(Resource):
    @login_required
    @ns.response(200, "Logged out", message_model)
    @ns.response(401, "Not authenticated", error_model)
    def post(self):
        """Log out the current user."""
        logout_user()
        return {"message": "Logged out"}, 200


@ns.route("/me")
class Me(Resource):
    @login_required
    @ns.response(200, "Current user", user_model)
    @ns.response(401, "Not authenticated", error_model)
    def get(self):
        """Get the current authenticated user."""
        return current_user.to_dict(), 200


@ns.route("/onboarding")
class Onboarding(Resource):
    @login_required
    def put(self):
        """Complete user onboarding with profile details."""
        data = ns.payload
        full_name = data.get("full_name")
        graduation_year = data.get("graduation_year")

        if not full_name or not graduation_year:
            return {"error": "Full name and graduation year are required"}, 400

        current_user.full_name = full_name
        current_user.graduation_year = graduation_year
        current_user.onboarding_complete = True
        db.session.commit()

        return current_user.to_dict(), 200
