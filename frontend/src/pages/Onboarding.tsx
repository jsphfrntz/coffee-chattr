import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Coffee } from "lucide-react";

export default function Onboarding() {
  const { user, completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [gradYear, setGradYear] = useState(
    user?.graduation_year ? String(user.graduation_year) : ""
  );
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim() || !gradYear) {
      setError("Both fields are required");
      return;
    }

    try {
      await completeOnboarding(fullName.trim(), parseInt(gradYear));
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--columbia-ice))]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-2 flex justify-center">
            <Coffee className="h-8 w-8 text-[hsl(var(--gold))]" />
          </div>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            Tell us a bit about yourself to get started
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="Jane Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gradYear">Graduation Year</Label>
              <Input
                id="gradYear"
                type="number"
                placeholder="2026"
                min={2020}
                max={2035}
                value={gradYear}
                onChange={(e) => setGradYear(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Get Started
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
