import Navigation from "@/components/Navigation";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useLocation } from "wouter";
import {
  Calendar,
  MapPin,
  CheckSquare,
  Clock,
  Heart,
  ListChecks,
  Sparkles,
  Users,
  Mail,
  FileText,
} from "lucide-react";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Reset test account mutation
  const resetTestAccount = trpc.profile.resetTestAccount.useMutation({
    onSuccess: () => {
      setLocation("/onboarding-full");
    },
    onError: error => {
      console.error("Reset failed:", error);
    },
  });

  const { data: profile, isLoading: profileLoading } =
    trpc.profile.get.useQuery(undefined, {
      enabled: !!user,
    });

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (user && profile && !profile.onboardingCompleted) {
      setLocation("/onboarding-full");
    }
  }, [user, profile, setLocation]);

  // Parse user priorities from onboarding data
  const userPriorities = profile?.onboardingData
    ? (() => {
        try {
          const data =
            typeof profile.onboardingData === "string"
              ? JSON.parse(profile.onboardingData)
              : profile.onboardingData;
          // Extract from nested structure: { full: formData, intent: intentData }
          const formData = data.full || data;
          return formData.priorities || [];
        } catch {
          return [];
        }
      })()
    : [];

  // Determine which sections to show
  // If no priorities (old users), show all sections (backward compatibility)
  const showAllSections = userPriorities.length === 0;
  const showVenues =
    showAllSections || userPriorities.includes("venue_recommendations");
  const { data: venues } = trpc.venues.getAll.useQuery();
  const { data: favoriteIds = [] } = trpc.venues.getFavoriteIds.useQuery(
    undefined,
    {
      enabled: !!user,
      retry: false,
    }
  );
  const { data: inquiries = [] } = trpc.inquiries.getUserInquiries.useQuery(
    undefined,
    {
      enabled: !!user,
      retry: false,
    }
  );
  const { data: budget } = trpc.budget.get.useQuery(undefined, {
    enabled: !!user,
    retry: false,
  });
  const { data: budgetCategories = [] } = trpc.budget.getCategories.useQuery(
    undefined,
    {
      enabled: !!user,
      retry: false,
    }
  );

  // Get favorited venues
  const favoritedVenues = venues?.filter(v => favoriteIds.includes(v.id)) || [];

  // Calculate budget totals
  const totalSpent = budgetCategories.reduce(
    (sum, cat) => sum + cat.actualSpend,
    0
  );
  const budgetRemaining = budget ? budget.totalBudget - totalSpent : 0;
  const formatCurrency = (amount: number) => {
    const symbol = budget?.currency === "EUR" ? "€" : "£";
    return `${symbol}${(amount / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const [tasks, setTasks] = useState([
    { id: 1, label: "Confirm guest numbers with venue", completed: false },
    {
      id: 2,
      label: "Review décor options and color palette",
      completed: false,
    },
    { id: 3, label: "Schedule tasting with caterer", completed: false },
    { id: 4, label: "Finalize ceremony music selections", completed: false },
  ]);

  const toggleTask = (id: number) => {
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Loading state
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="pt-32 container">
          <p className="font-sans text-center text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="pt-32 container max-w-2xl">
          <Card className="bg-white/5 border-[#C6B4AB]/20 backdrop-blur-sm">
            <CardContent className="pt-12 pb-12 text-center">
              <h2 className="font-serif text-3xl mb-4">
                Welcome to Your Planning Hub
              </h2>
              <p className="font-sans text-gray-300 mb-8">
                Sign in to start planning your dream Cyprus wedding
              </p>
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                className="bg-[#C6B4AB] hover:bg-[#B5A49B] text-black font-sans tracking-wider uppercase px-10 py-6"
              >
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // No profile yet - show onboarding prompt
  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-white font-sans">
        <Navigation />
        <div className="pt-32 pb-16 container max-w-3xl">
          <Card className="bg-white/5 border-[#C6B4AB]/20 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="w-20 h-20 bg-[#C6B4AB]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="text-[#C6B4AB]" size={40} />
              </div>
              <CardTitle className="font-serif text-4xl md:text-5xl text-white mb-4">
                Let's Set Up Your Planning Hub First
              </CardTitle>
              <CardDescription className="text-gray-300 text-lg font-sans">
                Answer a few quick questions to personalize your wedding
                planning experience
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-12">
              <Link href="/onboarding-full">
                <Button
                  size="lg"
                  className="bg-[#C6B4AB] hover:bg-[#B5A49B] text-black font-sans tracking-wider uppercase px-12 py-6 text-base"
                >
                  Start Setup
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Calculate days until wedding
  const calculateDaysToGo = () => {
    if (
      !profile.weddingDate ||
      profile.weddingDate === null ||
      profile.weddingDate === undefined
    ) {
      return null; // No date set
    }
    const today = new Date();
    const wedding = new Date(profile.weddingDate);
    const diffTime = wedding.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysToGo = calculateDaysToGo();
  const weddingDateFormatted = profile.weddingDate
    ? new Date(profile.weddingDate).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Not set";

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Navigation />

      <div className="pt-32 pb-16 container max-w-7xl">
        {/* Welcome Block */}
        <div className="mb-8 text-center">
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl mb-6 tracking-tight">
            {profile.onboardingCompleted === 1
              ? `Welcome back, ${profile.firstName}`
              : `Welcome, ${profile.firstName}! Let's get started`}
          </h1>

          {/* Test Account Reset Button */}
          {user?.email === "test@marrymeapp.com" && (
            <div className="mb-6">
              {!showResetConfirm ? (
                <Button
                  onClick={() => setShowResetConfirm(true)}
                  variant="outline"
                  className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                >
                  Reset Test Account
                </Button>
              ) : (
                <div className="flex gap-3 items-center">
                  <span className="text-gray-300 text-sm">Are you sure?</span>
                  <Button
                    onClick={() => resetTestAccount.mutate()}
                    disabled={resetTestAccount.isPending}
                    size="sm"
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    {resetTestAccount.isPending ? "Resetting..." : "Yes, Reset"}
                  </Button>
                  <Button
                    onClick={() => setShowResetConfirm(false)}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-gray-300"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-lg md:text-xl text-gray-300 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="text-[#C6B4AB]" size={20} />
              <span>{weddingDateFormatted}</span>
            </div>
            <div className="hidden md:block text-[#C6B4AB]">•</div>
            <div className="flex items-center gap-2">
              <MapPin className="text-[#C6B4AB]" size={20} />
              <span>{profile.location}, Cyprus</span>
            </div>
            <div className="hidden md:block text-[#C6B4AB]">•</div>
            <div className="flex items-center gap-2">
              <Users className="text-[#C6B4AB]" size={20} />
              <span>Approx. {profile.guestCount} guests</span>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <Clock className="text-[#C6B4AB]" size={24} />
            <span className="font-medium text-2xl text-[#C6B4AB]">
              {daysToGo === null
                ? "Set your wedding date"
                : daysToGo > 0
                  ? `${daysToGo} days to go`
                  : daysToGo === 0
                    ? "Today is the day!"
                    : "Your wedding has passed"}
            </span>
          </div>

          {/* Style Tags */}
          {profile.styleTags && profile.styleTags.length > 0 && (
            <div className="flex flex-wrap gap-3 justify-center">
              {profile.styleTags.map(style => (
                <span
                  key={style}
                  className="px-4 py-2 rounded-full bg-[#C6B4AB]/20 text-[#C6B4AB] font-sans text-sm tracking-wide border border-[#C6B4AB]/30"
                >
                  {style}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Wedding Snapshot Card */}
        <Card className="bg-white/5 border-[#C6B4AB]/20 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="font-serif text-3xl text-white flex items-center gap-3">
              <Heart className="text-[#C6B4AB]" size={28} />
              Wedding Snapshot
            </CardTitle>
            <CardDescription className="text-gray-400 font-sans">
              Your wedding details at a glance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-400 mb-1">Couple</p>
                <p className="text-white font-medium">
                  {profile.firstName} & {profile.partnerName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Date</p>
                <p className="text-white font-medium">{weddingDateFormatted}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Location</p>
                <p className="text-white font-medium">
                  {profile.location}, Cyprus
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Preferred Venue</p>
                <p className="text-white font-medium">
                  {profile.preferredVenueId && venues
                    ? (() => {
                        const venue = venues.find(
                          v => v.id === profile.preferredVenueId
                        );
                        return venue
                          ? `${venue.name}, ${venue.location}`
                          : "Still deciding – open to recommendations";
                      })()
                    : profile.preferredArea
                      ? `Preferred area: ${profile.preferredArea}`
                      : "Still deciding – open to recommendations"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Guest Count</p>
                <p className="text-white font-medium">
                  {profile.guestCount} guests
                </p>
              </div>
              {profile.budgetRange && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Budget</p>
                  <p className="text-white font-medium">
                    {profile.budgetRange}
                  </p>
                </div>
              )}
              {profile.email && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Contact Email</p>
                  <p className="text-white font-medium text-sm">
                    {profile.email}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <Link href="/profile">
                <Button
                  variant="outline"
                  className="border-[#C6B4AB] text-[#C6B4AB] hover:bg-[#C6B4AB] hover:text-black"
                >
                  Edit Wedding Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* My Shortlisted Venues */}
        {showVenues && (
          <Card className="bg-white/5 border-[#C6B4AB]/20 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="font-serif text-3xl text-white flex items-center gap-3">
                <Heart className="text-[#C6B4AB]" size={28} />
                My Shortlisted Venues
              </CardTitle>
              <CardDescription className="text-gray-400 font-sans">
                Your favorite venues at a glance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {favoritedVenues.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60 font-sans mb-4">
                    You haven't shortlisted any venues yet.
                  </p>
                  <Link href="/venues">
                    <Button
                      variant="outline"
                      className="border-[#C6B4AB] text-[#C6B4AB] hover:bg-[#C6B4AB] hover:text-black"
                    >
                      Browse Venues
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {favoritedVenues.slice(0, 3).map(venue => {
                      const venueSlug = (venue as any).slug || venue.id;
                      return (
                      <Link key={venue.id} href={`/venues/${venueSlug}`}>
                        <div className="group cursor-pointer">
                          <div className="relative aspect-[4/3] overflow-hidden mb-3 bg-white/5">
                            <img
                              src={venue.heroImageUrl}
                              alt={venue.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          </div>
                          <h3 className="font-serif text-xl text-white group-hover:text-[#C6B4AB] transition-colors mb-1">
                            {venue.name}
                          </h3>
                          <p className="text-white/60 text-sm font-sans flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            {venue.location}
                          </p>
                        </div>
                      </Link>
                      );
                    })}
                  </div>
                  {favoritedVenues.length > 0 && (
                    <div className="text-center">
                      <Link href="/venues?favorites=true">
                        <button className="text-[#C6B4AB] hover:text-white transition-colors font-sans text-sm">
                          View all favourites ({favoritedVenues.length})
                        </button>
                      </Link>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* My Inquiries */}
        <Card className="bg-white/5 border-[#C6B4AB]/20 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="font-serif text-3xl text-white flex items-center gap-3">
              <Mail className="text-[#C6B4AB]" size={28} />
              My Inquiries
            </CardTitle>
            <CardDescription className="text-gray-400 font-sans">
              Track your venue and collection enquiries
            </CardDescription>
          </CardHeader>
          <CardContent>
            {inquiries.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60 font-sans mb-4">
                  You haven't submitted any enquiries yet.
                </p>
                <Link href="/venues">
                  <Button
                    variant="outline"
                    className="border-[#C6B4AB] text-[#C6B4AB] hover:bg-[#C6B4AB] hover:text-black"
                  >
                    Browse Venues
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {inquiries.slice(0, 5).map(inquiry => {
                  const statusColors = {
                    pending:
                      "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
                    contacted:
                      "bg-blue-500/20 text-blue-300 border-blue-500/30",
                    booked:
                      "bg-green-500/20 text-green-300 border-green-500/30",
                  };

                  const inquiryTitle =
                    inquiry.venueName ||
                    inquiry.collectionName ||
                    "General Inquiry";
                  const inquirySubtitle =
                    inquiry.venueName && inquiry.venueLocation
                      ? inquiry.venueLocation
                      : inquiry.collectionName
                        ? "Collection Package"
                        : "";

                  const formattedDate = new Date(
                    inquiry.createdAt
                  ).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });

                  return (
                    <div
                      key={inquiry.id}
                      className="p-4 border border-white/10 rounded-lg hover:border-[#C6B4AB]/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-serif text-lg text-white mb-1">
                            {inquiryTitle}
                          </h4>
                          {inquirySubtitle && (
                            <p className="text-white/60 font-sans text-sm mb-2">
                              {inquirySubtitle}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-white/50 font-sans text-sm">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formattedDate}
                            </span>
                            {inquiry.weddingDate && (
                              <span>Wedding: {inquiry.weddingDate}</span>
                            )}
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-sans border capitalize ${
                            statusColors[
                              inquiry.status as keyof typeof statusColors
                            ]
                          }`}
                        >
                          {inquiry.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {inquiries.length > 5 && (
                  <p className="text-center text-white/60 font-sans text-sm pt-2">
                    Showing 5 of {inquiries.length} inquiries
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget Snapshot */}
        {budget && (
          <Card className="bg-white/5 border-[#C6B4AB]/20 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="font-serif text-3xl text-white flex items-center gap-3">
                <ListChecks className="text-[#C6B4AB]" size={28} />
                Budget Snapshot
              </CardTitle>
              <CardDescription className="text-gray-400 font-sans">
                Track your wedding spending
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Budget Overview */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-black/40 rounded-lg p-4 border border-white/10">
                    <p className="text-white/60 text-sm font-sans mb-1">
                      Total Budget
                    </p>
                    <p className="text-white font-serif text-2xl">
                      {formatCurrency(budget.totalBudget)}
                    </p>
                  </div>
                  <div className="bg-black/40 rounded-lg p-4 border border-white/10">
                    <p className="text-white/60 text-sm font-sans mb-1">
                      Spent
                    </p>
                    <p className="text-white font-serif text-2xl">
                      {formatCurrency(totalSpent)}
                    </p>
                  </div>
                  <div className="bg-black/40 rounded-lg p-4 border border-white/10">
                    <p className="text-white/60 text-sm font-sans mb-1">
                      Remaining
                    </p>
                    <p
                      className={`font-serif text-2xl ${budgetRemaining < 0 ? "text-red-500" : "text-[#C6B4AB]"}`}
                    >
                      {formatCurrency(budgetRemaining)}
                    </p>
                  </div>
                </div>

                {/* Top Categories */}
                {budgetCategories.filter(cat => cat.actualSpend > 0).length >
                  0 && (
                  <div>
                    <h4 className="text-white font-sans font-medium mb-3">
                      Top Spending
                    </h4>
                    <div className="space-y-2">
                      {budgetCategories
                        .filter(cat => cat.actualSpend > 0)
                        .sort((a, b) => b.actualSpend - a.actualSpend)
                        .slice(0, 3)
                        .map(category => {
                          const percentage =
                            category.allocatedAmount > 0
                              ? (category.actualSpend /
                                  category.allocatedAmount) *
                                100
                              : 0;
                          return (
                            <div
                              key={category.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-white/80 font-sans">
                                {category.categoryName}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-white font-sans">
                                  {formatCurrency(category.actualSpend)}
                                </span>
                                <span
                                  className={`text-xs ${percentage > 100 ? "text-red-500" : percentage >= 80 ? "text-yellow-500" : "text-white/50"}`}
                                >
                                  {percentage.toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                <Link href="/budget">
                  <Button className="w-full bg-[#C6B4AB] hover:bg-[#B5A49A] text-black font-sans">
                    View Full Budget
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dossier Library */}
        <Card className="bg-white/5 border-[#C6B4AB]/20 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="font-serif text-3xl text-white flex items-center gap-3">
              <FileText className="text-[#C6B4AB]" size={28} />
              Dossier Library
            </CardTitle>
            <CardDescription className="text-gray-400 font-sans">
              Browse venue and planning dossiers anytime
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-white/70 mb-6">
              Access curated guides, venue dossiers, and planning resources for
              your Cyprus wedding.
            </p>
            <Link href="/dossiers">
              <Button className="w-full bg-[#C6B4AB] hover:bg-[#B5A49A] text-black font-sans">
                Open Dossiers
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Today's Focus & Next Milestone */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Today's Focus */}
          <Card className="bg-white/5 border-[#C6B4AB]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-serif text-3xl text-white flex items-center gap-3">
                <CheckSquare className="text-[#C6B4AB]" size={28} />
                Today's Focus
              </CardTitle>
              <CardDescription className="text-gray-400 font-sans">
                Your priority tasks for today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => toggleTask(task.id)}
                  >
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(task.id)}
                      className="border-[#C6B4AB] data-[state=checked]:bg-[#C6B4AB] data-[state=checked]:border-[#C6B4AB] mt-1"
                    />
                    <label
                      htmlFor={`task-${task.id}`}
                      className={`font-sans text-base flex-1 cursor-pointer transition-all ${
                        task.completed
                          ? "line-through text-gray-500"
                          : "text-white"
                      }`}
                    >
                      {task.label}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Next Milestone */}
          <Card className="bg-white/5 border-[#C6B4AB]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-serif text-3xl text-white flex items-center gap-3">
                <Sparkles className="text-[#C6B4AB]" size={28} />
                Next Milestone
              </CardTitle>
              <CardDescription className="text-gray-400 font-sans">
                6 Months Before
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-white font-sans">
                  <span className="text-[#C6B4AB] mt-1">•</span>
                  <span>Finalize venue contract and deposit</span>
                </li>
                <li className="flex items-start gap-3 text-white font-sans">
                  <span className="text-[#C6B4AB] mt-1">•</span>
                  <span>Send save-the-date cards to guests</span>
                </li>
                <li className="flex items-start gap-3 text-white font-sans">
                  <span className="text-[#C6B4AB] mt-1">•</span>
                  <span>Book photographer and videographer</span>
                </li>
                <li className="flex items-start gap-3 text-white font-sans">
                  <span className="text-[#C6B4AB] mt-1">•</span>
                  <span>Begin dress shopping appointments</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="font-serif text-3xl md:text-4xl mb-8 text-center text-white">
            Continue Your Journey
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/my-quote-brief">
              <Card className="bg-white/5 border-[#C6B4AB]/20 backdrop-blur-sm hover:bg-white/10 transition-all cursor-pointer group h-full">
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 bg-[#C6B4AB]/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#C6B4AB]/30 transition-colors">
                    <Mail className="text-[#C6B4AB]" size={28} />
                  </div>
                  <h3 className="font-serif text-xl mb-2 text-white">
                    Request Status
                  </h3>
                  <p className="font-sans text-sm text-gray-400">
                    Track updates and refine your request
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/venues">
              <Card className="bg-white/5 border-[#C6B4AB]/20 backdrop-blur-sm hover:bg-white/10 transition-all cursor-pointer group h-full">
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 bg-[#C6B4AB]/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#C6B4AB]/30 transition-colors">
                    <Heart className="text-[#C6B4AB]" size={28} />
                  </div>
                  <h3 className="font-serif text-xl mb-2 text-white">
                    Venues
                  </h3>
                  <p className="font-sans text-sm text-gray-400">
                    Browse and shortlist favorites
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/collections">
              <Card className="bg-white/5 border-[#C6B4AB]/20 backdrop-blur-sm hover:bg-white/10 transition-all cursor-pointer group h-full">
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 bg-[#C6B4AB]/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#C6B4AB]/30 transition-colors">
                    <Heart className="text-[#C6B4AB]" size={28} />
                  </div>
                  <h3 className="font-serif text-xl mb-2 text-white">
                    Collections
                  </h3>
                  <p className="font-sans text-sm text-gray-400">
                    Explore curated wedding collections
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dossiers">
              <Card className="bg-white/5 border-[#C6B4AB]/20 backdrop-blur-sm hover:bg-white/10 transition-all cursor-pointer group h-full">
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 bg-[#C6B4AB]/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#C6B4AB]/30 transition-colors">
                    <FileText className="text-[#C6B4AB]" size={28} />
                  </div>
                  <h3 className="font-serif text-xl mb-2 text-white">
                    Dossiers
                  </h3>
                  <p className="font-sans text-sm text-gray-400">
                    Open planning guides and references
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/planning">
              <Card className="bg-white/5 border-[#C6B4AB]/20 backdrop-blur-sm hover:bg-white/10 transition-all cursor-pointer group h-full">
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 bg-[#C6B4AB]/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#C6B4AB]/30 transition-colors">
                    <ListChecks className="text-[#C6B4AB]" size={28} />
                  </div>
                  <h3 className="font-serif text-xl mb-2 text-white">
                    Planning
                  </h3>
                  <p className="font-sans text-sm text-gray-400">
                    Track your checklist
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/budget">
              <Card className="bg-white/5 border-[#C6B4AB]/20 backdrop-blur-sm hover:bg-white/10 transition-all cursor-pointer group h-full">
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 bg-[#C6B4AB]/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#C6B4AB]/30 transition-colors">
                    <CheckSquare className="text-[#C6B4AB]" size={28} />
                  </div>
                  <h3 className="font-serif text-xl mb-2 text-white">
                    Budget
                  </h3>
                  <p className="font-sans text-sm text-gray-400">
                    Monitor spend and targets
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/profile">
              <Card className="bg-white/5 border-[#C6B4AB]/20 backdrop-blur-sm hover:bg-white/10 transition-all cursor-pointer group h-full">
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 bg-[#C6B4AB]/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#C6B4AB]/30 transition-colors">
                    <Users className="text-[#C6B4AB]" size={28} />
                  </div>
                  <h3 className="font-serif text-xl mb-2 text-white">
                    Wedding Profile
                  </h3>
                  <p className="font-sans text-sm text-gray-400">
                    Update your wedding profile details
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-br from-[#C6B4AB]/10 to-[#C6B4AB]/5 border-[#C6B4AB]/30 backdrop-blur-sm">
            <CardContent className="py-12">
              <h3 className="font-serif text-3xl md:text-4xl mb-4 text-white">
                Need Help Planning?
              </h3>
              <p className="font-sans text-lg text-gray-300 mb-6 max-w-2xl mx-auto">
                Our expert wedding planners are here to guide you through every
                step of your Cyprus wedding journey
              </p>
              <Link href="/my-quote-brief">
                <Button
                  size="lg"
                  className="bg-[#C6B4AB] hover:bg-[#B5A49B] text-black font-sans tracking-wider uppercase px-10 py-6"
                >
                  Continue Wedding Request
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
