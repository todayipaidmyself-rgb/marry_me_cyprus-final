import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useMemo } from "react";
import { useBranding } from "@/contexts/BrandingContext";

export default function Landing() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: onboardingStatus, isLoading: statusLoading } =
    trpc.profile.checkOnboardingStatus.useQuery(undefined, { enabled: !!user });
  const { branding } = useBranding();
  const isLoadingState = authLoading || (!!user && statusLoading);

  const handleEnterHub = () => {
    if (!user) {
      // Not authenticated - send to discover to start flow
      setLocation("/discover");
    } else if (onboardingStatus?.completed) {
      // Authenticated and onboarding completed - go to dashboard
      setLocation("/dashboard");
    } else {
      // Authenticated but onboarding not completed - proceed to onboarding
      setLocation("/onboarding-full");
    }
  };

  const heroStyle = useMemo(
    () => ({
      backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.75) 100%), url('${
        branding.heroImageUrl ?? "/hero-background.jpg"
      }')`,
      backgroundPosition: "center",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
    }),
    [branding.heroImageUrl]
  );

  const primaryCtaLabel = useMemo(() => {
    if (!user) return "Start Exploring";
    if (onboardingStatus?.completed) return "Go to Dashboard";
    return "Continue Setup";
  }, [user, onboardingStatus?.completed]);

  return (
    <div className="min-h-screen bg-black font-sans">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 animate-[kenburns_18s_ease-in-out_infinite_alternate] will-change-transform"
          style={heroStyle}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/55 to-black/85" />

        <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
          <div className="flex justify-center">
            <img
              src={branding.logoUrl}
              alt={branding.companyName}
              className="h-auto w-full max-w-2xl drop-shadow-[0_20px_60px_rgba(0,0,0,0.45)] transition-transform duration-700 hover:scale-[1.01]"
              onError={e => {
                e.currentTarget.src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='200'%3E%3Crect fill='%23000' width='800' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23C6B4AB' font-family='serif' font-size='28'%3E" +
                  branding.companyName +
                  "%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>

          <p className="font-serif text-2xl md:text-3xl lg:text-4xl font-light tracking-tight text-white/90">
            {branding.tagline ??
              "Luxury Destination Weddings Across Cyprus & the UK"}
          </p>

          <div className="pt-2">
            <Button
              size="lg"
              onClick={handleEnterHub}
              disabled={isLoadingState}
              className="bg-[color:var(--brand-primary,#C6B4AB)] text-black font-sans tracking-[0.18em] uppercase px-12 py-6 text-base md:text-lg transition-all duration-300 hover:shadow-[0_20px_60px_rgba(198,180,171,0.4)] hover:scale-[1.03]"
            >
              {primaryCtaLabel}
            </Button>
          </div>
        </div>

        <div className="absolute bottom-10 w-full flex justify-center text-white/70 text-xs gap-6">
          <Link href="/venues" className="hover:text-white transition-colors">
            Browse Venues
          </Link>
          <Link
            href="/collections"
            className="hover:text-white transition-colors"
          >
            Browse Collections
          </Link>
          <Link href="/dossiers" className="hover:text-white transition-colors">
            Explore Dossiers
          </Link>
        </div>
      </section>
    </div>
  );
}
