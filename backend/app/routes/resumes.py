import os
import uuid

from flask import current_app, request, send_from_directory
from flask_login import current_user, login_required
from flask_restx import Namespace, Resource

from ..extensions import db
from ..models.resume import Resume, ResumeSend

ns = Namespace("resumes", description="Resume management")

ALLOWED_EXTENSIONS = {"pdf", "docx"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@ns.route("/")
class ResumeList(Resource):
    @login_required
    def get(self):
        """List all resumes for the current user."""
        resumes = (
            Resume.query.filter_by(user_id=current_user.id)
            .order_by(Resume.created_at.desc())
            .all()
        )
        return [r.to_dict() for r in resumes], 200

    @login_required
    def post(self):
        """Upload a new resume."""
        if "file" not in request.files:
            return {"error": "No file provided"}, 400

        file = request.files["file"]
        if not file.filename or not allowed_file(file.filename):
            return {"error": "Invalid file type. Only PDF and DOCX are allowed."}, 400

        label = request.form.get("label", file.filename)
        is_base = request.form.get("is_base", "false").lower() == "true"
        parent_resume_id = request.form.get("parent_resume_id")

        # Compute version
        version = 1
        if parent_resume_id:
            latest = (
                Resume.query.filter_by(
                    user_id=current_user.id, parent_resume_id=int(parent_resume_id)
                )
                .order_by(Resume.version.desc())
                .first()
            )
            version = (latest.version + 1) if latest else 2

        # If marking as base, unmark other bases
        if is_base:
            Resume.query.filter_by(user_id=current_user.id, is_base=True).update(
                {"is_base": False}
            )

        # Save file
        ext = file.filename.rsplit(".", 1)[1].lower()
        filename = f"{uuid.uuid4().hex}.{ext}"
        upload_dir = current_app.config["UPLOAD_FOLDER"]
        os.makedirs(upload_dir, exist_ok=True)
        file.save(os.path.join(upload_dir, filename))

        resume = Resume(
            user_id=current_user.id,
            label=label,
            file_url=filename,
            file_type=ext,
            parent_resume_id=int(parent_resume_id) if parent_resume_id else None,
            version=version,
            is_base=is_base,
        )
        db.session.add(resume)
        db.session.commit()
        return resume.to_dict(), 201


@ns.route("/<int:resume_id>")
class ResumeDetail(Resource):
    @login_required
    def get(self, resume_id):
        """Get a specific resume."""
        resume = Resume.query.filter_by(
            id=resume_id, user_id=current_user.id
        ).first_or_404()
        return resume.to_dict(), 200

    @login_required
    def put(self, resume_id):
        """Update resume metadata."""
        resume = Resume.query.filter_by(
            id=resume_id, user_id=current_user.id
        ).first_or_404()

        data = request.get_json()
        if "label" in data:
            resume.label = data["label"]
        if "is_base" in data and data["is_base"]:
            Resume.query.filter_by(user_id=current_user.id, is_base=True).update(
                {"is_base": False}
            )
            resume.is_base = True

        db.session.commit()
        return resume.to_dict(), 200

    @login_required
    def delete(self, resume_id):
        """Delete a resume."""
        resume = Resume.query.filter_by(
            id=resume_id, user_id=current_user.id
        ).first_or_404()

        # Delete file
        filepath = os.path.join(current_app.config["UPLOAD_FOLDER"], resume.file_url)
        if os.path.exists(filepath):
            os.remove(filepath)

        db.session.delete(resume)
        db.session.commit()
        return {"message": "Resume deleted"}, 200


@ns.route("/<int:resume_id>/download")
class ResumeDownload(Resource):
    @login_required
    def get(self, resume_id):
        """Download a resume file."""
        resume = Resume.query.filter_by(
            id=resume_id, user_id=current_user.id
        ).first_or_404()
        upload_dir = current_app.config["UPLOAD_FOLDER"]
        return send_from_directory(
            upload_dir, resume.file_url, as_attachment=True,
            download_name=f"{resume.label}.{resume.file_type}"
        )


@ns.route("/<int:resume_id>/sends")
class ResumeSendList(Resource):
    @login_required
    def get(self, resume_id):
        """List send history for a resume."""
        Resume.query.filter_by(
            id=resume_id, user_id=current_user.id
        ).first_or_404()

        sends = ResumeSend.query.filter_by(resume_id=resume_id).order_by(
            ResumeSend.sent_at.desc()
        ).all()
        return [
            {
                "id": s.id,
                "resume_id": s.resume_id,
                "job_id": s.job_id,
                "firm_id": s.firm_id,
                "sent_at": s.sent_at.isoformat() if s.sent_at else None,
                "sent_via": s.sent_via,
                "notes": s.notes,
            }
            for s in sends
        ], 200

    @login_required
    def post(self, resume_id):
        """Record a resume send."""
        Resume.query.filter_by(
            id=resume_id, user_id=current_user.id
        ).first_or_404()

        data = request.get_json()
        if not data.get("firm_id"):
            return {"error": "firm_id is required"}, 400

        send = ResumeSend(
            resume_id=resume_id,
            job_id=data.get("job_id"),
            firm_id=data["firm_id"],
            sent_via=data.get("sent_via"),
            notes=data.get("notes"),
        )
        db.session.add(send)
        db.session.commit()
        return {
            "id": send.id,
            "resume_id": send.resume_id,
            "firm_id": send.firm_id,
            "sent_at": send.sent_at.isoformat(),
        }, 201
