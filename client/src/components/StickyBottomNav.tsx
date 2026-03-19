import { Link, useLocation } from "wouter";
import { MapPin, FileText, Compass, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StickyBottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/venues", label: "Venues", icon: MapPin },
    { href: "/dossiers", label: "Dossiers", icon: FileText },
    { href: "/discover", label: "Discover", icon: Compass },
    { href: "/contact", label: "Contact", icon: MessageSquare },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-white/20 md:hidden">
      <div className="grid grid-cols-4 h-16">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors",
                isActive ? "text-[#C6B4AB]" : "text-white/60 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
