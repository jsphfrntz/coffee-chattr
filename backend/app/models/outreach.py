from datetime import datetime, timezone

from ..extensions import db


class Outreach(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    alumni_id = db.Column(db.Integer, db.ForeignKey("alumni.id"), nullable=False)
    firm_id = db.Column(db.Integer, db.ForeignKey("firm.id"), nullable=False)
    career_goal_id = db.Column(
        db.Integer, db.ForeignKey("career_goal.id"), nullable=True
    )
    subject = db.Column(db.String(500), nullable=False)
    body = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(50), default="drafted")
    email_provider = db.Column(db.String(50), nullable=True)
    draft_id = db.Column(db.String(255), nullable=True)
    personalization_notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    sent_at = db.Column(db.DateTime, nullable=True)
    follow_up_at = db.Column(db.DateTime, nullable=True)

    VALID_STATUSES = ["drafted", "reviewed", "sent", "replied", "no_reply"]

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "alumni_id": self.alumni_id,
            "firm_id": self.firm_id,
            "career_goal_id": self.career_goal_id,
            "subject": self.subject,
            "body": self.body,
            "status": self.status,
            "email_provider": self.email_provider,
            "personalization_notes": self.personalization_notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "sent_at": self.sent_at.isoformat() if self.sent_at else None,
            "follow_up_at": (
                self.follow_up_at.isoformat() if self.follow_up_at else None
            ),
        }
