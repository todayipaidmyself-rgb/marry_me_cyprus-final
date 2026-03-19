import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";

type Step = 1 | 2 | 3 | 4;

type FormData = {
  // Step 1: Intent & Basic Information (8 questions)
  user_role: string;
  intent_reason: string;
  priorities: string[];
  fullName: string;
  email: string;
  phone: string;
  weddingSeason: string;
  weddingLocation: string;

  // Step 2: Wedding Vision & Style (4 questions)
  weddingDate: string;
  guestCount: string;
  venueTypes: string[];
  atmospheres: string[];

  // Step 3: Priorities & Budget (4 questions)
  budgetRange: string;
  eventPriorities: string[];
  mmcPackages: string[];
  travelHelp: string;

  // Step 4: Planner Needs & Details (8 questions)
  dateFlexibility: string;
  ceremonyTime: string;
  accessibilityNeeds: string;
  compulsoryElements: string;
  absoluteNOs: string;
  vendorHelp: string[];
  culturalElements: string;
  venueRecommendations: string;
};

export default function OnboardingFull() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const utils = trpc.useUtils();
  const STEP_LABELS: Record<Step, string> = {
    1: "Onboarding Setup",
    2: "Wedding Basics",
    3: "Light Preparation",
    4: "Final Preferences",
  };

  // Get current user for email pre-fill
  const { data: user } = trpc.auth.me.useQuery(undefined, { retry: false });

  const [formData, setFormData] = useState<FormData>({
    // Step 1: Intent & Basic Information
    user_role: "",
    intent_reason: "",
    priorities: [],
    fullName: "",
    email: user?.email ?? "",
    phone: "",
    weddingSeason: "",
    weddingLocation: "",
    // Step 2
    weddingDate: "",
    guestCount: "",
    venueTypes: [],
    atmospheres: [],
    // Step 3
    budgetRange: "",
    eventPriorities: [],
    mmcPackages: [],
    travelHelp: "",
    // Step 4
    dateFlexibility: "",
    ceremonyTime: "",
    accessibilityNeeds: "",
    compulsoryElements: "",
    absoluteNOs: "",
    vendorHelp: [],
    culturalElements: "",
    venueRecommendations: "",
  });

  // Update email when user data loads
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email ?? "" }));
    } else {
      const saved =
        typeof window !== "undefined"
          ? localStorage.getItem("onboarding-draft")
          : null;
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as FormData;
          setFormData(prev => ({ ...prev, ...parsed }));
        } catch (_err) {
          // ignore parse errors
        }
      }
    }
  }, [user]);

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field: keyof FormData, value: string) => {
    setFormData(prev => {
      const currentArray = prev[field] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray };
    });
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as Step);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
      window.scrollTo(0, 0);
    }
  };

  const submitFormMutation = trpc.profile.saveFullOnboarding.useMutation({
    onSuccess: async () => {
      await utils.profile.get.invalidate();
      await utils.profile.checkOnboardingStatus.invalidate();
      toast.success("Setup saved", {
        description: "Next: complete your Wedding Request to brief your planner.",
      });
      setTimeout(() => {
        setLocation("/my-quote");
      }, 100);
    },
    onError: err => {
      // Graceful fallback: save locally and continue
      try {
        localStorage.setItem("onboarding-draft", JSON.stringify(formData));
      } catch (_err) {
        // ignore
      }
      toast.message("Setup saved locally", {
        description:
          "Sign in later to persist. Next: continue your Wedding Request.",
      });
      setLocation("/my-quote");
    },
  });

  const handleSubmit = () => {
    // Validate required fields
    if (
      !formData.user_role ||
      !formData.intent_reason ||
      formData.priorities.length === 0
    ) {
      toast.error("Please answer the intent questions");
      return;
    }
    if (!formData.fullName || !formData.email || !formData.phone) {
      toast.error("Please fill Full Name, Email, and Phone");
      return;
    }
    if (!formData.budgetRange) {
      toast.error("Please select a budget range");
      return;
    }

    // If unauthenticated, store locally and move on
    if (!user) {
      try {
        localStorage.setItem("onboarding-draft", JSON.stringify(formData));
        toast.success("Setup saved locally", {
          description: "Next: continue your Wedding Request.",
        });
        setLocation("/my-quote");
      } catch (err) {
        toast.error("Failed to save locally");
      }
      return;
    }

    submitFormMutation.mutate({
      onboardingData: JSON.stringify(formData),
      intentData: null,
    });
  };

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-12 text-center">
          <p className="text-[#C6B4AB] text-sm tracking-widest uppercase mb-4">
            Step {currentStep} of 4 • {STEP_LABELS[currentStep]}
          </p>
          <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
            <div
              className="bg-[#C6B4AB] h-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
          <p className="text-white/60 text-sm mt-4 max-w-2xl mx-auto">
            This setup captures your profile and wedding basics. Detailed service
            planning and planner handoff happens next in your Wedding Request.
          </p>
        </div>

        {/* Step 1: Intent & Basic Information (8 questions) */}
        {currentStep === 1 && (
          <div className="space-y-8">
            <div className="text-center space-y-4 mb-12">
              <h1 className="font-serif text-4xl md:text-5xl">
                Onboarding Setup
              </h1>
              <p
                className="text-white/70 text-lg"
                style={{ lineHeight: "1.8" }}
              >
                Start with your details so we can personalize your planning space.
              </p>
            </div>

            <div className="space-y-12">
              {/* Intent Question 1: Who are you? */}
              <div className="space-y-4">
                <label className="block text-lg font-medium text-[#C6B4AB]">
                  Who are you? *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Bride", value: "bride" },
                    { label: "Groom", value: "groom" },
                    { label: "Wedding Planner", value: "planner" },
                    { label: "Family Member / Guest", value: "family_guest" },
                  ].map(role => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => updateField("user_role", role.value)}
                      className={`p-6 border-2 rounded-lg transition-all ${
                        formData.user_role === role.value
                          ? "border-[#C6B4AB] bg-[#C6B4AB]/10"
                          : "border-white/20 hover:border-[#C6B4AB]/50"
                      }`}
                    >
                      <span className="text-lg">{role.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Intent Question 2: Why are you here? */}
              <div className="space-y-4">
                <label className="block text-lg font-medium text-[#C6B4AB]">
                  Why are you here? *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Planning a wedding", value: "planning" },
                    { label: "Helping plan a wedding", value: "helping" },
                    { label: "Browsing for inspiration", value: "browsing" },
                    { label: "Managing guest list", value: "managing" },
                  ].map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateField("intent_reason", option.value)}
                      className={`p-6 border-2 rounded-lg transition-all ${
                        formData.intent_reason === option.value
                          ? "border-[#C6B4AB] bg-[#C6B4AB]/10"
                          : "border-white/20 hover:border-[#C6B4AB]/50"
                      }`}
                    >
                      <span className="text-lg">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Intent Question 3: What do you need? */}
              <div className="space-y-4">
                <label className="block text-lg font-medium text-[#C6B4AB]">
                  What do you need? *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      label: "Venue recommendations",
                      value: "venue_recommendations",
                    },
                    { label: "Timeline & checklist", value: "timeline" },
                    { label: "Guest management", value: "guest_management" },
                    { label: "Budget planning", value: "budget_planning" },
                    { label: "All of the above", value: "all" },
                  ].map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        if (option.value === "all") {
                          updateField("priorities", [
                            "venue_recommendations",
                            "timeline",
                            "guest_management",
                            "budget_planning",
                          ]);
                        } else {
                          toggleArrayField("priorities", option.value);
                        }
                      }}
                      className={`p-6 border-2 rounded-lg transition-all ${
                        option.value === "all"
                          ? formData.priorities.length === 4
                            ? "border-[#C6B4AB] bg-[#C6B4AB]/10"
                            : "border-white/20 hover:border-[#C6B4AB]/50"
                          : formData.priorities.includes(option.value)
                            ? "border-[#C6B4AB] bg-[#C6B4AB]/10"
                            : "border-white/20 hover:border-[#C6B4AB]/50"
                      }`}
                    >
                      <span className="text-lg">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Basic Info Question 1: Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-[#C6B4AB]">
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={e => updateField("fullName", e.target.value)}
                  placeholder="Your full name"
                  className="bg-white/5 border-white/20 text-white"
                  required
                />
              </div>

              {/* Basic Info Question 2: Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#C6B4AB]">
                  Where do we send your plan to? *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={e => updateField("email", e.target.value)}
                  placeholder="your.email@example.com"
                  className="bg-white/5 border-white/20 text-white"
                  required
                />
              </div>

              {/* Basic Info Question 3: Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-[#C6B4AB]">
                  Phone *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={e => updateField("phone", e.target.value)}
                  placeholder="+44 or +357"
                  className="bg-white/5 border-white/20 text-white"
                  required
                />
              </div>

              {/* Basic Info Question 4: Wedding Season */}
              <div className="space-y-2">
                <Label htmlFor="weddingSeason" className="text-[#C6B4AB]">
                  What month or season are you hoping for?
                </Label>
                <Select
                  value={formData.weddingSeason}
                  onValueChange={value => updateField("weddingSeason", value)}
                >
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Select season or month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spring">Spring</SelectItem>
                    <SelectItem value="summer">Summer</SelectItem>
                    <SelectItem value="autumn">Autumn</SelectItem>
                    <SelectItem value="winter">Winter</SelectItem>
                    <SelectItem value="april-june">April-June</SelectItem>
                    <SelectItem value="july-september">
                      July-September
                    </SelectItem>
                    <SelectItem value="october-december">
                      October-December
                    </SelectItem>
                    <SelectItem value="january-march">January-March</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Basic Info Question 5: Wedding Location */}
              <div className="space-y-2">
                <Label htmlFor="weddingLocation" className="text-[#C6B4AB]">
                  Wedding Location
                </Label>
                <Select
                  value={formData.weddingLocation}
                  onValueChange={value => updateField("weddingLocation", value)}
                >
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paphos">Paphos</SelectItem>
                    <SelectItem value="limassol">Limassol</SelectItem>
                    <SelectItem value="ayia-napa">Ayia Napa</SelectItem>
                    <SelectItem value="protaras">Protaras</SelectItem>
                    <SelectItem value="larnaca">Larnaca</SelectItem>
                    <SelectItem value="nicosia">Nicosia</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end pt-8">
              <Button
                onClick={() => {
                  // Validate Intent questions before proceeding
                  if (
                    !formData.user_role ||
                    !formData.intent_reason ||
                    formData.priorities.length === 0
                  ) {
                    alert(
                      "Please answer all setup questions (Who are you?, Why are you here?, What do you need?)"
                    );
                    return;
                  }
                  if (
                    !formData.fullName ||
                    !formData.email ||
                    !formData.phone
                  ) {
                    alert(
                      "Please fill in all required fields: Full Name, Email, and Phone"
                    );
                    return;
                  }
                  nextStep();
                }}
                className="bg-[#C6B4AB] hover:bg-[#B5A399] text-black px-8 py-6 text-lg"
              >
                Continue <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Wedding Vision & Style (4 questions) */}
        {currentStep === 2 && (
          <div className="space-y-8">
            <div className="text-center space-y-4 mb-12">
              <h1 className="font-serif text-4xl md:text-5xl">
                Wedding Basics
              </h1>
              <p
                className="text-white/70 text-lg"
                style={{ lineHeight: "1.8" }}
              >
                Add the essentials now. You will define detailed services in your Wedding Request next.
              </p>
            </div>

            <div className="space-y-12">
              <div className="space-y-2">
                <Label htmlFor="weddingDate" className="text-[#C6B4AB]">
                  Do you already have a preferred wedding date?
                </Label>
                <Input
                  id="weddingDate"
                  type="date"
                  value={formData.weddingDate}
                  onChange={e => updateField("weddingDate", e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guestCount" className="text-[#C6B4AB]">
                  Rough guest count?
                </Label>
                <Input
                  id="guestCount"
                  type="number"
                  value={formData.guestCount}
                  onChange={e => updateField("guestCount", e.target.value)}
                  placeholder="Approximate number of guests"
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-[#C6B4AB]">
                  What type of venue do you love?
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "Beachfront",
                    "Garden",
                    "Historic Estate",
                    "Modern Hotel",
                    "Rooftop",
                    "Villa",
                    "Countryside",
                    "Other",
                  ].map(venue => (
                    <div key={venue} className="flex items-center space-x-2">
                      <Checkbox
                        id={`venue-${venue}`}
                        checked={formData.venueTypes.includes(
                          venue.toLowerCase().replace(/ /g, "-")
                        )}
                        onCheckedChange={() =>
                          toggleArrayField(
                            "venueTypes",
                            venue.toLowerCase().replace(/ /g, "-")
                          )
                        }
                      />
                      <label
                        htmlFor={`venue-${venue}`}
                        className="text-white/80 text-sm cursor-pointer"
                      >
                        {venue}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[#C6B4AB]">
                  What atmosphere are you imagining?
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "Elegant & Modern",
                    "Rustic & Natural",
                    "Romantic & Intimate",
                    "Glamorous & Luxe",
                    "Relaxed & Casual",
                    "Boho Chic",
                    "Traditional",
                    "Other",
                  ].map(atmosphere => (
                    <div
                      key={atmosphere}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`atmosphere-${atmosphere}`}
                        checked={formData.atmospheres.includes(
                          atmosphere
                            .toLowerCase()
                            .replace(/ & /g, "-")
                            .replace(/ /g, "-")
                        )}
                        onCheckedChange={() =>
                          toggleArrayField(
                            "atmospheres",
                            atmosphere
                              .toLowerCase()
                              .replace(/ & /g, "-")
                              .replace(/ /g, "-")
                          )
                        }
                      />
                      <label
                        htmlFor={`atmosphere-${atmosphere}`}
                        className="text-white/80 text-sm cursor-pointer"
                      >
                        {atmosphere}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-8">
              <Button
                onClick={prevStep}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg"
              >
                <ArrowLeft className="mr-2 h-5 w-5" /> Back
              </Button>
              <Button
                onClick={nextStep}
                className="bg-[#C6B4AB] hover:bg-[#B5A399] text-black px-8 py-6 text-lg"
              >
                Continue <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Priorities & Budget (4 questions) */}
        {currentStep === 3 && (
          <div className="space-y-8">
            <div className="text-center space-y-4 mb-12">
              <h1 className="font-serif text-4xl md:text-5xl">
                Light Preparation
              </h1>
              <p
                className="text-white/70 text-lg"
                style={{ lineHeight: "1.8" }}
              >
                Share high-level preferences now. Service-by-service planning comes in your Wedding Request.
              </p>
            </div>

            <div className="space-y-12">
              <div className="space-y-2">
                <Label htmlFor="budgetRange" className="text-[#C6B4AB]">
                  What's your total wedding budget? *
                </Label>
                <Select
                  value={formData.budgetRange}
                  onValueChange={value => updateField("budgetRange", value)}
                  required
                >
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-10k">Under $10,000</SelectItem>
                    <SelectItem value="10k-25k">$10,000 - $25,000</SelectItem>
                    <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                    <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                    <SelectItem value="100k-250k">
                      $100,000 - $250,000
                    </SelectItem>
                    <SelectItem value="250k-plus">$250,000+</SelectItem>
                    <SelectItem value="undecided">Undecided</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-[#C6B4AB]">
                  What are your biggest priorities?
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "Amazing venue",
                    "Stunning photography",
                    "Incredible food",
                    "Live entertainment",
                    "Floral design",
                    "Guest experience",
                    "Unique décor",
                    "Other",
                  ].map(priority => (
                    <div key={priority} className="flex items-center space-x-2">
                      <Checkbox
                        id={`event-priority-${priority}`}
                        checked={formData.eventPriorities.includes(
                          priority.toLowerCase().replace(/ /g, "-")
                        )}
                        onCheckedChange={() =>
                          toggleArrayField(
                            "eventPriorities",
                            priority.toLowerCase().replace(/ /g, "-")
                          )
                        }
                      />
                      <label
                        htmlFor={`event-priority-${priority}`}
                        className="text-white/80 text-sm cursor-pointer"
                      >
                        {priority}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[#C6B4AB]">
                  Are you interested in any MMC packages?
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "Full planning",
                    "Partial planning",
                    "Month-of coordination",
                    "Venue sourcing only",
                    "Design & styling",
                    "Not sure yet",
                  ].map(pkg => (
                    <div key={pkg} className="flex items-center space-x-2">
                      <Checkbox
                        id={`package-${pkg}`}
                        checked={formData.mmcPackages.includes(
                          pkg.toLowerCase().replace(/ /g, "-")
                        )}
                        onCheckedChange={() =>
                          toggleArrayField(
                            "mmcPackages",
                            pkg.toLowerCase().replace(/ /g, "-")
                          )
                        }
                      />
                      <label
                        htmlFor={`package-${pkg}`}
                        className="text-white/80 text-sm cursor-pointer"
                      >
                        {pkg}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="travelHelp" className="text-[#C6B4AB]">
                  Do you need help arranging travel or accommodation?
                </Label>
                <Select
                  value={formData.travelHelp}
                  onValueChange={value => updateField("travelHelp", value)}
                >
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes please</SelectItem>
                    <SelectItem value="no">No thanks</SelectItem>
                    <SelectItem value="maybe">Maybe later</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between pt-8">
              <Button
                onClick={prevStep}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg"
              >
                <ArrowLeft className="mr-2 h-5 w-5" /> Back
              </Button>
              <Button
                onClick={nextStep}
                className="bg-[#C6B4AB] hover:bg-[#B5A399] text-black px-8 py-6 text-lg"
              >
                Continue <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Planner Needs & Details (8 questions) */}
        {currentStep === 4 && (
          <div className="space-y-8">
            <div className="text-center space-y-4 mb-12">
              <h1 className="font-serif text-4xl md:text-5xl">
                Final Preferences
              </h1>
              <p
                className="text-white/70 text-lg"
                style={{ lineHeight: "1.8" }}
              >
                Finalize your profile context, then continue to your Wedding Request for planner handoff.
              </p>
            </div>

            <div className="space-y-12">
              <div className="space-y-2">
                <Label htmlFor="dateFlexibility" className="text-[#C6B4AB]">
                  Are you flexible on dates or do you require a specific day?
                </Label>
                <Select
                  value={formData.dateFlexibility}
                  onValueChange={value => updateField("dateFlexibility", value)}
                >
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flexible-season">
                      Flexible within a season
                    </SelectItem>
                    <SelectItem value="flexible-month">
                      Flexible within a month
                    </SelectItem>
                    <SelectItem value="specific-date">
                      Must be a specific date
                    </SelectItem>
                    <SelectItem value="not-decided">Not decided yet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ceremonyTime" className="text-[#C6B4AB]">
                  Do you prefer a sunset ceremony or earlier in the day?
                </Label>
                <Select
                  value={formData.ceremonyTime}
                  onValueChange={value => updateField("ceremonyTime", value)}
                >
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sunset">Sunset ceremony</SelectItem>
                    <SelectItem value="earlier">Earlier in the day</SelectItem>
                    <SelectItem value="no-preference">No preference</SelectItem>
                    <SelectItem value="not-sure">Not sure yet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accessibilityNeeds" className="text-[#C6B4AB]">
                  Any accessibility needs for guests?
                </Label>
                <Textarea
                  id="accessibilityNeeds"
                  value={formData.accessibilityNeeds}
                  onChange={e =>
                    updateField("accessibilityNeeds", e.target.value)
                  }
                  placeholder="e.g., Wheelchair access, dietary requirements…"
                  className="bg-white/5 border-white/20 text-white min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="compulsoryElements" className="text-[#C6B4AB]">
                  Any compulsory elements your wedding MUST include?
                </Label>
                <Textarea
                  id="compulsoryElements"
                  value={formData.compulsoryElements}
                  onChange={e =>
                    updateField("compulsoryElements", e.target.value)
                  }
                  placeholder="e.g., Live band, specific flowers, family traditions…"
                  className="bg-white/5 border-white/20 text-white min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="absoluteNOs" className="text-[#C6B4AB]">
                  Any absolute NOs?
                </Label>
                <Textarea
                  id="absoluteNOs"
                  value={formData.absoluteNOs}
                  onChange={e => updateField("absoluteNOs", e.target.value)}
                  placeholder="Things you definitely don't want…"
                  className="bg-white/5 border-white/20 text-white min-h-[100px]"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-[#C6B4AB]">
                  Do you want help organising:
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "Photographer",
                    "Videographer",
                    "Florist",
                    "Hair & makeup",
                    "Entertainment",
                    "Transport",
                    "Other vendors",
                  ].map(vendor => (
                    <div key={vendor} className="flex items-center space-x-2">
                      <Checkbox
                        id={`vendor-${vendor}`}
                        checked={formData.vendorHelp.includes(
                          vendor
                            .toLowerCase()
                            .replace(/ & /g, "-")
                            .replace(/ /g, "-")
                        )}
                        onCheckedChange={() =>
                          toggleArrayField(
                            "vendorHelp",
                            vendor
                              .toLowerCase()
                              .replace(/ & /g, "-")
                              .replace(/ /g, "-")
                          )
                        }
                      />
                      <label
                        htmlFor={`vendor-${vendor}`}
                        className="text-white/80 text-sm cursor-pointer"
                      >
                        {vendor}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="culturalElements" className="text-[#C6B4AB]">
                  Are there cultural, religious, or traditional elements we
                  should honour?
                </Label>
                <Textarea
                  id="culturalElements"
                  value={formData.culturalElements}
                  onChange={e =>
                    updateField("culturalElements", e.target.value)
                  }
                  placeholder="Tell us about any traditions or customs…"
                  className="bg-white/5 border-white/20 text-white min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="venueRecommendations"
                  className="text-[#C6B4AB]"
                >
                  Would you like us to recommend venues that match your style?
                </Label>
                <Select
                  value={formData.venueRecommendations}
                  onValueChange={value =>
                    updateField("venueRecommendations", value)
                  }
                >
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes please</SelectItem>
                    <SelectItem value="no">No thanks</SelectItem>
                    <SelectItem value="have-venue">
                      I already have a venue in mind
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between pt-8">
              <Button
                onClick={prevStep}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg"
              >
                <ArrowLeft className="mr-2 h-5 w-5" /> Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitFormMutation.isPending}
                className="bg-[#C6B4AB] hover:bg-[#B5A399] text-black px-8 py-6 text-lg"
              >
                {submitFormMutation.isPending
                  ? "Saving..."
                  : "Save & Continue to Wedding Request"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
