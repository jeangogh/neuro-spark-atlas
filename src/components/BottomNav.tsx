import { Link, useLocation } from "react-router-dom";
import { Home, Headphones, BookOpen, BarChart3 } from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", path: "/", icon: Home },
  { label: "Explorar", path: "/explorar", icon: Headphones },
  { label: "Aprender", path: "/aprender", icon: BookOpen },
  { label: "Análises", path: "/analises", icon: BarChart3 },
];

const HIDDEN_PATTERNS = [
  "/auth", "/triagem", "/nef", "/miniteste/", "/resultados",
  "/compartilhar", "/consentimento", "/teste-bonus", "/qualificacao",
  "/convite/", "/style-guide", "/admin",
];

export default function BottomNav() {
  const { pathname } = useLocation();

  // Hide on landing page (unauthenticated) and specific routes
  if (pathname === "/") return null;
  if (HIDDEN_PATTERNS.some((p) => pathname === p || pathname.startsWith(p))) return null;
  if (pathname.startsWith("/aprender/")) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md print:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="max-w-lg mx-auto flex items-center justify-around h-14">
        {NAV_ITEMS.map((item) => {
          const active = item.path === "/"
            ? pathname === "/"
            : pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
