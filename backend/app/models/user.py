from datetime import datetime, timezone

from flask_login import UserMixin
from werkzeug.security import check_password_hash, generate_password_hash

from ..extensions import db


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    full_name = db.Column(db.String(255), nullable=True)
    graduation_year = db.Column(db.Integer, nullable=True)
    password_hash = db.Column(db.String(256), nullable=False)
    gmail_token = db.Column(db.JSON, nullable=True)
    outlook_token = db.Column(db.JSON, nullable=True)
    linkedin_connected = db.Column(db.Boolean, default=False)
    onboarding_complete = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    career_goals = db.relationship("CareerGoal", backref="user", lazy="dynamic")
    jobs = db.relationship("Job", backref="user", lazy="dynamic")
    resumes = db.relationship(
        "Resume", backref="user", lazy="dynamic", foreign_keys="Resume.user_id"
    )
    outreach_messages = db.relationship("Outreach", backref="user", lazy="dynamic")
    events = db.relationship("Event", backref="user", lazy="dynamic")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "full_name": self.full_name,
            "graduation_year": self.graduation_year,
            "linkedin_connected": self.linkedin_connected,
            "onboarding_complete": self.onboarding_complete,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
