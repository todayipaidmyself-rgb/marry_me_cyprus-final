import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useBranding } from "@/contexts/BrandingContext";

export default function Navigation() {
  const [location] = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { branding } = useBranding();

  // Desktop menu for logged-out users
  const desktopPublicMenu = [
    { href: "/venues", label: "Venues" },
    { href: "/collections", label: "Collections" },
    { href: "/dossiers", label: "Dossiers" },
    { href: "/my-quote", label: "My Quote" },
  ];

  // Desktop menu for logged-in users
  const desktopAuthenticatedMenu = [
    { href: "/venues", label: "Venues" },
    { href: "/collections", label: "Collections" },
    { href: "/dossiers", label: "Dossiers" },
    { href: "/my-quote", label: "My Quote" },
    { href: "/profile", label: "Wedding Profile" },
  ];

  // Mobile hamburger should only contain secondary links to avoid duplicating bottom nav.
  const mobileMenuLinks = isAuthenticated
    ? [{ href: "/profile", label: "Wedding Profile" }]
    : [];

  const desktopLinks = isAuthenticated
    ? desktopAuthenticatedMenu
    : desktopPublicMenu;

  const showMobileMenuButton = mobileMenuLinks.length > 0 || isAuthenticated;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black text-white">
      <div className="container">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/">
            <img
              src={branding.logoUrl}
              alt={branding.companyName}
              className="h-8 md:h-10 w-auto cursor-pointer hover:opacity-80 transition-opacity"
            />
          </Link>

          {/* Desktop Navigation */}
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
                onClick={() => logout()}
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

          {/* Mobile Menu Button */}
          {showMobileMenuButton ? (
            <button
              className="lg:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          ) : null}
        </div>

        {/* Mobile Navigation */}
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
                  logout();
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
