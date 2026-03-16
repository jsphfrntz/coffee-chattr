from datetime import datetime, timezone

from ..extensions import db


class Job(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    career_goal_id = db.Column(
        db.Integer, db.ForeignKey("career_goal.id"), nullable=True
    )
    firm_id = db.Column(db.Integer, db.ForeignKey("firm.id"), nullable=True)
    title = db.Column(db.String(255), nullable=False)
    url = db.Column(db.String(500), nullable=True)
    description = db.Column(db.Text, nullable=True)
    location = db.Column(db.String(255), nullable=True)
    match_score = db.Column(db.Float, nullable=True)
    match_rationale = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(50), default="discovered")
    discovered_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    applied_at = db.Column(db.DateTime, nullable=True)

    resume_sends = db.relationship("ResumeSend", backref="job", lazy="dynamic")

    VALID_STATUSES = [
        "discovered",
        "saved",
        "applied",
        "interviewing",
        "rejected",
        "offer",
    ]

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "career_goal_id": self.career_goal_id,
            "firm_id": self.firm_id,
            "firm": self.firm.to_dict() if self.firm else None,
            "career_goal_label": (
                self.career_goal.label if self.career_goal else None
            ),
            "title": self.title,
            "url": self.url,
            "description": self.description,
            "location": self.location,
            "match_score": self.match_score,
            "match_rationale": self.match_rationale,
            "status": self.status,
            "discovered_at": (
                self.discovered_at.isoformat() if self.discovered_at else None
            ),
            "applied_at": self.applied_at.isoformat() if self.applied_at else None,
        }
