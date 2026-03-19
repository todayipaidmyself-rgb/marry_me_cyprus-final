export type DossierCatalogItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  fileUrl: string;
  isFeatured?: boolean;
  updatedAt: string;
};

export const DOSSIER_CATALOG: DossierCatalogItem[] = [
  {
    id: "company-dossier-2026",
    title: "Marry Me Cyprus Company Dossier 2026",
    description:
      "A complete overview of Marry Me Cyprus, our planning philosophy, and signature wedding experiences.",
    category: "Planning",
    fileUrl: "/dossiers/marry-me-cyprus-company-dossier-2026.pdf",
    isFeatured: true,
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "ultimate-package-dossier-2026",
    title: "Ultimate Package Dossier 2026",
    description:
      "Our premium all-in wedding package concept with curated experience elements and planner guidance.",
    category: "Packages",
    fileUrl: "/dossiers/ultimate-package-dossier-2026.pdf",
    isFeatured: true,
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "day-coordination-dossier-2026",
    title: "Day Coordination Dossier 2026",
    description:
      "How on-the-day coordination works, what is included, and how your planner supports execution.",
    category: "Planning",
    fileUrl: "/dossiers/day-coorination-dossier-2026.pdf",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "vow-renewals-dossier-2026",
    title: "Vow Renewals Dossier 2026",
    description:
      "Inspiration and planning support for elegant Cyprus vow renewal ceremonies and celebrations.",
    category: "Other",
    fileUrl: "/dossiers/vow-renewals-dossier-2026.pdf",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "symbolic-and-same-sex-weddings-dossier",
    title: "Symbolic & Same-Sex Weddings Dossier",
    description:
      "Guidance for symbolic and same-sex wedding experiences, ceremony formats, and personalization options.",
    category: "Legal",
    fileUrl: "/dossiers/symbolic-and-same-sex-weddings-dossier.pdf",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "legal-assistance-dossier-2026",
    title: "Legal Assistance Dossier 2026",
    description:
      "A practical legal support guide covering documents, timelines, and civil ceremony requirements.",
    category: "Legal",
    fileUrl: "/dossiers/legal-assistance-dossier-2026.pdf",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "pick-up-dossier-2026",
    title: "Pick-Up & Transport Dossier 2026",
    description:
      "Guest and couple transport logistics, pick-up planning, and movement coordination across events.",
    category: "Other",
    fileUrl: "/dossiers/pick-up-dossier-2026.pdf",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

