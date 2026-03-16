from flask_login import current_user, login_required
from flask_restx import Namespace, Resource

from ..models.career_goal import CareerGoal
from ..models.job import Job
from ..models.resume import Resume

ns = Namespace("dashboard", description="Dashboard stats")


@ns.route("/stats")
class DashboardStats(Resource):
    @login_required
    def get(self):
        """Get dashboard statistics for the current user."""
        user_id = current_user.id

        # Job stats
        total_jobs = Job.query.filter_by(user_id=user_id).count()
        jobs_by_status = {}
        for status in Job.VALID_STATUSES:
            count = Job.query.filter_by(user_id=user_id, status=status).count()
            if count > 0:
                jobs_by_status[status] = count

        # Career goals
        active_goals = CareerGoal.query.filter_by(
            user_id=user_id, is_active=True
        ).count()

        # Resumes
        total_resumes = Resume.query.filter_by(user_id=user_id).count()

        # Recent jobs
        recent_jobs = (
            Job.query.filter_by(user_id=user_id)
            .order_by(Job.discovered_at.desc())
            .limit(5)
            .all()
        )

        return {
            "jobs": {
                "total": total_jobs,
                "by_status": jobs_by_status,
            },
            "career_goals": {
                "active": active_goals,
            },
            "resumes": {
                "total": total_resumes,
            },
            "recent_jobs": [j.to_dict() for j in recent_jobs],
        }, 200
