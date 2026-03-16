import { useEffect, useState, type FormEvent } from "react";
import {
  getCareerGoals,
  createCareerGoal,
  updateCareerGoal,
  deleteCareerGoal,
  type CareerGoal,
} from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

function TagInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const tag = input.trim();
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    setInput("");
  };

  return (
    <div>
      <div className="mb-1.5 flex flex-wrap gap-1.5">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--columbia-light))] px-2.5 py-0.5 text-xs font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <Input
        placeholder={placeholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            addTag();
          }
        }}
        onBlur={addTag}
      />
    </div>
  );
}

interface GoalFormData {
  label: string;
  target_industries: string[];
  target_roles: string[];
  target_locations: string[];
  target_firm_size: string;
  narrative: string;
  is_active: boolean;
}

const emptyForm: GoalFormData = {
  label: "",
  target_industries: [],
  target_roles: [],
  target_locations: [],
  target_firm_size: "",
  narrative: "",
  is_active: true,
};

export default function CareerGoals() {
  const [goals, setGoals] = useState<CareerGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<GoalFormData>(emptyForm);
  const [error, setError] = useState("");

  const load = () => {
    getCareerGoals()
      .then(setGoals)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.label.trim()) {
      setError("Label is required");
      return;
    }

    try {
      if (editingId) {
        await updateCareerGoal(editingId, form);
      } else {
        await createCareerGoal(form);
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    }
  };

  const startEdit = (goal: CareerGoal) => {
    setForm({
      label: goal.label,
      target_industries: goal.target_industries,
      target_roles: goal.target_roles,
      target_locations: goal.target_locations,
      target_firm_size: goal.target_firm_size || "",
      narrative: goal.narrative || "",
      is_active: goal.is_active,
    });
    setEditingId(goal.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this career goal?")) return;
    await deleteCareerGoal(id);
    load();
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Career Goals</h1>
          <p className="mt-1 text-muted-foreground">
            Define your target roles and career narratives
          </p>
        </div>
        {!showForm && (
          <Button
            onClick={() => {
              setForm(emptyForm);
              setEditingId(null);
              setShowForm(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Goal
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-base font-semibold">
              {editingId ? "Edit Goal" : "New Career Goal"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label>Label</Label>
                <Input
                  placeholder='e.g. "IB — TMT", "MBB Consulting"'
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Target Industries</Label>
                  <TagInput
                    value={form.target_industries}
                    onChange={(v) => setForm({ ...form, target_industries: v })}
                    placeholder="Add industry, press Enter"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Target Roles</Label>
                  <TagInput
                    value={form.target_roles}
                    onChange={(v) => setForm({ ...form, target_roles: v })}
                    placeholder="Add role, press Enter"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Target Locations</Label>
                  <TagInput
                    value={form.target_locations}
                    onChange={(v) => setForm({ ...form, target_locations: v })}
                    placeholder="Add location, press Enter"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Firm Size</Label>
                  <Input
                    placeholder='e.g. "bulge bracket", "boutique"'
                    value={form.target_firm_size}
                    onChange={(e) =>
                      setForm({ ...form, target_firm_size: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Career Narrative</Label>
                <textarea
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Your career story for this track — what connects your past experience to this goal?"
                  value={form.narrative}
                  onChange={(e) =>
                    setForm({ ...form, narrative: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm({ ...form, is_active: e.target.checked })
                  }
                  className="h-4 w-4"
                />
                <Label htmlFor="is_active">Active goal</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  <Check className="mr-2 h-4 w-4" />
                  {editingId ? "Save Changes" : "Create Goal"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Goals list */}
      {goals.length === 0 && !showForm ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No career goals yet. Create one to start building your pipeline.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
            <Card key={goal.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        {goal.label}
                      </h3>
                      {goal.is_active ? (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                          Inactive
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {goal.target_industries.length > 0 && (
                        <div>
                          <span className="font-medium text-foreground">Industries:</span>{" "}
                          {goal.target_industries.join(", ")}
                        </div>
                      )}
                      {goal.target_roles.length > 0 && (
                        <div>
                          <span className="font-medium text-foreground">Roles:</span>{" "}
                          {goal.target_roles.join(", ")}
                        </div>
                      )}
                      {goal.target_locations.length > 0 && (
                        <div>
                          <span className="font-medium text-foreground">Locations:</span>{" "}
                          {goal.target_locations.join(", ")}
                        </div>
                      )}
                      {goal.target_firm_size && (
                        <div>
                          <span className="font-medium text-foreground">Size:</span>{" "}
                          {goal.target_firm_size}
                        </div>
                      )}
                    </div>

                    {goal.narrative && (
                      <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                        {goal.narrative}
                      </p>
                    )}
                  </div>

                  <div className="ml-4 flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEdit(goal)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(goal.id)}
                    >
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
