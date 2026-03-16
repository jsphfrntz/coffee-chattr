import { useEffect, useState } from "react";
import {
  searchAlumni,
  getFirmCoverage,
  type AlumniProfile,
  type FirmCoverage,
} from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  Users,
  Building2,
  Linkedin,
  Mail,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type Tab = "alumni" | "coverage";

export default function Network() {
  const [tab, setTab] = useState<Tab>("alumni");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Network</h1>
        <p className="mt-1 text-muted-foreground">
          CBS alumni database and firm coverage intelligence
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        <button
          onClick={() => setTab("alumni")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "alumni"
              ? "bg-white text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="mr-2 inline h-4 w-4" />
          Alumni Browser
        </button>
        <button
          onClick={() => setTab("coverage")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "coverage"
              ? "bg-white text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 className="mr-2 inline h-4 w-4" />
          Firm Coverage
        </button>
      </div>

      {tab === "alumni" ? <AlumniBrowser /> : <FirmCoverageView />}
    </div>
  );
}

function AlumniBrowser() {
  const [query, setQuery] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [alumni, setAlumni] = useState<AlumniProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = (p = 1) => {
    setLoading(true);
    searchAlumni({ q: query || undefined, company: company || undefined, location: location || undefined, page: p, per_page: 20 })
      .then((res) => {
        setAlumni(res.alumni);
        setTotal(res.total);
        setPage(res.page);
        setPages(res.pages);
        setSearched(true);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  // Load initial data
  useEffect(() => {
    doSearch(1);
  }, []);

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <Card>
        <CardContent className="p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              doSearch(1);
            }}
            className="flex flex-wrap gap-3"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, company, or title..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Input
              placeholder="Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-40"
            />
            <Input
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-40"
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results count */}
      {searched && (
        <div className="text-sm text-muted-foreground">
          {total.toLocaleString()} alumni found
        </div>
      )}

      {/* Alumni cards */}
      {alumni.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {alumni.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-semibold">{a.full_name}</h3>
                      {a.linkedin_url && (
                        <a
                          href={a.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-[#0A66C2] hover:opacity-80"
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                    {a.current_title && (
                      <div className="mt-0.5 truncate text-sm text-muted-foreground">
                        {a.current_title}
                      </div>
                    )}
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {a.current_company && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {a.current_company}
                        </span>
                      )}
                      {a.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {a.location}
                        </span>
                      )}
                      {a.email && (
                        <a
                          href={`mailto:${a.email}`}
                          className="flex items-center gap-1 text-[hsl(var(--columbia-mid))] hover:underline"
                        >
                          <Mail className="h-3 w-3" />
                          {a.email}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        searched && !loading && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No alumni found. Try broadening your search.
            </CardContent>
          </Card>
        )
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => doSearch(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pages}
            onClick={() => doSearch(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function FirmCoverageView() {
  const [data, setData] = useState<FirmCoverage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFirmCoverage()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-muted-foreground">Loading firm coverage...</div>;
  }

  if (!data || data.coverage.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No firm coverage data yet. Alumni data is needed to build coverage maps.
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...data.coverage.map((c) => c.alumni_count));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle
            style={{ fontFamily: "'DM Sans', sans-serif" }}
            className="text-base font-semibold"
          >
            CBS Alumni by Firm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.coverage.map((item) => (
              <div key={item.firm_name} className="flex items-center gap-3">
                <div className="w-48 truncate text-sm font-medium">
                  {item.firm_name}
                </div>
                <div className="flex-1">
                  <div className="relative h-6 overflow-hidden rounded-full bg-muted">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-[hsl(var(--columbia-mid))]"
                      style={{
                        width: `${(item.alumni_count / maxCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="w-12 text-right text-sm font-mono text-muted-foreground">
                  {item.alumni_count}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
