import { useEffect, useState, useRef, type FormEvent } from "react";
import {
  getResumes,
  uploadResume,
  updateResume,
  deleteResume,
  type Resume,
} from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  FileText,
  Download,
  Trash2,
  Star,
  GitBranch,
} from "lucide-react";

export default function Resumes() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [label, setLabel] = useState("");
  const [isBase, setIsBase] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    getResumes()
      .then(setResumes)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Please select a file");
      return;
    }

    setUploading(true);
    try {
      await uploadResume(file, label || file.name, isBase);
      setShowUpload(false);
      setLabel("");
      setIsBase(false);
      if (fileRef.current) fileRef.current.value = "";
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSetBase = async (id: number) => {
    await updateResume(id, { is_base: true });
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this resume?")) return;
    await deleteResume(id);
    load();
  };

  const baseResumes = resumes.filter((r) => r.is_base);
  const versionedResumes = resumes.filter((r) => !r.is_base);

  if (loading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Resumes</h1>
          <p className="mt-1 text-muted-foreground">
            Manage resume versions and track which firm got which version
          </p>
        </div>
        {!showUpload && (
          <Button onClick={() => setShowUpload(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Resume
          </Button>
        )}
      </div>

      {/* Upload form */}
      {showUpload && (
        <Card>
          <CardHeader>
            <CardTitle style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-base font-semibold">
              Upload Resume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label>File (PDF or DOCX)</Label>
                <Input ref={fileRef} type="file" accept=".pdf,.docx" required />
              </div>

              <div className="space-y-2">
                <Label>Label</Label>
                <Input
                  placeholder='e.g. "Base Resume", "McKinsey v3"'
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_base"
                  checked={isBase}
                  onChange={(e) => setIsBase(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="is_base">
                  This is my base (source of truth) resume
                </Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setShowUpload(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Base resumes */}
      {baseResumes.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <Star className="h-4 w-4 text-[hsl(var(--gold))]" />
            Base Resume
          </h2>
          <div className="space-y-3">
            {baseResumes.map((r) => (
              <ResumeCard
                key={r.id}
                resume={r}
                onDelete={handleDelete}
                onSetBase={handleSetBase}
              />
            ))}
          </div>
        </div>
      )}

      {/* Versioned resumes */}
      {versionedResumes.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <GitBranch className="h-4 w-4" />
            Versions
          </h2>
          <div className="space-y-3">
            {versionedResumes.map((r) => (
              <ResumeCard
                key={r.id}
                resume={r}
                onDelete={handleDelete}
                onSetBase={handleSetBase}
              />
            ))}
          </div>
        </div>
      )}

      {resumes.length === 0 && !showUpload && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
            <p className="text-muted-foreground">
              No resumes uploaded yet. Upload your base resume to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ResumeCard({
  resume,
  onDelete,
  onSetBase,
}: {
  resume: Resume;
  onDelete: (id: number) => void;
  onSetBase: (id: number) => void;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--columbia-light))]">
            <FileText className="h-5 w-5 text-[hsl(var(--columbia-mid))]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{resume.label}</span>
              {resume.is_base && (
                <Star className="h-3.5 w-3.5 fill-[hsl(var(--gold))] text-[hsl(var(--gold))]" />
              )}
              <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                v{resume.version}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {resume.file_type.toUpperCase()} &middot;{" "}
              {new Date(resume.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <a
            href={`/api/resumes/${resume.id}/download`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Download className="h-4 w-4" />
          </a>
          {!resume.is_base && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSetBase(resume.id)}
              title="Set as base resume"
            >
              <Star className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => onDelete(resume.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
