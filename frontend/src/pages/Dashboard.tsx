import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getDashboardStats, type DashboardStats } from "@/api/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Briefcase, Target, FileText, TrendingUp } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  discovered: "Discovered",
  saved: "Saved",
  applied: "Applied",
  interviewing: "Interviewing",
  rejected: "Rejected",
  offer: "Offer",
};

const STATUS_COLORS: Record<string, string> = {
  discovered: "bg-blue-100 text-blue-700",
  saved: "bg-slate-100 text-slate-700",
  applied: "bg-amber-100 text-amber-700",
  interviewing: "bg-purple-100 text-purple-700",
  rejected: "bg-red-100 text-red-700",
  offer: "bg-green-100 text-green-700",
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  const firstName = user?.full_name?.split(" ")[0] || user?.email;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here's your recruiting overview
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Total Jobs
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.jobs.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Active Goals
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.career_goals.active || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Resumes
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.resumes.total || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Applied
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.jobs.by_status?.applied || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline breakdown */}
      {stats && Object.keys(stats.jobs.by_status).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-base font-semibold">
              Pipeline Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(stats.jobs.by_status).map(([status, count]) => (
                <span
                  key={status}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[status] || "bg-gray-100 text-gray-700"}`}
                >
                  {STATUS_LABELS[status] || status}: {count}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent jobs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-base font-semibold">
                Recent Jobs
              </CardTitle>
              <CardDescription>Latest additions to your pipeline</CardDescription>
            </div>
            <Link
              to="/jobs"
              className="text-sm text-[hsl(var(--columbia-mid))] hover:underline"
            >
              View all
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {stats?.recent_jobs.length ? (
            <div className="space-y-3">
              {stats.recent_jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <div className="font-medium">{job.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {job.firm?.name || "No firm"}{" "}
                      {job.location && `· ${job.location}`}
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[job.status] || "bg-gray-100 text-gray-700"}`}
                  >
                    {STATUS_LABELS[job.status] || job.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No jobs yet.{" "}
              <Link to="/jobs" className="text-[hsl(var(--columbia-mid))] underline">
                Add your first job
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
