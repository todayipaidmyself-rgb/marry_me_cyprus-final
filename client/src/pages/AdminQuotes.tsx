import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Loader2,
  ChevronDown,
  ChevronUp,
  FileText,
  Trash2,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useBranding } from "@/contexts/BrandingContext";
import { sendQuoteToFormspree } from "@/lib/quoteEmail";
import {
  composePlannerNotes,
  parsePlannerNotes,
  type RequestContextData,
} from "@/lib/requestContext";

type StatusFilter = "all" | "draft" | "submitted" | "revising" | "agreed";

type QuoteItem = {
  packageId: number;
  quantity: number;
  clientRate: number;
  deposit?: number;
  commission?: number;
  packageName?: string;
  supplierName?: string;
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-white/10 text-white/70 border-white/20",
  submitted: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  revising: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  agreed: "bg-green-500/20 text-green-300 border-green-500/30",
};

const CATEGORY_ORDER = [
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

export default function AdminQuotes() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [emailingQuoteId, setEmailingQuoteId] = useState<number | null>(null);
  const { branding } = useBranding();

  // Editing state for the expanded quote
  const [editItems, setEditItems] = useState<QuoteItem[]>([]);
  const [editNotes, setEditNotes] = useState("");
  const [editStatus, setEditStatus] = useState<string>("");
  const [editRequestContext, setEditRequestContext] =
    useState<RequestContextData | null>(null);
  const [editRequestContextParseError, setEditRequestContextParseError] =
    useState(false);

  const {
    data: allQuotes = [],
    isLoading,
    refetch,
  } = trpc.quote.listQuotes.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
    retry: false,
    onError: () => {
      toast.error("Unable to load quotes");
    },
  });

  const packagesQuery = trpc.quote.getPackages.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  const editMutation = trpc.quote.editQuoteAdmin.useMutation({
    onSuccess: () => {
      toast.success("Quote updated");
      refetch();
    },
    onError: err => {
      toast.error("Update failed", { description: err.message });
    },
  });

  const packages = packagesQuery.data ?? [];

  const packagesByCategory = useMemo(() => {
    const grouped: Record<string, typeof packages> = {};
    for (const pkg of packages) {
      const key = pkg.category;
      if (!grouped[key]) grouped[key] = [];
      grouped[key]!.push(pkg);
    }
    return grouped;
  }, [packages]);

  // Redirect non-admin
  if (!authLoading && (!user || user.role !== "admin")) {
    setLocation("/dashboard");
    return null;
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#C6B4AB]" />
      </div>
    );
  }

  const filteredQuotes =
    statusFilter === "all"
      ? allQuotes
      : allQuotes.filter(q => q.status === statusFilter);

  const statusCounts = {
    all: allQuotes.length,
    draft: allQuotes.filter(q => q.status === "draft").length,
    submitted: allQuotes.filter(q => q.status === "submitted").length,
    revising: allQuotes.filter(q => q.status === "revising").length,
    agreed: allQuotes.filter(q => q.status === "agreed").length,
  };

  const openEditor = (quote: (typeof allQuotes)[number]) => {
    const parsedNotes = parsePlannerNotes(quote.plannerNotes);
    setExpandedId(quote.id);
    setEditItems([...(quote.items as QuoteItem[])]);
    setEditNotes(parsedNotes.visibleNotes);
    setEditStatus(quote.status);
    setEditRequestContext(parsedNotes.requestContext);
    setEditRequestContextParseError(parsedNotes.parseError);
  };

  const closeEditor = () => {
    setExpandedId(null);
    setEditItems([]);
    setEditNotes("");
    setEditStatus("");
    setEditRequestContext(null);
    setEditRequestContextParseError(false);
  };

  const handleSave = (quoteId: number) => {
    editMutation.mutate({
      quoteId,
      status: editStatus as
        | "draft"
        | "submitted"
        | "revising"
        | "agreed"
        | undefined,
      plannerNotes: composePlannerNotes(editNotes, editRequestContext),
      items: editItems.map(item => ({
        packageId: item.packageId,
        quantity: item.quantity,
        clientRate: item.clientRate,
        commission: item.commission,
        packageName: item.packageName,
        supplierName: item.supplierName,
      })),
    });
  };

  const handleSendRevision = (quoteId: number) => {
    const quote = allQuotes.find(q => q.id === quoteId);
    const currentItems = [...editItems];
    const currentNotes = editNotes;
    const currentStoredNotes = composePlannerNotes(editNotes, editRequestContext);
    const currentStatus = "revising" as const;

    editMutation.mutate(
      {
        quoteId,
        status: "revising",
        plannerNotes: currentStoredNotes,
        items: editItems.map(item => ({
          packageId: item.packageId,
          quantity: item.quantity,
          clientRate: item.clientRate,
          commission: item.commission,
          packageName: item.packageName,
          supplierName: item.supplierName,
        })),
      },
      {
        onSuccess: () => {
          toast.success("Revision sent to couple");
          refetch();
          if (!quote) return;

          const pkgMap = new Map<number, (typeof packages)[number]>(
            packages.map(p => [p.id, p])
          );
          const revisionItems = currentItems
            .filter(item => Number(item.quantity) > 0)
            .map(item => {
              const pkg = pkgMap.get(item.packageId);
              return {
                supplierName: item.supplierName ?? pkg?.supplierName ?? "Supplier",
                packageName: item.packageName ?? pkg?.packageName ?? "Package",
                quantity: Number(item.quantity) || 0,
                clientRate: Number(item.clientRate) || 0,
              };
            });

          if (revisionItems.length === 0) return;
          void sendQuoteToFormspree({
            subject: "Your Marry Me Cyprus Quote — Revised",
            quoteEmail: {
              status: currentStatus,
              coupleName: `Couple #${quote.userId}`,
              coupleEmail:
                import.meta.env.VITE_QUOTE_TEST_EMAIL?.trim() || "test@example.com",
              plannerEmail:
                user?.email?.trim() ||
                import.meta.env.VITE_PLANNER_EMAIL?.trim() ||
                "planner@marrymecyprus.com",
              coupleNotes: undefined,
              plannerNotes: currentNotes?.trim() || undefined,
              items: revisionItems,
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
          })
            .then(() => {
              toast.success("Revision notification sent — check spam/dashboard");
            })
            .catch(err => {
              console.warn("[AdminQuotes] Revision notification email failed", err);
              toast.warning("Revision saved, but email notification failed", {
                description: "Check Formspree dashboard for submission.",
              });
            });
        },
      }
    );
  };

  const handleMarkAgreed = (quoteId: number) => {
    editMutation.mutate(
      {
        quoteId,
        status: "agreed",
        plannerNotes: composePlannerNotes(editNotes, editRequestContext),
      },
      {
        onSuccess: () => {
          toast.success("Quote marked as agreed");
          refetch();
        },
      }
    );
  };

  const handleEditItemField = (
    index: number,
    field: keyof QuoteItem,
    value: string | number
  ) => {
    setEditItems(prev => {
      const next = [...prev];
      const item = { ...next[index] };
      if (field === "quantity" || field === "clientRate" || field === "commission") {
        (item as any)[field] = Number(value) || 0;
      } else {
        (item as any)[field] = value;
      }
      next[index] = item;
      return next;
    });
  };

  const handleRemoveEditItem = (index: number) => {
    setEditItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddPackage = (pkgId: number) => {
    const pkg = packages.find(p => p.id === pkgId);
    if (!pkg) return;
    setEditItems(prev => [
      ...prev,
      {
        packageId: pkg.id,
        quantity: 1,
        clientRate: Number(pkg.clientRate ?? 0),
        deposit: pkg.deposit ? Number(pkg.deposit) : undefined,
        commission: pkg.commission ? Number(pkg.commission) : undefined,
        packageName: pkg.packageName,
        supplierName: pkg.supplierName,
      },
    ]);
  };

  const handleEmailQuotation = async (quote: (typeof allQuotes)[number]) => {
    const quoteItems = (quote.items ?? []) as QuoteItem[];
    if (quote.status === "draft") {
      toast.error("Failed — try again", {
        description: "Submit the quote before emailing.",
      });
      return;
    }
    if (quoteItems.length === 0) {
      toast.error("Failed — try again", {
        description: "Quote must include at least one item.",
      });
      return;
    }

    const pkgMap = new Map<number, (typeof packages)[number]>(
      packages.map(p => [p.id, p])
    );
    const enrichedItems = quoteItems.map(item => {
      const pkg = pkgMap.get(item.packageId);
      return {
        supplierName: item.supplierName ?? pkg?.supplierName ?? "Supplier",
        packageName: item.packageName ?? pkg?.packageName ?? "Package",
        quantity: Number(item.quantity) || 0,
        clientRate: Number(item.clientRate) || 0,
      };
    });

    try {
      setEmailingQuoteId(quote.id);
      await sendQuoteToFormspree({
        quoteEmail: {
          status: quote.status,
          coupleName: `Couple #${quote.userId}`,
          coupleEmail:
            import.meta.env.VITE_QUOTE_TEST_EMAIL?.trim() || "test@example.com",
          plannerEmail:
            user?.email?.trim() ||
            import.meta.env.VITE_PLANNER_EMAIL?.trim() ||
            "planner@marrymecyprus.com",
          coupleNotes: undefined,
          plannerNotes:
            expandedId === quote.id ? editNotes?.trim() : quote.plannerNotes || undefined,
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
      console.warn("[AdminQuotes] Quote email failed", err);
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
      setEmailingQuoteId(null);
    }
  };

  const editTotals = useMemo(() => {
    const subtotal = editItems.reduce(
      (acc, item) => acc + (Number(item.clientRate) || 0) * (item.quantity || 0),
      0
    );
    const vat = subtotal * 0.19;
    return {
      subtotal,
      vat,
      total: subtotal + vat,
      commission: editItems.reduce(
        (acc, item) =>
          acc + (Number(item.commission) || 0) * (item.quantity || 0),
        0
      ),
    };
  }, [editItems]);

  return (
    <div className="min-h-screen bg-black text-white pb-[calc(84px+env(safe-area-inset-bottom))]">
      <div className="container pt-32 pb-16 px-4">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl text-white mb-2">
              Quote Management
            </h1>
            <p className="text-white/60 font-sans">
              Review, edit and finalise couple quotes
            </p>
          </div>
          <Link href="/admin/inquiries">
            <Button
              variant="outline"
              className="border-[#C6B4AB] text-[#C6B4AB] hover:bg-[#C6B4AB] hover:text-black"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Inquiries
            </Button>
          </Link>
        </div>

        {/* Status filter */}
        <Card className="bg-white/5 border-[#C6B4AB]/20 backdrop-blur-sm mb-8">
          <CardContent className="py-4">
            <div className="flex flex-wrap gap-3">
              {(
                [
                  "all",
                  "draft",
                  "submitted",
                  "revising",
                  "agreed",
                ] as StatusFilter[]
              ).map(status => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className={
                    statusFilter === status
                      ? "bg-[#C6B4AB] text-black hover:bg-[#C6B4AB]/90"
                      : "border-[#C6B4AB]/40 text-white/70 hover:bg-white/10"
                  }
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)} (
                  {statusCounts[status]})
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Empty state */}
        {filteredQuotes.length === 0 && (
          <Card className="bg-white/5 border-[#C6B4AB]/20 backdrop-blur-sm">
            <CardContent className="py-16 text-center">
              <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/60 font-sans">No quotes yet.</p>
            </CardContent>
          </Card>
        )}

        {/* Quotes list */}
        <div className="space-y-4">
          {filteredQuotes.map(quote => {
            const isExpanded = expandedId === quote.id;
            const quoteItems = (quote.items ?? []) as QuoteItem[];
            const createdDate = new Date(quote.createdAt).toLocaleDateString(
              "en-GB",
              {
                day: "numeric",
                month: "short",
                year: "numeric",
              }
            );

            return (
              <Card
                key={quote.id}
                className="bg-white/5 border-[#C6B4AB]/20 backdrop-blur-sm overflow-hidden"
              >
                {/* Summary row */}
                <div
                  className="p-4 grid grid-cols-1 md:grid-cols-7 gap-4 items-center cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() =>
                    isExpanded ? closeEditor() : openEditor(quote)
                  }
                >
                  <div className="md:col-span-2">
                    <p className="font-serif text-lg text-white">
                      Quote #{quote.id}
                    </p>
                    <p className="text-white/50 text-sm font-sans">
                      User {quote.userId} &bull; {createdDate}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-white/50 uppercase tracking-wider mb-1">
                      Items
                    </p>
                    <p className="text-white font-sans">
                      {quoteItems.length} packages
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-white/50 uppercase tracking-wider mb-1">
                      Total
                    </p>
                    <p className="text-white font-sans font-semibold">
                      €{Number(quote.totalClient ?? 0).toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <Badge
                      className={`capitalize ${STATUS_COLORS[quote.status] ?? STATUS_COLORS.draft}`}
                    >
                      {quote.status}
                    </Badge>
                  </div>

                  <div className="flex justify-end md:justify-start">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#C6B4AB]/50 text-[#C6B4AB] hover:bg-[#C6B4AB] hover:text-black"
                      onClick={e => {
                        e.stopPropagation();
                        void handleEmailQuotation(quote);
                      }}
                      disabled={quote.status === "draft" || emailingQuoteId === quote.id}
                    >
                      {emailingQuoteId === quote.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Email Quotation
                    </Button>
                  </div>

                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm" className="text-[#C6B4AB]">
                      {isExpanded ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Expanded editor */}
                {isExpanded && (
                  <div className="p-6 border-t border-white/10 bg-white/[0.02] space-y-6">
                    {/* Status + notes row */}
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-3">
                        <label className="text-xs uppercase tracking-wider text-white/50">
                          Status
                        </label>
                        <Select
                          value={editStatus}
                          onValueChange={setEditStatus}
                        >
                          <SelectTrigger className="bg-white/5 border-white/20 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="submitted">Submitted</SelectItem>
                            <SelectItem value="revising">Revising</SelectItem>
                            <SelectItem value="agreed">Agreed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs uppercase tracking-wider text-white/50">
                          Planner Notes
                        </label>
                        <Textarea
                          value={editNotes}
                          onChange={e => setEditNotes(e.target.value)}
                          placeholder="Add notes for the couple or internal reference."
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/30 min-h-[80px]"
                        />
                        {editRequestContextParseError ? (
                          <p className="text-xs text-yellow-300/80">
                            Structured request context is present but malformed.
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {editRequestContext ? (
                      <Card className="bg-white/[0.03] border-white/10">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg font-serif text-white">
                            Couple Request Context
                          </CardTitle>
                          <CardDescription className="text-white/50">
                            Parsed from structured request data in notes.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                          {editRequestContext.styleTags &&
                          editRequestContext.styleTags.length > 0 ? (
                            <div>
                              <p className="text-xs uppercase tracking-wider text-white/50 mb-1">
                                Style Tags
                              </p>
                              <p className="text-white/80">
                                {editRequestContext.styleTags.join(", ")}
                              </p>
                            </div>
                          ) : null}
                          {editRequestContext.atmosphereTags &&
                          editRequestContext.atmosphereTags.length > 0 ? (
                            <div>
                              <p className="text-xs uppercase tracking-wider text-white/50 mb-1">
                                Atmosphere Tags
                              </p>
                              <p className="text-white/80">
                                {editRequestContext.atmosphereTags.join(", ")}
                              </p>
                            </div>
                          ) : null}
                          {editRequestContext.mustHaves ? (
                            <div>
                              <p className="text-xs uppercase tracking-wider text-white/50 mb-1">
                                Must-haves
                              </p>
                              <p className="text-white/80">
                                {editRequestContext.mustHaves}
                              </p>
                            </div>
                          ) : null}
                          {editRequestContext.avoidNotes ? (
                            <div>
                              <p className="text-xs uppercase tracking-wider text-white/50 mb-1">
                                Avoid
                              </p>
                              <p className="text-white/80">
                                {editRequestContext.avoidNotes}
                              </p>
                            </div>
                          ) : null}
                          {editRequestContext.serviceIntent &&
                          Object.keys(editRequestContext.serviceIntent).length > 0 ? (
                            <div>
                              <p className="text-xs uppercase tracking-wider text-white/50 mb-1">
                                Service Intent
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(editRequestContext.serviceIntent).map(
                                  ([key, value]) => (
                                    <Badge
                                      key={key}
                                      variant="outline"
                                      className="border-white/20 text-white/70"
                                    >
                                      {key}: {value}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                          ) : null}
                        </CardContent>
                      </Card>
                    ) : null}

                    {/* Items table */}
                    <Card className="bg-white/[0.03] border-white/10">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-serif text-white">
                          Line Items
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {editItems.length === 0 ? (
                          <p className="text-sm text-white/40">
                            No items. Add packages below.
                          </p>
                        ) : (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow className="border-white/10">
                                  <TableHead className="text-white/60">
                                    Supplier / Package
                                  </TableHead>
                                  <TableHead className="text-white/60 w-24">
                                    Qty
                                  </TableHead>
                                  <TableHead className="text-white/60 w-32">
                                    Rate (€)
                                  </TableHead>
                                  <TableHead className="text-white/60 w-32">
                                    Comm (€)
                                  </TableHead>
                                  <TableHead className="text-white/60 w-28">
                                    Line Total
                                  </TableHead>
                                  <TableHead className="w-12" />
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {editItems.map((item, idx) => (
                                  <TableRow
                                    key={`${item.packageId}-${idx}`}
                                    className="border-white/10"
                                  >
                                    <TableCell className="text-white">
                                      <span className="font-medium">
                                        {item.supplierName ?? "Supplier"}
                                      </span>{" "}
                                      — {item.packageName ?? "Package"}
                                    </TableCell>
                                    <TableCell>
                                      <Input
                                        type="number"
                                        min={1}
                                        value={item.quantity}
                                        onChange={e =>
                                          handleEditItemField(
                                            idx,
                                            "quantity",
                                            e.target.value
                                          )
                                        }
                                        className="w-20 bg-white/5 border-white/20 text-white"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Input
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        value={item.clientRate}
                                        onChange={e =>
                                          handleEditItemField(
                                            idx,
                                            "clientRate",
                                            e.target.value
                                          )
                                        }
                                        className="w-28 bg-white/5 border-white/20 text-white"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Input
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        value={item.commission ?? 0}
                                        onChange={e =>
                                          handleEditItemField(
                                            idx,
                                            "commission",
                                            e.target.value
                                          )
                                        }
                                        className="w-28 bg-white/5 border-white/20 text-white"
                                      />
                                    </TableCell>
                                    <TableCell className="text-white font-medium">
                                      €
                                      {(
                                        (Number(item.clientRate) || 0) *
                                        (item.quantity || 0)
                                      ).toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                          handleRemoveEditItem(idx)
                                        }
                                        className="text-white/50 hover:text-red-400"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Add packages accordion */}
                    <Accordion type="single" collapsible className="space-y-2">
                      <AccordionItem
                        value="add-packages"
                        className="bg-white/[0.03] border border-white/10 rounded-xl px-2"
                      >
                        <AccordionTrigger className="px-4 py-3 text-left text-white/80">
                          <div className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            <span>Add Packages</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4 max-h-[400px] overflow-y-auto">
                          {CATEGORY_ORDER.map(cat => {
                            const list = packagesByCategory[cat.key] ?? [];
                            if (list.length === 0) return null;
                            return (
                              <div key={cat.key} className="mb-4">
                                <p className="text-xs uppercase tracking-wider text-white/50 mb-2">
                                  {cat.label}
                                </p>
                                <div className="space-y-1">
                                  {list.map(pkg => (
                                    <div
                                      key={pkg.id}
                                      className="flex items-center justify-between py-2 px-3 rounded bg-white/5 hover:bg-white/10 transition-colors"
                                    >
                                      <div>
                                        <span className="text-sm text-white">
                                          {pkg.supplierName} —{" "}
                                          {pkg.packageName}
                                        </span>
                                        <span className="text-xs text-white/50 ml-2">
                                          €
                                          {Number(pkg.clientRate ?? 0).toFixed(
                                            2
                                          )}
                                        </span>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                          handleAddPackage(pkg.id)
                                        }
                                        className="text-[#C6B4AB] hover:text-white"
                                      >
                                        <Plus className="h-3 w-3 mr-1" />
                                        Add
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    {/* Totals summary */}
                    <Card className="bg-white/[0.03] border-white/10">
                      <CardContent className="py-4 space-y-2 text-sm">
                        <div className="flex justify-between text-white/70">
                          <span>Subtotal</span>
                          <span>€{editTotals.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-white/70">
                          <span>VAT (19%)</span>
                          <span>€{editTotals.vat.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-white font-semibold text-lg">
                          <span>Grand Total</span>
                          <span>€{editTotals.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-white/40 text-xs">
                          <span>Commission (est.)</span>
                          <span>€{editTotals.commission.toFixed(2)}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={() => handleSave(quote.id)}
                        disabled={editMutation.isLoading}
                        className="bg-[#C6B4AB] hover:bg-[#B5A49A] text-black"
                      >
                        {editMutation.isLoading && (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        )}
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleSendRevision(quote.id)}
                        disabled={editMutation.isLoading}
                        className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20"
                      >
                        Send Revision
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleMarkAgreed(quote.id)}
                        disabled={editMutation.isLoading}
                        className="border-green-500/50 text-green-300 hover:bg-green-500/20"
                      >
                        Mark Agreed
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={closeEditor}
                        className="text-white/50 hover:text-white"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => void handleEmailQuotation(quote)}
                        disabled={quote.status === "draft" || emailingQuoteId === quote.id}
                        className="border-[#C6B4AB]/50 text-[#C6B4AB] hover:bg-[#C6B4AB] hover:text-black"
                      >
                        {emailingQuoteId === quote.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Email Quotation
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
