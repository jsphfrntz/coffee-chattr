from datetime import datetime, timezone

from ..extensions import db


class Alumni(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), nullable=True)
    linkedin_url = db.Column(db.String(500), nullable=True)
    graduation_year = db.Column(db.Integer, nullable=True)
    current_company = db.Column(db.String(255), nullable=True)
    current_title = db.Column(db.String(255), nullable=True)
    industry = db.Column(db.String(255), nullable=True)
    location = db.Column(db.String(255), nullable=True)
    last_enriched_at = db.Column(db.DateTime, nullable=True)
    created_by = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    firm_history = db.relationship("AlumniFirm", backref="alumni", lazy="dynamic")

    def to_dict(self):
        return {
            "id": self.id,
            "full_name": self.full_name,
            "email": self.email,
            "linkedin_url": self.linkedin_url,
            "graduation_year": self.graduation_year,
            "current_company": self.current_company,
            "current_title": self.current_title,
            "industry": self.industry,
            "location": self.location,
            "last_enriched_at": (
                self.last_enriched_at.isoformat() if self.last_enriched_at else None
            ),
        }


class AlumniFirm(db.Model):
    __tablename__ = "alumni_firm"
    id = db.Column(db.Integer, primary_key=True)
    alumni_id = db.Column(db.Integer, db.ForeignKey("alumni.id"), nullable=False)
    firm_id = db.Column(db.Integer, db.ForeignKey("firm.id"), nullable=False)
    title = db.Column(db.String(255), nullable=True)
    is_current = db.Column(db.Boolean, default=False)
    start_year = db.Column(db.Integer, nullable=True)
