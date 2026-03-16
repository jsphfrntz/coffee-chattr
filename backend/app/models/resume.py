from datetime import datetime, timezone

from ..extensions import db


class Resume(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    label = db.Column(db.String(255), nullable=False)
    file_url = db.Column(db.String(500), nullable=False)
    file_type = db.Column(db.String(10), nullable=False)
    parent_resume_id = db.Column(
        db.Integer, db.ForeignKey("resume.id"), nullable=True
    )
    version = db.Column(db.Integer, default=1)
    is_base = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    children = db.relationship(
        "Resume", backref=db.backref("parent", remote_side="Resume.id"), lazy="dynamic"
    )
    sends = db.relationship("ResumeSend", backref="resume", lazy="dynamic")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "label": self.label,
            "file_url": self.file_url,
            "file_type": self.file_type,
            "parent_resume_id": self.parent_resume_id,
            "version": self.version,
            "is_base": self.is_base,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class ResumeSend(db.Model):
    __tablename__ = "resume_send"
    id = db.Column(db.Integer, primary_key=True)
    resume_id = db.Column(db.Integer, db.ForeignKey("resume.id"), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey("job.id"), nullable=True)
    firm_id = db.Column(db.Integer, db.ForeignKey("firm.id"), nullable=False)
    sent_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    sent_via = db.Column(db.String(50), nullable=True)
    notes = db.Column(db.Text, nullable=True)
