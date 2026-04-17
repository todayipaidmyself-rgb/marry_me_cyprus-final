import { trpc } from "@/lib/trpc";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export type ServiceIntent = "need" | "maybe" | "skip";
export type ServicePriority = "low" | "medium" | "high";

const clean = (value: unknown) => String(value ?? "").trim();

const resolveWeddingYear = (weddingDate: string, weddingYear: string): number | null => {
  const directYear = Number.parseInt(clean(weddingYear), 10);
  if (Number.isFinite(directYear) && directYear >= 2024 && directYear <= 2100) {
    return directYear;
  }

  const parsedYear = clean(weddingDate) ? new Date(weddingDate).getFullYear() : NaN;
  return Number.isFinite(parsedYear) ? parsedYear : null;
};

export function useMyQuoteBriefLogic() {
  const [primaryName, setPrimaryName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [weddingYear, setWeddingYear] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("");
  const [snapshotSeason, setSnapshotSeason] = useState("");
  const [snapshotGuestRange, setSnapshotGuestRange] = useState("");
  const [snapshotLocation, setSnapshotLocation] = useState("");
  const [snapshotBudget, setSnapshotBudget] = useState("");
  const [serviceIntent, setServiceIntent] = useState<Record<string, ServiceIntent>>({});
  const [servicePriority, setServicePriority] = useState<Record<string, ServicePriority>>(
    {}
  );
  const [serviceNotes, setServiceNotes] = useState<Record<string, string>>({});
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [styleTags, setStyleTags] = useState<string[]>([]);
  const [atmosphereTags, setAtmosphereTags] = useState<string[]>([]);
  const [mustHaves, setMustHaves] = useState("");
  const [avoidNotes, setAvoidNotes] = useState("");
  const [visibleNotes, setVisibleNotes] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const submitPlannerBriefIntake = trpc.quote.submitPlannerBriefIntake.useMutation({
    onError: err =>
      toast.error("Planner intake failed", {
        description: err.message || "Unable to send planner brief.",
      }),
  });

  const resolvedWeddingYear = useMemo(
    () => resolveWeddingYear(weddingDate, weddingYear),
    [weddingDate, weddingYear]
  );

  const activeCategoryList = useMemo(
    () =>
      Object.entries(serviceIntent)
        .filter(([, intent]) => clean(intent) && intent !== "skip")
        .map(([category]) => category),
    [serviceIntent]
  );

  const canSubmit = useMemo(
    () =>
      Boolean(clean(primaryName)) &&
      Boolean(resolvedWeddingYear) &&
      activeCategoryList.length > 0 &&
      !submitPlannerBriefIntake.isPending,
    [
      activeCategoryList.length,
      primaryName,
      resolvedWeddingYear,
      submitPlannerBriefIntake.isPending,
    ]
  );

  const submitBrief = async () => {
    if (!clean(primaryName)) {
      toast.error("Complete your primary name first.");
      return;
    }

    if (!resolvedWeddingYear) {
      toast.error("Add a wedding date or wedding year first.");
      return;
    }

    if (activeCategoryList.length === 0) {
      toast.error("Select at least one service category first.");
      return;
    }

    await submitPlannerBriefIntake.mutateAsync({
      primaryName,
      partnerName,
      weddingDate,
      weddingYear,
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
      visibleNotes,
    });

    setIsSubmitted(true);
    toast.success("Quote submitted for planner review");
  };

  return {
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
    resolvedWeddingYear,
    activeCategoryList,
    isSubmitted,
    isSubmitting: submitPlannerBriefIntake.isPending,
    canSubmit,
    submitBrief,
  };
}
