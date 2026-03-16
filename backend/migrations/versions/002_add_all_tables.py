"""add all coffeechattr tables

Revision ID: 002
Revises: 001
Create Date: 2026-03-16 00:00:00.000000

"""

from alembic import op
import sqlalchemy as sa

revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def upgrade():
    # Extend user table
    with op.batch_alter_table("user") as batch_op:
        batch_op.add_column(sa.Column("full_name", sa.String(255), nullable=True))
        batch_op.add_column(sa.Column("graduation_year", sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column("gmail_token", sa.JSON(), nullable=True))
        batch_op.add_column(sa.Column("outlook_token", sa.JSON(), nullable=True))
        batch_op.add_column(
            sa.Column("linkedin_connected", sa.Boolean(), server_default="false")
        )
        batch_op.add_column(
            sa.Column("onboarding_complete", sa.Boolean(), server_default="false")
        )

    # Firms
    op.create_table(
        "firm",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("industry", sa.String(255), nullable=True),
        sa.Column("website", sa.String(500), nullable=True),
        sa.Column("careers_url", sa.String(500), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )

    # Alumni
    op.create_table(
        "alumni",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("linkedin_url", sa.String(500), nullable=True),
        sa.Column("graduation_year", sa.Integer(), nullable=True),
        sa.Column("current_company", sa.String(255), nullable=True),
        sa.Column("current_title", sa.String(255), nullable=True),
        sa.Column("industry", sa.String(255), nullable=True),
        sa.Column("location", sa.String(255), nullable=True),
        sa.Column("last_enriched_at", sa.DateTime(), nullable=True),
        sa.Column("created_by", sa.Integer(), sa.ForeignKey("user.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )

    # Alumni-Firm join table
    op.create_table(
        "alumni_firm",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column(
            "alumni_id", sa.Integer(), sa.ForeignKey("alumni.id"), nullable=False
        ),
        sa.Column("firm_id", sa.Integer(), sa.ForeignKey("firm.id"), nullable=False),
        sa.Column("title", sa.String(255), nullable=True),
        sa.Column("is_current", sa.Boolean(), nullable=True),
        sa.Column("start_year", sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )

    # Career goals
    op.create_table(
        "career_goal",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("user.id"), nullable=False),
        sa.Column("label", sa.String(255), nullable=False),
        sa.Column("target_industries", sa.JSON(), nullable=True),
        sa.Column("target_roles", sa.JSON(), nullable=True),
        sa.Column("target_locations", sa.JSON(), nullable=True),
        sa.Column("target_firm_size", sa.String(100), nullable=True),
        sa.Column("narrative", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )

    # Jobs
    op.create_table(
        "job",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("user.id"), nullable=False),
        sa.Column(
            "career_goal_id",
            sa.Integer(),
            sa.ForeignKey("career_goal.id"),
            nullable=True,
        ),
        sa.Column("firm_id", sa.Integer(), sa.ForeignKey("firm.id"), nullable=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("url", sa.String(500), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("location", sa.String(255), nullable=True),
        sa.Column("match_score", sa.Float(), nullable=True),
        sa.Column("match_rationale", sa.Text(), nullable=True),
        sa.Column("status", sa.String(50), nullable=True),
        sa.Column("discovered_at", sa.DateTime(), nullable=True),
        sa.Column("applied_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )

    # Resumes
    op.create_table(
        "resume",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("user.id"), nullable=False),
        sa.Column("label", sa.String(255), nullable=False),
        sa.Column("file_url", sa.String(500), nullable=False),
        sa.Column("file_type", sa.String(10), nullable=False),
        sa.Column(
            "parent_resume_id",
            sa.Integer(),
            sa.ForeignKey("resume.id"),
            nullable=True,
        ),
        sa.Column("version", sa.Integer(), nullable=True),
        sa.Column("is_base", sa.Boolean(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )

    # Resume sends
    op.create_table(
        "resume_send",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column(
            "resume_id", sa.Integer(), sa.ForeignKey("resume.id"), nullable=False
        ),
        sa.Column("job_id", sa.Integer(), sa.ForeignKey("job.id"), nullable=True),
        sa.Column("firm_id", sa.Integer(), sa.ForeignKey("firm.id"), nullable=False),
        sa.Column("sent_at", sa.DateTime(), nullable=True),
        sa.Column("sent_via", sa.String(50), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )

    # Outreach
    op.create_table(
        "outreach",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("user.id"), nullable=False),
        sa.Column(
            "alumni_id", sa.Integer(), sa.ForeignKey("alumni.id"), nullable=False
        ),
        sa.Column("firm_id", sa.Integer(), sa.ForeignKey("firm.id"), nullable=False),
        sa.Column(
            "career_goal_id",
            sa.Integer(),
            sa.ForeignKey("career_goal.id"),
            nullable=True,
        ),
        sa.Column("subject", sa.String(500), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("status", sa.String(50), nullable=True),
        sa.Column("email_provider", sa.String(50), nullable=True),
        sa.Column("draft_id", sa.String(255), nullable=True),
        sa.Column("personalization_notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("sent_at", sa.DateTime(), nullable=True),
        sa.Column("follow_up_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )

    # Events
    op.create_table(
        "event",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("user.id"), nullable=False),
        sa.Column("firm_id", sa.Integer(), sa.ForeignKey("firm.id"), nullable=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("event_type", sa.String(50), nullable=False),
        sa.Column("date", sa.DateTime(), nullable=False),
        sa.Column("location", sa.String(255), nullable=True),
        sa.Column("alumni_ids", sa.JSON(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )

    # Event briefings
    op.create_table(
        "event_briefing",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column(
            "event_id", sa.Integer(), sa.ForeignKey("event.id"), nullable=False
        ),
        sa.Column("briefing_content", sa.Text(), nullable=False),
        sa.Column("talking_points", sa.JSON(), nullable=True),
        sa.Column(
            "relevant_career_goal_id",
            sa.Integer(),
            sa.ForeignKey("career_goal.id"),
            nullable=True,
        ),
        sa.Column("alumni_bios", sa.JSON(), nullable=True),
        sa.Column("generated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )

    # LinkedIn connections
    op.create_table(
        "linkedin_connection",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("user.id"), nullable=False),
        sa.Column(
            "alumni_id", sa.Integer(), sa.ForeignKey("alumni.id"), nullable=True
        ),
        sa.Column("linkedin_name", sa.String(255), nullable=False),
        sa.Column("linkedin_url", sa.String(500), nullable=True),
        sa.Column("current_company", sa.String(255), nullable=True),
        sa.Column("current_title", sa.String(255), nullable=True),
        sa.Column("connection_degree", sa.Integer(), nullable=True),
        sa.Column("synced_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade():
    op.drop_table("linkedin_connection")
    op.drop_table("event_briefing")
    op.drop_table("event")
    op.drop_table("outreach")
    op.drop_table("resume_send")
    op.drop_table("resume")
    op.drop_table("job")
    op.drop_table("career_goal")
    op.drop_table("alumni_firm")
    op.drop_table("alumni")
    op.drop_table("firm")

    with op.batch_alter_table("user") as batch_op:
        batch_op.drop_column("onboarding_complete")
        batch_op.drop_column("linkedin_connected")
        batch_op.drop_column("outlook_token")
        batch_op.drop_column("gmail_token")
        batch_op.drop_column("graduation_year")
        batch_op.drop_column("full_name")
