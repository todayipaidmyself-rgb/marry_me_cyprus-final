export const REQUEST_CONTEXT_START = "---REQUEST_CONTEXT_JSON_START---";
export const REQUEST_CONTEXT_END = "---REQUEST_CONTEXT_JSON_END---";

export type RequestContextData = {
  version?: number;
  visibleNotes?: string;
  selectedCollection?: string;
  serviceIntent?: Record<string, "need" | "maybe" | "skip">;
  servicePriority?: Record<string, "low" | "medium" | "high">;
  serviceNotes?: Record<string, string>;
  styleTags?: string[];
  atmosphereTags?: string[];
  mustHaves?: string;
  avoidNotes?: string;
};

export type ParsedPlannerNotes = {
  visibleNotes: string;
  requestContext: RequestContextData | null;
  hasStructuredContext: boolean;
  parseError: boolean;
};

const normalizeContext = (input: unknown): RequestContextData | null => {
  if (!input || typeof input !== "object") return null;
  const value = input as Record<string, unknown>;
  return {
    version:
      typeof value.version === "number" && Number.isFinite(value.version)
        ? value.version
        : undefined,
    visibleNotes:
      typeof value.visibleNotes === "string" ? value.visibleNotes : undefined,
    selectedCollection:
      typeof value.selectedCollection === "string"
        ? value.selectedCollection
        : undefined,
    serviceIntent:
      value.serviceIntent && typeof value.serviceIntent === "object"
        ? (value.serviceIntent as Record<string, "need" | "maybe" | "skip">)
        : undefined,
    servicePriority:
      value.servicePriority && typeof value.servicePriority === "object"
        ? (value.servicePriority as Record<string, "low" | "medium" | "high">)
        : undefined,
    serviceNotes:
      value.serviceNotes && typeof value.serviceNotes === "object"
        ? (value.serviceNotes as Record<string, string>)
        : undefined,
    styleTags: Array.isArray(value.styleTags)
      ? value.styleTags.filter(v => typeof v === "string")
      : undefined,
    atmosphereTags: Array.isArray(value.atmosphereTags)
      ? value.atmosphereTags.filter(v => typeof v === "string")
      : undefined,
    mustHaves: typeof value.mustHaves === "string" ? value.mustHaves : undefined,
    avoidNotes:
      typeof value.avoidNotes === "string" ? value.avoidNotes : undefined,
  };
};

export const parsePlannerNotes = (plannerNotes?: string | null): ParsedPlannerNotes => {
  const source = String(plannerNotes ?? "");
  const start = source.indexOf(REQUEST_CONTEXT_START);
  const end = source.indexOf(REQUEST_CONTEXT_END);

  if (start === -1 || end === -1 || end <= start) {
    return {
      visibleNotes: source.trim(),
      requestContext: null,
      hasStructuredContext: false,
      parseError: false,
    };
  }

  const visibleNotes = source.slice(0, start).trim();
  const jsonRaw = source
    .slice(start + REQUEST_CONTEXT_START.length, end)
    .trim();

  try {
    const parsed = JSON.parse(jsonRaw);
    return {
      visibleNotes,
      requestContext: normalizeContext(parsed),
      hasStructuredContext: true,
      parseError: false,
    };
  } catch {
    return {
      visibleNotes: visibleNotes || source.trim(),
      requestContext: null,
      hasStructuredContext: true,
      parseError: true,
    };
  }
};

export const composePlannerNotes = (
  visibleNotes: string,
  requestContext: RequestContextData | null
) => {
  const cleanVisible = String(visibleNotes ?? "").trim();
  if (!requestContext) return cleanVisible;
  return `${cleanVisible}\n\n${REQUEST_CONTEXT_START}\n${JSON.stringify(requestContext)}\n${REQUEST_CONTEXT_END}`;
};
