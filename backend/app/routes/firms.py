from flask_login import login_required
from flask_restx import Namespace, Resource

from ..extensions import db
from ..models.firm import Firm

ns = Namespace("firms", description="Firm management")


@ns.route("/")
class FirmList(Resource):
    @login_required
    def get(self):
        """List all firms."""
        firms = Firm.query.order_by(Firm.name).all()
        return [f.to_dict() for f in firms], 200

    @login_required
    def post(self):
        """Create a new firm."""
        data = ns.payload
        name = data.get("name")
        if not name:
            return {"error": "Firm name is required"}, 400

        existing = Firm.query.filter_by(name=name).first()
        if existing:
            return existing.to_dict(), 200

        firm = Firm(
            name=name,
            industry=data.get("industry"),
            website=data.get("website"),
            careers_url=data.get("careers_url"),
            notes=data.get("notes"),
        )
        db.session.add(firm)
        db.session.commit()
        return firm.to_dict(), 201


@ns.route("/<int:firm_id>")
class FirmDetail(Resource):
    @login_required
    def get(self, firm_id):
        """Get a specific firm."""
        firm = Firm.query.get_or_404(firm_id)
        return firm.to_dict(), 200

    @login_required
    def put(self, firm_id):
        """Update a firm."""
        firm = Firm.query.get_or_404(firm_id)
        data = ns.payload
        if "name" in data:
            firm.name = data["name"]
        if "industry" in data:
            firm.industry = data["industry"]
        if "website" in data:
            firm.website = data["website"]
        if "careers_url" in data:
            firm.careers_url = data["careers_url"]
        if "notes" in data:
            firm.notes = data["notes"]
        db.session.commit()
        return firm.to_dict(), 200
