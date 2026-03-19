import fs from "node:fs";
import path from "node:path";
import csv from "csv-parser";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

type RawRow = Record<string, string | undefined>;

type ParsedPackage = {
  name: string;
  category: string;
  price: number;
  description?: string;
};

const prisma = new PrismaClient();

const CATEGORY_FROM_FILE: Record<string, string> = {
  "photo & video-table 1.csv": "Photography & Videography",
  "hair & makeup -table 1.csv": "Hair & Makeup",
  "entertainment-table 1.csv": "Entertainment",
  "transport-table 1.csv": "Transport",
  "extras -table 1.csv": "Extras",
};

const normalize = (value: string | undefined) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const normalizeHeader = (value: string | undefined) =>
  normalize(value).replace(/\s+/g, " ");

const parseMoney = (value: string | undefined): number | null => {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const match = text.match(/-?\d[\d,]*\.?\d*/);
  if (!match) return null;
  const parsed = Number(match[0].replace(/,/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const getValueByHeaderContains = (
  row: RawRow,
  matcher: (header: string) => boolean
): string | undefined => {
  const entry = Object.entries(row).find(([header]) =>
    matcher(normalizeHeader(header))
  );
  const value = entry?.[1];
  return typeof value === "string" ? value.trim() : undefined;
};

const resolveDataDir = (projectRoot: string) => {
  const primary = path.join(projectRoot, "public", "data");
  if (fs.existsSync(primary)) return primary;

  const fallback = path.join(projectRoot, "client", "public", "data");
  if (fs.existsSync(fallback)) {
    console.warn(
      `[prisma:seed] /public/data not found, using fallback ${fallback}`
    );
    return fallback;
  }

  throw new Error(
    `[prisma:seed] No data directory found. Expected ${primary} (or fallback ${fallback}).`
  );
};

const parseCsvFile = async (filePath: string, category: string) => {
  const results: ParsedPackage[] = [];
  let lastSupplier = "";

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row: RawRow) => {
        const supplier =
          getValueByHeaderContains(row, h => h.includes("supplier name")) ??
          lastSupplier;
        const packageName =
          getValueByHeaderContains(row, h => h === "package") ?? "";
        const rateToClient =
          getValueByHeaderContains(row, h => h.includes("rate to client")) ?? "";
        const notes =
          getValueByHeaderContains(
            row,
            h => h.includes("extra notes") || h.includes("services") || h.includes("notes")
          ) ?? "";

        if (supplier) lastSupplier = supplier;

        // Skip title/header/empty/non-package lines.
        if (!lastSupplier || !packageName) return;
        if (normalize(packageName) === "package") return;

        const price = parseMoney(rateToClient);
        if (!price) return;

        results.push({
          name: `${lastSupplier} - ${packageName}`.trim(),
          category,
          price,
          description: notes || undefined,
        });
      })
      .on("end", () => resolve())
      .on("error", err => reject(err));
  });

  return results;
};

async function main() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const projectRoot = path.resolve(__dirname, "..");
  const dataDir = resolveDataDir(projectRoot);

  const files = (await fs.promises.readdir(dataDir)).filter(file =>
    file.toLowerCase().endsWith(".csv")
  );

  if (files.length === 0) {
    console.warn(`[prisma:seed] No CSV files found in ${dataDir}`);
    return;
  }

  const existing = await prisma.supplierPackage.findMany({
    select: { name: true, category: true, price: true },
  });
  const existingKeys = new Set(
    existing.map(
      pkg => `${pkg.name.toLowerCase()}||${pkg.category.toLowerCase()}||${pkg.price}`
    )
  );

  let inserted = 0;
  let skipped = 0;

  for (const file of files) {
    const category = CATEGORY_FROM_FILE[file.toLowerCase()] ?? "Extras";
    const filePath = path.join(dataDir, file);

    try {
      const parsedRows = await parseCsvFile(filePath, category);
      let fileInserted = 0;
      let fileSkipped = 0;

      for (const row of parsedRows) {
        const key = `${row.name.toLowerCase()}||${row.category.toLowerCase()}||${row.price}`;
        if (existingKeys.has(key)) {
          fileSkipped += 1;
          skipped += 1;
          continue;
        }

        await prisma.supplierPackage.create({
          data: row,
        });
        existingKeys.add(key);
        fileInserted += 1;
        inserted += 1;
      }

      console.log(
        `[prisma:seed] ${file}: parsed ${parsedRows.length}, inserted ${fileInserted}, skipped ${fileSkipped}`
      );
    } catch (err) {
      console.warn(`[prisma:seed] Failed parsing ${file}. Continuing...`, err);
    }
  }

  console.log(
    `[prisma:seed] Complete. Inserted ${inserted}, skipped ${skipped}.`
  );
}

main()
  .catch(err => {
    console.error("[prisma:seed] Failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
