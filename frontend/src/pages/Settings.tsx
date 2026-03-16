import { useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Settings() {
  const { user, completeOnboarding } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [gradYear, setGradYear] = useState(
    user?.graduation_year ? String(user.graduation_year) : ""
  );
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    try {
      await completeOnboarding(fullName, parseInt(gradYear));
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Account and integration settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-base font-semibold">
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {saved && (
              <Alert>
                <AlertDescription>Profile updated.</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Graduation Year</Label>
              <Input
                type="number"
                value={gradYear}
                onChange={(e) => setGradYear(e.target.value)}
                required
              />
            </div>
            <Button type="submit">Save</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-base font-semibold">
            Integrations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <div className="font-medium">Gmail</div>
              <div className="text-sm text-muted-foreground">
                Connect your Gmail for draft creation
              </div>
            </div>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <div className="font-medium">Outlook</div>
              <div className="text-sm text-muted-foreground">
                Connect your Outlook for draft creation
              </div>
            </div>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <div className="font-medium">LinkedIn</div>
              <div className="text-sm text-muted-foreground">
                Chrome MCP extension for network intelligence
              </div>
            </div>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
