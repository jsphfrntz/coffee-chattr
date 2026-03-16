from flask_login import current_user, login_required
from flask_restx import Namespace, Resource

from ..extensions import db
from ..models.career_goal import CareerGoal

ns = Namespace("career-goals", description="Career goals management")


@ns.route("/")
class CareerGoalList(Resource):
    @login_required
    def get(self):
        """List all career goals for the current user."""
        goals = CareerGoal.query.filter_by(user_id=current_user.id).order_by(
            CareerGoal.created_at.desc()
        ).all()
        return [g.to_dict() for g in goals], 200

    @login_required
    def post(self):
        """Create a new career goal."""
        data = ns.payload
        label = data.get("label")

        if not label:
            return {"error": "Label is required"}, 400

        goal = CareerGoal(
            user_id=current_user.id,
            label=label,
            target_industries=data.get("target_industries", []),
            target_roles=data.get("target_roles", []),
            target_locations=data.get("target_locations", []),
            target_firm_size=data.get("target_firm_size"),
            narrative=data.get("narrative"),
            is_active=data.get("is_active", True),
        )
        db.session.add(goal)
        db.session.commit()
        return goal.to_dict(), 201


@ns.route("/<int:goal_id>")
class CareerGoalDetail(Resource):
    @login_required
    def get(self, goal_id):
        """Get a specific career goal."""
        goal = CareerGoal.query.filter_by(
            id=goal_id, user_id=current_user.id
        ).first_or_404()
        return goal.to_dict(), 200

    @login_required
    def put(self, goal_id):
        """Update a career goal."""
        goal = CareerGoal.query.filter_by(
            id=goal_id, user_id=current_user.id
        ).first_or_404()

        data = ns.payload
        if "label" in data:
            goal.label = data["label"]
        if "target_industries" in data:
            goal.target_industries = data["target_industries"]
        if "target_roles" in data:
            goal.target_roles = data["target_roles"]
        if "target_locations" in data:
            goal.target_locations = data["target_locations"]
        if "target_firm_size" in data:
            goal.target_firm_size = data["target_firm_size"]
        if "narrative" in data:
            goal.narrative = data["narrative"]
        if "is_active" in data:
            goal.is_active = data["is_active"]

        db.session.commit()
        return goal.to_dict(), 200

    @login_required
    def delete(self, goal_id):
        """Delete a career goal."""
        goal = CareerGoal.query.filter_by(
            id=goal_id, user_id=current_user.id
        ).first_or_404()
        db.session.delete(goal)
        db.session.commit()
        return {"message": "Career goal deleted"}, 200
