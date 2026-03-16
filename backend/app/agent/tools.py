"""Agent tool definitions and execution layer.

Each tool is a function the Claude agent can call to interact with the
CoffeeChattr database on behalf of the authenticated user.
"""

from datetime import datetime, timezone

from ..extensions import db
from ..models.alumni import Alumni
from ..models.career_goal import CareerGoal
from ..models.firm import Firm
from ..models.job import Job
from ..models.resume import Resume

# ── Tool schemas (Anthropic format) ──────────────────────────────────

TOOL_DEFINITIONS = [
    {
        "name": "get_career_goals",
        "description": "List the user's career goals. Returns all goals with their target industries, roles, locations, and narrative.",
        "input_schema": {
            "type": "object",
            "properties": {
                "active_only": {
                    "type": "boolean",
                    "description": "If true, only return active goals. Default true.",
                },
            },
            "required": [],
        },
    },
    {
        "name": "create_career_goal",
        "description": "Create a new career goal for the user. Use this when a user describes a career track they're pursuing.",
        "input_schema": {
            "type": "object",
            "properties": {
                "label": {
                    "type": "string",
                    "description": "Short label, e.g. 'IB — TMT', 'MBB Consulting'",
                },
                "target_industries": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Target industries",
                },
                "target_roles": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Target role titles",
                },
                "target_locations": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Target locations",
                },
                "target_firm_size": {
                    "type": "string",
                    "description": "e.g. 'bulge bracket', 'boutique', 'Big 4'",
                },
                "narrative": {
                    "type": "string",
                    "description": "The user's career story/narrative for this track",
                },
            },
            "required": ["label"],
        },
    },
    {
        "name": "update_career_goal",
        "description": "Update an existing career goal.",
        "input_schema": {
            "type": "object",
            "properties": {
                "goal_id": {"type": "integer", "description": "The career goal ID to update"},
                "label": {"type": "string"},
                "target_industries": {"type": "array", "items": {"type": "string"}},
                "target_roles": {"type": "array", "items": {"type": "string"}},
                "target_locations": {"type": "array", "items": {"type": "string"}},
                "target_firm_size": {"type": "string"},
                "narrative": {"type": "string"},
                "is_active": {"type": "boolean"},
            },
            "required": ["goal_id"],
        },
    },
    {
        "name": "get_jobs",
        "description": "List jobs in the user's pipeline. Can filter by status or career goal.",
        "input_schema": {
            "type": "object",
            "properties": {
                "status": {
                    "type": "string",
                    "enum": ["discovered", "saved", "applied", "interviewing", "rejected", "offer"],
                    "description": "Filter by status",
                },
                "career_goal_id": {
                    "type": "integer",
                    "description": "Filter by career goal ID",
                },
            },
            "required": [],
        },
    },
    {
        "name": "add_job",
        "description": "Add a job to the user's pipeline. Automatically creates the firm if it doesn't exist.",
        "input_schema": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "description": "Job title"},
                "firm_name": {"type": "string", "description": "Company/firm name"},
                "location": {"type": "string", "description": "Job location"},
                "url": {"type": "string", "description": "Job posting URL"},
                "description": {"type": "string", "description": "Job description or notes"},
                "career_goal_id": {"type": "integer", "description": "Associated career goal ID"},
                "status": {
                    "type": "string",
                    "enum": ["discovered", "saved", "applied", "interviewing", "rejected", "offer"],
                    "description": "Initial status. Default: 'saved'",
                },
            },
            "required": ["title"],
        },
    },
    {
        "name": "update_job_status",
        "description": "Update the status of a job in the pipeline.",
        "input_schema": {
            "type": "object",
            "properties": {
                "job_id": {"type": "integer", "description": "The job ID"},
                "status": {
                    "type": "string",
                    "enum": ["discovered", "saved", "applied", "interviewing", "rejected", "offer"],
                },
            },
            "required": ["job_id", "status"],
        },
    },
    {
        "name": "get_resumes",
        "description": "List the user's uploaded resumes with version info.",
        "input_schema": {
            "type": "object",
            "properties": {},
            "required": [],
        },
    },
    {
        "name": "get_firms",
        "description": "List or search firms in the database.",
        "input_schema": {
            "type": "object",
            "properties": {
                "search": {
                    "type": "string",
                    "description": "Search firms by name (partial match)",
                },
            },
            "required": [],
        },
    },
    {
        "name": "add_firm",
        "description": "Add a new firm to the database.",
        "input_schema": {
            "type": "object",
            "properties": {
                "name": {"type": "string"},
                "industry": {"type": "string"},
                "website": {"type": "string"},
                "careers_url": {"type": "string"},
                "notes": {"type": "string"},
            },
            "required": ["name"],
        },
    },
    {
        "name": "search_alumni",
        "description": "Search the CBS alumni database by name, company, title, or location. Returns matching alumni profiles with LinkedIn URLs and contact info.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Search by name, company, or title",
                },
                "company": {
                    "type": "string",
                    "description": "Filter by company name",
                },
                "location": {
                    "type": "string",
                    "description": "Filter by location",
                },
            },
            "required": [],
        },
    },
    {
        "name": "get_alumni_at_firm",
        "description": "Get all CBS alumni currently at a specific firm. Useful for networking and warm intros.",
        "input_schema": {
            "type": "object",
            "properties": {
                "firm_name": {
                    "type": "string",
                    "description": "The firm/company name to look up",
                },
            },
            "required": ["firm_name"],
        },
    },
    {
        "name": "get_dashboard_stats",
        "description": "Get the user's recruiting dashboard statistics: job counts by status, active goals, resume count.",
        "input_schema": {
            "type": "object",
            "properties": {},
            "required": [],
        },
    },
]


# ── Tool execution ───────────────────────────────────────────────────

def execute_tool(tool_name: str, tool_input: dict, user_id: int) -> str:
    """Execute a tool call and return the result as a string."""
    try:
        fn = _TOOL_HANDLERS.get(tool_name)
        if not fn:
            return f"Error: Unknown tool '{tool_name}'"
        result = fn(tool_input, user_id)
        return str(result)
    except Exception as e:
        return f"Error executing {tool_name}: {e}"


def _get_career_goals(params: dict, user_id: int):
    query = CareerGoal.query.filter_by(user_id=user_id)
    if params.get("active_only", True):
        query = query.filter_by(is_active=True)
    goals = query.order_by(CareerGoal.created_at.desc()).all()
    if not goals:
        return "No career goals found. The user hasn't set up any career goals yet."
    return [g.to_dict() for g in goals]


def _create_career_goal(params: dict, user_id: int):
    goal = CareerGoal(
        user_id=user_id,
        label=params["label"],
        target_industries=params.get("target_industries", []),
        target_roles=params.get("target_roles", []),
        target_locations=params.get("target_locations", []),
        target_firm_size=params.get("target_firm_size"),
        narrative=params.get("narrative"),
        is_active=True,
    )
    db.session.add(goal)
    db.session.commit()
    return {"created": goal.to_dict()}


def _update_career_goal(params: dict, user_id: int):
    goal = CareerGoal.query.filter_by(
        id=params["goal_id"], user_id=user_id
    ).first()
    if not goal:
        return "Error: Career goal not found."

    for field in ["label", "target_industries", "target_roles", "target_locations",
                  "target_firm_size", "narrative", "is_active"]:
        if field in params:
            setattr(goal, field, params[field])
    db.session.commit()
    return {"updated": goal.to_dict()}


def _get_jobs(params: dict, user_id: int):
    query = Job.query.filter_by(user_id=user_id)
    if params.get("status"):
        query = query.filter_by(status=params["status"])
    if params.get("career_goal_id"):
        query = query.filter_by(career_goal_id=params["career_goal_id"])
    jobs = query.order_by(Job.discovered_at.desc()).all()
    if not jobs:
        return "No jobs found matching the filters."
    return [j.to_dict() for j in jobs]


def _add_job(params: dict, user_id: int):
    firm_id = None
    if params.get("firm_name"):
        firm = Firm.query.filter_by(name=params["firm_name"]).first()
        if not firm:
            firm = Firm(name=params["firm_name"])
            db.session.add(firm)
            db.session.flush()
        firm_id = firm.id

    job = Job(
        user_id=user_id,
        title=params["title"],
        firm_id=firm_id,
        location=params.get("location"),
        url=params.get("url"),
        description=params.get("description"),
        career_goal_id=params.get("career_goal_id"),
        status=params.get("status", "saved"),
    )
    db.session.add(job)
    db.session.commit()
    return {"added": job.to_dict()}


def _update_job_status(params: dict, user_id: int):
    job = Job.query.filter_by(id=params["job_id"], user_id=user_id).first()
    if not job:
        return "Error: Job not found."
    job.status = params["status"]
    if params["status"] == "applied" and not job.applied_at:
        job.applied_at = datetime.now(timezone.utc)
    db.session.commit()
    return {"updated": job.to_dict()}


def _get_resumes(params: dict, user_id: int):
    resumes = Resume.query.filter_by(user_id=user_id).order_by(
        Resume.created_at.desc()
    ).all()
    if not resumes:
        return "No resumes uploaded yet."
    return [r.to_dict() for r in resumes]


def _get_firms(params: dict, user_id: int):
    query = Firm.query
    search = params.get("search")
    if search:
        query = query.filter(Firm.name.ilike(f"%{search}%"))
    firms = query.order_by(Firm.name).limit(25).all()
    if not firms:
        return "No firms found."
    return [f.to_dict() for f in firms]


def _add_firm(params: dict, user_id: int):
    existing = Firm.query.filter_by(name=params["name"]).first()
    if existing:
        return {"already_exists": existing.to_dict()}
    firm = Firm(
        name=params["name"],
        industry=params.get("industry"),
        website=params.get("website"),
        careers_url=params.get("careers_url"),
        notes=params.get("notes"),
    )
    db.session.add(firm)
    db.session.commit()
    return {"created": firm.to_dict()}


def _get_dashboard_stats(params: dict, user_id: int):
    total_jobs = Job.query.filter_by(user_id=user_id).count()
    by_status = {}
    for s in Job.VALID_STATUSES:
        c = Job.query.filter_by(user_id=user_id, status=s).count()
        if c:
            by_status[s] = c
    active_goals = CareerGoal.query.filter_by(user_id=user_id, is_active=True).count()
    total_resumes = Resume.query.filter_by(user_id=user_id).count()
    return {
        "total_jobs": total_jobs,
        "jobs_by_status": by_status,
        "active_career_goals": active_goals,
        "total_resumes": total_resumes,
    }


def _search_alumni(params: dict, user_id: int):
    query = Alumni.query
    q = params.get("query")
    if q:
        query = query.filter(
            db.or_(
                Alumni.full_name.ilike(f"%{q}%"),
                Alumni.current_company.ilike(f"%{q}%"),
                Alumni.current_title.ilike(f"%{q}%"),
            )
        )
    if params.get("company"):
        query = query.filter(Alumni.current_company.ilike(f"%{params['company']}%"))
    if params.get("location"):
        query = query.filter(Alumni.location.ilike(f"%{params['location']}%"))
    results = query.order_by(Alumni.full_name).limit(20).all()
    if not results:
        return "No alumni found matching that search."
    return [a.to_dict() for a in results]


def _get_alumni_at_firm(params: dict, user_id: int):
    firm_name = params["firm_name"]
    results = (
        Alumni.query
        .filter(Alumni.current_company.ilike(f"%{firm_name}%"))
        .order_by(Alumni.full_name)
        .limit(30)
        .all()
    )
    if not results:
        return f"No CBS alumni found at {firm_name}."
    return {
        "firm": firm_name,
        "count": len(results),
        "alumni": [a.to_dict() for a in results],
    }


_TOOL_HANDLERS = {
    "get_career_goals": _get_career_goals,
    "create_career_goal": _create_career_goal,
    "update_career_goal": _update_career_goal,
    "get_jobs": _get_jobs,
    "add_job": _add_job,
    "update_job_status": _update_job_status,
    "get_resumes": _get_resumes,
    "get_firms": _get_firms,
    "add_firm": _add_firm,
    "search_alumni": _search_alumni,
    "get_alumni_at_firm": _get_alumni_at_firm,
    "get_dashboard_stats": _get_dashboard_stats,
}
