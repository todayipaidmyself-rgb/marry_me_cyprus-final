import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Venues from "./pages/Venues";
import Collections from "./pages/Collections";
import Planning from "./pages/Planning";
import Timeline from "./pages/Timeline";
import Profile from "./pages/Profile";
import Contact from "./pages/Contact";
import VenueDetail from "./pages/VenueDetail";
import CollectionDetail from "./pages/CollectionDetail";
import AdminInquiries from "./pages/AdminInquiries";
import { Budget } from "./pages/Budget";
import Dossiers from "./pages/Dossiers";
import DossierDetail from "./pages/DossierDetail";
import Discover from "./pages/Discover";
// Pre-enrollment pages removed - simplified to direct onboarding flow
import OnboardingFull from "./pages/OnboardingFull";
import WeddingProfile from "./pages/WeddingProfile";
import SharedProfile from "./pages/SharedProfile";
import AdminBranding from "./pages/AdminBranding";
import AdminQuotes from "./pages/AdminQuotes";
import MyQuote from "./pages/MyQuote";
import Team from "./pages/Team";
import HubPage from "./pages/Hub";
import MoreVenues from "./pages/MoreVenues";
import { ContactHub } from "./components/ContactHub";
import { FloatingContactButton } from "./components/FloatingContactButton";
import { MobileContactBar } from "./components/MobileContactBar";
import { BottomNav } from "./components/BottomNav";
import FloatingContactLauncher from "./components/FloatingContactLauncher";
import { useState, type ReactNode } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

function FullScreenLoader() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <p className="text-white/70">Loading...</p>
    </div>
  );
}

function AuthRequiredScreen() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container py-24 text-center">
        <h1 className="font-serif text-3xl md:text-4xl mb-4">Sign In Required</h1>
        <p className="text-white/70 mb-8 max-w-xl mx-auto">
          Please sign in to continue to your planning workspace.
        </p>
        <a
          href={getLoginUrl()}
          className="inline-flex items-center justify-center px-6 py-3 bg-[#C6B4AB] text-black font-medium uppercase tracking-wider hover:bg-[#B5A49B] transition-colors"
        >
          Sign In
        </a>
      </div>
    </div>
  );
}

function AdminRequiredScreen() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container py-24 text-center">
        <h1 className="font-serif text-3xl md:text-4xl mb-4">Admin Access Required</h1>
        <p className="text-white/70 max-w-xl mx-auto">
          This area is reserved for internal admin users.
        </p>
      </div>
    </div>
  );
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth({ mode: "optional" });
  const isDevBypass =
    (typeof process !== "undefined" &&
      process.env?.NODE_ENV === "development") ||
    import.meta.env.DEV;
  if (loading) return <FullScreenLoader />;
  if (!user && isDevBypass) return <>{children}</>;
  if (!user) return <AuthRequiredScreen />;
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth({ mode: "optional" });
  if (loading) return <FullScreenLoader />;
  if (!user) return <AuthRequiredScreen />;
  if (user.role !== "admin") return <AdminRequiredScreen />;
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard">
        <RequireAuth>
          <Dashboard />
        </RequireAuth>
      </Route>
      <Route path="/venues/:id" component={VenueDetail} />
      <Route path="/venues/:slug" component={VenueDetail} />
      <Route path="/venues" component={Venues} />
      <Route path="/more-venues" component={MoreVenues} />
      <Route path="/collections/:id" component={CollectionDetail} />
      <Route path="/collections" component={Collections} />
      <Route path="/planning">
        <RequireAuth>
          <Planning />
        </RequireAuth>
      </Route>
      <Route path="/timeline" component={Timeline} />
      <Route path="/profile">
        <RequireAuth>
          <Profile />
        </RequireAuth>
      </Route>
      <Route path="/wedding-profile">
        <RequireAuth>
          <WeddingProfile />
        </RequireAuth>
      </Route>
      <Route path="/profile/:token" component={SharedProfile} />
      <Route path="/budget">
        <RequireAuth>
          <Budget />
        </RequireAuth>
      </Route>
      <Route path="/dossiers/:id" component={DossierDetail} />
      <Route path="/dossiers" component={Dossiers} />
      <Route path="/discover" component={Discover} />
      <Route path="/hub" component={HubPage} />
      {/* Pre-enrollment routes removed - users go directly to /onboarding-full after signup */}
      <Route path="/onboarding-full" component={OnboardingFull} />
      <Route path="/contact" component={Contact} />
      <Route path="/admin/inquiries">
        <RequireAdmin>
          <AdminInquiries />
        </RequireAdmin>
      </Route>
      <Route path="/my-quote" component={MyQuote} />
      <Route path="/admin/branding">
        <RequireAdmin>
          <AdminBranding />
        </RequireAdmin>
      </Route>
      <Route path="/admin/quotes">
        <RequireAdmin>
          <AdminQuotes />
        </RequireAdmin>
      </Route>
      <Route path="/team" component={Team} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  const [isContactHubOpen, setIsContactHubOpen] = useState(false);
  const [location] = useLocation();

  // Hide contact components on Landing page
  const showContactComponents = location !== "/";

  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <main className="pb-20 md:pb-0">
            <Router />
          </main>
          <BottomNav />
          <FloatingContactLauncher onOpen={() => setIsContactHubOpen(true)} />

          {/* Contact Hub Components - Hidden on Landing page */}
          {showContactComponents && (
            <>
              <ContactHub
                isOpen={isContactHubOpen}
                onClose={() => setIsContactHubOpen(false)}
              />
              <FloatingContactButton
                onClick={() => setIsContactHubOpen(true)}
              />
              <MobileContactBar onMoreClick={() => setIsContactHubOpen(true)} />
            </>
          )}
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
