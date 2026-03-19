type BrandingEmailInput = {
  companyName: string;
  tagline?: string;
  logoUrl?: string;
  heroImageUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  emailSignature?: string;
};

export type QuoteEmailItem = {
  supplierName?: string;
  packageName?: string;
  quantity: number;
  clientRate: number;
};

export type QuoteEmailInput = {
  status: string;
  coupleName: string;
  coupleEmail: string;
  plannerEmail?: string;
  coupleNotes?: string;
  plannerNotes?: string;
  items: QuoteEmailItem[];
  branding: BrandingEmailInput;
};

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const money = (value: number) =>
  Number.isFinite(value) ? value.toFixed(2) : "0.00";

const resolvePublicAssetUrl = (value: string | undefined) => {
  const trimmed = value?.trim() || "";
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("data:")) return trimmed;

  const siteUrl = import.meta.env.VITE_SITE_URL?.trim();
  if (siteUrl) {
    return `${siteUrl.replace(/\/+$/, "")}/${trimmed.replace(/^\/+/, "")}`;
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin.replace(/\/+$/, "")}/${trimmed.replace(/^\/+/, "")}`;
  }
  return trimmed;
};

const normalizeBranding = (branding: BrandingEmailInput) => ({
  companyName: branding.companyName?.trim() || "Marry Me Cyprus",
  tagline:
    branding.tagline?.trim() || "Luxury destination weddings in Cyprus",
  logoUrl: resolvePublicAssetUrl(branding.logoUrl?.trim() || "/logo.png"),
  heroImageUrl: resolvePublicAssetUrl(branding.heroImageUrl?.trim() || "/hero.webp"),
  primaryColor: branding.primaryColor?.trim() || "#C6B4AB",
  secondaryColor: branding.secondaryColor?.trim() || "#0B1224",
  emailSignature:
    branding.emailSignature?.trim() || "With love from Marry Me Cyprus",
});

export const buildQuoteEmailText = (input: QuoteEmailInput): string => {
  const subtotal = input.items.reduce(
    (acc, item) => acc + Number(item.clientRate || 0) * Number(item.quantity || 0),
    0
  );
  const vat = subtotal * 0.19;
  const total = subtotal + vat;
  const b = normalizeBranding(input.branding);

  const lines = input.items.length
    ? input.items.map(
        item =>
          `- ${item.supplierName ?? "Supplier"} — ${item.packageName ?? "Package"} | qty ${item.quantity} | €${money(Number(item.clientRate || 0))} | subtotal €${money(Number(item.clientRate || 0) * Number(item.quantity || 0))}`
      )
    : ["- No items selected."];

  return `${b.companyName} | ${b.tagline}

Dear ${input.coupleName},

Your wedding quotation is ready.
Status: ${input.status.toUpperCase()}

Items:
${lines.join("\n")}

Totals:
- Subtotal: €${money(subtotal)}
- VAT (19%): €${money(vat)}
- Grand Total: €${money(total)}

${input.coupleNotes ? `Couple notes:\n${input.coupleNotes}\n` : ""}${input.plannerNotes ? `Planner notes:\n${input.plannerNotes}\n` : ""}
${b.emailSignature}
${input.plannerEmail ? `Reply to: ${input.plannerEmail}` : ""}`;
};

export const buildQuoteEmailHtml = (input: QuoteEmailInput): string => {
  const b = normalizeBranding(input.branding);
  const subtotal = input.items.reduce(
    (acc, item) => acc + Number(item.clientRate || 0) * Number(item.quantity || 0),
    0
  );
  const vat = subtotal * 0.19;
  const total = subtotal + vat;

  const rows = input.items.length
    ? input.items
        .map(item => {
          const qty = Number(item.quantity || 0);
          const rate = Number(item.clientRate || 0);
          const line = qty * rate;
          return `<tr>
            <td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#111827;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;">
              <div style="font-weight:600;">${escapeHtml(item.supplierName ?? "Supplier")} — ${escapeHtml(item.packageName ?? "Package")}</div>
              <div style="margin-top:4px;color:#6b7280;font-size:12px;">
                Qty: ${qty} &nbsp; | &nbsp; Price: €${money(rate)} &nbsp; | &nbsp; Subtotal: €${money(line)}
              </div>
            </td>
            <td style="padding:12px;border-bottom:1px solid #e5e7eb;text-align:center;color:#111827;font-family:Arial,sans-serif;font-size:14px;">${qty}</td>
            <td style="padding:12px;border-bottom:1px solid #e5e7eb;text-align:right;color:#111827;font-family:Arial,sans-serif;font-size:14px;">€${money(rate)}</td>
            <td style="padding:12px;border-bottom:1px solid #e5e7eb;text-align:right;color:#111827;font-family:Arial,sans-serif;font-size:14px;">€${money(line)}</td>
          </tr>`;
        })
        .join("")
    : `<tr><td colspan="4" style="padding:12px;border-bottom:1px solid #e5e7eb;color:#6b7280;">No items selected.</td></tr>`;

  const senderName =
    input.branding.companyName?.trim() || "Marry Me Cyprus";
  const senderEmail =
    input.plannerEmail?.trim() ||
    import.meta.env.VITE_PLANNER_EMAIL?.trim() ||
    "planner@marrymecyprus.com";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <title>${escapeHtml(b.companyName)} Quote</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f2ef;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f2ef;">
      <tr>
        <td align="center" style="padding:20px 12px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:680px;background-color:#ffffff;border:1px solid #e8e3dc;">
            <tr>
              <td style="padding:0;">
                <img src="${escapeHtml(b.heroImageUrl)}" alt="${escapeHtml(b.companyName)}" width="680" style="display:block;width:100%;max-width:680px;height:auto;border:0;outline:none;text-decoration:none;" />
              </td>
            </tr>
            <tr>
              <td style="padding:24px 24px 18px 24px;border-bottom:1px solid #ece7e0;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="vertical-align:top;">
                      <div style="font-family:Georgia,Times New Roman,serif;font-size:30px;line-height:1.2;color:${escapeHtml(b.secondaryColor)};font-weight:600;">
                        ${escapeHtml(b.companyName)}
                      </div>
                      <div style="margin-top:6px;font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:#6b7280;">
                        ${escapeHtml(b.tagline)}
                      </div>
                    </td>
                    <td align="right" style="vertical-align:top;padding-left:12px;">
                      <img src="${escapeHtml(b.logoUrl)}" alt="${escapeHtml(b.companyName)} logo" width="72" style="display:block;max-width:72px;height:auto;border:0;outline:none;text-decoration:none;" />
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.6;color:#111827;">
                  Dear ${escapeHtml(input.coupleName)},
                </div>
                <div style="margin-top:10px;font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#374151;">
                  Your curated wedding quotation is ready.
                </div>

                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:18px;background-color:#1b1b1b;border-left:4px solid ${escapeHtml(b.primaryColor)};">
                  <tr>
                    <td style="padding:12px 14px;">
                      <div style="font-family:Arial,sans-serif;font-size:11px;line-height:1.4;letter-spacing:1px;text-transform:uppercase;color:#d1d5db;">
                        Status
                      </div>
                      <div style="font-family:Georgia,Times New Roman,serif;font-size:21px;line-height:1.3;text-transform:capitalize;color:#ffffff;">
                        ${escapeHtml(input.status)}
                      </div>
                    </td>
                  </tr>
                </table>

                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:20px;border:1px solid #e8e3dc;border-collapse:collapse;">
                  <thead>
                    <tr style="background-color:#faf8f5;">
                      <th align="left" style="padding:12px;border-bottom:1px solid #e8e3dc;font-family:Arial,sans-serif;font-size:11px;line-height:1.4;letter-spacing:1px;text-transform:uppercase;color:#6b7280;">Supplier / Package</th>
                      <th align="center" style="padding:12px;border-bottom:1px solid #e8e3dc;font-family:Arial,sans-serif;font-size:11px;line-height:1.4;letter-spacing:1px;text-transform:uppercase;color:#6b7280;">Qty</th>
                      <th align="right" style="padding:12px;border-bottom:1px solid #e8e3dc;font-family:Arial,sans-serif;font-size:11px;line-height:1.4;letter-spacing:1px;text-transform:uppercase;color:#6b7280;">Price</th>
                      <th align="right" style="padding:12px;border-bottom:1px solid #e8e3dc;font-family:Arial,sans-serif;font-size:11px;line-height:1.4;letter-spacing:1px;text-transform:uppercase;color:#6b7280;">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>${rows}</tbody>
                </table>

                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:14px;">
                  <tr>
                    <td />
                    <td align="right" style="width:280px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid #e8e3dc;background:#fff;">
                        <tr>
                          <td style="padding:10px 12px;font-family:Arial,sans-serif;font-size:14px;color:#374151;">Subtotal</td>
                          <td align="right" style="padding:10px 12px;font-family:Arial,sans-serif;font-size:14px;color:#374151;">€${money(subtotal)}</td>
                        </tr>
                        <tr>
                          <td style="padding:0 12px 10px 12px;font-family:Arial,sans-serif;font-size:14px;color:#374151;">VAT (19%)</td>
                          <td align="right" style="padding:0 12px 10px 12px;font-family:Arial,sans-serif;font-size:14px;color:#374151;">€${money(vat)}</td>
                        </tr>
                        <tr>
                          <td style="padding:11px 12px;border-top:1px solid #e8e3dc;background:#1a1610;font-family:Georgia,Times New Roman,serif;font-size:17px;font-weight:700;color:#d8b56a;">Grand Total</td>
                          <td align="right" style="padding:11px 12px;border-top:1px solid #e8e3dc;background:#1a1610;font-family:Georgia,Times New Roman,serif;font-size:17px;font-weight:700;color:#d8b56a;">€${money(total)}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                ${
                  input.coupleNotes || input.plannerNotes
                    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:18px;border:1px solid #e8e3dc;background:#faf8f5;">
                        <tr>
                          <td style="padding:14px;">
                            <div style="font-family:Georgia,Times New Roman,serif;font-size:19px;line-height:1.3;color:#111827;margin-bottom:8px;">Notes</div>
                            ${input.coupleNotes ? `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#111827;margin-bottom:6px;"><strong>Couple:</strong> ${escapeHtml(input.coupleNotes)}</div>` : ""}
                            ${input.plannerNotes ? `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#111827;"><strong>Planner:</strong> ${escapeHtml(input.plannerNotes)}</div>` : ""}
                          </td>
                        </tr>
                      </table>`
                    : ""
                }

                <div style="margin-top:22px;padding-top:14px;border-top:1px solid #ece7e0;font-family:Arial,sans-serif;font-size:13px;line-height:1.7;color:#6b7280;">
                  <div style="color:#374151;">${escapeHtml(b.emailSignature)}</div>
                  <div style="margin-top:4px;">Sender: ${escapeHtml(senderName)} &lt;${escapeHtml(senderEmail)}&gt;</div>
                  ${input.plannerEmail ? `<div style="margin-top:2px;">Reply to: ${escapeHtml(input.plannerEmail)}</div>` : ""}
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

export const sendQuoteToFormspree = async (params: {
  quoteEmail: QuoteEmailInput;
  subject?: string;
}) => {
  const endpoint =
    import.meta.env.VITE_FORMSPREE_QUOTE_ENDPOINT?.trim() ||
    "https://formspree.io/f/mqedekwq";
  const subject = params.subject || "Your Marry Me Cyprus Wedding Quote";

  if (!endpoint) {
    throw new Error("Formspree endpoint is not configured");
  }
  if (!params.quoteEmail.coupleEmail?.trim()) {
    throw new Error("Recipient email is missing");
  }
  if (!params.quoteEmail.items.length) {
    throw new Error("Quote has no items");
  }

  let html = "";
  let text = "";
  try {
    html = buildQuoteEmailHtml(params.quoteEmail);
  } catch (err) {
    console.warn("[quote-email] HTML generation failed, using text only", err);
  }
  try {
    text = buildQuoteEmailText(params.quoteEmail);
  } catch (err) {
    console.warn("[quote-email] Text generation failed", err);
  }

  const forcedDevRecipient =
    import.meta.env.VITE_QUOTE_TEST_EMAIL?.trim() || "test@example.com";
  const recipientEmail =
    import.meta.env.DEV ? forcedDevRecipient : params.quoteEmail.coupleEmail;
  const senderName =
    params.quoteEmail.branding.companyName?.trim() || "Marry Me Cyprus";
  const senderEmail =
    params.quoteEmail.plannerEmail?.trim() ||
    import.meta.env.VITE_PLANNER_EMAIL?.trim() ||
    "planner@marrymecyprus.com";

  const payload = {
    email: recipientEmail,
    name: senderName,
    sender_name: senderName,
    sender_email: senderEmail,
    subject,
    html: html || `<pre>${escapeHtml(text || "Quote details unavailable.")}</pre>`,
    message: text || "Quote details unavailable.",
    reply_to: params.quoteEmail.plannerEmail || undefined,
  };

  console.log("Sending payload:", payload);
  if (import.meta.env.DEV) {
    console.log("[quote-email] Full HTML for preview:", payload.html);
  }

  // Verify Formspree domain/email for delivery.
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseText = await res.text();
  console.log("[quote-email] Formspree response:", {
    status: res.status,
    ok: res.ok,
    body: responseText,
  });

  if (!res.ok) {
    console.error("[quote-email] Formspree error response:", responseText);

    let detail = "";
    try {
      const data = JSON.parse(responseText);
      detail = data?.error || data?.message || "";
    } catch {
      detail = responseText;
    }

    throw new Error(
      detail ||
        `Formspree request failed (${res.status}). Check Formspree dashboard for submission.`
    );
  }

  return { ok: true as const, html: payload.html, recipientEmail, responseText };
};
