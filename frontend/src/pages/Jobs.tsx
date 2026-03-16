import { useEffect, useState, type FormEvent } from "react";
import {
  getJobs,
  createJob,
  updateJob,
  deleteJob,
  getCareerGoals,
  type Job,
  type CareerGoal,
} from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Trash2,
  ExternalLink,
  ChevronDown,
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: "discovered", label: "Discovered", color: "bg-blue-100 text-blue-700" },
  { value: "saved", label: "Saved", color: "bg-slate-100 text-slate-700" },
  { value: "applied", label: "Applied", color: "bg-amber-100 text-amber-700" },
  { value: "interviewing", label: "Interviewing", color: "bg-purple-100 text-purple-700" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-700" },
  { value: "offer", label: "Offer", color: "bg-green-100 text-green-700" },
];

const statusColor = (status: string) =>
  STATUS_OPTIONS.find((s) => s.value === status)?.color || "bg-gray-100 text-gray-700";

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [goals, setGoals] = useState<CareerGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterGoal, setFilterGoal] = useState<number | undefined>();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    firm_name: "",
    url: "",
    description: "",
    location: "",
    career_goal_id: undefined as number | undefined,
    status: "saved",
  });

  const load = () => {
    Promise.all([
      getJobs({ status: filterStatus || undefined, career_goal_id: filterGoal }),
      getCareerGoals(),
    ])
      .then(([j, g]) => {
        setJobs(j);
        setGoals(g);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, [filterStatus, filterGoal]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) {
      setError("Job title is required");
      return;
    }
    try {
      await createJob({
        title: form.title,
        firm_name: form.firm_name || undefined,
        url: form.url || undefined,
        description: form.description || undefined,
        location: form.location || undefined,
        career_goal_id: form.career_goal_id,
        status: form.status,
      });
      setShowForm(false);
      setForm({ title: "", firm_name: "", url: "", description: "", location: "", career_goal_id: undefined, status: "saved" });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create job");
    }
  };

  const handleStatusChange = async (jobId: number, status: string) => {
    await updateJob(jobId, { status } as Partial<Job>);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this job?")) return;
    await deleteJob(id);
    load();
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Jobs Pipeline</h1>
          <p className="mt-1 text-muted-foreground">
            Track opportunities across your career goals
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Job
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        {goals.length > 0 && (
          <select
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={filterGoal || ""}
            onChange={(e) => setFilterGoal(e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">All Goals</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>{g.label}</option>
            ))}
          </select>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-base font-semibold">
              Add Job
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Job Title *</Label>
                  <Input
                    placeholder="e.g. Associate, TMT Investment Banking"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Firm</Label>
                  <Input
                    placeholder="e.g. Goldman Sachs"
                    value={form.firm_name}
                    onChange={(e) => setForm({ ...form, firm_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    placeholder="e.g. New York, NY"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Job URL</Label>
                  <Input
                    placeholder="https://..."
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Career Goal</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.career_goal_id || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        career_goal_id: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                  >
                    <option value="">None</option>
                    {goals.map((g) => (
                      <option key={g.id} value={g.id}>{g.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Job description or notes..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">Add Job</Button>
                <Button variant="outline" type="button" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Jobs list */}
      {jobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No jobs in your pipeline yet. Add one to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{job.title}</h3>
                      {job.url && (
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      {job.firm?.name && <span>{job.firm.name}</span>}
                      {job.location && (
                        <>
                          <span className="text-border">|</span>
                          <span>{job.location}</span>
                        </>
                      )}
                      {job.career_goal_label && (
                        <>
                          <span className="text-border">|</span>
                          <span className="rounded bg-[hsl(var(--columbia-light))] px-1.5 py-0.5 text-xs">
                            {job.career_goal_label}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    <div className="relative">
                      <select
                        className={`appearance-none rounded-full px-3 py-1 pr-7 text-xs font-medium ${statusColor(job.status)}`}
                        value={job.status}
                        onChange={(e) => handleStatusChange(job.id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2" />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(job.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
