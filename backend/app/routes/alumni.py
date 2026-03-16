from flask import request as flask_request
from flask_login import current_user, login_required
from flask_restx import Namespace, Resource

from ..extensions import db
from ..models.alumni import Alumni
from ..models.firm import Firm
from ..models.career_goal import CareerGoal

ns = Namespace("alumni", description="Alumni database")


@ns.route("/")
class AlumniList(Resource):
    @login_required
    def get(self):
        """Search and list alumni."""
        query = Alumni.query
        q = flask_request.args.get("q")
        company = flask_request.args.get("company")
        industry = flask_request.args.get("industry")
        location = flask_request.args.get("location")
        page = flask_request.args.get("page", 1, type=int)
        per_page = flask_request.args.get("per_page", 25, type=int)

        if q:
            query = query.filter(
                db.or_(
                    Alumni.full_name.ilike(f"%{q}%"),
                    Alumni.current_company.ilike(f"%{q}%"),
                    Alumni.current_title.ilike(f"%{q}%"),
                )
            )
        if company:
            query = query.filter(Alumni.current_company.ilike(f"%{company}%"))
        if industry:
            query = query.filter(Alumni.industry.ilike(f"%{industry}%"))
        if location:
            query = query.filter(Alumni.location.ilike(f"%{location}%"))

        paginated = query.order_by(Alumni.full_name).paginate(
            page=page, per_page=per_page, error_out=False
        )

        return {
            "alumni": [a.to_dict() for a in paginated.items],
            "total": paginated.total,
            "page": paginated.page,
            "pages": paginated.pages,
        }, 200


@ns.route("/<int:alumni_id>")
class AlumniDetail(Resource):
    @login_required
    def get(self, alumni_id):
        """Get a specific alumni profile."""
        alumni = Alumni.query.get_or_404(alumni_id)
        return alumni.to_dict(), 200


@ns.route("/firm-coverage")
class FirmCoverage(Resource):
    @login_required
    def get(self):
        """Get firm coverage analysis based on the user's target firms/industries.

        Shows how many CBS alumni are at each relevant firm.
        """
        # Get user's active career goals to determine target firms
        goals = CareerGoal.query.filter_by(
            user_id=current_user.id, is_active=True
        ).all()

        target_industries = set()
        for g in goals:
            for ind in (g.target_industries or []):
                target_industries.add(ind.lower())

        # Get firms that have alumni, ranked by alumni count
        results = (
            db.session.query(
                Alumni.current_company,
                db.func.count(Alumni.id).label("alumni_count"),
            )
            .filter(Alumni.current_company.isnot(None))
            .group_by(Alumni.current_company)
            .order_by(db.text("alumni_count DESC"))
            .limit(50)
            .all()
        )

        coverage = []
        for company, count in results:
            coverage.append({
                "firm_name": company,
                "alumni_count": count,
            })

        return {
            "coverage": coverage,
            "target_industries": list(target_industries),
        }, 200
