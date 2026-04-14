import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Menu, X } from "lucide-react";
import { useCallback, useState } from "react";
import { useBranding } from "@/contexts/BrandingContext";

export default function Navigation() {
  const [location] = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { branding } = useBranding();

  const handleSignOut = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  }, [logout]);

  const desktopPublicMenu = [
    { href: "/venues", label: "Venues" },
    { href: "/collections", label: "Collections" },
    { href: "/dossiers", label: "Dossiers" },
    { href: "/my-quote", label: "My Quote" },
  ];

  const desktopAuthenticatedMenu = [
    { href: "/venues", label: "Venues" },
    { href: "/collections", label: "Collections" },
    { href: "/dossiers", label: "Dossiers" },
    { href: "/my-quote", label: "My Quote" },
  ];

  const mobileMenuLinks: Array<{ href: string; label: string }> = [];

  const desktopLinks = isAuthenticated
    ? desktopAuthenticatedMenu
    : desktopPublicMenu;

  const showMobileMenuButton = isAuthenticated;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black text-white">
      <div className="container">
        <div className="relative flex items-center justify-between h-20">
          <div className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
            <Link href="/">
              <img
                src={branding.logoUrl}
                alt={branding.companyName}
                className="h-8 md:h-10 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              />
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            {desktopLinks.map(link => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`font-sans text-sm tracking-wider uppercase cursor-pointer transition-colors ${
                    location === link.href
                      ? "text-[color:var(--brand-primary,#C6B4AB)]"
                      : "text-white hover:text-[color:var(--brand-primary,#C6B4AB)]"
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            ))}

            {isAuthenticated ? (
              <Button
                onClick={() => void handleSignOut()}
                variant="outline"
                className="border-[color:var(--brand-primary,#C6B4AB)] text-white hover:bg-[color:var(--brand-primary,#C6B4AB)] hover:text-black transition-colors"
              >
                Sign Out
              </Button>
            ) : (
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                variant="outline"
                className="border-[color:var(--brand-primary,#C6B4AB)] text-white hover:bg-[color:var(--brand-primary,#C6B4AB)] hover:text-black transition-colors"
              >
                Sign In
              </Button>
            )}
          </div>

          {showMobileMenuButton ? (
            <button
              className="relative z-10 lg:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          ) : null}
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden pb-6 space-y-4">
            {mobileMenuLinks.map(link => (
              <Link key={link.href} href={link.href}>
                <div
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block font-sans text-sm tracking-wider uppercase py-2 cursor-pointer transition-colors ${
                    location === link.href
                      ? "text-[color:var(--brand-primary,#C6B4AB)]"
                      : "text-white hover:text-[color:var(--brand-primary,#C6B4AB)]"
                  }`}
                >
                  {link.label}
                </div>
              </Link>
            ))}

            {isAuthenticated ? (
              <Button
                onClick={() => {
                  void handleSignOut();
                  setMobileMenuOpen(false);
                }}
                variant="outline"
                className="w-full border-[color:var(--brand-primary,#C6B4AB)] text-white hover:bg-[color:var(--brand-primary,#C6B4AB)] hover:text-black"
              >
                Sign Out
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </nav>
  );
}