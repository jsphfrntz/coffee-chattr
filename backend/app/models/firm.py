from datetime import datetime, timezone

from ..extensions import db


class Firm(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    industry = db.Column(db.String(255), nullable=True)
    website = db.Column(db.String(500), nullable=True)
    careers_url = db.Column(db.String(500), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    jobs = db.relationship("Job", backref="firm", lazy="dynamic")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "industry": self.industry,
            "website": self.website,
            "careers_url": self.careers_url,
            "notes": self.notes,
        }
