from datetime import datetime, timezone

from ..extensions import db


class CareerGoal(db.Model):
    __tablename__ = "career_goal"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    label = db.Column(db.String(255), nullable=False)
    target_industries = db.Column(db.JSON, default=list)
    target_roles = db.Column(db.JSON, default=list)
    target_locations = db.Column(db.JSON, default=list)
    target_firm_size = db.Column(db.String(100), nullable=True)
    narrative = db.Column(db.Text, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    jobs = db.relationship("Job", backref="career_goal", lazy="dynamic")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "label": self.label,
            "target_industries": self.target_industries or [],
            "target_roles": self.target_roles or [],
            "target_locations": self.target_locations or [],
            "target_firm_size": self.target_firm_size,
            "narrative": self.narrative,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
