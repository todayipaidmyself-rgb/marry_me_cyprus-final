import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Check, Sparkles, ArrowRight } from "lucide-react";
import {
  useMyQuoteBriefLogic,
  type ServiceIntent,
} from "@/hooks/useMyQuoteBriefLogic";
import { Link } from "wouter";
import { type Dispatch, type SetStateAction } from "react";

const SIMPLIFIED_CATEGORIES = [
  "Venue",
  "Photography / Video",
  "Live Streaming",
  "Social Media Content",
  "Hair & Makeup",
  "Flowers",
  "Cake",
  "Decor & Styling",
  "Entertainment",
  "Transport",
  "Ceremony",
  "Legal Support",
  "Planning Support",
  "Food & Drinks",
  "Stationery",
  "Extras",
] as const;

type SimplifiedCategory = (typeof SIMPLIFIED_CATEGORIES)[number];

const SIMPLIFIED_OPTIONS: Record<SimplifiedCategory, string[]> = {
  Venue: [
    "Beach Venue",
    "Estate / Villa",
    "Hotel / Resort",
    "Garden Venue",
    "Private Dining Venue",
    "Not sure yet",
  ],
  "Photography / Video": [
    "Photography",
    "Video",
    "Photography + Video",
    "Not sure yet",
  ],
  "Live Streaming": [
    "Wedding Live Stream",
    "Ceremony Live Stream",
    "Private Family Stream",
    "Not sure yet",
  ],
  "Social Media Content": [
    "Content Creator (Photos)",
    "Content Creator (Video)",
    "Content Creator (Photos + Video)",
    "Behind-the-Scenes Coverage",
    "Ceremony Press (Wedding Magazine)",
    "Not sure yet",
  ],
  "Hair & Makeup": [
    "Bridal Hair + Makeup",
    "Hair Only",
    "Makeup Only",
    "Bridal Party Styling",
    "Not sure yet",
  ],
  Flowers: [
    "Bouquet + Buttonholes",
    "Ceremony Florals",
    "Reception Florals",
    "Full Floral Styling",
    "Not sure yet",
  ],
  Cake: [
    "Wedding Cake",
    "Cake + Dessert Display",
    "Dessert Table",
    "Not sure yet",
  ],
  "Decor & Styling": [
    "Ceremony Styling",
    "Reception Styling",
    "Table Styling",
    "Full Styling Concept",
    "Not sure yet",
  ],
  Entertainment: [
    "DJ",
    "Singer",
    "Saxophonist",
    "Violinist",
    "Harpist",
    "Live Band",
    "Greek Dancers",
    "Bagpiper",
    "Photo Booth",
    "Not sure yet",
  ],
  Transport: [
    "Couple Transport",
    "Guest Shuttles",
    "Luxury Car",
    "Late-Night Return Transport",
    "Not sure yet",
  ],
  Ceremony: [
    "Celebrant",
    "Civil Ceremony Support",
    "Symbolic Ceremony",
    "Religious Ceremony Support",
    "Not sure yet",
  ],
  "Legal Support": [
    "Marriage Paperwork Help",
    "Registrar Support",
    "Civil Ceremony Documents",
    "Not sure yet",
  ],
  "Planning Support": [
    "Full Planning Support",
    "Planning Guidance",
    "On-the-Day Coordination",
    "Wedding Timeline Help",
    "Not sure yet",
  ],
  "Food & Drinks": [
    "Wedding Meal",
    "BBQ / Late Food",
    "Dessert Table",
    "Mobile Bar",
    "Cocktail Bar",
    "Not sure yet",
  ],
  Stationery: [
    "Invitations / Stationery",
    "On-the-Day Stationery",
    "Wedding Signage",
    "Welcome Signage",
    "Not sure yet",
  ],
  Extras: [
    "Wedding Magazine (Ceremony Press)",
    "Audio Guestbook / Memory Box",
    "Dress Steaming",
    "Sparklers / Confetti",
    "Dancefloor",
    "Cold Sparks / Special Effects",
    "Not sure yet",
  ],
};

const seasonOptions = ["Spring", "Summer", "Autumn", "Winter", "Flexible"];
const guestRangeOptions = ["20-50", "50-80", "80-120", "120+", "Not sure"];
const locationOptions = [
  "Paphos",
  "Limassol",
  "Larnaca",
  "Ayia Napa",
  "Open to ideas",
];
const budgetOptions = [
  "Under EUR 15k",
  "EUR 15k-30k",
  "EUR 30k-50k",
  "EUR 50k+",
  "Not sure yet",
];
const styleOptions = [
  "Romantic",
  "Modern",
  "Mediterranean",
  "Luxury",
  "Boho",
  "Minimal",
];
const atmosphereOptions = [
  "Sunset ceremony",
  "Live music",
  "Elegant dinner",
  "Beach reception",
  "Party atmosphere",
];
const collectionOptions = [
  "No collection preference",
  "Alassos — Beachfront Wedding",
  "L'Chateau — Luxury Villa Wedding",
  "Liopetro — Heritage Venue",
  "Paliomonastiro — Cliffside Garden",
];

const toggleTag = (
  tag: string,
  setList: Dispatch<SetStateAction<string[]>>
) => {
  setList(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]));
};

export default function MyQuoteBrief() {
  const {
    primaryName,
    setPrimaryName,
    partnerName,
    setPartnerName,
    weddingDate,
    setWeddingDate,
    weddingYear,
    setWeddingYear,
    selectedCollection,
    setSelectedCollection,
    snapshotSeason,
    setSnapshotSeason,
    snapshotGuestRange,
    setSnapshotGuestRange,
    snapshotLocation,
    setSnapshotLocation,
    snapshotBudget,
    setSnapshotBudget,
    serviceIntent,
    setServiceIntent,
    servicePriority,
    setServicePriority,
    serviceNotes,
    setServiceNotes,
    selectedOptions,
    setSelectedOptions,
    styleTags,
    setStyleTags,
    atmosphereTags,
    setAtmosphereTags,
    mustHaves,
    setMustHaves,
    avoidNotes,
    setAvoidNotes,
    visibleNotes,
    setVisibleNotes,
    activeCategoryList,
    isSubmitted,
    isSubmitting,
    canSubmit,
    submitBrief,
  } = useMyQuoteBriefLogic();

  const handleServiceIntentChange = (
    category: SimplifiedCategory,
    nextIntent: ServiceIntent
  ) => {
    setServiceIntent(prev => ({
      ...prev,
      [category]: nextIntent,
    }));

    if (nextIntent === "skip") {
      setSelectedOptions(prev => ({ ...prev, [category]: [] }));
    }
  };

  const onSelectOption = (category: SimplifiedCategory, option: string) => {
    setSelectedOptions(prev => {
      const current = prev[category] ?? [];
      const exists = current.includes(option);
      const next = exists
        ? current.filter(value => value !== option)
        : [...current, option];
      return { ...prev, [category]: next };
    });
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white text-[#171717]">
        <div className="container py-10 md:py-14 space-y-10">
          <section className="w-full border border-neutral-200 bg-white px-8 py-10 md:px-12 md:py-14">
            <p className="text-xs uppercase tracking-[0.24em] text-neutral-500 mb-4">
              Build Your Wedding Request
            </p>
            <h1 className="font-serif text-4xl md:text-6xl leading-tight tracking-tight text-[#101010]">
              Build Your Wedding Request
            </h1>
            <p className="mt-4 max-w-3xl text-neutral-600 text-base md:text-lg leading-relaxed">
              Share your vision, priorities, and preferences. Your planner will
              curate tailored ideas.
            </p>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                "01 Wedding Snapshot",
                "02 Services",
                "03 Style",
                "04 Review",
              ].map(step => (
                <div
                  key={step}
                  className="border border-neutral-200 bg-neutral-50 px-3 py-2 text-[11px] md:text-xs tracking-[0.16em] uppercase text-neutral-600"
                >
                  {step}
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-5">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl text-[#101010]">
                Wedding Snapshot
              </h2>
              <p className="text-neutral-600 mt-1">
                Set the tone with quick inspiration choices.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-neutral-200 bg-white md:col-span-2 lg:col-span-4">
                <CardContent className="p-5 space-y-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                      Couple Details
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="briefPrimaryName"
                        className="text-[11px] uppercase tracking-[0.18em] text-neutral-500"
                      >
                        Primary Name
                      </label>
                      <Input
                        id="briefPrimaryName"
                        type="text"
                        value={primaryName}
                        onChange={e => setPrimaryName(e.target.value)}
                        placeholder="Primary name"
                        className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-neutral-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="briefPartnerName"
                        className="text-[11px] uppercase tracking-[0.18em] text-neutral-500"
                      >
                        Partner Name
                      </label>
                      <Input
                        id="briefPartnerName"
                        type="text"
                        value={partnerName}
                        onChange={e => setPartnerName(e.target.value)}
                        placeholder="Partner name (optional)"
                        className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-neutral-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="briefWeddingDate"
                        className="text-[11px] uppercase tracking-[0.18em] text-neutral-500"
                      >
                        Wedding Date
                      </label>
                      <Input
                        id="briefWeddingDate"
                        type="date"
                        value={weddingDate}
                        onChange={e => setWeddingDate(e.target.value)}
                        className="bg-white border-neutral-300 text-neutral-900 focus-visible:ring-neutral-400"
                      />
                    </div>

                  </div>
                </CardContent>
              </Card>

              <Card className="border-neutral-200 bg-white">
                <CardContent className="p-5 space-y-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                      Wedding Date / Season
                    </p>
                    <p className="font-serif text-xl mt-1 text-neutral-900">
                      {snapshotSeason || weddingDate || "Not selected"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {seasonOptions.map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setSnapshotSeason(option)}
                        className={`px-2.5 py-1.5 text-[11px] border transition-colors ${
                          snapshotSeason === option
                            ? "border-neutral-900 bg-neutral-900 text-white"
                            : "border-neutral-300 text-neutral-700 hover:border-neutral-500"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-neutral-200 bg-white">
                <CardContent className="p-5 space-y-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                      Guest Count
                    </p>
                    <p className="font-serif text-xl mt-1 text-neutral-900">
                      {snapshotGuestRange || "Not selected"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {guestRangeOptions.map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setSnapshotGuestRange(option)}
                        className={`px-2.5 py-1.5 text-[11px] border transition-colors ${
                          snapshotGuestRange === option
                            ? "border-neutral-900 bg-neutral-900 text-white"
                            : "border-neutral-300 text-neutral-700 hover:border-neutral-500"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-neutral-200 bg-white">
                <CardContent className="p-5 space-y-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                      Location
                    </p>
                    <p className="font-serif text-xl mt-1 text-neutral-900">
                      {snapshotLocation || "Not selected"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {locationOptions.map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setSnapshotLocation(option)}
                        className={`px-2.5 py-1.5 text-[11px] border transition-colors ${
                          snapshotLocation === option
                            ? "border-neutral-900 bg-neutral-900 text-white"
                            : "border-neutral-300 text-neutral-700 hover:border-neutral-500"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-neutral-200 bg-white">
                <CardContent className="p-5 space-y-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                      Budget Comfort Band
                    </p>
                    <p className="font-serif text-xl mt-1 text-neutral-900">
                      {snapshotBudget || "Not selected"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {budgetOptions.map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setSnapshotBudget(option)}
                        className={`px-2.5 py-1.5 text-[11px] border transition-colors ${
                          snapshotBudget === option
                            ? "border-neutral-900 bg-neutral-900 text-white"
                            : "border-neutral-300 text-neutral-700 hover:border-neutral-500"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="space-y-5">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl text-[#101010]">
                Collections
              </h2>
              <p className="text-neutral-600 mt-1">
                Select your preferred collection as your starting point.
              </p>
            </div>
            <Card className="border-neutral-200 bg-white">
              <CardContent className="p-5 space-y-3">
                <label
                  htmlFor="briefSelectedCollection"
                  className="text-[11px] uppercase tracking-[0.18em] text-neutral-500"
                >
                  Collections
                </label>
                <select
                  id="briefSelectedCollection"
                  value={selectedCollection}
                  onChange={e => setSelectedCollection(e.target.value)}
                  className="w-full h-10 border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                >
                  <option value="">Select a collection</option>
                  {collectionOptions.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-5">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
              <div>
                <h2 className="font-serif text-3xl md:text-4xl text-[#101010]">
                  Services
                </h2>
                <p className="text-neutral-600 mt-1">
                  Choose what feels essential without package complexity.
                </p>
              </div>
              <Badge variant="outline" className="border-neutral-300 text-neutral-700">
                {activeCategoryList.length} categories selected
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              {SIMPLIFIED_CATEGORIES.map(category => {
                const intent = serviceIntent[category] ?? "skip";
                const priority = servicePriority[category] ?? "medium";
                const selectedForCategory = selectedOptions[category] ?? [];
                const showPreferences = intent !== "skip";

                return (
                  <Card
                    key={category}
                    className="border-neutral-200 bg-white overflow-hidden transition-all duration-300 hover:border-neutral-400"
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="font-serif text-2xl flex items-center justify-between text-neutral-900">
                        <span>{category}</span>
                        {selectedForCategory.length > 0 ? (
                          <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                            {selectedForCategory.length} picks
                          </span>
                        ) : null}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: "skip", label: "Skip" },
                          { value: "maybe", label: "Considering" },
                          { value: "need", label: "Essential" },
                        ].map(option => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              handleServiceIntentChange(
                                category,
                                option.value as ServiceIntent
                              )
                            }
                            className={`px-2 py-2 text-[11px] border transition-colors ${
                              intent === option.value
                                ? "border-neutral-900 bg-neutral-900 text-white"
                                : "border-neutral-300 text-neutral-700 hover:border-neutral-500"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>

                      <div
                        className={`transition-all duration-300 overflow-hidden ${
                          showPreferences
                            ? "max-h-[520px] opacity-100"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="space-y-3 pt-1">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">
                            Priority
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            {(["low", "medium", "high"] as const).map(level => (
                              <button
                                key={level}
                                type="button"
                                onClick={() =>
                                  setServicePriority(prev => ({
                                    ...prev,
                                    [category]: level,
                                  }))
                                }
                                className={`px-2 py-2 text-[11px] border transition-colors ${
                                  priority === level
                                    ? "border-neutral-900 bg-neutral-900 text-white"
                                    : "border-neutral-300 text-neutral-700 hover:border-neutral-500"
                                }`}
                              >
                                {level}
                              </button>
                            ))}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {SIMPLIFIED_OPTIONS[category].map(option => {
                              const selected = selectedForCategory.includes(option);
                              return (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => onSelectOption(category, option)}
                                  className={`px-2.5 py-1.5 text-[11px] border transition-colors ${
                                    selected
                                      ? "border-neutral-900 bg-neutral-900 text-white"
                                      : "border-neutral-300 text-neutral-700 hover:border-neutral-500"
                                  }`}
                                >
                                  {selected ? (
                                    <Check className="inline h-3.5 w-3.5 mr-1" />
                                  ) : null}
                                  {option}
                                </button>
                              );
                            })}
                          </div>

                          <Input
                            value={serviceNotes[category] ?? ""}
                            onChange={e =>
                              setServiceNotes(prev => ({
                                ...prev,
                                [category]: e.target.value,
                              }))
                            }
                            placeholder={`Preference note for ${category.toLowerCase()}`}
                            className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-neutral-400"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          <section className="space-y-5">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl text-[#101010]">
                Style & Experience
              </h2>
              <p className="text-neutral-600 mt-1">
                Shape the mood and atmosphere of your day.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-neutral-200 bg-white">
                <CardHeader>
                  <CardTitle className="font-serif text-2xl text-neutral-900">
                    Style Inspiration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {styleOptions.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag, setStyleTags)}
                        className={`px-3 py-2 text-xs border tracking-[0.08em] transition-colors ${
                          styleTags.includes(tag)
                            ? "border-neutral-900 bg-neutral-900 text-white"
                            : "border-neutral-300 text-neutral-700 hover:border-neutral-500"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  <p className="text-sm text-neutral-600 mt-3">Atmosphere details</p>
                  <div className="flex flex-wrap gap-2">
                    {atmosphereOptions.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag, setAtmosphereTags)}
                        className={`px-3 py-2 text-xs border tracking-[0.08em] transition-colors ${
                          atmosphereTags.includes(tag)
                            ? "border-neutral-900 bg-neutral-900 text-white"
                            : "border-neutral-300 text-neutral-700 hover:border-neutral-500"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-neutral-200 bg-white">
                <CardHeader>
                  <CardTitle className="font-serif text-2xl text-neutral-900 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-neutral-700" />
                    Vision Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    value={mustHaves}
                    onChange={e => setMustHaves(e.target.value)}
                    placeholder="Describe the moment you imagine most when you picture your wedding day."
                    className="min-h-[90px] bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-neutral-400"
                  />
                  <Textarea
                    value={avoidNotes}
                    onChange={e => setAvoidNotes(e.target.value)}
                    placeholder="Anything you absolutely want to avoid?"
                    className="min-h-[90px] bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-neutral-400"
                  />
                  <Textarea
                    value={visibleNotes}
                    onChange={e => setVisibleNotes(e.target.value)}
                    placeholder="Any extra details your planner should know?"
                    className="min-h-[120px] bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-neutral-400"
                  />
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <Card className="border-neutral-200 bg-white">
              <CardHeader>
                <CardTitle className="font-serif text-3xl md:text-4xl text-neutral-900">
                  Your Wedding Vision
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6 text-sm">
                  <div className="space-y-2">
                    <p className="text-neutral-500 uppercase tracking-[0.16em] text-[11px]">
                      Snapshot
                    </p>
                    <p className="text-neutral-800">
                      Location: {snapshotLocation || "Not selected"}
                    </p>
                    <p className="text-neutral-800">
                      Guests: {snapshotGuestRange || "Not selected"}
                    </p>
                    <p className="text-neutral-800">
                      Date/Year: {weddingDate || weddingYear || "Not selected"}
                    </p>
                    {selectedCollection ? (
                      <p className="text-neutral-800">
                        Collection: {selectedCollection}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <p className="text-neutral-500 uppercase tracking-[0.16em] text-[11px]">
                      Services Requested
                    </p>
                    <p className="text-neutral-800">
                      {activeCategoryList.length > 0
                        ? activeCategoryList.join(", ")
                        : "No services selected yet"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <p className="text-neutral-500 uppercase tracking-[0.16em] text-[11px]">
                    Atmosphere
                  </p>
                  <p className="text-neutral-800">
                    {atmosphereTags.length > 0
                      ? atmosphereTags.join(" • ")
                      : "Not selected yet"}
                  </p>
                </div>

                {(styleTags.length > 0 || mustHaves || avoidNotes || visibleNotes) && (
                  <div className="space-y-2 text-sm">
                    <p className="text-neutral-500 uppercase tracking-[0.16em] text-[11px]">
                      Vision Notes
                    </p>
                    {styleTags.length > 0 ? (
                      <p className="text-neutral-800">Style: {styleTags.join(", ")}</p>
                    ) : null}
                    {mustHaves ? (
                      <p className="text-neutral-800">Must-haves: {mustHaves}</p>
                    ) : null}
                    {avoidNotes ? (
                      <p className="text-neutral-800">Avoid: {avoidNotes}</p>
                    ) : null}
                    {visibleNotes ? (
                      <p className="text-neutral-700">{visibleNotes}</p>
                    ) : null}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          <section>
            <Card className="border-neutral-200 bg-neutral-50">
              <CardContent className="p-6 md:p-8 space-y-4">
                {isSubmitted ? (
                  <div className="space-y-4">
                    <h3 className="font-serif text-3xl text-neutral-900">
                      Your request has been sent
                    </h3>
                    <p className="text-neutral-700 max-w-2xl">
                      Your planner will review your preferences and prepare tailored
                      venue and service options.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Link href="/dashboard">
                        <Button className="bg-neutral-900 hover:bg-neutral-800 text-white">
                          Go to Dashboard
                        </Button>
                      </Link>
                      <Link href="/venues">
                        <Button
                          variant="outline"
                          className="border-neutral-300 text-neutral-800 hover:bg-white"
                        >
                          Continue Browsing Venues
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="font-serif text-3xl text-neutral-900">
                      Ready to share your vision?
                    </h3>
                    <p className="text-neutral-700 max-w-2xl">
                      Your planner will review your ideas and prepare tailored venue
                      and service options.
                    </p>
                    <Button
                      onClick={() => void submitBrief()}
                      disabled={!canSubmit || isSubmitting}
                      className="bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-6 text-base tracking-[0.08em]"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Send My Wedding Request
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                    {!canSubmit ? (
                      <p className="text-xs text-neutral-500">
                        Add your primary name, a wedding date or year, and at least
                        one service category to continue.
                      </p>
                    ) : null}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
