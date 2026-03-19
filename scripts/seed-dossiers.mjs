import { drizzle } from "drizzle-orm/mysql2";
import { dossiers } from "../drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

const realDossiers = [
  {
    id: "company-brochure-2023-24-25",
    title: "Marry Me Cyprus Company Brochure 2023-25",
    description:
      "Comprehensive overview of Marry Me Cyprus wedding planning services, packages, and offerings for destination weddings in Cyprus.",
    category: "Planning",
    fileUrl:
      "/dossiers/Planning-company-brochure-marry-me-cyprus-2023-24-25-pdf-m5K8OxD4XNIxe5Ng.pdf",
    thumbnailUrl: null,
    isFeatured: true,
  },
  {
    id: "day-coordination-dossier",
    title: "Day Coordination Service",
    description:
      "Professional day-of coordination services to ensure your wedding day runs smoothly from start to finish.",
    category: "Planning",
    fileUrl: "/dossiers/Planning-day-coordination-dossier-mv0Pkk734pt3j8k4.pdf",
    thumbnailUrl: null,
    isFeatured: false,
  },
  {
    id: "elopements-micro-weddings",
    title: "Elopements & Micro Weddings",
    description:
      "Intimate wedding packages perfect for couples seeking a private, romantic celebration in Cyprus.",
    category: "Planning",
    fileUrl:
      "/dossiers/Planning-elopements-micro-weddings-dossier-mv0Pkk7eGKFo516y.pdf",
    thumbnailUrl: null,
    isFeatured: true,
  },
  {
    id: "legal-assistance-dossier",
    title: "Legal Assistance & Documentation",
    description:
      "Complete guide to legal requirements, paperwork, and official documentation for getting married in Cyprus.",
    category: "Legal",
    fileUrl: "/dossiers/Planning-legal-assistance-dosseir-AMqDVV4z8VHQNll4.pdf",
    thumbnailUrl: null,
    isFeatured: true,
  },
  {
    id: "pick-up-service-dossier",
    title: "Airport & Guest Pick-Up Services",
    description:
      "Convenient transportation and transfer services for you and your wedding guests arriving in Cyprus.",
    category: "Planning",
    fileUrl: "/dossiers/Planning-pick-up-dossier-mjE4889ZxlsVr4LR.pdf",
    thumbnailUrl: null,
    isFeatured: false,
  },
  {
    id: "symbolic-same-sex-weddings",
    title: "Symbolic & Same-Sex Wedding Ceremonies",
    description:
      "Beautiful symbolic ceremonies and same-sex wedding celebrations with full planning support.",
    category: "Planning",
    fileUrl:
      "/dossiers/Planning-symbolic-same-sex-weddings-dossier-mp84ee9Ny9TqML2r.pdf",
    thumbnailUrl: null,
    isFeatured: false,
  },
  {
    id: "ultimate-package-dossier",
    title: "Ultimate Wedding Package",
    description:
      "Our most comprehensive all-inclusive wedding package with premium services and luxury touches throughout.",
    category: "Packages",
    fileUrl: "/dossiers/Planning-ultimate-package-dossier-YrD499NBZwhgLzkB.pdf",
    thumbnailUrl: null,
    isFeatured: true,
  },
  {
    id: "vow-renewals-dossier",
    title: "Vow Renewal Ceremonies",
    description:
      "Celebrate your enduring love with a beautiful vow renewal ceremony in the stunning setting of Cyprus.",
    category: "Planning",
    fileUrl: "/dossiers/Planning-vow-renewals-dossier-dOqZrr4255CyRLbw.pdf",
    thumbnailUrl: null,
    isFeatured: false,
  },
];

async function seedDossiers() {
  console.log("🌱 Seeding dossiers...");

  try {
    // Clear existing dossiers
    await db.delete(dossiers);
    console.log("✓ Cleared existing dossiers");

    // Insert new dossiers
    for (const dossier of realDossiers) {
      await db.insert(dossiers).values(dossier);
      console.log(`✓ Inserted: ${dossier.title}`);
    }

    console.log(`\n✅ Successfully seeded ${realDossiers.length} dossiers`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding dossiers:", error);
    process.exit(1);
  }
}

seedDossiers();
