import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import ChatWidget from "@/components/ChatWidget";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Mail,
  FileText,
  Calendar,
  Settings,
  LogOut,
  Coffee,
  Target,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/goals", label: "Career Goals", icon: Target },
  { to: "/jobs", label: "Jobs", icon: Briefcase },
  { to: "/resumes", label: "Resumes", icon: FileText },
  { to: "/network", label: "Network", icon: Users },
  { to: "/outreach", label: "Outreach", icon: Mail },
  { to: "/events", label: "Events", icon: Calendar },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-border bg-white">
        {/* Logo */}
        <div className="flex items-center gap-2 border-b border-border px-6 py-5">
          <Coffee className="h-6 w-6 text-[hsl(var(--gold))]" />
          <span className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            CoffeeChattr
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[hsl(var(--columbia-light))] text-[hsl(var(--columbia-navy))]"
                    : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--columbia-ice))] hover:text-foreground"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-border p-4">
          <div className="mb-2 truncate text-sm font-medium">
            {user?.full_name || user?.email}
          </div>
          <div className="mb-3 truncate text-xs text-muted-foreground">
            {user?.graduation_year ? `CBS '${String(user.graduation_year).slice(2)}` : user?.email}
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-8 py-8">
          <Outlet />
        </div>
      </main>

      {/* Chat widget */}
      <ChatWidget />
    </div>
  );
}
