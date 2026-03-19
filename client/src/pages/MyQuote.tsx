import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Check, Sparkles, ArrowRight } from "lucide-react";
import { useMyQuoteRequestLogic } from "@/hooks/useMyQuoteRequestLogic";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  useMemo,
  useState,
  useEffect,
  useRef,
  type Dispatch,
  type SetStateAction,
} from "react";

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
type ServiceIntent = "need" | "maybe" | "skip";
type ServicePriority = "low" | "medium" | "high";

const RAW_TO_SIMPLIFIED: Record<string, SimplifiedCategory> = {
  venue: "Venue",
  Photography: "Photography / Video",
  "Photo + Video": "Photography / Video",
  Videography: "Photography / Video",
  "Hair & Makeup": "Hair & Makeup",
  flowers: "Flowers",
  cake: "Cake",
  decor: "Decor & Styling",
  Entertainment: "Entertainment",
  Transport: "Transport",
  license: "Legal Support",
  planning_fee: "Planning Support",
  Extras: "Extras",
};

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

type MappingRule =
  | { mode: "context-only" }
  | { mode: "raw-category"; rawCategories: string[] }
  | { mode: "text-match"; rawCategories?: string[]; includeAny: string[] };

const OPTION_TO_PACKAGE_MAPPING: Record<
  SimplifiedCategory,
  Record<string, MappingRule>
> = {
  Venue: {
    "Beach Venue": {
      mode: "text-match",
      rawCategories: ["venue"],
      includeAny: ["beach", "sea", "coast"],
    },
    "Estate / Villa": {
      mode: "text-match",
      rawCategories: ["venue"],
      includeAny: ["estate", "villa"],
    },
    "Hotel / Resort": {
      mode: "text-match",
      rawCategories: ["venue"],
      includeAny: ["hotel", "resort"],
    },
    "Garden Venue": {
      mode: "text-match",
      rawCategories: ["venue"],
      includeAny: ["garden"],
    },
    "Private Dining Venue": {
      mode: "text-match",
      rawCategories: ["venue"],
      includeAny: ["private", "dining"],
    },
    "Not sure yet": { mode: "context-only" },
  },
  "Photography / Video": {
    Photography: { mode: "raw-category", rawCategories: ["Photography"] },
    Video: { mode: "raw-category", rawCategories: ["Videography"] },
    "Photography + Video": {
      mode: "raw-category",
      rawCategories: ["Photo + Video"],
    },
    "Not sure yet": { mode: "context-only" },
  },
  "Live Streaming": {
    "Wedding Live Stream": { mode: "context-only" },
    "Ceremony Live Stream": { mode: "context-only" },
    "Private Family Stream": { mode: "context-only" },
    "Not sure yet": { mode: "context-only" },
  },
  "Social Media Content": {
    "Content Creator (Photos)": {
      mode: "text-match",
      rawCategories: ["Photography", "Photo + Video"],
      includeAny: ["content", "social"],
    },
    "Content Creator (Video)": {
      mode: "text-match",
      rawCategories: ["Videography", "Photo + Video"],
      includeAny: ["content", "social"],
    },
    "Content Creator (Photos + Video)": {
      mode: "text-match",
      rawCategories: ["Photography", "Photo + Video", "Videography"],
      includeAny: ["content", "social"],
    },
    "Behind-the-Scenes Coverage": { mode: "context-only" },
    "Ceremony Press (Wedding Magazine)": { mode: "context-only" },
    "Not sure yet": { mode: "context-only" },
  },
  "Hair & Makeup": {
    "Bridal Hair + Makeup": {
      mode: "raw-category",
      rawCategories: ["Hair & Makeup"],
    },
    "Hair Only": {
      mode: "text-match",
      rawCategories: ["Hair & Makeup"],
      includeAny: ["hair"],
    },
    "Makeup Only": {
      mode: "text-match",
      rawCategories: ["Hair & Makeup"],
      includeAny: ["makeup"],
    },
    "Bridal Party Styling": {
      mode: "text-match",
      rawCategories: ["Hair & Makeup"],
      includeAny: ["bridesmaid", "party"],
    },
    "Not sure yet": { mode: "context-only" },
  },
  Flowers: {
    "Bouquet + Buttonholes": {
      mode: "text-match",
      rawCategories: ["flowers"],
      includeAny: ["bouquet", "buttonhole"],
    },
    "Ceremony Florals": {
      mode: "text-match",
      rawCategories: ["flowers"],
      includeAny: ["ceremony"],
    },
    "Reception Florals": {
      mode: "text-match",
      rawCategories: ["flowers"],
      includeAny: ["reception"],
    },
    "Full Floral Styling": {
      mode: "text-match",
      rawCategories: ["flowers"],
      includeAny: ["full", "floral", "styling"],
    },
    "Not sure yet": { mode: "context-only" },
  },
  Cake: {
    "Wedding Cake": { mode: "raw-category", rawCategories: ["cake"] },
    "Cake + Dessert Display": {
      mode: "text-match",
      rawCategories: ["cake", "Extras"],
      includeAny: ["cake", "dessert"],
    },
    "Dessert Table": {
      mode: "text-match",
      rawCategories: ["cake", "Extras"],
      includeAny: ["dessert"],
    },
    "Not sure yet": { mode: "context-only" },
  },
  "Decor & Styling": {
    "Ceremony Styling": {
      mode: "text-match",
      rawCategories: ["decor"],
      includeAny: ["ceremony"],
    },
    "Reception Styling": {
      mode: "text-match",
      rawCategories: ["decor"],
      includeAny: ["reception"],
    },
    "Table Styling": {
      mode: "text-match",
      rawCategories: ["decor"],
      includeAny: ["table"],
    },
    "Full Styling Concept": {
      mode: "text-match",
      rawCategories: ["decor"],
      includeAny: ["full", "styling", "dressing"],
    },
    "Not sure yet": { mode: "context-only" },
  },
  Entertainment: {
    DJ: {
      mode: "text-match",
      rawCategories: ["Entertainment"],
      includeAny: ["dj"],
    },
    Singer: {
      mode: "text-match",
      rawCategories: ["Entertainment"],
      includeAny: ["singer", "vocal"],
    },
    Saxophonist: {
      mode: "text-match",
      rawCategories: ["Entertainment"],
      includeAny: ["sax"],
    },
    Violinist: {
      mode: "text-match",
      rawCategories: ["Entertainment"],
      includeAny: ["violin"],
    },
    Harpist: {
      mode: "text-match",
      rawCategories: ["Entertainment"],
      includeAny: ["harp"],
    },
    "Live Band": {
      mode: "text-match",
      rawCategories: ["Entertainment"],
      includeAny: ["band", "live"],
    },
    "Greek Dancers": {
      mode: "text-match",
      rawCategories: ["Entertainment"],
      includeAny: ["greek", "dancer"],
    },
    Bagpiper: {
      mode: "text-match",
      rawCategories: ["Entertainment"],
      includeAny: ["bag"],
    },
    "Photo Booth": {
      mode: "text-match",
      rawCategories: ["Entertainment", "Extras"],
      includeAny: ["booth", "mirror"],
    },
    "Not sure yet": { mode: "context-only" },
  },
  Transport: {
    "Couple Transport": {
      mode: "raw-category",
      rawCategories: ["Transport"],
    },
    "Guest Shuttles": {
      mode: "text-match",
      rawCategories: ["Transport"],
      includeAny: ["guest", "shuttle"],
    },
    "Luxury Car": {
      mode: "text-match",
      rawCategories: ["Transport"],
      includeAny: ["rolls", "range", "luxury"],
    },
    "Late-Night Return Transport": { mode: "context-only" },
    "Not sure yet": { mode: "context-only" },
  },
  Ceremony: {
    Celebrant: {
      mode: "text-match",
      rawCategories: ["Extras"],
      includeAny: ["celebrant"],
    },
    "Civil Ceremony Support": {
      mode: "raw-category",
      rawCategories: ["license"],
    },
    "Symbolic Ceremony": { mode: "context-only" },
    "Religious Ceremony Support": { mode: "context-only" },
    "Not sure yet": { mode: "context-only" },
  },
  "Legal Support": {
    "Marriage Paperwork Help": { mode: "context-only" },
    "Registrar Support": {
      mode: "raw-category",
      rawCategories: ["license"],
    },
    "Civil Ceremony Documents": {
      mode: "raw-category",
      rawCategories: ["license"],
    },
    "Not sure yet": { mode: "context-only" },
  },
  "Planning Support": {
    "Full Planning Support": {
      mode: "raw-category",
      rawCategories: ["planning_fee"],
    },
    "Planning Guidance": { mode: "context-only" },
    "On-the-Day Coordination": { mode: "context-only" },
    "Wedding Timeline Help": { mode: "context-only" },
    "Not sure yet": { mode: "context-only" },
  },
  "Food & Drinks": {
    "Wedding Meal": { mode: "context-only" },
    "BBQ / Late Food": {
      mode: "text-match",
      rawCategories: ["Extras"],
      includeAny: ["bbq", "late", "food"],
    },
    "Dessert Table": {
      mode: "text-match",
      rawCategories: ["Extras", "cake"],
      includeAny: ["dessert"],
    },
    "Mobile Bar": {
      mode: "text-match",
      rawCategories: ["Extras"],
      includeAny: ["bar", "bartender"],
    },
    "Cocktail Bar": {
      mode: "text-match",
      rawCategories: ["Extras"],
      includeAny: ["cocktail", "bar"],
    },
    "Not sure yet": { mode: "context-only" },
  },
  Stationery: {
    "Invitations / Stationery": {
      mode: "text-match",
      rawCategories: ["Extras"],
      includeAny: ["stationery", "invite"],
    },
    "On-the-Day Stationery": {
      mode: "text-match",
      rawCategories: ["Extras"],
      includeAny: ["stationery", "menu", "place"],
    },
    "Wedding Signage": {
      mode: "text-match",
      rawCategories: ["Extras"],
      includeAny: ["sign"],
    },
    "Welcome Signage": {
      mode: "text-match",
      rawCategories: ["Extras"],
      includeAny: ["welcome", "sign"],
    },
    "Not sure yet": { mode: "context-only" },
  },
  Extras: {
    "Wedding Magazine (Ceremony Press)": { mode: "context-only" },
    "Audio Guestbook / Memory Box": {
      mode: "text-match",
      rawCategories: ["Extras"],
      includeAny: ["audio", "guestbook", "memory"],
    },
    "Dress Steaming": {
      mode: "text-match",
      rawCategories: ["Extras"],
      includeAny: ["steaming", "dress"],
    },
    "Sparklers / Confetti": {
      mode: "text-match",
      rawCategories: ["Extras"],
      includeAny: ["spark", "confetti"],
    },
    Dancefloor: {
      mode: "text-match",
      rawCategories: ["Extras"],
      includeAny: ["dancefloor"],
    },
    "Cold Sparks / Special Effects": {
      mode: "text-match",
      rawCategories: ["Extras"],
      includeAny: ["spark", "special", "effects"],
    },
    "Not sure yet": { mode: "context-only" },
  },
};

type PersistedRequestContext = {
  version: 1;
  visibleNotes: string;
  selectedCollection: string;
  snapshotSeason: string;
  snapshotGuestRange: string;
  snapshotLocation: string;
  snapshotBudget: string;
  serviceIntent: Record<string, ServiceIntent>;
  servicePriority: Record<string, ServicePriority>;
  serviceNotes: Record<string, string>;
  selectedOptions: Record<string, string[]>;
  styleTags: string[];
  atmosphereTags: string[];
  mustHaves: string;
  avoidNotes: string;
};

const CONTEXT_START = "\n\n---REQUEST_CONTEXT_JSON_START---\n";
const CONTEXT_END = "\n---REQUEST_CONTEXT_JSON_END---";
const LOCAL_CONTEXT_KEY = "my-quote-request-context-v1";

const defaultContext = (): PersistedRequestContext => ({
  version: 1,
  visibleNotes: "",
  selectedCollection: "",
  snapshotSeason: "",
  snapshotGuestRange: "",
  snapshotLocation: "",
  snapshotBudget: "",
  serviceIntent: {},
  servicePriority: {},
  serviceNotes: {},
  selectedOptions: {},
  styleTags: [],
  atmosphereTags: [],
  mustHaves: "",
  avoidNotes: "",
});

const parseNotesEnvelope = (raw: string | undefined | null) => {
  const source = String(raw ?? "");
  const start = source.indexOf(CONTEXT_START);
  const end = source.indexOf(CONTEXT_END);
  if (start === -1 || end === -1 || end <= start) {
    return {
      visibleNotes: source,
      context: defaultContext(),
    };
  }
  const visibleNotes = source.slice(0, start).trimEnd();
  const jsonBlock = source
    .slice(start + CONTEXT_START.length, end)
    .trim();
  try {
    const parsed = JSON.parse(jsonBlock) as Partial<PersistedRequestContext>;
    return {
      visibleNotes,
      context: {
        ...defaultContext(),
        ...parsed,
        version: 1,
      },
    };
  } catch {
    return {
      visibleNotes: source,
      context: defaultContext(),
    };
  }
};

const buildNotesEnvelope = (
  visibleNotes: string,
  context: PersistedRequestContext
) => {
  const cleanVisible = visibleNotes.trim();
  const json = JSON.stringify(context);
  return `${cleanVisible}${CONTEXT_START}${json}${CONTEXT_END}`;
};

export default function MyQuote() {
  const {
    notesDraft,
    setNotesDraft,
    isSubmittingQuote,
    isLoading,
    usingDevPackages,
    orderedCategories,
    packagesByCategory,
    quoteStatus,
    items,
    canSubmit,
    addItem,
    updateNotes,
    submitQuote,
    handleAdd,
    handleSubmit,
  } = useMyQuoteRequestLogic();

  const [serviceIntent, setServiceIntent] = useState<Record<string, ServiceIntent>>(
    {}
  );
  const [servicePriority, setServicePriority] = useState<
    Record<string, ServicePriority>
  >({});
  const [serviceNotes, setServiceNotes] = useState<Record<string, string>>({});
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [styleTags, setStyleTags] = useState<string[]>([]);
  const [atmosphereTags, setAtmosphereTags] = useState<string[]>([]);
  const [mustHaves, setMustHaves] = useState("");
  const [avoidNotes, setAvoidNotes] = useState("");
  const [visibleNotes, setVisibleNotes] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("");
  const [snapshotSeason, setSnapshotSeason] = useState("");
  const [snapshotGuestRange, setSnapshotGuestRange] = useState("");
  const [snapshotLocation, setSnapshotLocation] = useState("");
  const [snapshotBudget, setSnapshotBudget] = useState("");
  const { data: profile } = trpc.profile.get.useQuery(undefined, { retry: false });
  const hasHydratedRef = useRef(false);

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

  const allPackages = useMemo(() => {
    const combined: Array<{
      id: number;
      category: string;
      packageName?: string | null;
      supplierName?: string | null;
    }> = [];
    for (const cat of orderedCategories) {
      const list = packagesByCategory[cat.key] ?? [];
      for (const pkg of list) {
        combined.push(pkg);
      }
    }
    return combined;
  }, [orderedCategories, packagesByCategory]);

  const normalizeText = (value: unknown) =>
    String(value ?? "")
      .toLowerCase()
      .trim();

  const resolveOptionPackageIds = (category: SimplifiedCategory, option: string) => {
    const rule = OPTION_TO_PACKAGE_MAPPING[category]?.[option];
    if (!rule || rule.mode === "context-only") return [];

    const scoped = (rule.mode === "raw-category" || rule.mode === "text-match") &&
      rule.rawCategories
      ? allPackages.filter(pkg => rule.rawCategories!.includes(pkg.category))
      : allPackages;

    if (rule.mode === "raw-category") {
      return scoped.map(pkg => pkg.id);
    }

    const matches = scoped.filter(pkg => {
      const haystack = `${normalizeText(pkg.packageName)} ${normalizeText(pkg.supplierName)} ${normalizeText(pkg.category)}`;
      return rule.includeAny.some(token => haystack.includes(normalizeText(token)));
    });
    return matches.map(pkg => pkg.id);
  };

  const mapRawCategoryToSimplified = (rawCategory: string): SimplifiedCategory | null =>
    RAW_TO_SIMPLIFIED[rawCategory] ?? null;

  const selectedByCategory = useMemo(() => {
    const grouped: Record<string, typeof items> = {};
    for (const item of items) {
      const pkg = allPackages.find(p => p.id === item.packageId);
      const simplified = pkg ? mapRawCategoryToSimplified(pkg.category) : null;
      if (!simplified) continue;
      if (!grouped[simplified]) grouped[simplified] = [];
      grouped[simplified].push(item);
    }
    return grouped;
  }, [allPackages, items]);

  const activeCategoryList = useMemo(
    () =>
      SIMPLIFIED_CATEGORIES.filter(cat => {
        const hasIntent = (serviceIntent[cat] ?? "skip") !== "skip";
        const hasOptions = (selectedOptions[cat]?.length ?? 0) > 0;
        const hasMappedItems = (selectedByCategory[cat]?.length ?? 0) > 0;
        return hasIntent || hasOptions || hasMappedItems;
      }),
    [selectedByCategory, selectedOptions, serviceIntent]
  );

  const selectedCategoryCount = activeCategoryList.length;
  const isSubmitted = quoteStatus !== "draft";

  const toggleTag = (
    tag: string,
    setList: Dispatch<SetStateAction<string[]>>
  ) => {
    setList(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]));
  };

  const getSnapshotValue = (
    value?: string | number | null,
    fallback = "Not selected"
  ) => (value && String(value).trim() ? String(value) : fallback);

  const contextForPersistence = useMemo<PersistedRequestContext>(
    () => ({
      version: 1,
      visibleNotes,
      selectedCollection,
      snapshotSeason,
      snapshotGuestRange,
      snapshotLocation,
      snapshotBudget,
      serviceIntent,
      servicePriority,
      serviceNotes,
      selectedOptions,
      styleTags,
      atmosphereTags,
      mustHaves,
      avoidNotes,
    }),
    [
      visibleNotes,
      selectedCollection,
      snapshotSeason,
      snapshotGuestRange,
      snapshotLocation,
      snapshotBudget,
      serviceIntent,
      servicePriority,
      serviceNotes,
      selectedOptions,
      styleTags,
      atmosphereTags,
      mustHaves,
      avoidNotes,
    ]
  );

  const hasMeaningfulContext = (ctx: PersistedRequestContext) =>
    Boolean(ctx.visibleNotes.trim()) ||
    Boolean(ctx.selectedCollection.trim()) ||
    Boolean(ctx.snapshotSeason.trim()) ||
    Boolean(ctx.snapshotGuestRange.trim()) ||
    Boolean(ctx.snapshotLocation.trim()) ||
    Boolean(ctx.snapshotBudget.trim()) ||
    Object.keys(ctx.serviceIntent).length > 0 ||
    Object.keys(ctx.servicePriority).length > 0 ||
    Object.keys(ctx.serviceNotes).length > 0 ||
    Object.keys(ctx.selectedOptions).length > 0 ||
    ctx.styleTags.length > 0 ||
    ctx.atmosphereTags.length > 0 ||
    Boolean(ctx.mustHaves.trim()) ||
    Boolean(ctx.avoidNotes.trim());

  useEffect(() => {
    if (hasHydratedRef.current) return;
    const parsedFromNotes = parseNotesEnvelope(notesDraft);
    let context = parsedFromNotes.context;
    if (
      !hasMeaningfulContext(context) &&
      typeof window !== "undefined" &&
      window.localStorage
    ) {
      const localRaw = window.localStorage.getItem(LOCAL_CONTEXT_KEY);
      if (localRaw) {
        try {
          const local = JSON.parse(localRaw) as PersistedRequestContext;
          context = { ...defaultContext(), ...local, version: 1 };
        } catch {
          context = parsedFromNotes.context;
        }
      }
    }
    setVisibleNotes(parsedFromNotes.visibleNotes || String(context.visibleNotes ?? ""));
    setSnapshotSeason(String(context.snapshotSeason ?? ""));
    setSnapshotGuestRange(String(context.snapshotGuestRange ?? ""));
    setSnapshotLocation(String(context.snapshotLocation ?? ""));
    setSnapshotBudget(String(context.snapshotBudget ?? ""));
    setServiceIntent(context.serviceIntent ?? {});
    setServicePriority(context.servicePriority ?? {});
    setServiceNotes(context.serviceNotes ?? {});
    setSelectedOptions(context.selectedOptions ?? {});
    setStyleTags(Array.isArray(context.styleTags) ? context.styleTags : []);
    setAtmosphereTags(Array.isArray(context.atmosphereTags) ? context.atmosphereTags : []);
    setMustHaves(String(context.mustHaves ?? ""));
    setAvoidNotes(String(context.avoidNotes ?? ""));
    setSelectedCollection(String(context.selectedCollection ?? ""));
    hasHydratedRef.current = true;
  }, [notesDraft]);

  useEffect(() => {
    if (!hasHydratedRef.current) return;
    setNotesDraft(visibleNotes);
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(
        LOCAL_CONTEXT_KEY,
        JSON.stringify(contextForPersistence)
      );
    }
  }, [contextForPersistence, setNotesDraft, visibleNotes]);

  const persistContextNow = async () => {
    const envelope = buildNotesEnvelope(visibleNotes, contextForPersistence);
    if (!usingDevPackages) {
      try {
        await updateNotes.mutateAsync({ plannerNotes: envelope });
      } catch {
        // Keep existing submit behavior even if note persistence fails.
      }
    }
  };

  const onSelectOption = (category: SimplifiedCategory, option: string) => {
    setSelectedOptions(prev => {
      const current = prev[category] ?? [];
      const exists = current.includes(option);
      const next = exists ? current.filter(v => v !== option) : [...current, option];
      return { ...prev, [category]: next };
    });

    const candidateIds = resolveOptionPackageIds(category, option);
    if (candidateIds.length > 0) {
      handleAdd(candidateIds[0]);
    }
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
              <Card className="border-neutral-200 bg-white">
                <CardContent className="p-5 space-y-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                      Wedding Date / Season
                    </p>
                    <p className="font-serif text-xl mt-1 text-neutral-900">
                      {getSnapshotValue(
                        snapshotSeason,
                        getSnapshotValue(
                          profile?.weddingDate,
                          getSnapshotValue(profile?.weddingSeason)
                        )
                      )}
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
                      {getSnapshotValue(
                        snapshotGuestRange,
                        getSnapshotValue(
                          profile?.guestCount ? `${profile.guestCount} guests` : ""
                        )
                      )}
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
                      {getSnapshotValue(
                        snapshotLocation,
                        getSnapshotValue(profile?.location)
                      )}
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
                      {getSnapshotValue(
                        snapshotBudget,
                        getSnapshotValue(profile?.budgetRange)
                      )}
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
                  htmlFor="selectedCollection"
                  className="text-[11px] uppercase tracking-[0.18em] text-neutral-500"
                >
                  Collections
                </label>
                <select
                  id="selectedCollection"
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

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="h-40 animate-pulse bg-neutral-100 border-neutral-200" />
              <Card className="h-40 animate-pulse bg-neutral-100 border-neutral-200" />
              <Card className="h-40 animate-pulse bg-neutral-100 border-neutral-200" />
            </div>
          ) : (
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
                  {selectedCategoryCount} categories selected
                </Badge>
              </div>

              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                {SIMPLIFIED_CATEGORIES.map(category => {
                  const selectedInCat = selectedByCategory[category] ?? [];
                  const intent =
                    serviceIntent[category] ?? (selectedInCat.length > 0 ? "need" : "maybe");
                  const priority = servicePriority[category] ?? "medium";
                  const showPreferences = intent === "need";
                  const selectedForCategory = selectedOptions[category] ?? [];
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
                                setServiceIntent(prev => ({
                                  ...prev,
                                  [category]: option.value as ServiceIntent,
                                }))
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
                                    disabled={addItem.isLoading}
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
          )}

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

                  <p className="text-sm text-neutral-600 mt-3">
                    Atmosphere details
                  </p>
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
                  <Button
                    variant="outline"
                    onClick={async () => {
                      await persistContextNow();
                    }}
                    disabled={updateNotes.isLoading}
                    className="border-neutral-300 text-neutral-800 hover:bg-neutral-100"
                  >
                    {updateNotes.isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Save Vision Notes
                  </Button>
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
                      Location:{" "}
                      {getSnapshotValue(
                        snapshotLocation,
                        getSnapshotValue(profile?.location)
                      )}
                    </p>
                    <p className="text-neutral-800">
                      Guests:{" "}
                      {getSnapshotValue(
                        snapshotGuestRange,
                        getSnapshotValue(profile?.guestCount ? `${profile.guestCount}` : "")
                      )}
                    </p>
                    <p className="text-neutral-800">
                      Date/Season:{" "}
                      {getSnapshotValue(
                        snapshotSeason,
                        getSnapshotValue(
                          profile?.weddingDate,
                          getSnapshotValue(profile?.weddingSeason)
                        )
                      )}
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
                      <p className="text-neutral-800">
                        Style: {styleTags.join(", ")}
                      </p>
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
                      onClick={async () => {
                        await handleSubmit();
                        await persistContextNow();
                      }}
                      disabled={!canSubmit || isSubmittingQuote}
                      className="bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-6 text-base tracking-[0.08em]"
                    >
                      {(submitQuote.isLoading || isSubmittingQuote) && !usingDevPackages ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Send My Wedding Request
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                    {items.length === 0 ? (
                      <p className="text-xs text-neutral-500">
                        Choose at least one essential service to continue.
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
