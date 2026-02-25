import { Link, useLocation } from "react-router-dom";
import { Home, Compass, BarChart3 } from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", path: "/selecionar-teste", icon: Home },
  { label: "Explorar", path: "/explorar", icon: Compass },
  { label: "Análises", path: "/historico", icon: BarChart3 },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md print:hidden">
      <div className="max-w-lg mx-auto flex items-center justify-around h-14">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.path;
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
