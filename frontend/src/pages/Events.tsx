import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function Events() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Events</h1>
        <p className="mt-1 text-muted-foreground">
          Recruiting events, coffee chats, and AI-generated briefings
        </p>
      </div>
      <Card>
        <CardContent className="py-16 text-center">
          <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
          <p className="text-lg font-medium text-muted-foreground">Coming in Phase 3</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Event calendar, attendee briefings, and talking points
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
