import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
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
import {
  ChevronDown,
  ChevronUp,
  Edit,
  Save,
  X,
  CheckCircle2,
  Share2,
  Copy,
  Check,
} from "lucide-react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

type FormData = {
  user_role: string;
  intent_reason: string;
  priorities: string[];
  fullName: string;
  email: string;
  phone: string;
  weddingSeason: string;
  weddingLocation: string;
  weddingDate: string;
  guestCount: string;
  venueTypes: string[];
  atmospheres: string[];
  budgetRange: string;
  eventPriorities: string[];
  mmcPackages: string[];
  travelHelp: string;
  dateFlexibility: string;
  ceremonyTime: string;
  accessibilityNeeds: string;
  compulsoryElements: string;
  absoluteNOs: string;
  vendorHelp: string[];
  culturalElements: string;
  venueRecommendations: string;
  additionalInfo: string;
};

export default function WeddingProfile() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [expandedSections, setExpandedSections] = useState<
    Record<number, boolean>
  >({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
  });

  const { data: profile, isLoading: profileLoading } =
    trpc.profile.get.useQuery(undefined, {
      enabled: !!user,
    });

  const [formData, setFormData] = useState<FormData>({
    user_role: "",
    intent_reason: "",
    priorities: [],
    fullName: "",
    email: "",
    phone: "",
    weddingSeason: "",
    weddingLocation: "",
    weddingDate: "",
    guestCount: "",
    venueTypes: [],
    atmospheres: [],
    budgetRange: "",
    eventPriorities: [],
    mmcPackages: [],
    travelHelp: "",
    dateFlexibility: "",
    ceremonyTime: "",
    accessibilityNeeds: "",
    compulsoryElements: "",
    absoluteNOs: "",
    vendorHelp: [],
    culturalElements: "",
    venueRecommendations: "",
    additionalInfo: "",
  });

  // Load profile data
  useEffect(() => {
    if (profile?.onboardingData) {
      try {
        const data =
          typeof profile.onboardingData === "string"
            ? JSON.parse(profile.onboardingData)
            : profile.onboardingData;
        // Extract from nested structure: { full: formData, intent: intentData }
        const formData = data.full || data;
        setFormData(formData);
      } catch (error) {
        console.error("Failed to parse onboarding data:", error);
      }
    }
  }, [profile]);

  const utils = trpc.useUtils();
  const saveProfileMutation = trpc.profile.saveFullOnboarding.useMutation({
    onSuccess: async () => {
      await utils.profile.get.invalidate();
      setIsEditMode(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
  });

  const generateShareLinkMutation = trpc.share.generateLink.useMutation({
    onSuccess: data => {
      console.log("[Frontend] Received share link data:", data);
      console.log("[Frontend] Share token:", data.shareToken);
      console.log("[Frontend] URL:", data.url);
      const fullUrl = `${window.location.origin}${data.url}`;
      console.log("[Frontend] Full URL:", fullUrl);
      setShareUrl(fullUrl);
      setShowShareModal(true);
    },
  });

  const handleSave = () => {
    saveProfileMutation.mutate({
      onboardingData: JSON.stringify(formData),
      intentData: null,
    });
  };

  const handleGenerateShareLink = () => {
    generateShareLinkMutation.mutate();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleCancel = () => {
    // Reload original data
    if (profile?.onboardingData) {
      try {
        const data =
          typeof profile.onboardingData === "string"
            ? JSON.parse(profile.onboardingData)
            : profile.onboardingData;
        // Extract from nested structure: { full: formData, intent: intentData }
        const formData = data.full || data;
        setFormData(formData);
      } catch (error) {
        console.error("Failed to parse onboarding data:", error);
      }
    }
    setIsEditMode(false);
  };

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field: keyof FormData, value: string) => {
    setFormData(prev => {
      const currentArray = (prev[field] as string[]) || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray };
    });
  };

  const toggleSection = (section: number) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const formatLabel = (key: string): string => {
    const labels: Record<string, string> = {
      user_role: "Who are you?",
      intent_reason: "Why are you here?",
      priorities: "What do you need?",
      fullName: "Full Name",
      email: "Email",
      phone: "Phone",
      weddingSeason: "Wedding Season",
      weddingLocation: "Wedding Location",
      weddingDate: "Preferred Wedding Date",
      guestCount: "Rough Guest Count",
      venueTypes: "Venue Types",
      atmospheres: "Wedding Atmosphere",
      budgetRange: "Total Wedding Budget",
      eventPriorities: "Biggest Priorities",
      mmcPackages: "MMC Packages",
      travelHelp: "Travel/Accommodation Help",
      dateFlexibility: "Date Flexibility",
      ceremonyTime: "Ceremony Time Preference",
      accessibilityNeeds: "Accessibility Needs",
      compulsoryElements: "Compulsory Elements",
      absoluteNOs: "Absolute NOs",
      vendorHelp: "Vendor Help Needed",
      culturalElements: "Cultural/Religious Elements",
      venueRecommendations: "Venue Recommendations",
      additionalInfo: "Additional Information",
    };
    return labels[key] || key;
  };

  const formatValue = (value: any): string => {
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(", ") : "Not specified";
    }
    if (typeof value === "string" && value.trim() === "") {
      return "Not specified";
    }
    return value || "Not specified";
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C6B4AB] mx-auto mb-4"></div>
          <p className="text-white/70">Loading your wedding profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-white/70">
            Please log in to view your wedding profile
          </p>
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            className="bg-[#C6B4AB] hover:bg-[#B5A399] text-black"
          >
            Log In
          </Button>
        </div>
      </div>
    );
  }

  const sections = [
    {
      id: 1,
      title: "Your Intent",
      fields: ["user_role", "intent_reason", "priorities"],
    },
    {
      id: 2,
      title: "Wedding Essentials",
      fields: [
        "weddingDate",
        "weddingLocation",
        "weddingSeason",
        "guestCount",
        "budgetRange",
      ],
    },
    {
      id: 3,
      title: "Wedding Style",
      fields: ["venueTypes", "atmospheres", "eventPriorities"],
    },
    {
      id: 4,
      title: "Priorities & Preferences",
      fields: [
        "mmcPackages",
        "travelHelp",
        "dateFlexibility",
        "ceremonyTime",
        "accessibilityNeeds",
      ],
    },
    {
      id: 5,
      title: "Planner Needs",
      fields: [
        "compulsoryElements",
        "absoluteNOs",
        "vendorHelp",
        "culturalElements",
        "venueRecommendations",
      ],
    },
    {
      id: 6,
      title: "Additional Information",
      fields: ["fullName", "email", "phone", "additionalInfo"],
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-6 mb-12">
          <h1 className="font-serif text-5xl md:text-6xl">Wedding Profile</h1>
          <p className="text-white/70 text-lg">
            Your complete wedding planning information
          </p>

          {/* Success Message */}
          {showSuccess && (
            <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4 flex items-center justify-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-green-500">
                Profile updated successfully!
              </span>
            </div>
          )}

          {/* Edit/Save Buttons */}
          <div className="flex justify-center space-x-4">
            {!isEditMode ? (
              <>
                <Button
                  onClick={() => setIsEditMode(true)}
                  className="bg-[#C6B4AB] hover:bg-[#B5A399] text-black px-8 py-6 text-lg"
                >
                  <Edit className="mr-2 h-5 w-5" /> Edit Wedding Profile
                </Button>
                <Button
                  onClick={handleGenerateShareLink}
                  className="bg-[#C6B4AB] hover:bg-[#B5A399] text-black px-8 py-6 text-lg"
                >
                  <Share2 className="mr-2 h-5 w-5" /> Send Details to Planner
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleSave}
                  disabled={saveProfileMutation.isPending}
                  className="bg-[#C6B4AB] hover:bg-[#B5A399] text-black px-8 py-6 text-lg"
                >
                  <Save className="mr-2 h-5 w-5" />
                  {saveProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg"
                >
                  <X className="mr-2 h-5 w-5" /> Cancel
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map(section => (
            <div
              key={section.id}
              className="border border-white/20 rounded-lg overflow-hidden bg-white/5"
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
              >
                <h2 className="font-serif text-2xl text-[#C6B4AB]">
                  {section.title}
                </h2>
                {expandedSections[section.id] ? (
                  <ChevronUp className="h-6 w-6 text-[#C6B4AB]" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-[#C6B4AB]" />
                )}
              </button>

              {/* Section Content */}
              {expandedSections[section.id] && (
                <div className="p-6 pt-0 space-y-6">
                  {section.fields.map(field => (
                    <div key={field} className="space-y-2">
                      <Label className="text-[#C6B4AB] text-lg">
                        {formatLabel(field)}
                      </Label>

                      {!isEditMode ? (
                        // View Mode
                        <div className="text-white/80 bg-white/5 p-4 rounded-lg">
                          {formatValue(formData[field as keyof FormData])}
                        </div>
                      ) : (
                        // Edit Mode
                        <>
                          {/* Text inputs */}
                          {[
                            "fullName",
                            "email",
                            "phone",
                            "weddingSeason",
                            "weddingLocation",
                            "weddingDate",
                            "guestCount",
                            "user_role",
                            "intent_reason",
                          ].includes(field) && (
                            <Input
                              value={
                                formData[field as keyof FormData] as string
                              }
                              onChange={e =>
                                updateField(
                                  field as keyof FormData,
                                  e.target.value
                                )
                              }
                              className="bg-white/5 border-white/20 text-white"
                            />
                          )}

                          {/* Textareas */}
                          {[
                            "accessibilityNeeds",
                            "compulsoryElements",
                            "absoluteNOs",
                            "culturalElements",
                            "venueRecommendations",
                            "additionalInfo",
                          ].includes(field) && (
                            <Textarea
                              value={
                                formData[field as keyof FormData] as string
                              }
                              onChange={e =>
                                updateField(
                                  field as keyof FormData,
                                  e.target.value
                                )
                              }
                              className="bg-white/5 border-white/20 text-white min-h-[100px]"
                            />
                          )}

                          {/* Select dropdowns */}
                          {field === "budgetRange" && (
                            <Select
                              value={formData.budgetRange}
                              onValueChange={value =>
                                updateField("budgetRange", value)
                              }
                            >
                              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                                <SelectValue placeholder="Select budget range" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="under-10k">
                                  Under $10,000
                                </SelectItem>
                                <SelectItem value="10k-25k">
                                  $10,000 - $25,000
                                </SelectItem>
                                <SelectItem value="25k-50k">
                                  $25,000 - $50,000
                                </SelectItem>
                                <SelectItem value="50k-100k">
                                  $50,000 - $100,000
                                </SelectItem>
                                <SelectItem value="100k-250k">
                                  $100,000 - $250,000
                                </SelectItem>
                                <SelectItem value="250k-plus">
                                  $250,000+
                                </SelectItem>
                                <SelectItem value="undecided">
                                  Undecided
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}

                          {field === "travelHelp" && (
                            <Select
                              value={formData.travelHelp}
                              onValueChange={value =>
                                updateField("travelHelp", value)
                              }
                            >
                              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                                <SelectValue placeholder="Select option" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="yes">Yes please</SelectItem>
                                <SelectItem value="no">No thanks</SelectItem>
                                <SelectItem value="maybe">
                                  Maybe later
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}

                          {field === "dateFlexibility" && (
                            <Select
                              value={formData.dateFlexibility}
                              onValueChange={value =>
                                updateField("dateFlexibility", value)
                              }
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
                                <SelectItem value="not-decided">
                                  Not decided yet
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}

                          {field === "ceremonyTime" && (
                            <Select
                              value={formData.ceremonyTime}
                              onValueChange={value =>
                                updateField("ceremonyTime", value)
                              }
                            >
                              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                                <SelectValue placeholder="Select option" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sunset">
                                  Sunset ceremony
                                </SelectItem>
                                <SelectItem value="earlier">
                                  Earlier in the day
                                </SelectItem>
                                <SelectItem value="no-preference">
                                  No preference
                                </SelectItem>
                                <SelectItem value="not-sure">
                                  Not sure yet
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}

                          {/* Checkbox arrays */}
                          {[
                            "priorities",
                            "venueTypes",
                            "atmospheres",
                            "eventPriorities",
                            "mmcPackages",
                            "vendorHelp",
                          ].includes(field) && (
                            <div className="grid grid-cols-2 gap-3">
                              {field === "priorities" &&
                                [
                                  "Venue recommendations",
                                  "Timeline & checklist",
                                  "Guest management",
                                  "Budget planning",
                                  "All of the above",
                                ].map(option => (
                                  <div
                                    key={option}
                                    className="flex items-center space-x-2"
                                  >
                                    <Checkbox
                                      id={`${field}-${option}`}
                                      checked={(
                                        formData[
                                          field as keyof FormData
                                        ] as string[]
                                      ).includes(
                                        option
                                          .toLowerCase()
                                          .replace(/ & /g, "-")
                                          .replace(/ /g, "-")
                                      )}
                                      onCheckedChange={() =>
                                        toggleArrayField(
                                          field as keyof FormData,
                                          option
                                            .toLowerCase()
                                            .replace(/ & /g, "-")
                                            .replace(/ /g, "-")
                                        )
                                      }
                                    />
                                    <label
                                      htmlFor={`${field}-${option}`}
                                      className="text-white/80 text-sm cursor-pointer"
                                    >
                                      {option}
                                    </label>
                                  </div>
                                ))}
                              {field === "venueTypes" &&
                                [
                                  "Beachfront",
                                  "Garden",
                                  "Historic Estate",
                                  "Modern Hotel",
                                  "Rooftop",
                                  "Villa",
                                  "Countryside",
                                  "Other",
                                ].map(option => (
                                  <div
                                    key={option}
                                    className="flex items-center space-x-2"
                                  >
                                    <Checkbox
                                      id={`${field}-${option}`}
                                      checked={(
                                        formData[
                                          field as keyof FormData
                                        ] as string[]
                                      ).includes(
                                        option.toLowerCase().replace(/ /g, "-")
                                      )}
                                      onCheckedChange={() =>
                                        toggleArrayField(
                                          field as keyof FormData,
                                          option
                                            .toLowerCase()
                                            .replace(/ /g, "-")
                                        )
                                      }
                                    />
                                    <label
                                      htmlFor={`${field}-${option}`}
                                      className="text-white/80 text-sm cursor-pointer"
                                    >
                                      {option}
                                    </label>
                                  </div>
                                ))}
                              {field === "atmospheres" &&
                                [
                                  "Elegant & Modern",
                                  "Rustic & Natural",
                                  "Romantic & Intimate",
                                  "Glamorous & Luxe",
                                  "Relaxed & Casual",
                                  "Boho Chic",
                                  "Traditional",
                                  "Other",
                                ].map(option => (
                                  <div
                                    key={option}
                                    className="flex items-center space-x-2"
                                  >
                                    <Checkbox
                                      id={`${field}-${option}`}
                                      checked={(
                                        formData[
                                          field as keyof FormData
                                        ] as string[]
                                      ).includes(
                                        option
                                          .toLowerCase()
                                          .replace(/ & /g, "-")
                                          .replace(/ /g, "-")
                                      )}
                                      onCheckedChange={() =>
                                        toggleArrayField(
                                          field as keyof FormData,
                                          option
                                            .toLowerCase()
                                            .replace(/ & /g, "-")
                                            .replace(/ /g, "-")
                                        )
                                      }
                                    />
                                    <label
                                      htmlFor={`${field}-${option}`}
                                      className="text-white/80 text-sm cursor-pointer"
                                    >
                                      {option}
                                    </label>
                                  </div>
                                ))}
                              {field === "eventPriorities" &&
                                [
                                  "Amazing venue",
                                  "Stunning photography",
                                  "Incredible food",
                                  "Live entertainment",
                                  "Floral design",
                                  "Guest experience",
                                  "Unique décor",
                                  "Other",
                                ].map(option => (
                                  <div
                                    key={option}
                                    className="flex items-center space-x-2"
                                  >
                                    <Checkbox
                                      id={`${field}-${option}`}
                                      checked={(
                                        formData[
                                          field as keyof FormData
                                        ] as string[]
                                      ).includes(
                                        option.toLowerCase().replace(/ /g, "-")
                                      )}
                                      onCheckedChange={() =>
                                        toggleArrayField(
                                          field as keyof FormData,
                                          option
                                            .toLowerCase()
                                            .replace(/ /g, "-")
                                        )
                                      }
                                    />
                                    <label
                                      htmlFor={`${field}-${option}`}
                                      className="text-white/80 text-sm cursor-pointer"
                                    >
                                      {option}
                                    </label>
                                  </div>
                                ))}
                              {field === "mmcPackages" &&
                                [
                                  "Full planning",
                                  "Partial planning",
                                  "Month-of coordination",
                                  "Venue sourcing only",
                                  "Design & styling",
                                  "Not sure yet",
                                ].map(option => (
                                  <div
                                    key={option}
                                    className="flex items-center space-x-2"
                                  >
                                    <Checkbox
                                      id={`${field}-${option}`}
                                      checked={(
                                        formData[
                                          field as keyof FormData
                                        ] as string[]
                                      ).includes(
                                        option.toLowerCase().replace(/ /g, "-")
                                      )}
                                      onCheckedChange={() =>
                                        toggleArrayField(
                                          field as keyof FormData,
                                          option
                                            .toLowerCase()
                                            .replace(/ /g, "-")
                                        )
                                      }
                                    />
                                    <label
                                      htmlFor={`${field}-${option}`}
                                      className="text-white/80 text-sm cursor-pointer"
                                    >
                                      {option}
                                    </label>
                                  </div>
                                ))}
                              {field === "vendorHelp" &&
                                [
                                  "Photographer",
                                  "Videographer",
                                  "Florist",
                                  "Hair & makeup",
                                  "Entertainment",
                                  "Transport",
                                  "Other vendors",
                                ].map(option => (
                                  <div
                                    key={option}
                                    className="flex items-center space-x-2"
                                  >
                                    <Checkbox
                                      id={`${field}-${option}`}
                                      checked={(
                                        formData[
                                          field as keyof FormData
                                        ] as string[]
                                      ).includes(
                                        option
                                          .toLowerCase()
                                          .replace(/ & /g, "-")
                                          .replace(/ /g, "-")
                                      )}
                                      onCheckedChange={() =>
                                        toggleArrayField(
                                          field as keyof FormData,
                                          option
                                            .toLowerCase()
                                            .replace(/ & /g, "-")
                                            .replace(/ /g, "-")
                                        )
                                      }
                                    />
                                    <label
                                      htmlFor={`${field}-${option}`}
                                      className="text-white/80 text-sm cursor-pointer"
                                    >
                                      {option}
                                    </label>
                                  </div>
                                ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Save Buttons (Edit Mode) */}
        {isEditMode && (
          <div className="flex justify-center space-x-4 mt-12">
            <Button
              onClick={handleSave}
              disabled={saveProfileMutation.isPending}
              className="bg-[#C6B4AB] hover:bg-[#B5A399] text-black px-8 py-6 text-lg"
            >
              <Save className="mr-2 h-5 w-5" />
              {saveProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg"
            >
              <X className="mr-2 h-5 w-5" /> Cancel
            </Button>
          </div>
        )}

        {/* Back to Dashboard */}
        <div className="text-center mt-12">
          <Button
            onClick={() => setLocation("/dashboard")}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-white/20 rounded-lg p-8 max-w-md w-full">
            <h3 className="text-2xl font-serif text-[#C6B4AB] mb-4">
              Share Your Wedding Profile
            </h3>
            <p className="text-white/70 mb-6">
              Share this link with your wedding planner to give them access to
              all your wedding details.
            </p>

            <div className="bg-black/50 border border-white/20 rounded p-4 mb-6">
              <p className="text-white/90 text-sm break-all">{shareUrl}</p>
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={handleCopyLink}
                className="flex-1 bg-[#C6B4AB] hover:bg-[#B5A399] text-black"
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" /> Copy Link
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  setShowShareModal(false);
                  setCopied(false);
                }}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
