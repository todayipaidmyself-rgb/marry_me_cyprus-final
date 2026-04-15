import { trpc } from "@/lib/trpc";
import { useMemo, useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useBranding } from "@/contexts/BrandingContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { sendQuoteToFormspree } from "@/lib/quoteEmail";

type QuoteItem = {
  packageId: number;
  quantity: number;
  clientRate: number;
  deposit?: number;
  commission?: number;
  packageName?: string;
  supplierName?: string;
};

type PackageOption = {
  id: number;
  category: string;
  supplierName?: string | null;
  packageName?: string | null;
  clientRate?: number | string | null;
  deposit?: number | string | null;
  notes?: string | null;
};

type GroupedPackages = Record<string, PackageOption[]>;

type GuestQuoteItem = {
  id: string;
  label: string;
  type: string;
  packageId?: number;
  quantity?: number;
};

const CATEGORY_ORDER: { key: string; label: string }[] = [
  { key: "venue", label: "Venue" },
  { key: "Photography", label: "Photography & Videography" },
  { key: "Photo + Video", label: "Photo + Video" },
  { key: "Videography", label: "Videography" },
  { key: "Hair & Makeup", label: "Hair & Makeup" },
  { key: "flowers", label: "Flowers" },
  { key: "cake", label: "Wedding Cake" },
  { key: "decor", label: "Decor & Dressing" },
  { key: "Entertainment", label: "Entertainment" },
  { key: "Transport", label: "Wedding Day Transport" },
  { key: "planning_fee", label: "Planning Fee" },
  { key: "license", label: "License / Registrar Fee" },
  { key: "Extras", label: "Extras" },
];

// REMOVE when seed works
const DEV_HARDCODED_PACKAGES: PackageOption[] = [
  { id: 910001, category: "Photography", supplierName: "Beziique", packageName: "Sunset Package", clientRate: "1350", deposit: "300" },
  { id: 910002, category: "Photography", supplierName: "Lee Stuart", packageName: "Full Day", clientRate: "1150", deposit: "250" },
  { id: 910003, category: "Photo + Video", supplierName: "Christodoulou", packageName: "Full Day Photo & Video", clientRate: "3300", deposit: "700" },
  { id: 910004, category: "Photography", supplierName: "Thimisy", packageName: "Full Day Photos", clientRate: "1495", deposit: "300" },
  { id: 910005, category: "Photography", supplierName: "Big Day Social", packageName: "Content Creator", clientRate: "650", deposit: "150" },
  { id: 910006, category: "Photography", supplierName: "Beziique", packageName: "Golden Hour Deluxe", clientRate: "1750", deposit: "400" },
  { id: 910007, category: "Photography", supplierName: "Lee Stuart", packageName: "Signature Full Weekend", clientRate: "1850", deposit: "400" },
  { id: 910008, category: "Photography", supplierName: "Peter Blue", packageName: "Half Day", clientRate: "750", deposit: "150" },
  { id: 910009, category: "Photo + Video", supplierName: "Chris Stephenson", packageName: "Photo + Film", clientRate: "2400", deposit: "500" },
  { id: 910010, category: "Photo + Video", supplierName: "Frame & Film Cyprus", packageName: "All-Day Duo Coverage", clientRate: "2750", deposit: "600" },
  { id: 910011, category: "Photo + Video", supplierName: "Thimisy", packageName: "Photo + Video Full Day", clientRate: "2490", deposit: "500" },
  { id: 910012, category: "Videography", supplierName: "Storybox Films", packageName: "Classic", clientRate: "1200", deposit: "250" },
  { id: 910013, category: "Videography", supplierName: "White Motion", packageName: "Cinematic Film", clientRate: "1900", deposit: "400" },
  { id: 910014, category: "Videography", supplierName: "Renoir Visuals", packageName: "Cinema Film + Speech Edit", clientRate: "1550", deposit: "320" },
  { id: 910015, category: "Hair & Makeup", supplierName: "Cyprus Bridal Hair", packageName: "Bridal with trial", clientRate: "100", deposit: "20" },
  { id: 910016, category: "Hair & Makeup", supplierName: "Renoir", packageName: "Bridal 2026", clientRate: "175", deposit: "40" },
  { id: 910017, category: "Hair & Makeup", supplierName: "KC Bridal Beauty", packageName: "Bridal with trial", clientRate: "130", deposit: "30" },
  { id: 910018, category: "Hair & Makeup", supplierName: "Makeup by Elena", packageName: "Bridal Makeup (with trial)", clientRate: "120", deposit: "30" },
  { id: 910019, category: "Hair & Makeup", supplierName: "Cyprus Bridal Hair", packageName: "Bridesmaid Hair", clientRate: "65", deposit: "20" },
  { id: 910020, category: "Hair & Makeup", supplierName: "Glam by Sofia", packageName: "Bridal Full Look (trial + day)", clientRate: "180", deposit: "50" },
  { id: 910021, category: "Hair & Makeup", supplierName: "Makeup by Elena", packageName: "Mother of Bride Makeup", clientRate: "70", deposit: "20" },
  { id: 910022, category: "Entertainment", supplierName: "Definitive Disco", packageName: "Standard", clientRate: "450", deposit: "120" },
  { id: 910023, category: "Entertainment", supplierName: "DJ Jason", packageName: "5 hours", clientRate: "450", deposit: "100" },
  { id: 910024, category: "Entertainment", supplierName: "DJ Pizel", packageName: "Weekend", clientRate: "650", deposit: "170" },
  { id: 910025, category: "Entertainment", supplierName: "Definitive Disco", packageName: "Wedding Party Set 5h", clientRate: "620", deposit: "150" },
  { id: 910026, category: "Entertainment", supplierName: "DJ Jason", packageName: "Ceremony + 4h", clientRate: "520", deposit: "120" },
  { id: 910027, category: "Entertainment", supplierName: "Duo Strings", packageName: "Ceremony Set", clientRate: "380", deposit: "80" },
  { id: 910028, category: "Entertainment", supplierName: "Sunset Live Band", packageName: "Live Band Full Evening", clientRate: "1400", deposit: "300" },
  { id: 910029, category: "Transport", supplierName: "Rolls Royce", packageName: "One Way", clientRate: "550", deposit: "150" },
  { id: 910030, category: "Transport", supplierName: "Range Rover", packageName: "One Way", clientRate: "185", deposit: "70" },
  { id: 910031, category: "Transport", supplierName: "Rolls Royce", packageName: "Return", clientRate: "850", deposit: "200" },
  { id: 910032, category: "Transport", supplierName: "Mercedes Viano", packageName: "3 hours", clientRate: "280", deposit: "100" },
  { id: 910033, category: "Transport", supplierName: "Range Rover", packageName: "Full Day Chauffeur 6h", clientRate: "620", deposit: "180" },
  { id: 910034, category: "Transport", supplierName: "Luxury Coaches Cyprus", packageName: "Guest Shuttle Premium (up to 55)", clientRate: "520", deposit: "150" },
  { id: 910035, category: "Extras", supplierName: "Love Island Cakes", packageName: "Signature Wedding Cake", clientRate: "560", deposit: "180", notes: "15% comm" },
  { id: 910036, category: "Extras", supplierName: "Love Island Cakes", packageName: "Dessert Table + Cake Combo", clientRate: "780", deposit: "250", notes: "15% comm" },
  { id: 910037, category: "Extras", supplierName: "Audio Memories", packageName: "Audio Guestbook + Setup", clientRate: "295", deposit: "90" },
  { id: 910038, category: "Extras", supplierName: "FX Events", packageName: "Cold Sparklers + Confetti Combo", clientRate: "420", deposit: "120" },
  { id: 910039, category: "Extras", supplierName: "Marquee Letters", packageName: "LOVE + Initials Package", clientRate: "340", deposit: "110" },
  { id: 910040, category: "Extras", supplierName: "Dancefloors Cyprus", packageName: "Gloss Dancefloor 20x20", clientRate: "980", deposit: "280" },
  { id: 910041, category: "venue", supplierName: "Luxury Beach Venue", packageName: "Luxury Beach Full Day", clientRate: "4500", deposit: "1000" },
  { id: 910042, category: "flowers", supplierName: "Florals Cyprus", packageName: "Bridal Bouquet", clientRate: "800", deposit: "200" },
  { id: 910043, category: "cake", supplierName: "Cake Boutique", packageName: "3-Tier", clientRate: "600", deposit: "200" },
  { id: 910044, category: "decor", supplierName: "Renoir Events", packageName: "Full Dressing", clientRate: "2500", deposit: "600" },
  { id: 910045, category: "planning_fee", supplierName: "Marry Me Cyprus", packageName: "Marry Me Cyprus", clientRate: "2000", deposit: "500" },
  { id: 910046, category: "license", supplierName: "Cyprus Civil Registry", packageName: "Civil & Registrar", clientRate: "500", deposit: "200" },
  { id: 910047, category: "venue", supplierName: "Alassos", packageName: "Sea Terrace Full Day", clientRate: "4500", deposit: "1000" },
  { id: 910048, category: "flowers", supplierName: "Thimisy", packageName: "Full Floral Styling", clientRate: "1600", deposit: "400" },
];

export function useMyQuoteRequestLogic() {
  const [notesDraft, setNotesDraft] = useState("");
  const [guestItems, setGuestItems] = useState<GuestQuoteItem[]>([]);
  const [isEmailing, setIsEmailing] = useState(false);
  const [hasWarnedEmptyPackages, setHasWarnedEmptyPackages] = useState(false);
  const [localDevItems, setLocalDevItems] = useState<QuoteItem[]>([]);
  const [localDevStatus, setLocalDevStatus] = useState<"draft" | "submitted">(
    "draft"
  );
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  const hasAttemptedGuestMergeRef = useRef(false);
  const { branding } = useBranding();
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const quoteQuery = trpc.quote.getMyQuote.useQuery(undefined, {
    onSuccess(data) {
      setNotesDraft(data?.plannerNotes ?? "");
    },
  });
  const packagesQuery = trpc.quote.getPackages.useQuery(undefined, {
    onError: err => {
      console.warn("[MyQuote] getPackages failed, using dev fallback", err);
      toast.error("Packages failed to load", {
        description:
          err.message || "No packages loaded — DB/seed issue? Check terminal.",
      });
    },
  });

  const addItem = trpc.quote.addItemToQuote.useMutation({
    onMutate: async input => {
      await utils.quote.getMyQuote.cancel();
      const previousQuote = utils.quote.getMyQuote.getData();
      if (!previousQuote) return { previousQuote };

      const pkg = packagesById.get(input.packageId);
      const existingItems = Array.isArray(previousQuote.items)
        ? [...(previousQuote.items as QuoteItem[])]
        : [];
      const itemIndex = existingItems.findIndex(i => i.packageId === input.packageId);
      const nextItem: QuoteItem = {
        packageId: input.packageId,
        quantity: input.quantity,
        clientRate:
          Number(pkg?.clientRate ?? existingItems[itemIndex]?.clientRate ?? 0) || 0,
        deposit:
          pkg?.deposit !== undefined && pkg?.deposit !== null
            ? Number(pkg.deposit)
            : existingItems[itemIndex]?.deposit,
        commission:
          pkg?.commission !== undefined && pkg?.commission !== null
            ? Number(pkg.commission)
            : existingItems[itemIndex]?.commission,
        packageName: pkg?.packageName ?? existingItems[itemIndex]?.packageName,
        supplierName: pkg?.supplierName ?? existingItems[itemIndex]?.supplierName,
      };

      if (itemIndex >= 0) {
        existingItems[itemIndex] = nextItem;
      } else {
        existingItems.push(nextItem);
      }

      const subtotal = existingItems.reduce(
        (acc, item) => acc + (Number(item.clientRate) || 0) * (item.quantity || 0),
        0
      );
      const total = subtotal + subtotal * 0.19;

      utils.quote.getMyQuote.setData(undefined, {
        ...previousQuote,
        items: existingItems,
        totalClient: total.toFixed(2),
        updatedAt: new Date(),
      });

      return { previousQuote };
    },
    onSuccess: async () => {
      toast.success("Added!");
      await utils.quote.getMyQuote.invalidate();
      await quoteQuery.refetch();
    },
    onError: (err, _input, context) => {
      if (context?.previousQuote) {
        utils.quote.getMyQuote.setData(undefined, context.previousQuote);
      }
      toast.error("Failed — try again", {
        description: err.message || "Unable to add package right now.",
      });
    },
  });

  const removeItem = trpc.quote.removeItemFromQuote.useMutation({
    onSuccess: () => quoteQuery.refetch(),
    onError: err =>
      toast.error("Unable to remove item", { description: err.message }),
  });

  const updateNotes = trpc.quote.updateNotes.useMutation({
    onSuccess: () => quoteQuery.refetch(),
    onError: err =>
      toast.error("Unable to save notes", { description: err.message }),
  });

  const submitQuote = trpc.quote.submitQuote.useMutation({
    onError: err =>
      toast.error("Unable to submit quote", { description: err.message }),
  });
  const submitWeddingIntake = trpc.quote.submitWeddingIntake.useMutation({
    onError: err =>
      toast.error("Planner intake failed", { description: err.message }),
  });
  const mergeGuestItems = trpc.quote.mergeGuestItems.useMutation({
    onError: err =>
      toast.error("Unable to merge guest selections", {
        description: err.message || "Please try again.",
      }),
  });

  const isLoading = quoteQuery.isLoading || packagesQuery.isLoading;
  const quote = quoteQuery.data;
  const isGuestSession = !user;
  const fetchedPackages: PackageOption[] = Array.isArray(packagesQuery.data)
    ? (packagesQuery.data as PackageOption[])
    : [];
  const usingDevPackages = !isLoading && fetchedPackages.length === 0;
  const packages: PackageOption[] = usingDevPackages
    ? DEV_HARDCODED_PACKAGES
    : fetchedPackages;

  const normalizeCategory = (value: unknown) =>
    String(value ?? "")
      .trim()
      .toLowerCase();

  const packagesById = useMemo(
    () => new Map<number, PackageOption>(packages.map(pkg => [pkg.id, pkg])),
    [packages]
  );

  const packagesByCategory = useMemo<GroupedPackages>(() => {
    const grouped: GroupedPackages = {};
    for (const cat of CATEGORY_ORDER) {
      grouped[cat.key] = [];
    }
    for (const pkg of packages) {
      const matchingCategory = CATEGORY_ORDER.find(
        cat => normalizeCategory(cat.key) === normalizeCategory(pkg.category)
      );
      const key = matchingCategory?.key ?? pkg.category ?? "other";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(pkg);
    }
    return grouped;
  }, [packages]);

  const orderedCategories = useMemo(() => {
    const seen = new Set(CATEGORY_ORDER.map(c => c.key));
    const known = CATEGORY_ORDER.map(c => ({
      key: c.key,
      label: c.label,
    }));
    const unknown = Object.keys(packagesByCategory)
      .filter(key => !seen.has(key) && (packagesByCategory[key]?.length ?? 0) > 0)
      .sort((a, b) => a.localeCompare(b))
      .map(key => ({ key, label: key }));
    return [...known, ...unknown];
  }, [packagesByCategory]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    console.log("[MyQuote] Loaded packages:", fetchedPackages);
    console.log("[MyQuote] getPackages state", {
      isLoading: packagesQuery.isLoading,
      isFetching: packagesQuery.isFetching,
      isError: packagesQuery.isError,
      error: packagesQuery.error?.message ?? null,
      dataCount: fetchedPackages.length,
    });
    if (usingDevPackages) {
      console.log("[MyQuote] Using hardcoded dev packages fallback");
    }
  }, [
    fetchedPackages,
    packagesQuery.error?.message,
    packagesQuery.isError,
    packagesQuery.isFetching,
    packagesQuery.isLoading,
    usingDevPackages,
  ]);

  useEffect(() => {
    if (isLoading) return;
    if (!usingDevPackages) return;
    if (hasWarnedEmptyPackages) return;
    toast.warning("Using dev packages — run seed for production");
    setHasWarnedEmptyPackages(true);
  }, [hasWarnedEmptyPackages, isLoading, usingDevPackages]);

  const items: QuoteItem[] =
    usingDevPackages || isGuestSession
      ? localDevItems
      : ((quote?.items ?? []) as QuoteItem[]);
  const quoteStatus =
    usingDevPackages || isGuestSession ? localDevStatus : (quote?.status ?? "draft");

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (acc, item) =>
        acc + (Number(item.clientRate) || 0) * (item.quantity || 0),
      0
    );
    const vat = subtotal * 0.19;
    return {
      subtotal,
      vat,
      total: subtotal + vat,
      commission: items.reduce(
        (acc, item) =>
          acc + (Number(item.commission) || 0) * (item.quantity || 0),
        0
      ),
    };
  }, [items]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("quote-guest-items");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as GuestQuoteItem[];
      if (Array.isArray(parsed)) {
        setGuestItems(
          parsed
            .map(item => ({
              id: String(item?.id ?? ""),
              label: String(item?.label ?? ""),
              type: String(item?.type ?? ""),
              packageId:
                Number.isFinite(Number(item?.packageId)) && Number(item?.packageId) > 0
                  ? Number(item?.packageId)
                  : undefined,
              quantity:
                Number.isFinite(Number(item?.quantity)) && Number(item?.quantity) > 0
                  ? Number(item?.quantity)
                  : undefined,
            }))
            .filter(item => item.id && item.label)
        );
      }
    } catch (_err) {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (hasAttemptedGuestMergeRef.current) return;
    if (!user || usingDevPackages) return;
    if (quoteQuery.isLoading || packagesQuery.isLoading) return;

    const raw = localStorage.getItem("quote-guest-items");
    if (!raw) {
      hasAttemptedGuestMergeRef.current = true;
      return;
    }

    let parsed: GuestQuoteItem[] = [];
    try {
      const value = JSON.parse(raw) as GuestQuoteItem[];
      parsed = Array.isArray(value) ? value : [];
    } catch {
      parsed = [];
    }

    if (!parsed.length) {
      hasAttemptedGuestMergeRef.current = true;
      return;
    }

    hasAttemptedGuestMergeRef.current = true;
    void (async () => {
      try {
        const result = await mergeGuestItems.mutateAsync({
          items: parsed.map(item => ({
            id: item.id,
            label: item.label,
            type: item.type,
            packageId: item.packageId,
            quantity: item.quantity,
          })),
        });

        await quoteQuery.refetch();
        if (result.mergedCount > 0) {
          toast.success("Guest selections merged into your quote");
          localStorage.removeItem("quote-guest-items");
          setGuestItems([]);
        } else if (result.skippedCount > 0) {
          toast.warning("Some guest selections could not be matched", {
            description: "Open My Quote and add packages manually.",
          });
        }
      } catch (err) {
        console.warn("[MyQuote] Guest merge failed", err);
      }
    })();
  }, [
    mergeGuestItems,
    packagesQuery.isLoading,
    quoteQuery,
    quoteQuery.isLoading,
    usingDevPackages,
    user,
  ]);

  const clearGuestItems = () => {
    setGuestItems([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("quote-guest-items");
    }
  };

  const handleAdd = (packageId: number) => {
    const addLocally = (qtyToAdd: number) => {
      if (!Number.isFinite(qtyToAdd) || qtyToAdd <= 0) return;
      const pkg = packagesById.get(packageId);
      if (!pkg) return;
      setLocalDevItems(prev => {
        const next = [...prev];
        const idx = next.findIndex(item => item.packageId === packageId);
        if (idx >= 0) {
          next[idx] = {
            ...next[idx],
            quantity: Math.max(1, (next[idx].quantity || 0) + qtyToAdd),
            clientRate: Number(pkg.clientRate ?? next[idx].clientRate ?? 0),
            deposit:
              pkg.deposit !== undefined && pkg.deposit !== null
                ? Number(pkg.deposit)
                : next[idx].deposit,
            packageName: pkg.packageName ?? next[idx].packageName,
            supplierName: pkg.supplierName ?? next[idx].supplierName,
          };
        } else {
          next.push({
            packageId,
            quantity: qtyToAdd,
            clientRate: Number(pkg.clientRate ?? 0),
            deposit:
              pkg.deposit !== undefined && pkg.deposit !== null
                ? Number(pkg.deposit)
                : undefined,
            packageName: pkg.packageName ?? undefined,
            supplierName: pkg.supplierName ?? undefined,
          });
        }
        return next;
      });
    };

    if (!user) {
      const pkg = packagesById.get(packageId);
      if (!pkg || typeof window === "undefined") return;
      const saved = localStorage.getItem("quote-guest-items");
      let next: GuestQuoteItem[] = [];
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as GuestQuoteItem[];
          next = Array.isArray(parsed) ? parsed : [];
        } catch {
          next = [];
        }
      }
      const existingIndex = next.findIndex(item => item.packageId === packageId);
      if (existingIndex >= 0) {
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: Math.max(1, Number(next[existingIndex].quantity ?? 1) + 1),
        };
      } else {
        next.push({
          id: `package-${packageId}`,
          label: `${pkg.supplierName ?? "Supplier"} — ${pkg.packageName ?? "Package"}`,
          type: pkg.category,
          packageId,
          quantity: 1,
        });
      }
      localStorage.setItem("quote-guest-items", JSON.stringify(next));
      setGuestItems(next);
      // RE-ENABLE for prod — persistence notice.
      // toast.success("Added — sign in to persist", {
      //   description: "We will merge this into your quote after login.",
      // });
      addLocally(1);
      toast.success("Added!");
      return;
    }

    if (usingDevPackages) {
      addLocally(1);
      toast.success("Added!");
      return;
    }
    addItem.mutate({ packageId, quantity: 1 });
  };

  const handleQuantityChange = (item: QuoteItem, nextQty: number) => {
    if (!Number.isFinite(nextQty) || nextQty <= 0) return;
    if (usingDevPackages || isGuestSession) {
      setLocalDevItems(prev =>
        prev.map(it =>
          it.packageId === item.packageId ? { ...it, quantity: nextQty } : it
        )
      );
      return;
    }
    addItem.mutate({ packageId: item.packageId, quantity: nextQty });
  };

  const handleRemove = (packageId: number) => {
    if (usingDevPackages || isGuestSession) {
      setLocalDevItems(prev => prev.filter(item => item.packageId !== packageId));
      return;
    }
    removeItem.mutate({ packageId });
  };

  const handleSaveNotes = () => {
    updateNotes.mutate({ plannerNotes: notesDraft });
  };

  const handleEmailQuotation = async () => {
    if (!quote && !usingDevPackages) {
      toast.error("Failed — try again");
      return;
    }
    if (quoteStatus === "draft") {
      toast.error("Failed — try again", {
        description: "Submit the quote before emailing.",
      });
      return;
    }
    if (items.length === 0) {
      toast.error("Failed — try again", {
        description: "Quote must include at least one item.",
      });
      return;
    }

    const pkgMap = new Map<number, PackageOption>(packages.map(p => [p.id, p]));
    const enrichedItems = items.map(item => {
      const pkg = pkgMap.get(item.packageId);
      return {
        supplierName: item.supplierName ?? pkg?.supplierName ?? "Supplier",
        packageName: item.packageName ?? pkg?.packageName ?? "Package",
        quantity: Number(item.quantity) || 0,
        clientRate: Number(item.clientRate) || 0,
      };
    });

    try {
      setIsEmailing(true);
      await sendQuoteToFormspree({
        quoteEmail: {
          status: quoteStatus,
          coupleName: user?.name?.trim() || "Lovely Couple",
          coupleEmail:
            user?.email?.trim() ||
            import.meta.env.VITE_QUOTE_TEST_EMAIL?.trim() ||
            "test@example.com",
          plannerEmail:
            import.meta.env.VITE_PLANNER_EMAIL?.trim() ||
            "planner@marrymecyprus.com",
          coupleNotes: notesDraft?.trim() || undefined,
          plannerNotes:
            (usingDevPackages ? notesDraft : quote?.plannerNotes)?.trim() || undefined,
          items: enrichedItems,
          branding: {
            companyName: branding.companyName,
            tagline: branding.tagline,
            logoUrl: branding.logoUrl,
            heroImageUrl: branding.heroImageUrl,
            primaryColor: branding.primaryColor,
            secondaryColor: branding.secondaryColor,
            emailSignature: branding.emailSignature,
          },
        },
      });
      toast.success("Sent — check spam/dashboard");
    } catch (err) {
      console.warn("[MyQuote] Quote email failed", err);
      const detail =
        err instanceof Error && err.message
          ? err.message
          : "Check Formspree dashboard for submission.";
      toast.error("Failed — try again", {
        description: detail.includes("Check Formspree dashboard")
          ? detail
          : `${detail} Check Formspree dashboard for submission.`,
      });
    } finally {
      setIsEmailing(false);
    }
  };

  const canSubmit = items.length > 0 && !submitQuote.isLoading;
  const handleSubmit = async (options?: {
    weddingIntakePayload?: {
      coupleName1: string;
      weddingYear: number;
      notesInternal: string;
      coupleName2?: string;
      email?: string;
      phone?: string;
      locationDistrict?: string;
    };
  }) => {
    if (usingDevPackages) {
      setLocalDevStatus("submitted");
      toast.success("Quote submitted for planner review");
      return;
    }
    if (!quote || !user) {
      toast.error("Unable to submit quote", {
        description: "Please sign in and try again.",
      });
      return;
    }

    try {
      setIsSubmittingQuote(true);
      const updatedQuote = await submitQuote.mutateAsync();
      await quoteQuery.refetch();

      if (options?.weddingIntakePayload) {
        await submitWeddingIntake.mutateAsync(options.weddingIntakePayload);
      }

      toast.success("Quote submitted for planner review");

      const pkgMap = new Map<number, PackageOption>(packages.map(p => [p.id, p]));
      const submittedItems = ((updatedQuote?.items ?? items) as QuoteItem[]).map(item => {
        const pkg = pkgMap.get(item.packageId);
        return {
          supplierName: item.supplierName ?? pkg?.supplierName ?? "Supplier",
          packageName: item.packageName ?? pkg?.packageName ?? "Package",
          quantity: Number(item.quantity) || 0,
          clientRate: Number(item.clientRate) || 0,
        };
      });

      if (submittedItems.length > 0) {
        try {
          await sendQuoteToFormspree({
            subject: "Your Marry Me Cyprus Quote — Submitted",
            quoteEmail: {
              status: "submitted",
              coupleName: user?.name?.trim() || "Lovely Couple",
              coupleEmail:
                user?.email?.trim() ||
                import.meta.env.VITE_QUOTE_TEST_EMAIL?.trim() ||
                "test@example.com",
              plannerEmail:
                import.meta.env.VITE_PLANNER_EMAIL?.trim() ||
                "planner@marrymecyprus.com",
              coupleNotes: notesDraft?.trim() || undefined,
              plannerNotes:
                updatedQuote?.plannerNotes?.trim() ||
                quote?.plannerNotes?.trim() ||
                undefined,
              items: submittedItems,
              branding: {
                companyName: branding.companyName,
                tagline: branding.tagline,
                logoUrl: branding.logoUrl,
                heroImageUrl: branding.heroImageUrl,
                primaryColor: branding.primaryColor,
                secondaryColor: branding.secondaryColor,
                emailSignature: branding.emailSignature,
              },
            },
          });
          toast.success("Submitted notification sent — check spam/dashboard");
        } catch (emailErr) {
          console.warn("[MyQuote] Submit notification email failed", emailErr);
          toast.warning("Quote submitted, but email notification failed", {
            description: "Check Formspree dashboard for submission.",
          });
        }
      }
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  return {
    notesDraft,
    setNotesDraft,
    guestItems,
    isEmailing,
    isSubmittingQuote,
    isLoading,
    usingDevPackages,
    orderedCategories,
    packagesByCategory,
    quoteStatus,
    totals,
    items,
    canSubmit,
    quoteQuery,
    addItem,
    removeItem,
    updateNotes,
    submitQuote,
    clearGuestItems,
    handleAdd,
    handleQuantityChange,
    handleRemove,
    handleSaveNotes,
    handleEmailQuotation,
    handleSubmit,
  };
}
