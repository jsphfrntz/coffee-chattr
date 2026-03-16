import { Card, CardContent } from "@/components/ui/card";
import { Mail } from "lucide-react";

export default function Outreach() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Outreach</h1>
        <p className="mt-1 text-muted-foreground">
          AI-personalized alumni emails and follow-up tracking
        </p>
      </div>
      <Card>
        <CardContent className="py-16 text-center">
          <Mail className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
          <p className="text-lg font-medium text-muted-foreground">Coming in Phase 2</p>
          <p className="mt-1 text-sm text-muted-foreground">
            AI email drafting, Gmail/Outlook integration, and send tracking
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
