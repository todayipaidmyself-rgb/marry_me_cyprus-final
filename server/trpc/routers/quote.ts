import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, inArray } from "drizzle-orm";
import { Resend } from "resend";
import {
  adminProcedure,
  protectedProcedure,
  publicProcedure,
  router,
} from "../../_core/trpc";
import { getDb } from "../../db";
import {
  quotes,
  supplierPackages,
  userProfiles,
  users,
  type Quote,
  type SupplierPackage,
} from "../../../drizzle/schema";

const VAT_RATE = 0.19;
const resend = new Resend(process.env.RESEND_API_KEY);

type QuoteItem = {
  packageId: number;
  quantity: number;
  clientRate: number;
  deposit?: number;
  commission?: number;
  packageName?: string;
  supplierName?: string;
};

type GuestMergeItemInput = {
  id?: string;
  label?: string;
  type?: string;
  packageId?: number;
  quantity?: number;
};

type QuoteWithDerived = Quote & {
  items: QuoteItem[];
  vatAmount: number;
};

type EmailBranding = {
  companyName: string;
  tagline?: string;
  logoUrl?: string;
  heroImageUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  emailSignature?: string;
};

const toNumber = (value: unknown) => {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
};

const roundMoney = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const normalizeItems = (raw: unknown): QuoteItem[] => {
  if (!raw || !Array.isArray(raw)) return [];
  return raw
    .map(item => ({
      packageId: Number(item?.packageId ?? 0),
      quantity: Number(item?.quantity ?? 0),
      clientRate: toNumber(item?.clientRate),
      deposit:
        item?.deposit !== undefined ? toNumber(item?.deposit) : undefined,
      commission:
        item?.commission !== undefined ? toNumber(item?.commission) : undefined,
      packageName:
        typeof item?.packageName === "string" ? item.packageName : undefined,
      supplierName:
        typeof item?.supplierName === "string" ? item.supplierName : undefined,
    }))
    .filter(item => item.packageId > 0 && item.quantity > 0);
};

const recalcTotals = (items: QuoteItem[]) => {
  const subtotal = items.reduce(
    (acc, item) => acc + toNumber(item.clientRate) * toNumber(item.quantity),
    0
  );
  const commissionTotal = items.reduce(
    (acc, item) => acc + toNumber(item.commission) * toNumber(item.quantity),
    0
  );
  const vatAmount = subtotal * VAT_RATE;
  const totalClient = subtotal + vatAmount;
  return {
    subtotal: roundMoney(subtotal),
    vatAmount: roundMoney(vatAmount),
    totalClient: roundMoney(totalClient),
    commissionTotal: roundMoney(commissionTotal),
  };
};

const buildQuoteResponse = (quote: Quote): QuoteWithDerived => {
  const items = normalizeItems(quote.items);
  const totals = recalcTotals(items);
  return {
    ...quote,
    items,
    totalClient: totals.totalClient.toString(),
    commissionTotal: totals.commissionTotal.toString(),
    vatAmount: totals.vatAmount,
  };
};

const DEFAULT_EMAIL_BRANDING: Required<EmailBranding> = {
  companyName: "Marry Me Cyprus",
  tagline: "Luxury destination weddings in Cyprus",
  logoUrl: "/logo.png",
  heroImageUrl: "/hero.webp",
  primaryColor: "#C6B4AB",
  secondaryColor: "#0B1224",
  emailSignature: "With love from Marry Me Cyprus",
};

const buildEmailHtml = ({
  branding,
  coupleName,
  quote,
  coupleNotes,
  plannerNotes,
}: {
  branding: Required<EmailBranding>;
  coupleName: string;
  quote: QuoteWithDerived;
  coupleNotes?: string;
  plannerNotes?: string;
}) => {
  const totals = recalcTotals(quote.items);
  const itemRows =
    quote.items.length === 0
      ? `<tr><td colspan="4" style="padding:14px 12px;color:#6b7280;border-bottom:1px solid #e5e7eb;">No items selected yet.</td></tr>`
      : quote.items
          .map(item => {
            const qty = toNumber(item.quantity);
            const rate = toNumber(item.clientRate);
            const lineTotal = roundMoney(qty * rate);
            return `<tr>
              <td style="padding:14px 12px;border-bottom:1px solid #e5e7eb;color:#111827;">${escapeHtml(item.supplierName ?? "Supplier")} — ${escapeHtml(item.packageName ?? "Package")}</td>
              <td style="padding:14px 12px;border-bottom:1px solid #e5e7eb;color:#111827;text-align:center;">${qty}</td>
              <td style="padding:14px 12px;border-bottom:1px solid #e5e7eb;color:#111827;text-align:right;">€${rate.toFixed(2)}</td>
              <td style="padding:14px 12px;border-bottom:1px solid #e5e7eb;color:#111827;text-align:right;">€${lineTotal.toFixed(2)}</td>
            </tr>`;
          })
          .join("");

  const hero = branding.heroImageUrl
    ? `<div style="height:220px;background-image:url('${escapeHtml(branding.heroImageUrl)}');background-size:cover;background-position:center;"></div>`
    : "";
  const logo = branding.logoUrl
    ? `<img src="${escapeHtml(branding.logoUrl)}" alt="${escapeHtml(branding.companyName)}" style="height:46px;object-fit:contain;" />`
    : "";

  const notesSection =
    coupleNotes || plannerNotes
      ? `<div style="margin-top:24px;padding:18px 20px;border:1px solid #e5e7eb;background:#fafafa;">
          <h3 style="font-family:Georgia,serif;color:#111827;font-size:18px;margin:0 0 10px 0;">Notes</h3>
          ${
            coupleNotes
              ? `<p style="margin:0 0 8px 0;color:#111827;"><strong>Couple:</strong> ${escapeHtml(coupleNotes)}</p>`
              : ""
          }
          ${
            plannerNotes
              ? `<p style="margin:0;color:#111827;"><strong>Planner:</strong> ${escapeHtml(plannerNotes)}</p>`
              : ""
          }
        </div>`
      : "";

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(branding.companyName)} — Quotation</title>
  </head>
  <body style="margin:0;background:#f3f4f6;font-family:Inter,Arial,sans-serif;color:#111827;">
    <div style="max-width:760px;margin:24px auto;background:#ffffff;border:1px solid #e5e7eb;">
      ${hero}
      <div style="padding:26px 26px 12px 26px;border-bottom:1px solid #e5e7eb;">
        <div style="display:flex;justify-content:space-between;gap:16px;align-items:center;">
          <div>
            <div style="font-family:Georgia,serif;font-size:28px;line-height:1.2;color:${escapeHtml(branding.secondaryColor)};">${escapeHtml(branding.companyName)}</div>
            <div style="margin-top:6px;font-size:13px;color:#6b7280;">${escapeHtml(branding.tagline)}</div>
          </div>
          ${logo}
        </div>
      </div>
      <div style="padding:24px 26px 28px 26px;">
        <p style="margin:0 0 14px 0;color:#111827;">Dear ${escapeHtml(coupleName)},</p>
        <p style="margin:0 0 22px 0;color:#4b5563;">Please find your branded wedding quotation below.</p>

        <div style="padding:14px 16px;background:#0f172a;color:#ffffff;border-left:4px solid ${escapeHtml(branding.primaryColor)};margin-bottom:18px;">
          <div style="font-size:13px;opacity:0.85;">Status</div>
          <div style="font-size:18px;text-transform:capitalize;font-family:Georgia,serif;">${escapeHtml(quote.status)}</div>
        </div>

        <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;">
          <thead>
            <tr style="background:#f9fafb;">
              <th style="text-align:left;padding:12px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:12px;text-transform:uppercase;letter-spacing:.08em;">Package</th>
              <th style="text-align:center;padding:12px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:12px;text-transform:uppercase;letter-spacing:.08em;">Qty</th>
              <th style="text-align:right;padding:12px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:12px;text-transform:uppercase;letter-spacing:.08em;">Price</th>
              <th style="text-align:right;padding:12px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:12px;text-transform:uppercase;letter-spacing:.08em;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <div style="margin-top:16px;display:flex;justify-content:flex-end;">
          <div style="min-width:260px;border:1px solid #e5e7eb;padding:14px 16px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;color:#374151;"><span>Subtotal</span><span>€${totals.subtotal.toFixed(2)}</span></div>
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;color:#374151;"><span>VAT (19%)</span><span>€${totals.vatAmount.toFixed(2)}</span></div>
            <div style="display:flex;justify-content:space-between;padding-top:8px;border-top:1px solid #e5e7eb;font-weight:700;color:#111827;"><span>Grand Total</span><span>€${totals.totalClient.toFixed(2)}</span></div>
          </div>
        </div>

        ${notesSection}

        <div style="margin-top:26px;padding-top:16px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:13px;">
          ${escapeHtml(branding.emailSignature)}
        </div>
      </div>
    </div>
  </body>
</html>`;
};

const buildEmailText = ({
  branding,
  coupleName,
  quote,
  coupleNotes,
  plannerNotes,
}: {
  branding: Required<EmailBranding>;
  coupleName: string;
  quote: QuoteWithDerived;
  coupleNotes?: string;
  plannerNotes?: string;
}) => {
  const totals = recalcTotals(quote.items);
  const lines = quote.items.length
    ? quote.items.map(item => {
        const qty = toNumber(item.quantity);
        const rate = toNumber(item.clientRate);
        const subtotal = roundMoney(qty * rate);
        return `- ${item.supplierName ?? "Supplier"} - ${item.packageName ?? "Package"} | qty ${qty} | €${rate.toFixed(2)} | €${subtotal.toFixed(2)}`;
      })
    : ["- No items selected yet."];

  return `${branding.companyName}
${branding.tagline}

Dear ${coupleName},

Please find your wedding quotation below.
Status: ${quote.status}

Items:
${lines.join("\n")}

Totals:
- Subtotal: €${totals.subtotal.toFixed(2)}
- VAT (19%): €${totals.vatAmount.toFixed(2)}
- Grand Total: €${totals.totalClient.toFixed(2)}

${coupleNotes ? `Couple notes: ${coupleNotes}\n` : ""}${plannerNotes ? `Planner notes: ${plannerNotes}\n` : ""}
${branding.emailSignature}`;
};

async function ensureQuote(
  db: NonNullable<Awaited<ReturnType<typeof getDb>>>,
  userId: number
) {
  const existing = await db
    .select()
    .from(quotes)
    .where(eq(quotes.userId, userId))
    .limit(1);
  if (existing.length > 0) {
    return buildQuoteResponse(existing[0]);
  }

  await db.insert(quotes).values({
    userId,
    status: "draft",
    items: [],
    totalClient: "0",
    commissionTotal: "0",
  });

  const created = await db
    .select()
    .from(quotes)
    .where(eq(quotes.userId, userId))
    .limit(1);
  return buildQuoteResponse(created[0]);
}

async function fetchPackage(
  db: NonNullable<Awaited<ReturnType<typeof getDb>>>,
  packageId: number
): Promise<SupplierPackage | undefined> {
  const result = await db
    .select()
    .from(supplierPackages)
    .where(eq(supplierPackages.id, packageId))
    .limit(1);
  return result[0];
}

const categoryFromGuestType = (type?: string) => {
  const normalized = String(type ?? "")
    .trim()
    .toLowerCase();
  if (normalized === "venue") return "venue";
  if (normalized === "collection") return "Extras";
  return undefined;
};

const resolveGuestToPackage = ({
  guestItem,
  packageById,
  packagePool,
}: {
  guestItem: GuestMergeItemInput;
  packageById: Map<number, SupplierPackage>;
  packagePool: SupplierPackage[];
}) => {
  if (guestItem.packageId && packageById.has(guestItem.packageId)) {
    return packageById.get(guestItem.packageId);
  }

  const label = String(guestItem.label ?? "")
    .trim()
    .toLowerCase();
  if (!label) return undefined;

  const preferredCategory = categoryFromGuestType(guestItem.type);
  const filtered = preferredCategory
    ? packagePool.filter(
        pkg => String(pkg.category ?? "").toLowerCase() === preferredCategory.toLowerCase()
      )
    : packagePool;

  const exact = filtered.find(pkg => {
    const pkgName = String(pkg.packageName ?? "").trim().toLowerCase();
    const supplier = String(pkg.supplierName ?? "").trim().toLowerCase();
    return pkgName === label || supplier === label;
  });
  if (exact) return exact;

  const partial = filtered.find(pkg => {
    const pkgName = String(pkg.packageName ?? "").trim().toLowerCase();
    const supplier = String(pkg.supplierName ?? "").trim().toLowerCase();
    return pkgName.includes(label) || supplier.includes(label) || label.includes(pkgName);
  });
  return partial;
};

const plannerBriefIntentSchema = z.enum(["need", "maybe", "skip"]);
const plannerBriefPrioritySchema = z.enum(["low", "medium", "high"]);

const plannerBriefInputSchema = z.object({
  primaryName: z.string().min(1),
  partnerName: z.string().optional(),
  email: z.string().email(),
  phone: z.string().min(1),
  weddingDate: z.string().optional(),
  weddingYear: z.union([z.string(), z.number()]).optional(),
  selectedCollection: z.string().optional(),
  snapshotSeason: z.string().optional(),
  snapshotGuestRange: z.string().optional(),
  snapshotLocation: z.string().optional(),
  snapshotBudget: z.string().optional(),
  serviceIntent: z.record(z.string(), plannerBriefIntentSchema),
  servicePriority: z.record(z.string(), plannerBriefPrioritySchema),
  serviceNotes: z.record(z.string(), z.string()),
  selectedOptions: z.record(z.string(), z.array(z.string())),
  styleTags: z.array(z.string()),
  atmosphereTags: z.array(z.string()),
  mustHaves: z.string().optional(),
  avoidNotes: z.string().optional(),
  visibleNotes: z.string().optional(),
});

const cleanPlannerBriefText = (value: unknown) => String(value ?? "").trim();

const resolvePlannerBriefWeddingYear = ({
  weddingDate,
  weddingYear,
}: {
  weddingDate?: string;
  weddingYear?: string | number;
}) => {
  const parsedFromDate = cleanPlannerBriefText(weddingDate)
    ? new Date(cleanPlannerBriefText(weddingDate)).getFullYear()
    : NaN;
  if (
    Number.isFinite(parsedFromDate) &&
    parsedFromDate >= 2024 &&
    parsedFromDate <= 2100
  ) {
    return parsedFromDate;
  }

  const parsedFallbackYear = Number.parseInt(
    cleanPlannerBriefText(weddingYear),
    10
  );
  if (
    Number.isFinite(parsedFallbackYear) &&
    parsedFallbackYear >= 2024 &&
    parsedFallbackYear <= 2100
  ) {
    return parsedFallbackYear;
  }

  throw new TRPCError({
    code: "BAD_REQUEST",
    message: "A valid wedding year is required",
  });
};

const buildPlannerBriefConsoleMessage = (
  input: z.infer<typeof plannerBriefInputSchema>,
  weddingYear: number,
  submittedAt: string
) => {
  const coupleName = [input.primaryName, input.partnerName]
    .map(cleanPlannerBriefText)
    .filter(Boolean)
    .join(" & ");

  const stylePreferences = [...input.styleTags, ...input.atmosphereTags]
    .map(cleanPlannerBriefText)
    .filter(Boolean);

  const selectedServices = Object.entries(input.serviceIntent)
    .filter(([, intent]) => intent !== "skip")
    .map(([category]) => {
      const options = (input.selectedOptions[category] ?? [])
        .map(cleanPlannerBriefText)
        .filter(Boolean);
      return options.length > 0
        ? `${category}: ${options.join(", ")}`
        : category;
    });

  return [
    "[INTAKE REQUEST]",
    "Source: planner-brief",
    `Submitted: ${submittedAt}`,
    "",
    "— WEDDING SNAPSHOT —",
    `Couple: ${coupleName || "Not provided"}`,
    `Year: ${weddingYear}`,
    `Location / District: ${cleanPlannerBriefText(input.snapshotLocation) || "Not provided"}`,
    `Guest Count: ${cleanPlannerBriefText(input.snapshotGuestRange) || "Not provided"}`,
    `Budget: ${cleanPlannerBriefText(input.snapshotBudget) || "Not provided"}`,
    `Collection: ${cleanPlannerBriefText(input.selectedCollection) || "Not provided"}`,
    "",
    "— CONTACT DETAILS —",
    `Email: ${cleanPlannerBriefText(input.email) || "Not provided"}`,
    `Phone / WhatsApp: ${cleanPlannerBriefText(input.phone) || "Not provided"}`,
    "",
    "— VISION & STYLE —",
    stylePreferences.join(", ") || "Not provided",
    "",
    "— SELECTED SERVICES —",
    selectedServices.join("\n") || "Not provided",
    "",
    "— CLIENT NOTES —",
    cleanPlannerBriefText(input.visibleNotes) || "Not provided",
    "",
    "— MUST HAVES —",
    cleanPlannerBriefText(input.mustHaves) || "Not provided",
    "",
    "— AVOID —",
    cleanPlannerBriefText(input.avoidNotes) || "Not provided",
  ].join("\n");
};

export const quoteRouter = router({
  getPackages: publicProcedure
    .input(z.object({ category: z.string().optional() }).optional())
    .query(async ({ input }) => {
      if (!process.env.DATABASE_URL) {
        console.warn(
          "[quote] DATABASE_URL is missing. getPackages will return [] until DB is configured."
        );
      }
      const db = await getDb();
      if (!db) {
        console.warn("[quote] Database not available for getPackages");
        return [];
      }
      try {
        const category = input?.category;
        const rows = category
          ? await db
              .select()
              .from(supplierPackages)
              .where(eq(supplierPackages.category, category))
          : await db.select().from(supplierPackages);
        console.info(
          `[quote] getPackages fetched ${rows.length} rows${category ? ` for category "${category}"` : ""}`
        );
        return rows;
      } catch (err) {
        console.warn("[quote] Failed to fetch packages", err);
        return [];
      }
    }),

  getMyQuote: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      console.warn("[quote] Database not available for getMyQuote");
      return {
        id: -1,
        userId: ctx.user.id,
        status: "draft" as const,
        items: [],
        plannerNotes: null,
        totalClient: "0",
        commissionTotal: "0",
        createdAt: new Date(),
        updatedAt: new Date(),
        vatAmount: 0,
      };
    }
    return ensureQuote(db, ctx.user.id);
  }),

  addItemToQuote: protectedProcedure
    .input(
      z.object({
        packageId: z.number().int().positive(),
        quantity: z.number().int().positive().max(1000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        console.warn("[quote] Database not available for addItemToQuote");
        return null;
      }

      const pkg = await fetchPackage(db, input.packageId);
      if (!pkg) {
        console.warn("[quote] Package not found", input.packageId);
        return ensureQuote(db, ctx.user.id);
      }

      const quote = await ensureQuote(db, ctx.user.id);
      const existingItems = [...quote.items];
      const idx = existingItems.findIndex(
        item => item.packageId === input.packageId
      );
      const baseItem: QuoteItem = {
        packageId: input.packageId,
        quantity: input.quantity,
        clientRate: toNumber(pkg.clientRate ?? pkg.deposit ?? 0),
        deposit: pkg.deposit ? toNumber(pkg.deposit) : undefined,
        commission: pkg.commission ? toNumber(pkg.commission) : undefined,
        packageName: pkg.packageName,
        supplierName: pkg.supplierName,
      };

      if (idx >= 0) {
        existingItems[idx] = {
          ...existingItems[idx],
          ...baseItem,
          quantity: input.quantity,
        };
      } else {
        existingItems.push(baseItem);
      }

      const totals = recalcTotals(existingItems);

      await db
        .update(quotes)
        .set({
          items: existingItems,
          totalClient: totals.totalClient.toString(),
          commissionTotal: totals.commissionTotal.toString(),
          updatedAt: new Date(),
        })
        .where(eq(quotes.id, quote.id));

      return {
        ...quote,
        items: existingItems,
        totalClient: totals.totalClient.toString(),
        commissionTotal: totals.commissionTotal.toString(),
        vatAmount: totals.vatAmount,
      };
    }),

  removeItemFromQuote: protectedProcedure
    .input(z.object({ packageId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        console.warn("[quote] Database not available for removeItemFromQuote");
        return null;
      }

      const quote = await ensureQuote(db, ctx.user.id);
      const remaining = quote.items.filter(
        item => item.packageId !== input.packageId
      );
      const totals = recalcTotals(remaining);

      await db
        .update(quotes)
        .set({
          items: remaining,
          totalClient: totals.totalClient.toString(),
          commissionTotal: totals.commissionTotal.toString(),
          updatedAt: new Date(),
        })
        .where(eq(quotes.id, quote.id));

      return {
        ...quote,
        items: remaining,
        totalClient: totals.totalClient.toString(),
        commissionTotal: totals.commissionTotal.toString(),
        vatAmount: totals.vatAmount,
      };
    }),

  updateNotes: protectedProcedure
    .input(
      z.object({
        plannerNotes: z.string().max(2000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        console.warn("[quote] Database not available for updateNotes");
        return null;
      }
      const quote = await ensureQuote(db, ctx.user.id);
      await db
        .update(quotes)
        .set({
          plannerNotes: input.plannerNotes ?? null,
          updatedAt: new Date(),
        })
        .where(eq(quotes.id, quote.id));

      return { ...quote, plannerNotes: input.plannerNotes ?? null };
    }),

  mergeGuestItems: protectedProcedure
    .input(
      z.object({
        items: z
          .array(
            z.object({
              id: z.string().optional(),
              label: z.string().max(300).optional(),
              type: z.string().max(120).optional(),
              packageId: z.number().int().positive().optional(),
              quantity: z.number().int().positive().max(1000).optional(),
            })
          )
          .max(200),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        console.warn("[quote] Database not available for mergeGuestItems");
        return {
          quote: null,
          mergedCount: 0,
          skippedCount: input.items.length,
        };
      }

      const quote = await ensureQuote(db, ctx.user.id);
      if (!input.items.length) {
        return { quote, mergedCount: 0, skippedCount: 0 };
      }

      const allPackages = await db.select().from(supplierPackages);
      const packageById = new Map<number, SupplierPackage>();
      allPackages.forEach(pkg => packageById.set(pkg.id, pkg));

      const nextItems = [...quote.items];
      let mergedCount = 0;
      let skippedCount = 0;

      for (const rawItem of input.items) {
        const guestItem: GuestMergeItemInput = rawItem;
        const pkg = resolveGuestToPackage({
          guestItem,
          packageById,
          packagePool: allPackages,
        });
        if (!pkg) {
          skippedCount += 1;
          continue;
        }

        const quantity = Math.max(1, Math.min(1000, Number(guestItem.quantity ?? 1)));
        const existingIdx = nextItems.findIndex(item => item.packageId === pkg.id);
        const baseRate = toNumber(pkg.clientRate ?? pkg.deposit ?? 0);
        const baseCommission = toNumber(pkg.commission);
        const baseDeposit = toNumber(pkg.deposit);

        if (existingIdx >= 0) {
          const currentQty = toNumber(nextItems[existingIdx].quantity);
          nextItems[existingIdx] = {
            ...nextItems[existingIdx],
            quantity: Math.min(1000, currentQty + quantity),
            clientRate: baseRate || toNumber(nextItems[existingIdx].clientRate),
            commission: baseCommission || toNumber(nextItems[existingIdx].commission),
            deposit: baseDeposit || toNumber(nextItems[existingIdx].deposit),
            packageName: pkg.packageName ?? nextItems[existingIdx].packageName,
            supplierName: pkg.supplierName ?? nextItems[existingIdx].supplierName,
          };
        } else {
          nextItems.push({
            packageId: pkg.id,
            quantity,
            clientRate: baseRate,
            deposit: baseDeposit,
            commission: baseCommission,
            packageName: pkg.packageName,
            supplierName: pkg.supplierName,
          });
        }
        mergedCount += 1;
      }

      const totals = recalcTotals(nextItems);
      await db
        .update(quotes)
        .set({
          items: nextItems,
          totalClient: totals.totalClient.toString(),
          commissionTotal: totals.commissionTotal.toString(),
          updatedAt: new Date(),
        })
        .where(eq(quotes.id, quote.id));

      return {
        quote: {
          ...quote,
          items: nextItems,
          totalClient: totals.totalClient.toString(),
          commissionTotal: totals.commissionTotal.toString(),
          vatAmount: totals.vatAmount,
        },
        mergedCount,
        skippedCount,
      };
    }),

  submitQuote: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      console.warn("[quote] Database not available for submitQuote");
      return null;
    }
    const quote = await ensureQuote(db, ctx.user.id);
    await db
      .update(quotes)
      .set({ status: "submitted", updatedAt: new Date() })
      .where(eq(quotes.id, quote.id));
    return { ...quote, status: "submitted" as const };
  }),

  submitPlannerBriefIntake: publicProcedure
    .input(plannerBriefInputSchema)
    .mutation(async ({ input }) => {
      const endpoint = process.env.INTAKE_ENDPOINT_URL?.trim();
      const apiKey = process.env.INTAKE_API_KEY?.trim();

      if (!endpoint || !apiKey) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Wedding intake is not configured",
        });
      }

      const submittedAt = new Date().toISOString();
      const weddingYear = resolvePlannerBriefWeddingYear({
        weddingDate: input.weddingDate,
        weddingYear: input.weddingYear,
      });

      const selectedServices = Object.entries(input.serviceIntent)
        .filter(([, intent]) => intent !== "skip")
        .map(([category]) => {
          const options = (input.selectedOptions[category] ?? [])
            .map(cleanPlannerBriefText)
            .filter(Boolean);
          return options.length > 0
            ? `${category}: ${options.join(", ")}`
            : category;
        });

      const stylePreferences = [...input.styleTags, ...input.atmosphereTags]
        .map(cleanPlannerBriefText)
        .filter(Boolean);

      const message = buildPlannerBriefConsoleMessage(
        input,
        weddingYear,
        submittedAt
      );

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          coupleName1: cleanPlannerBriefText(input.primaryName),
          coupleName2: cleanPlannerBriefText(input.partnerName) || undefined,
          email: cleanPlannerBriefText(input.email) || undefined,
          phone: cleanPlannerBriefText(input.phone) || undefined,
          weddingYear,
          locationDistrict:
            cleanPlannerBriefText(input.snapshotLocation) || undefined,
          selectedCollection:
            cleanPlannerBriefText(input.selectedCollection) || undefined,
          selectedServices,
          stylePreferences,
          message,
          source: "planner-brief",
        }),
      });

      if (!response.ok) {
        let responseText = "";
        try {
          responseText = await response.text();
        } catch {
          responseText = "";
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Planner brief intake failed (${response.status})${responseText ? `: ${responseText}` : ""}`,
        });
      }

      try {
        if (input.email) {
          await resend.emails.send({
            from: "onboarding@resend.dev",
            to: input.email,
            subject: "Your wedding request has been received",
            html: `<p>Hello ${cleanPlannerBriefText(input.primaryName) || "there"},</p><p>Your wedding request has been received.</p><p>Your planner will review your preferences and be in touch shortly.</p><p>Marry Me Cyprus</p>`,
          });
        }

        await resend.emails.send({
          from: "onboarding@resend.dev",
          to: "ultimateworkz@gmail.com",
          subject: "New Wedding Request Submitted",
          html: `<p><strong>Couple names:</strong> ${[input.primaryName, input.partnerName]
            .map(cleanPlannerBriefText)
            .filter(Boolean)
            .join(" & ") || "Not provided"}</p><p><strong>Email:</strong> ${cleanPlannerBriefText(input.email) || "Not provided"}</p><p><strong>Phone:</strong> ${cleanPlannerBriefText(input.phone) || "Not provided"}</p><p><strong>Wedding year:</strong> ${weddingYear}</p><p><strong>Location:</strong> ${cleanPlannerBriefText(input.snapshotLocation) || "Not provided"}</p><p>Check the console for full details.</p>`,
        });
      } catch (err) {
        console.error("Email send failed:", err);
      }

      try {
        return await response.json();
      } catch {
        return { success: true as const };
      }
    }),

  submitWeddingIntake: protectedProcedure
    .input(
      z.object({
        coupleName1: z.string().min(1),
        weddingYear: z.number().int().min(2024).max(2100),
        notesInternal: z.string().min(1),
        coupleName2: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        locationDistrict: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const endpoint = process.env.INTAKE_ENDPOINT_URL?.trim();
      const apiKey = process.env.INTAKE_API_KEY?.trim();

      if (!endpoint || !apiKey) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Wedding intake is not configured",
        });
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          coupleName1: input.coupleName1,
          coupleName2: input.coupleName2 ?? "",
          weddingYear: input.weddingYear,
          notesInternal: input.notesInternal,
          email: input.email ?? "",
          phone: input.phone ?? "",
          locationDistrict: input.locationDistrict ?? "",
          source: "mmc-app",
        }),
      });

      if (!response.ok) {
        let responseText = "";
        try {
          responseText = await response.text();
        } catch {
          responseText = "";
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Wedding intake failed (${response.status})${responseText ? `: ${responseText}` : ""}`,
        });
      }

      try {
        return await response.json();
      } catch {
        return { success: true as const };
      }
    }),

  listQuotes: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      console.warn("[quote] Database not available for listQuotes");
      return [];
    }
    const rows = await db.select().from(quotes).orderBy(quotes.createdAt);
    return rows.map(buildQuoteResponse);
  }),

  editQuoteAdmin: adminProcedure
    .input(
      z.object({
        quoteId: z.number().int().positive(),
        status: z.enum(["draft", "submitted", "revising", "agreed"]).optional(),
        plannerNotes: z.string().max(2000).optional(),
        items: z
          .array(
            z.object({
              packageId: z.number().int().positive(),
              quantity: z.number().int().positive(),
              clientRate: z.number().nonnegative().optional(),
              commission: z.number().nonnegative().optional(),
              packageName: z.string().optional(),
              supplierName: z.string().optional(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        console.warn("[quote] Database not available for editQuoteAdmin");
        return null;
      }

      const rows = await db
        .select()
        .from(quotes)
        .where(eq(quotes.id, input.quoteId))
        .limit(1);
      if (rows.length === 0) return null;
      const current = buildQuoteResponse(rows[0]);

      let nextItems = current.items;
      if (input.items) {
        const packageIds = input.items.map(i => i.packageId);
        const packageMap = new Map<number, SupplierPackage>();
        if (packageIds.length > 0) {
          const pkgs = await db
            .select()
            .from(supplierPackages)
            .where(inArray(supplierPackages.id, packageIds));
          pkgs.forEach(p => packageMap.set(p.id, p));
        }

        nextItems = input.items
          .filter(item => item.quantity > 0)
          .map(item => {
            const pkg = packageMap.get(item.packageId);
            return {
              packageId: item.packageId,
              quantity: item.quantity,
              clientRate:
                item.clientRate ??
                (pkg
                  ? toNumber(pkg.clientRate ?? pkg.deposit ?? 0)
                  : toNumber(
                      current.items.find(i => i.packageId === item.packageId)
                        ?.clientRate
                    )),
              commission:
                item.commission ??
                (pkg
                  ? toNumber(pkg.commission)
                  : toNumber(
                      current.items.find(i => i.packageId === item.packageId)
                        ?.commission
                    )),
              packageName: item.packageName ?? pkg?.packageName,
              supplierName: item.supplierName ?? pkg?.supplierName,
            };
          });
      }

      const totals = recalcTotals(nextItems);

      await db
        .update(quotes)
        .set({
          status: input.status ?? current.status,
          plannerNotes: input.plannerNotes ?? current.plannerNotes,
          items: nextItems,
          totalClient: totals.totalClient.toString(),
          commissionTotal: totals.commissionTotal.toString(),
          updatedAt: new Date(),
        })
        .where(eq(quotes.id, current.id));

      return {
        ...current,
        status: input.status ?? current.status,
        plannerNotes: input.plannerNotes ?? current.plannerNotes,
        items: nextItems,
        totalClient: totals.totalClient.toString(),
        commissionTotal: totals.commissionTotal.toString(),
        vatAmount: totals.vatAmount,
      };
    }),

  generateQuoteEmail: protectedProcedure
    .input(
      z.object({
        quoteId: z.number().int().positive(),
        coupleNotes: z.string().max(4000).optional(),
        plannerNotes: z.string().max(4000).optional(),
        branding: z
          .object({
            companyName: z.string().min(1).max(120),
            tagline: z.string().max(220).optional(),
            logoUrl: z.string().max(500).optional(),
            heroImageUrl: z.string().max(500).optional(),
            primaryColor: z.string().max(20).optional(),
            secondaryColor: z.string().max(20).optional(),
            emailSignature: z.string().max(220).optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        console.warn("[quote] Database not available for generateQuoteEmail");
        return `<html><body><p>Quotation preview is temporarily unavailable.</p></body></html>`;
      }

      const quoteRows = await db
        .select()
        .from(quotes)
        .where(eq(quotes.id, input.quoteId))
        .limit(1);
      if (quoteRows.length === 0) {
        console.warn("[quote] generateQuoteEmail quote not found", input.quoteId);
        return `<html><body><p>Quotation not found.</p></body></html>`;
      }

      const quote = buildQuoteResponse(quoteRows[0]);
      const isAdmin = (ctx.user as { role?: string } | null)?.role === "admin";
      if (!isAdmin && quote.userId !== ctx.user.id) {
        console.warn("[quote] generateQuoteEmail access denied", {
          quoteId: quote.id,
          userId: ctx.user.id,
        });
        return `<html><body><p>Quotation is not accessible.</p></body></html>`;
      }

      const userRow = await db
        .select({
          name: users.name,
          email: users.email,
        })
        .from(users)
        .where(eq(users.id, quote.userId))
        .limit(1);

      const profileRow = await db
        .select({
          firstName: userProfiles.firstName,
          partnerName: userProfiles.partnerName,
          email: userProfiles.email,
        })
        .from(userProfiles)
        .where(eq(userProfiles.userId, quote.userId))
        .limit(1);

      const profile = profileRow[0];
      const user = userRow[0];
      const coupleName =
        [profile?.firstName, profile?.partnerName]
          .filter(Boolean)
          .join(" & ")
          .trim() ||
        user?.name?.trim() ||
        "Lovely Couple";

      const branding: Required<EmailBranding> = {
        ...DEFAULT_EMAIL_BRANDING,
        ...input.branding,
      };

      const coupleNotes = input.coupleNotes?.trim();
      const plannerNotes =
        input.plannerNotes?.trim() ?? quote.plannerNotes ?? undefined;

      let html: string;
      try {
        html = buildEmailHtml({
          branding,
          coupleName,
          quote,
          coupleNotes,
          plannerNotes,
        });
      } catch (err) {
        console.warn("[quote] HTML template generation failed", err);
        html = `<html><body><pre>${escapeHtml(
          buildEmailText({
            branding,
            coupleName,
            quote,
            coupleNotes,
            plannerNotes,
          })
        )}</pre></body></html>`;
      }

      const text = buildEmailText({
        branding,
        coupleName,
        quote,
        coupleNotes,
        plannerNotes,
      });

      const coupleEmail =
        profile?.email?.trim() ||
        user?.email?.trim() ||
        process.env.QUOTE_DEV_COUPLE_EMAIL?.trim() ||
        "couple@example.local";
      const plannerEmail =
        process.env.QUOTE_DEV_PLANNER_EMAIL?.trim() || "planner@example.local";

      try {
        const nodemailer = await import("nodemailer");
        const smtpHost = process.env.SMTP_HOST?.trim();
        const smtpPort = Number(process.env.SMTP_PORT ?? "587");
        const smtpUser = process.env.SMTP_USER?.trim();
        const smtpPass = process.env.SMTP_PASS?.trim();

        const transporter = smtpHost
          ? nodemailer.createTransport({
              host: smtpHost,
              port: Number.isFinite(smtpPort) ? smtpPort : 587,
              secure: smtpPort === 465,
              auth:
                smtpUser && smtpPass
                  ? { user: smtpUser, pass: smtpPass }
                  : undefined,
            })
          : nodemailer.createTransport({ jsonTransport: true });

        await transporter.sendMail({
          from: process.env.QUOTE_FROM_EMAIL?.trim() || "no-reply@example.local",
          to: coupleEmail,
          cc: plannerEmail,
          subject: `${branding.companyName} — Wedding Quotation`,
          text,
          html,
        });
      } catch (err) {
        console.warn("[quote] Email send failed (continuing with HTML output)", err);
      }

      return html;
    }),
});
