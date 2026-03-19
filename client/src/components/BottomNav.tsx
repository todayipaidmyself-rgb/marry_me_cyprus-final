import { Link, useLocation } from "wouter";
import {
  Compass,
  FileText,
  MapPin,
  MessageSquare,
  Package,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

const signedInNavItems = [
  { name: "Venues", route: "/venues", icon: MapPin },
  { name: "Collections", route: "/collections", icon: Package },
  { name: "Dossiers", route: "/dossiers", icon: FileText },
  { name: "My Quote", route: "/my-quote", icon: MessageSquare },
];
const guestNavItems = [
  { name: "My Quote", route: "/my-quote", icon: MessageSquare },
  { name: "Venues", route: "/venues", icon: MapPin },
  { name: "Collections", route: "/collections", icon: Package },
  { name: "Dossiers", route: "/dossiers", icon: FileText },
  { name: "Discover", route: "/discover", icon: Compass },
];

export function BottomNav() {
  const [pathname] = useLocation();
  const { isAuthenticated } = useAuth({ mode: "optional" });
  const navItems = isAuthenticated ? signedInNavItems : guestNavItems;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-black/35 backdrop-blur-md pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex h-16 items-center justify-between px-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const isExternal = "externalHref" in item;
          const isActive =
            !isExternal &&
            (pathname === item.route || pathname.startsWith(`${item.route}/`));

          return (
            <div key={item.name} className="flex min-w-0 flex-1 items-center justify-center px-1">
              {isExternal ? (
                <a
                  href={item.externalHref}
                  className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1"
                >
                  <Icon className="h-5 w-5 text-white/60 transition-colors" />
                  <span className="text-[10px] leading-tight font-medium text-white/60 transition-colors">
                    {item.name}
                  </span>
                </a>
              ) : (
                <Link
                  href={item.route}
                  className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1"
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon
                    className={`h-5 w-5 transition-colors ${
                      isActive ? "text-white/90" : "text-white/60"
                    }`}
                  />
                  <span
                    className={`text-[10px] leading-tight font-medium transition-colors ${
                      isActive ? "text-white/90" : "text-white/60"
                    }`}
                  >
                    {item.name}
                  </span>
                  {isActive && <div className="mt-1 h-[2px] w-8 bg-white/70" />}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
