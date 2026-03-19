import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Branding, defaultBranding } from "@/lib/branding";

const STORAGE_KEY = "branding-config";

type BrandingContextValue = {
  branding: Branding;
  setBranding: (next: Branding) => void;
};

const BrandingContext = createContext<BrandingContextValue | undefined>(
  undefined
);

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBrandingState] = useState<Branding>(() => {
    const fromStorage =
      typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (fromStorage) {
      try {
        return { ...defaultBranding, ...JSON.parse(fromStorage) };
      } catch (_err) {
        console.warn("Invalid branding in storage, falling back to defaults");
      }
    }
    return defaultBranding;
  });

  const setBranding = (next: Branding) => {
    setBrandingState(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  };

  useEffect(() => {
    if (typeof document === "undefined") return;

    document.title = branding.tagline
      ? `${branding.companyName} — ${branding.tagline}`
      : branding.companyName;

    const metaDescription =
      document.querySelector('meta[name="description"]') ??
      document.head.appendChild(
        Object.assign(document.createElement("meta"), { name: "description" })
      );
    metaDescription.setAttribute(
      "content",
      branding.tagline ??
        `${branding.companyName} — Luxury weddings tailored to you`
    );

    const favicon =
      document.querySelector("link[rel='icon']") ??
      document.head.appendChild(
        Object.assign(document.createElement("link"), { rel: "icon" })
      );
    if (branding.faviconUrl) {
      favicon.setAttribute("href", branding.faviconUrl);
    }

    const root = document.documentElement;
    root.style.setProperty("--brand-primary", branding.primaryColor);
    root.style.setProperty("--brand-secondary", branding.secondaryColor);
    // Also override core theme tokens so shadcn/Tailwind colors pick it up.
    root.style.setProperty("--primary", branding.primaryColor);
    root.style.setProperty("--accent", branding.primaryColor);
    root.style.setProperty("--ring", branding.primaryColor);
    root.style.setProperty("--sidebar-primary", branding.primaryColor);
    root.style.setProperty("--sidebar-accent", branding.primaryColor);
    root.style.setProperty("--secondary", branding.secondaryColor);
    root.style.setProperty("--muted", branding.secondaryColor + "1a"); // subtle tint
    root.style.setProperty("--background", "#ffffff");
    root.style.setProperty("--foreground", "#0f172a");
  }, [branding]);

  const value = useMemo<BrandingContextValue>(
    () => ({ branding, setBranding }),
    [branding]
  );

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const ctx = useContext(BrandingContext);
  if (!ctx) throw new Error("useBranding must be used within BrandingProvider");
  return ctx;
}
