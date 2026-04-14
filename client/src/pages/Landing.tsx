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

  const primaryCtaLabel = useMemo(() => {
    if (!user) return "Start Exploring";
    if (onboardingStatus?.completed) return "Go to Dashboard";
    return "Continue Setup";
  }, [user, onboardingStatus?.completed]);

  return (
    <div className="min-h-screen bg-black font-sans">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src="/videos/mmc-video-hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 z-[1] bg-black/25" />
        <div className="absolute inset-0 z-[2] bg-gradient-to-b from-black/20 via-black/45 to-black/80" />
        <div className="absolute inset-0 z-[3] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0)_55%)]" />
        <div className="absolute inset-x-0 top-0 z-[4] h-40 bg-gradient-to-b from-black/35 to-transparent" />

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center justify-center px-6 text-center text-white animate-fade-in">
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

          <p className="mt-6 font-serif text-2xl md:text-3xl lg:text-4xl font-light tracking-tight text-white/90">
            {branding.tagline ??
              "Luxury Destination Weddings Across Cyprus & the UK"}
          </p>

          <div className="mt-8">
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

        <div className="absolute bottom-10 z-10 w-full flex justify-center gap-6 text-xs text-white/70">
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
