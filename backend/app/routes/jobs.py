from datetime import datetime, timezone

from flask import request as flask_request
from flask_login import current_user, login_required
from flask_restx import Namespace, Resource

from ..extensions import db
from ..models.firm import Firm
from ..models.job import Job

ns = Namespace("jobs", description="Job pipeline management")


@ns.route("/")
class JobList(Resource):
    @login_required
    def get(self):
        """List all jobs for the current user."""
        query = Job.query.filter_by(user_id=current_user.id)

        status = flask_request.args.get("status")
        if status:
            query = query.filter_by(status=status)

        career_goal_id = flask_request.args.get("career_goal_id")
        if career_goal_id:
            query = query.filter_by(career_goal_id=int(career_goal_id))

        jobs = query.order_by(Job.discovered_at.desc()).all()
        return [j.to_dict() for j in jobs], 200

    @login_required
    def post(self):
        """Add a job to the pipeline."""
        data = ns.payload
        title = data.get("title")

        if not title:
            return {"error": "Job title is required"}, 400

        # Handle firm: create or find by name
        firm_id = data.get("firm_id")
        firm_name = data.get("firm_name")
        if not firm_id and firm_name:
            firm = Firm.query.filter_by(name=firm_name).first()
            if not firm:
                firm = Firm(name=firm_name, industry=data.get("firm_industry"))
                db.session.add(firm)
                db.session.flush()
            firm_id = firm.id

        job = Job(
            user_id=current_user.id,
            career_goal_id=data.get("career_goal_id"),
            firm_id=firm_id,
            title=title,
            url=data.get("url"),
            description=data.get("description"),
            location=data.get("location"),
            status=data.get("status", "saved"),
        )
        db.session.add(job)
        db.session.commit()
        return job.to_dict(), 201


@ns.route("/<int:job_id>")
class JobDetail(Resource):
    @login_required
    def get(self, job_id):
        """Get a specific job."""
        job = Job.query.filter_by(
            id=job_id, user_id=current_user.id
        ).first_or_404()
        return job.to_dict(), 200

    @login_required
    def put(self, job_id):
        """Update a job."""
        job = Job.query.filter_by(
            id=job_id, user_id=current_user.id
        ).first_or_404()

        data = ns.payload
        if "title" in data:
            job.title = data["title"]
        if "url" in data:
            job.url = data["url"]
        if "description" in data:
            job.description = data["description"]
        if "location" in data:
            job.location = data["location"]
        if "career_goal_id" in data:
            job.career_goal_id = data["career_goal_id"]
        if "status" in data:
            new_status = data["status"]
            if new_status not in Job.VALID_STATUSES:
                return {"error": f"Invalid status. Must be one of: {Job.VALID_STATUSES}"}, 400
            job.status = new_status
            if new_status == "applied" and not job.applied_at:
                job.applied_at = datetime.now(timezone.utc)

        db.session.commit()
        return job.to_dict(), 200

    @login_required
    def delete(self, job_id):
        """Delete a job from the pipeline."""
        job = Job.query.filter_by(
            id=job_id, user_id=current_user.id
        ).first_or_404()
        db.session.delete(job)
        db.session.commit()
        return {"message": "Job deleted"}, 200
