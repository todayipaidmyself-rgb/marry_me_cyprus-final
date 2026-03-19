import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Heart, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import Navigation from "@/components/Navigation";

const BUDGET_OPTIONS = [
  "Under €10,000",
  "€10,000–€15,000",
  "€15,000–€20,000",
  "€20,000+",
];

const STYLE_OPTIONS = [
  "Luxury",
  "Romantic",
  "Boho",
  "Classic",
  "Modern",
  "Beachfront",
  "Garden",
  "Minimalist",
];

const LOCATION_OPTIONS = [
  "Paphos",
  "Ayia Napa",
  "Limassol",
  "Protaras",
  "Larnaca",
];

const CONTACT_METHOD_OPTIONS = ["Email", "WhatsApp", "Phone", "Other"];

const WEDDING_STYLE_OPTIONS = [
  "Classic",
  "Boho",
  "Rustic",
  "Modern Luxury",
  "Beach Chic",
  "Garden",
  "Chateau",
  "Winery",
  "Minimal & Modern",
  "Romantic",
];

export default function Profile() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const { data: profile, isLoading: profileLoading } =
    trpc.profile.get.useQuery(undefined, {
      enabled: isAuthenticated,
    });

  const { data: venues } = trpc.venues.getAll.useQuery();
  const { data: favoriteIds } = trpc.venues.getFavoriteIds.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: inquiries } = trpc.inquiries.getUserInquiries.useQuery(
    undefined,
    {
      enabled: isAuthenticated,
    }
  );

  const toggleFavorite = trpc.venues.toggleFavorite.useMutation({
    onSuccess: () => {
      utils.venues.getFavoriteIds.invalidate();
    },
  });

  // Get favorite venues from IDs
  const favoriteVenues = venues?.filter(v => favoriteIds?.includes(v.id)) || [];

  const upsertProfile = trpc.profile.upsert.useMutation({
    onSuccess: () => {
      utils.profile.get.invalidate();
      toast.success("Profile updated successfully");
    },
    onError: error => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  // Form state
  const [firstName, setFirstName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [location, setLocation] = useState("");
  const [preferredVenueSelection, setPreferredVenueSelection] =
    useState("unsure");
  const [preferredArea, setPreferredArea] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [primaryContactName, setPrimaryContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [styleTags, setStyleTags] = useState<string[]>([]);
  const [preferredVenues, setPreferredVenues] = useState<string[]>([]);
  const [country, setCountry] = useState("");
  const [backupDate, setBackupDate] = useState("");
  const [preferredContactMethod, setPreferredContactMethod] = useState("");
  const [weddingStyles, setWeddingStyles] = useState<string[]>([]);
  const [mustHaves, setMustHaves] = useState("");

  // Load profile data into form
  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || "");
      setPartnerName(profile.partnerName || "");
      setWeddingDate(profile.weddingDate || "");
      setLocation(profile.location || "");

      // Backwards compatibility: handle old venueArea data
      if (profile.preferredVenueId) {
        setPreferredVenueSelection(profile.preferredVenueId);
        setPreferredArea("");
      } else if (profile.preferredArea) {
        setPreferredVenueSelection("other");
        setPreferredArea(profile.preferredArea);
      } else if (profile.venueArea) {
        // Old data: treat as "other" area
        setPreferredVenueSelection("other");
        setPreferredArea(profile.venueArea);
      } else {
        setPreferredVenueSelection("unsure");
        setPreferredArea("");
      }

      setGuestCount(profile.guestCount?.toString() || "");
      setBudgetRange(profile.budgetRange || "");
      setPrimaryContactName(profile.primaryContactName || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
      setStyleTags(profile.styleTags || []);
      setPreferredVenues(profile.preferredVenues || []);
      setCountry(profile.country || "");
      setBackupDate(profile.backupDate || "");
      setPreferredContactMethod(profile.preferredContactMethod || "");
      setWeddingStyles(profile.weddingStyles || []);
      setMustHaves(profile.mustHaves || "");
    }
  }, [profile]);

  const handleSaveBasics = () => {
    if (
      !firstName ||
      !partnerName ||
      !weddingDate ||
      !location ||
      !guestCount
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Determine preferredVenueId and preferredArea based on selection
    const preferredVenueId =
      preferredVenueSelection === "unsure" ||
      preferredVenueSelection === "other"
        ? undefined
        : preferredVenueSelection;
    const preferredAreaValue =
      preferredVenueSelection === "other"
        ? preferredArea || undefined
        : undefined;

    upsertProfile.mutate({
      firstName,
      partnerName,
      weddingDate,
      location,
      guestCount: parseInt(guestCount),
      styleTags,
      primaryContactName: primaryContactName || undefined,
      email: email || undefined,
      phone: phone || undefined,
      budgetRange: budgetRange || undefined,
      preferredVenues,
      preferredVenueId,
      preferredArea: preferredAreaValue,
      country: country || undefined,
      backupDate: backupDate || undefined,
      preferredContactMethod: preferredContactMethod || undefined,
      weddingStyles,
      mustHaves: mustHaves || undefined,
    });
  };

  const handleSaveContact = () => {
    // Determine preferredVenueId and preferredArea based on selection
    const preferredVenueId =
      preferredVenueSelection === "unsure" ||
      preferredVenueSelection === "other"
        ? undefined
        : preferredVenueSelection;
    const preferredAreaValue =
      preferredVenueSelection === "other"
        ? preferredArea || undefined
        : undefined;

    upsertProfile.mutate({
      firstName,
      partnerName,
      weddingDate,
      location,
      guestCount: parseInt(guestCount),
      styleTags,
      primaryContactName: primaryContactName || undefined,
      email: email || undefined,
      phone: phone || undefined,
      budgetRange: budgetRange || undefined,
      preferredVenues,
      preferredVenueId,
      preferredArea: preferredAreaValue,
      country: country || undefined,
      backupDate: backupDate || undefined,
      preferredContactMethod: preferredContactMethod || undefined,
      weddingStyles,
      mustHaves: mustHaves || undefined,
    });
  };

  const handleSaveVision = () => {
    // Determine preferredVenueId and preferredArea based on selection
    const preferredVenueId =
      preferredVenueSelection === "unsure" ||
      preferredVenueSelection === "other"
        ? undefined
        : preferredVenueSelection;
    const preferredAreaValue =
      preferredVenueSelection === "other"
        ? preferredArea || undefined
        : undefined;

    upsertProfile.mutate({
      firstName,
      partnerName,
      weddingDate,
      location,
      guestCount: parseInt(guestCount),
      styleTags,
      primaryContactName: primaryContactName || undefined,
      email: email || undefined,
      phone: phone || undefined,
      budgetRange: budgetRange || undefined,
      preferredVenues,
      preferredVenueId,
      preferredArea: preferredAreaValue,
      country: country || undefined,
      backupDate: backupDate || undefined,
      preferredContactMethod: preferredContactMethod || undefined,
      weddingStyles,
      mustHaves: mustHaves || undefined,
    });
  };

  const toggleStyle = (style: string) => {
    setStyleTags(prev =>
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    );
  };

  const toggleWeddingStyle = (style: string) => {
    setWeddingStyles(prev =>
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    );
  };

  const toggleVenue = (venueId: string) => {
    setPreferredVenues(prev =>
      prev.includes(venueId)
        ? prev.filter(v => v !== venueId)
        : [...prev, venueId]
    );
  };

  // Calculate profile completion percentage
  const calculateCompletion = () => {
    let completed = 0;
    const total = 8;

    if (firstName && partnerName) completed++;
    if (weddingDate || backupDate) completed++;
    if (guestCount) completed++;
    if (location) completed++;
    if (favoriteVenues.length > 0 || preferredVenueSelection !== "unsure")
      completed++;
    if (budgetRange) completed++;
    if (weddingStyles.length > 0) completed++;
    if (email && preferredContactMethod) completed++;

    return Math.round((completed / total) * 100);
  };

  const completionPercentage = calculateCompletion();
  const completionMessage =
    completionPercentage === 100
      ? "100% complete – you're ready to plan 🎉"
      : completionPercentage >= 80
        ? "Almost there – 80% complete"
        : completionPercentage >= 60
          ? "You're making great progress – 60% complete"
          : completionPercentage >= 40
            ? "Your Wedding Profile is 40% complete"
            : "Let's complete your profile – 20% complete";

  // Generate dynamic next steps
  const getNextSteps = () => {
    const steps = [];

    if (favoriteVenues.length === 0) {
      steps.push({
        text: "Start saving venues you love to build your shortlist",
        link: "/venues",
        linkText: "Explore venues",
      });
    }

    if (favoriteVenues.length > 0 && (!inquiries || inquiries.length === 0)) {
      const firstVenue = favoriteVenues[0];
      const firstVenueSlug = (firstVenue as any)?.slug || firstVenue?.id;
      steps.push({
        text: "Send an enquiry to check availability for your shortlisted venues",
        link: `/venues/${firstVenueSlug}`,
        linkText: "View venue",
      });
    }

    if (inquiries && inquiries.length > 0) {
      steps.push({
        text: "Track your enquiry status from the dashboard",
        link: "/dashboard",
        linkText: "View dashboard",
      });
    }

    if (!weddingDate && !backupDate) {
      steps.push({
        text: "Lock in your date range and backup date",
        link: "/profile",
        linkText: "Add dates",
      });
    }

    if (favoriteVenues.length >= 2) {
      steps.push({
        text: "Confirm your top 2–3 venues from your shortlist",
        link: "/venues",
        linkText: "Review venues",
      });
    }

    return steps.slice(0, 4); // Max 4 steps
  };

  const nextSteps = getNextSteps();

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C6B4AB]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <h1 className="font-serif text-4xl text-white">Sign In Required</h1>
          <p className="text-white/70">
            Please sign in to view and edit your wedding profile.
          </p>
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            className="bg-[#C6B4AB] hover:bg-[#B5A49A] text-black"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <h1 className="font-serif text-4xl text-white">
            Complete Your Setup
          </h1>
          <p className="text-white/70">
            Complete onboarding first, then return here to edit your Wedding
            Profile anytime.
          </p>
          <Button
            onClick={() => navigate("/onboarding-full")}
            className="bg-[#C6B4AB] hover:bg-[#B5A49A] text-black"
          >
            Start Setup
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <div className="py-16 px-4">
        <div className="container max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-serif text-5xl md:text-6xl text-white mb-4">
              Your Wedding Profile
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto mb-8">
              Update your details so Marry Me Cyprus can recommend the right
              venues, packages and next steps.
            </p>

            {/* Profile Completion Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="mb-2">
                <span className="text-white/90 font-medium">
                  {completionMessage}
                </span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#C6B4AB] transition-all duration-500 ease-out"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Planning Snapshot */}
          <div className="mb-8 border border-white/10 rounded-lg p-8 bg-black/40 backdrop-blur-sm">
            <h2 className="font-serif text-3xl text-white mb-4">
              Planning Snapshot
            </h2>
            <p className="text-white/70 mb-6">
              {weddingDate
                ? `You're planning a ${new Date(weddingDate).getFullYear()} wedding`
                : "You're planning a wedding"}
              {location && ` in ${location}`}
              {guestCount && ` with ${guestCount} guests`}.
            </p>

            {nextSteps.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-white font-medium mb-3">Next Steps:</h3>
                {nextSteps.map((step, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 text-white/80"
                  >
                    <CheckCircle2 className="w-5 h-5 text-[#C6B4AB] flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span>{step.text}</span>
                      {step.link && (
                        <Link
                          href={step.link}
                          className="ml-2 text-[#C6B4AB] hover:underline inline-flex items-center gap-1"
                        >
                          {step.linkText} <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Venues / Your Shortlist */}
          <div className="mb-8 border border-white/10 rounded-lg p-8 bg-black/40 backdrop-blur-sm">
            <h2 className="font-serif text-3xl text-white mb-6">
              Your Shortlist
            </h2>

            {favoriteVenues.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/70 mb-6">
                  You don't have any saved venues yet. Explore venues and tap
                  the heart icon to build your shortlist.
                </p>
                <Link href="/venues">
                  <Button className="bg-[#C6B4AB] hover:bg-[#B5A49A] text-black">
                    Explore Venues
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {favoriteVenues.map(venue => (
                  <div
                    key={venue.id}
                    className="border border-white/10 rounded-lg overflow-hidden bg-black/20 hover:border-[#C6B4AB]/50 transition-colors"
                  >
                    <img
                      src={venue.heroImageUrl}
                      alt={venue.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-serif text-xl text-white">
                          {venue.name}
                        </h3>
                        <button
                          onClick={() =>
                            toggleFavorite.mutate({ venueId: venue.id })
                          }
                          className="text-[#C6B4AB] hover:text-[#B5A49A] transition-colors"
                        >
                          <Heart className="w-5 h-5 fill-current" />
                        </button>
                      </div>
                      <p className="text-white/60 text-sm mb-1">
                        {venue.location}
                      </p>
                      <p className="text-white/60 text-sm mb-4">{venue.type}</p>
                      <Link href={`/venues/${(venue as any).slug || venue.id}`}>
                        <Button variant="outline" className="w-full">
                          View Venue
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Wedding Basics Card */}
          <div className="mb-8 border border-white/10 rounded-lg p-8 bg-black/40 backdrop-blur-sm">
            <h2 className="font-serif text-3xl text-white mb-6">
              Wedding Basics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="firstName" className="text-white/90 mb-2 block">
                  Your Name *
                </Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="Sophie"
                />
              </div>
              <div>
                <Label
                  htmlFor="partnerName"
                  className="text-white/90 mb-2 block"
                >
                  Partner's Name *
                </Label>
                <Input
                  id="partnerName"
                  value={partnerName}
                  onChange={e => setPartnerName(e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="Mark"
                />
              </div>
              <div>
                <Label
                  htmlFor="weddingDate"
                  className="text-white/90 mb-2 block"
                >
                  Wedding Date *
                </Label>
                <Input
                  id="weddingDate"
                  type="date"
                  value={weddingDate}
                  onChange={e => setWeddingDate(e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              <div>
                <Label
                  htmlFor="backupDate"
                  className="text-white/90 mb-2 block"
                >
                  Backup Date (optional)
                </Label>
                <Input
                  id="backupDate"
                  type="date"
                  value={backupDate}
                  onChange={e => setBackupDate(e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              <div>
                <Label htmlFor="location" className="text-white/90 mb-2 block">
                  Location *
                </Label>
                <select
                  id="location"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/20 text-white"
                >
                  <option value="">Select location</option>
                  {LOCATION_OPTIONS.map(loc => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label
                  htmlFor="preferredVenue"
                  className="text-white/90 mb-2 block"
                >
                  Preferred venue (if known)
                </Label>
                <select
                  id="preferredVenue"
                  value={preferredVenueSelection}
                  onChange={e => {
                    setPreferredVenueSelection(e.target.value);
                    setPreferredArea("");
                  }}
                  className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/20 text-white"
                >
                  <option value="unsure">
                    I'm not sure yet – help me choose
                  </option>
                  {venues &&
                    venues
                      .sort((a, b) => {
                        if (a.location !== b.location) {
                          return a.location.localeCompare(b.location);
                        }
                        return a.name.localeCompare(b.name);
                      })
                      .map(venue => (
                        <option key={venue.id} value={venue.id}>
                          {venue.name} — {venue.location}
                        </option>
                      ))}
                  <option value="other">Other area in Cyprus</option>
                </select>
              </div>
              {preferredVenueSelection === "other" && (
                <div>
                  <Label
                    htmlFor="preferredArea"
                    className="text-white/90 mb-2 block"
                  >
                    Town / area name
                  </Label>
                  <Input
                    id="preferredArea"
                    value={preferredArea}
                    onChange={e => setPreferredArea(e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="e.g. Coral Bay, Protaras, Ayia Napa…"
                  />
                </div>
              )}
              <div>
                <Label
                  htmlFor="guestCount"
                  className="text-white/90 mb-2 block"
                >
                  Guest Count *
                </Label>
                <Input
                  id="guestCount"
                  type="number"
                  value={guestCount}
                  onChange={e => setGuestCount(e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="80"
                  min="1"
                  max="1000"
                />
              </div>
              <div>
                <Label
                  htmlFor="budgetRange"
                  className="text-white/90 mb-2 block"
                >
                  Budget Range
                </Label>
                <select
                  id="budgetRange"
                  value={budgetRange}
                  onChange={e => setBudgetRange(e.target.value)}
                  className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/20 text-white"
                >
                  <option value="">Select budget range</option>
                  {BUDGET_OPTIONS.map(budget => (
                    <option key={budget} value={budget}>
                      {budget}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleSaveBasics}
                disabled={upsertProfile.isPending}
                className="bg-[#C6B4AB] hover:bg-[#B5A49A] text-black"
              >
                {upsertProfile.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="mb-8 border border-white/10 rounded-lg p-8 bg-black/40 backdrop-blur-sm">
            <h2 className="font-serif text-3xl text-white mb-6">
              Contact Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label
                  htmlFor="primaryContactName"
                  className="text-white/90 mb-2 block"
                >
                  Primary Contact Name
                </Label>
                <Input
                  id="primaryContactName"
                  value={primaryContactName}
                  onChange={e => setPrimaryContactName(e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="Sophie Anderson"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-white/90 mb-2 block">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="sophie@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-white/90 mb-2 block">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="+44 7700 900000"
                />
              </div>
              <div>
                <Label htmlFor="country" className="text-white/90 mb-2 block">
                  Country of Residence
                </Label>
                <Input
                  id="country"
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="United Kingdom"
                />
              </div>
              <div>
                <Label
                  htmlFor="preferredContactMethod"
                  className="text-white/90 mb-2 block"
                >
                  Preferred Contact Method
                </Label>
                <select
                  id="preferredContactMethod"
                  value={preferredContactMethod}
                  onChange={e => setPreferredContactMethod(e.target.value)}
                  className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/20 text-white"
                >
                  <option value="">Select method</option>
                  {CONTACT_METHOD_OPTIONS.map(method => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleSaveContact}
                disabled={upsertProfile.isPending}
                className="bg-[#C6B4AB] hover:bg-[#B5A49A] text-black"
              >
                {upsertProfile.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>

          {/* Vision & Style Card */}
          <div className="mb-8 border border-white/10 rounded-lg p-8 bg-black/40 backdrop-blur-sm">
            <h2 className="font-serif text-3xl text-white mb-6">
              Vision & Style
            </h2>

            <div className="mb-6">
              <Label className="text-white/90 mb-3 block">Style Keywords</Label>
              <div className="flex flex-wrap gap-2">
                {STYLE_OPTIONS.map(style => (
                  <button
                    key={style}
                    onClick={() => toggleStyle(style)}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${
                      styleTags.includes(style)
                        ? "bg-[#C6B4AB] text-black"
                        : "bg-white/5 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <Label className="text-white/90 mb-3 block">
                Wedding Style (select all that apply)
              </Label>
              <div className="flex flex-wrap gap-2">
                {WEDDING_STYLE_OPTIONS.map(style => (
                  <button
                    key={style}
                    onClick={() => toggleWeddingStyle(style)}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${
                      weddingStyles.includes(style)
                        ? "bg-[#C6B4AB] text-black"
                        : "bg-white/5 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <Label htmlFor="mustHaves" className="text-white/90 mb-3 block">
                Must-Haves (e.g., sea view, outdoor space, on-site
                accommodation)
              </Label>
              <textarea
                id="mustHaves"
                value={mustHaves}
                onChange={e => setMustHaves(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/20 text-white resize-none"
                placeholder="Tell us what's essential for your perfect venue..."
              />
            </div>

            <div className="mb-6">
              <Label className="text-white/90 mb-3 block">
                Preferred Venues
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {venues?.map((venue: { id: string; name: string }) => (
                  <button
                    key={venue.id}
                    onClick={() => toggleVenue(venue.id)}
                    className={`px-4 py-2 rounded-md text-sm text-left transition-colors ${
                      preferredVenues.includes(venue.id)
                        ? "bg-[#C6B4AB] text-black"
                        : "bg-white/5 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    {venue.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleSaveVision}
                disabled={upsertProfile.isPending}
                className="bg-[#C6B4AB] hover:bg-[#B5A49A] text-black"
              >
                {upsertProfile.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
