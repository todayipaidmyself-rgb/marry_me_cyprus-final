import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import {
  mysqlTable,
  varchar,
  text,
  mysqlEnum,
  boolean,
  timestamp,
} from "drizzle-orm/mysql-core";

const dossiers = mysqlTable("dossiers", {
  id: varchar("id", { length: 100 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: mysqlEnum("category", [
    "Venues",
    "Packages",
    "Décor",
    "Planning",
    "Legal",
    "Other",
  ]).notNull(),
  fileUrl: text("fileUrl").notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  isFeatured: boolean("isFeatured").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

const sampleDossiers = [
  {
    id: "mmc_overview",
    title: "Marry Me Cyprus – Overview Dossier",
    category: "Packages",
    description:
      "A high-level look at who we are, how we work, and what's included in our signature wedding services.",
    fileUrl: "/dossiers/mmc-overview.pdf",
    isFeatured: true,
  },
  {
    id: "lchateau_venue_dossier",
    title: "L'Chateau Venue Dossier",
    category: "Venues",
    description:
      "Key details, layouts and inspiration for weddings at L'Chateau country house estate in Tala.",
    fileUrl: "/dossiers/lchateau-venue.pdf",
    isFeatured: false,
  },
  {
    id: "alassos_beachfront_dossier",
    title: "Alassos – Beachfront Wedding Dossier",
    category: "Venues",
    description:
      "A focused look at Alassos, including ceremony spaces, reception flow, and sample beachside styling.",
    fileUrl: "/dossiers/alassos-beachfront.pdf",
    isFeatured: false,
  },
  {
    id: "decor_styling_lookbook",
    title: "Décor & Styling Lookbook",
    category: "Décor",
    description:
      "A visual dossier of décor ideas, tablescapes, florals and ceremony setups curated by the MMC team.",
    fileUrl: "/dossiers/decor-lookbook.pdf",
    isFeatured: true,
  },
];

console.log("Seeding dossiers...");
for (const dossier of sampleDossiers) {
  await db
    .insert(dossiers)
    .values(dossier)
    .onDuplicateKeyUpdate({ set: dossier });
  console.log(`✓ ${dossier.title}`);
}

console.log("Done!");
await connection.end();
