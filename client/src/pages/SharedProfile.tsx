import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { ChevronDown, ChevronUp } from "lucide-react";

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

export default function SharedProfile() {
  const [, params] = useRoute("/profile/:token");
  const token = params?.token || "";

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

  const {
    data: profile,
    isLoading,
    error,
  } = trpc.share.getSharedProfile.useQuery({ token }, { enabled: !!token });

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
        const formData = data.full || data;
        setFormData(formData);
      } catch (error) {
        console.error("Failed to parse onboarding data:", error);
      }
    }
  }, [profile]);

  const toggleSection = (sectionId: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const sections = [
    {
      id: 1,
      title: "Your Intent",
      fields: [
        { label: "Who are you?", value: formData.user_role },
        { label: "Why are you here?", value: formData.intent_reason },
        {
          label: "What do you need?",
          value: formData.priorities,
          type: "array",
        },
      ],
    },
    {
      id: 2,
      title: "Wedding Essentials",
      fields: [
        { label: "Preferred Wedding Date", value: formData.weddingDate },
        { label: "Location", value: formData.weddingLocation },
        { label: "Season", value: formData.weddingSeason },
        { label: "Rough Guest Count", value: formData.guestCount },
        { label: "Budget Range", value: formData.budgetRange },
      ],
    },
    {
      id: 3,
      title: "Wedding Style",
      fields: [
        { label: "Venue Types", value: formData.venueTypes, type: "array" },
        { label: "Atmospheres", value: formData.atmospheres, type: "array" },
        {
          label: "Event Priorities",
          value: formData.eventPriorities,
          type: "array",
        },
      ],
    },
    {
      id: 4,
      title: "Priorities & Preferences",
      fields: [
        { label: "MMC Packages", value: formData.mmcPackages, type: "array" },
        { label: "Travel Help", value: formData.travelHelp },
        { label: "Date Flexibility", value: formData.dateFlexibility },
        { label: "Ceremony Time", value: formData.ceremonyTime },
        { label: "Accessibility Needs", value: formData.accessibilityNeeds },
      ],
    },
    {
      id: 5,
      title: "Planner Needs",
      fields: [
        { label: "Compulsory Elements", value: formData.compulsoryElements },
        { label: "Absolute NOs", value: formData.absoluteNOs },
        { label: "Vendor Help", value: formData.vendorHelp, type: "array" },
        { label: "Cultural Elements", value: formData.culturalElements },
        {
          label: "Venue Recommendations",
          value: formData.venueRecommendations,
        },
      ],
    },
    {
      id: 6,
      title: "Additional Information",
      fields: [
        { label: "Full Name", value: formData.fullName },
        { label: "Email", value: formData.email },
        { label: "Phone", value: formData.phone },
        { label: "Additional Info", value: formData.additionalInfo },
      ],
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white/70">Loading wedding profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-serif text-[#C6B4AB] mb-4">
            Profile Not Found
          </h2>
          <p className="text-white/70">
            This wedding profile link is invalid or has expired.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-[#C6B4AB] mb-4">
            Wedding Profile
          </h1>
          <p className="text-white/70">
            {formData.fullName || "Wedding Planning Details"}
          </p>
          <div className="mt-4 text-sm text-white/50">
            <p>Read-only view • Shared by the couple</p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map(section => (
            <div
              key={section.id}
              className="border border-white/20 rounded-lg overflow-hidden"
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-6 py-4 bg-white/5 hover:bg-white/10 flex items-center justify-between transition-colors"
              >
                <h2 className="text-xl font-serif text-[#C6B4AB]">
                  {section.title}
                </h2>
                {expandedSections[section.id] ? (
                  <ChevronUp className="h-5 w-5 text-[#C6B4AB]" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-[#C6B4AB]" />
                )}
              </button>

              {/* Section Content */}
              {expandedSections[section.id] && (
                <div className="p-6 space-y-6">
                  {section.fields.map((field, index) => (
                    <div key={index}>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        {field.label}
                      </label>
                      {field.type === "array" ? (
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(field.value) &&
                          field.value.length > 0 ? (
                            field.value.map((item, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-[#C6B4AB]/20 text-[#C6B4AB] rounded-full text-sm"
                              >
                                {item}
                              </span>
                            ))
                          ) : (
                            <span className="text-white/50 text-sm">
                              Not specified
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-white/90">
                          {field.value || (
                            <span className="text-white/50">Not specified</span>
                          )}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-white/50 text-sm">
          <p>Powered by Marry Me Cyprus</p>
        </div>
      </div>
    </div>
  );
}
