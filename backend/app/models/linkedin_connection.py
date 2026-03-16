from datetime import datetime, timezone

from ..extensions import db


class LinkedInConnection(db.Model):
    __tablename__ = "linkedin_connection"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    alumni_id = db.Column(db.Integer, db.ForeignKey("alumni.id"), nullable=True)
    linkedin_name = db.Column(db.String(255), nullable=False)
    linkedin_url = db.Column(db.String(500), nullable=True)
    current_company = db.Column(db.String(255), nullable=True)
    current_title = db.Column(db.String(255), nullable=True)
    connection_degree = db.Column(db.Integer, nullable=True)
    synced_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "alumni_id": self.alumni_id,
            "linkedin_name": self.linkedin_name,
            "linkedin_url": self.linkedin_url,
            "current_company": self.current_company,
            "current_title": self.current_title,
            "connection_degree": self.connection_degree,
            "synced_at": self.synced_at.isoformat() if self.synced_at else None,
        }
