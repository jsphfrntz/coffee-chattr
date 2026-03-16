from datetime import datetime, timezone

from ..extensions import db


class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    firm_id = db.Column(db.Integer, db.ForeignKey("firm.id"), nullable=True)
    title = db.Column(db.String(255), nullable=False)
    event_type = db.Column(db.String(50), nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(255), nullable=True)
    alumni_ids = db.Column(db.JSON, default=list)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    briefings = db.relationship("EventBriefing", backref="event", lazy="dynamic")

    VALID_TYPES = ["coffee_chat", "info_session", "interview", "networking"]

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "firm_id": self.firm_id,
            "title": self.title,
            "event_type": self.event_type,
            "date": self.date.isoformat() if self.date else None,
            "location": self.location,
            "alumni_ids": self.alumni_ids or [],
            "notes": self.notes,
        }


class EventBriefing(db.Model):
    __tablename__ = "event_briefing"
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey("event.id"), nullable=False)
    briefing_content = db.Column(db.Text, nullable=False)
    talking_points = db.Column(db.JSON, default=list)
    relevant_career_goal_id = db.Column(
        db.Integer, db.ForeignKey("career_goal.id"), nullable=True
    )
    alumni_bios = db.Column(db.JSON, default=dict)
    generated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
