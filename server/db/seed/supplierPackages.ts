/**
 * Seed supplier packages safely. Re-runnable.
 * Run (from repo root): pnpm tsx server/db/seed/supplierPackages.ts
 */
import { eq } from "drizzle-orm";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import Papa from "papaparse";
import { getDb } from "../../db";
import { supplierPackages } from "../../../drizzle/schema";

type SeedPackage = {
  category: string;
  supplierName: string;
  packageName: string;
  clientRate: string;
  deposit?: string;
  commission?: string; // accepts "15%" or absolute like "238"
  notes?: string;
};

type SeedPackageWithSource = SeedPackage & {
  sourceFile: string;
};

const CSV_CATEGORY_BY_FILE: Record<string, string> = {
  "Photo & Video-Table 1.csv": "Photography & Videography",
  "Hair & Makeup -Table 1.csv": "Hair & Makeup",
  "Entertainment-Table 1.csv": "Entertainment",
  "Transport-Table 1.csv": "Transport",
  "Extras -Table 1.csv": "Extras",
};

const CSV_PRIMARY_CATEGORIES = new Set([
  "Photography & Videography",
  "Hair & Makeup",
  "Entertainment",
  "Transport",
  "Extras",
]);

const seedData: SeedPackage[] = [
  // Photography / Videography
  {
    category: "Photography",
    supplierName: "Beziique",
    packageName: "Sunset Package",
    clientRate: "1350",
    deposit: "300",
    commission: "238",
    notes: "Core sunset photography package",
  },
  {
    category: "Photography",
    supplierName: "Beziique",
    packageName: "Golden Hour Deluxe",
    clientRate: "1750",
    deposit: "400",
    commission: "300",
    notes: "Extended coverage with deluxe edits",
  },
  {
    category: "Photography",
    supplierName: "Lee Stuart",
    packageName: "Full Day",
    clientRate: "1150",
    deposit: "250",
    commission: "225",
  },
  {
    category: "Photography",
    supplierName: "Peter Blue",
    packageName: "Half Day",
    clientRate: "750",
    deposit: "150",
    commission: "120",
  },
  {
    category: "Photo + Video",
    supplierName: "Chris Stephenson",
    packageName: "Photo + Film",
    clientRate: "2400",
    deposit: "500",
    commission: "360",
  },
  {
    category: "Photo + Video",
    supplierName: "Christodoulou",
    packageName: "Full Day",
    clientRate: "3300",
    deposit: "700",
    commission: "520",
  },
  {
    category: "Videography",
    supplierName: "Beziique",
    packageName: "Cinema Highlight",
    clientRate: "1450",
    deposit: "300",
    commission: "230",
  },
  {
    category: "Videography",
    supplierName: "White Motion",
    packageName: "Cinematic Film",
    clientRate: "1900",
    deposit: "400",
    commission: "300",
  },
  {
    category: "Videography",
    supplierName: "Storybox Films",
    packageName: "Classic",
    clientRate: "1200",
    deposit: "250",
    commission: "180",
  },

  // Hair & Makeup
  {
    category: "Hair & Makeup",
    supplierName: "Cyprus Bridal Hair",
    packageName: "Bridal with trial",
    clientRate: "100",
    deposit: "20",
    commission: "0.15", // decimal ratio handled below (15%)
  },
  {
    category: "Hair & Makeup",
    supplierName: "Cyprus Bridal Hair",
    packageName: "Bridesmaid Hair",
    clientRate: "65",
    deposit: "20",
    commission: "10%",
  },
  {
    category: "Hair & Makeup",
    supplierName: "Makeup by Elena",
    packageName: "Bridal Makeup (with trial)",
    clientRate: "120",
    deposit: "30",
    commission: "18%",
  },
  {
    category: "Hair & Makeup",
    supplierName: "Makeup by Elena",
    packageName: "Bridesmaid Makeup",
    clientRate: "75",
    deposit: "20",
    commission: "12%",
  },
  {
    category: "Hair & Makeup",
    supplierName: "Glam by Sofia",
    packageName: "Full Glam",
    clientRate: "95",
    deposit: "20",
    commission: "14%",
  },

  // Entertainment
  {
    category: "Entertainment",
    supplierName: "DJ Jason",
    packageName: "5 hours",
    clientRate: "450",
    deposit: "100",
    commission: "70",
  },
  {
    category: "Entertainment",
    supplierName: "DJ Jason",
    packageName: "Ceremony + 4h",
    clientRate: "520",
    deposit: "120",
    commission: "78",
  },
  {
    category: "Entertainment",
    supplierName: "Duo Strings",
    packageName: "Ceremony Set",
    clientRate: "380",
    deposit: "80",
    commission: "57",
  },
  {
    category: "Entertainment",
    supplierName: "Harpist Sofia",
    packageName: "Ceremony",
    clientRate: "320",
    deposit: "80",
    commission: "48",
  },
  {
    category: "Entertainment",
    supplierName: "Sunset Live Band",
    packageName: "Sunset Set",
    clientRate: "950",
    deposit: "200",
    commission: "150",
  },
  {
    category: "Entertainment",
    supplierName: "Definitive Disco",
    packageName: "Wedding Party Set 5h",
    clientRate: "620",
    deposit: "150",
    commission: "95",
  },
  // Missing CSV entertainment backfill (ensures full catalogue even when CSV rows are irregular)
  {
    category: "Entertainment",
    supplierName: "Moditisax",
    packageName: "2 hours",
    clientRate: "525",
    deposit: "75",
    commission: "75",
  },
  {
    category: "Entertainment",
    supplierName: "Victor Sax",
    packageName: "1 hour",
    clientRate: "400",
    deposit: "75",
    commission: "40",
  },
  {
    category: "Entertainment",
    supplierName: "Victor Sax",
    packageName: "2 hours",
    clientRate: "800",
    deposit: "75",
    commission: "80",
  },
  {
    category: "Entertainment",
    supplierName: "Greek Dancers",
    packageName: "45 minute",
    clientRate: "295",
    deposit: "75",
    commission: "95",
  },
  {
    category: "Entertainment",
    supplierName: "Bag Piper",
    packageName: "Short Package",
    clientRate: "250",
    deposit: "75",
    commission: "50",
  },
  {
    category: "Entertainment",
    supplierName: "Bag Piper",
    packageName: "Long Package",
    clientRate: "350",
    deposit: "75",
    commission: "50",
  },
  {
    category: "Entertainment",
    supplierName: "Bag Piper",
    packageName: "Short Package - Napa",
    clientRate: "300",
    deposit: "75",
    commission: "50",
  },
  {
    category: "Entertainment",
    supplierName: "Bag Piper",
    packageName: "Long Package - Napa",
    clientRate: "400",
    deposit: "75",
    commission: "50",
  },
  {
    category: "Entertainment",
    supplierName: "Magic Mirror & Photobooth",
    packageName: "2 hours",
    clientRate: "400",
    deposit: "125",
    commission: "40",
  },
  {
    category: "Entertainment",
    supplierName: "Magic Mirror & Photobooth",
    packageName: "3 hours",
    clientRate: "500",
    deposit: "125",
    commission: "50",
  },
  {
    category: "Entertainment",
    supplierName: "Singing Waiters",
    packageName: "Singing Waiters PFO or DUO sets for 1 Hour",
    clientRate: "375",
    deposit: "100",
    commission: "75",
  },
  {
    category: "Entertainment",
    supplierName: "Singing Waiters",
    packageName: "45 Minute Singing Waiters",
    clientRate: "275",
    deposit: "100",
    commission: "20",
  },
  {
    category: "Entertainment",
    supplierName: "Erika Soteri Entertainment",
    packageName: "Ceremony Duo",
    clientRate: "550",
    deposit: "110",
    commission: "55",
  },
  {
    category: "Entertainment",
    supplierName: "Erika Soteri Entertainment",
    packageName: "Cocktail Reception Duo",
    clientRate: "825",
    deposit: "165",
    commission: "82.5",
  },
  {
    category: "Entertainment",
    supplierName: "Erika Soteri Entertainment",
    packageName: "Cocktail Reception Trio",
    clientRate: "1210",
    deposit: "242",
    commission: "121",
  },
  {
    category: "Entertainment",
    supplierName: "Erika Soteri Entertainment",
    packageName: "Cocktail Reception Quartet",
    clientRate: "1650",
    deposit: "330",
    commission: "165",
  },
  {
    category: "Entertainment",
    supplierName: "Erika Soteri Entertainment",
    packageName: "Dinner Duo",
    clientRate: "880",
    deposit: "176",
    commission: "88",
  },
  {
    category: "Entertainment",
    supplierName: "Erika Soteri Entertainment",
    packageName: "Dinner Trio",
    clientRate: "1320",
    deposit: "264",
    commission: "132",
  },
  {
    category: "Entertainment",
    supplierName: "Erika Soteri Entertainment",
    packageName: "Dinner Quartet",
    clientRate: "1760",
    deposit: "352",
    commission: "176",
  },
  {
    category: "Entertainment",
    supplierName: "Erika Soteri Entertainment",
    packageName: "Dinner Quintet",
    clientRate: "2090",
    deposit: "418",
    commission: "209",
  },
  {
    category: "Entertainment",
    supplierName: "Erika Soteri Entertainment",
    packageName: "Evening Duo",
    clientRate: "880",
    deposit: "176",
    commission: "88",
  },
  {
    category: "Entertainment",
    supplierName: "Erika Soteri Entertainment",
    packageName: "Evening Trio",
    clientRate: "1320",
    deposit: "264",
    commission: "132",
  },
  {
    category: "Entertainment",
    supplierName: "Erika Soteri Entertainment",
    packageName: "Evening Quartet",
    clientRate: "1760",
    deposit: "352",
    commission: "176",
  },
  {
    category: "Entertainment",
    supplierName: "Erika Soteri Entertainment",
    packageName: "Evening Quintet",
    clientRate: "2090",
    deposit: "418",
    commission: "209",
  },
  {
    category: "Entertainment",
    supplierName: "Erika Soteri Entertainment",
    packageName: "Evening 6 piece",
    clientRate: "2420",
    deposit: "484",
    commission: "242",
  },
  {
    category: "Entertainment",
    supplierName: "Erika Soteri Entertainment",
    packageName: "Evening 7 piece",
    clientRate: "2640",
    deposit: "528",
    commission: "264",
  },
  {
    category: "Entertainment",
    supplierName: "Natalia - Violinist",
    packageName: "45 minutes",
    clientRate: "275",
    deposit: "75",
    commission: "40",
  },
  {
    category: "Entertainment",
    supplierName: "Natalia - Violinist",
    packageName: "1.50 hours",
    clientRate: "450",
    deposit: "75",
    commission: "50",
  },
  {
    category: "Entertainment",
    supplierName: "Silent Disco",
    packageName: "Simona Package",
    clientRate: "450",
    deposit: "100",
    commission: "50",
    notes: "CSV notes indicate custom pricing bands; verify at booking",
  },

  // Transport
  {
    category: "Transport",
    supplierName: "Rolls Royce",
    packageName: "One Way",
    clientRate: "550",
    deposit: "150",
    commission: "80",
  },
  {
    category: "Transport",
    supplierName: "Rolls Royce",
    packageName: "Return",
    clientRate: "850",
    deposit: "200",
    commission: "120",
  },
  {
    category: "Transport",
    supplierName: "Mercedes Viano",
    packageName: "3 hours",
    clientRate: "280",
    deposit: "100",
    commission: "40",
  },
  {
    category: "Transport",
    supplierName: "Classic London Cab",
    packageName: "One Way",
    clientRate: "320",
    deposit: "120",
    commission: "50",
  },
  {
    category: "Transport",
    supplierName: "Range Rover",
    packageName: "One Way",
    clientRate: "420",
    deposit: "120",
    commission: "63",
  },

  // Extras
  {
    category: "Extras",
    supplierName: "Fireworks Cyprus",
    packageName: "Fireworks Show",
    clientRate: "700",
    deposit: "200",
    commission: "105",
  },
  {
    category: "Extras",
    supplierName: "FX Events",
    packageName: "Cold Sparklers (pair)",
    clientRate: "260",
    deposit: "100",
    commission: "40",
  },
  {
    category: "Extras",
    supplierName: "Dancefloors Cyprus",
    packageName: "Dancefloor 12x12",
    clientRate: "480",
    deposit: "150",
    commission: "70",
  },
  {
    category: "Extras",
    supplierName: "Floral Studio",
    packageName: "Aisle Flowers Package",
    clientRate: "420",
    deposit: "150",
    commission: "63",
  },
  {
    category: "Extras",
    supplierName: "Floral Studio",
    packageName: "Floral Arch Premium",
    clientRate: "950",
    deposit: "300",
    commission: "140",
  },
  {
    category: "Extras",
    supplierName: "Marquee Letters",
    packageName: "LED Letters LOVE",
    clientRate: "240",
    deposit: "100",
    commission: "36",
  },
  {
    category: "Extras",
    supplierName: "Audio Memories",
    packageName: "Audio Guestbook",
    clientRate: "220",
    deposit: "80",
    commission: "33",
  },
  {
    category: "Extras",
    supplierName: "Cake Boutique",
    packageName: "Three-Tier Cake",
    clientRate: "380",
    deposit: "150",
    commission: "57",
  },
  {
    category: "Photography",
    supplierName: "Beziique",
    packageName: "Full Day Story Collection",
    clientRate: "2100",
    deposit: "450",
    commission: "340",
  },
  {
    category: "Photography",
    supplierName: "Lee Stuart",
    packageName: "Signature Full Weekend",
    clientRate: "1850",
    deposit: "400",
    commission: "300",
  },
  {
    category: "Photo + Video",
    supplierName: "Frame & Film Cyprus",
    packageName: "All-Day Duo Coverage",
    clientRate: "2750",
    deposit: "600",
    commission: "420",
  },
  {
    category: "Videography",
    supplierName: "White Motion",
    packageName: "Aerial + Teaser Edit",
    clientRate: "2250",
    deposit: "500",
    commission: "350",
  },
  {
    category: "Hair & Makeup",
    supplierName: "Cyprus Bridal Hair",
    packageName: "Bridal Hair + 2 Bridesmaids",
    clientRate: "220",
    deposit: "60",
    commission: "15%",
  },
  {
    category: "Hair & Makeup",
    supplierName: "Glam by Sofia",
    packageName: "Bridal Full Look (trial + day)",
    clientRate: "180",
    deposit: "50",
    commission: "15%",
  },
  {
    category: "Entertainment",
    supplierName: "DJ Jason",
    packageName: "Ceremony + Reception 7h",
    clientRate: "680",
    deposit: "150",
    commission: "102",
  },
  {
    category: "Entertainment",
    supplierName: "Sunset Live Band",
    packageName: "Live Band Full Evening",
    clientRate: "1400",
    deposit: "300",
    commission: "210",
  },
  {
    category: "Transport",
    supplierName: "Rolls Royce",
    packageName: "Ceremony + Photos 3h",
    clientRate: "760",
    deposit: "200",
    commission: "115",
  },
  {
    category: "Transport",
    supplierName: "Luxury Coaches Cyprus",
    packageName: "Guest Shuttle (up to 40)",
    clientRate: "420",
    deposit: "120",
    commission: "63",
  },
  {
    category: "Extras",
    supplierName: "Floral Studio",
    packageName: "Premium Ceremony Arch + Aisle",
    clientRate: "1250",
    deposit: "350",
    commission: "188",
  },
  {
    category: "Extras",
    supplierName: "Dancefloors Cyprus",
    packageName: "Black & White Gloss Floor 16x16",
    clientRate: "750",
    deposit: "220",
    commission: "113",
  },
  {
    category: "Extras",
    supplierName: "Audio Memories",
    packageName: "Audio Guestbook + Setup",
    clientRate: "295",
    deposit: "90",
    commission: "44",
  },
  {
    category: "Photography",
    supplierName: "Beziique",
    packageName: "Editorial Luxe Full Day",
    clientRate: "2350",
    deposit: "500",
    commission: "360",
  },
  {
    category: "Photography",
    supplierName: "Lee Stuart",
    packageName: "Classic Story Package",
    clientRate: "1320",
    deposit: "280",
    commission: "210",
  },
  {
    category: "Photo + Video",
    supplierName: "Chris Stephenson",
    packageName: "Signature Film + Photo",
    clientRate: "3100",
    deposit: "700",
    commission: "470",
  },
  {
    category: "Videography",
    supplierName: "Storybox Films",
    packageName: "Documentary + Highlight Reel",
    clientRate: "1680",
    deposit: "350",
    commission: "250",
  },
  {
    category: "Hair & Makeup",
    supplierName: "Cyprus Bridal Hair",
    packageName: "Bridal Hair Luxury Styling",
    clientRate: "140",
    deposit: "30",
    commission: "15%",
  },
  {
    category: "Hair & Makeup",
    supplierName: "Makeup by Elena",
    packageName: "Bride + 3 Bridesmaids Makeup",
    clientRate: "330",
    deposit: "80",
    commission: "12%",
  },
  {
    category: "Entertainment",
    supplierName: "DJ Jason",
    packageName: "Afterparty Add-On 2h",
    clientRate: "220",
    deposit: "60",
    commission: "33",
  },
  {
    category: "Entertainment",
    supplierName: "Duo Strings",
    packageName: "Cocktail Hour Set",
    clientRate: "420",
    deposit: "100",
    commission: "63",
  },
  {
    category: "Transport",
    supplierName: "Rolls Royce",
    packageName: "Full Day Prestige",
    clientRate: "980",
    deposit: "250",
    commission: "145",
  },
  {
    category: "Transport",
    supplierName: "Mercedes Viano",
    packageName: "Airport + Venue Transfers",
    clientRate: "360",
    deposit: "100",
    commission: "54",
  },
  {
    category: "Extras",
    supplierName: "FX Events",
    packageName: "Cold Sparklers + Confetti Combo",
    clientRate: "420",
    deposit: "120",
    commission: "63",
  },
  {
    category: "Extras",
    supplierName: "Marquee Letters",
    packageName: "LOVE + Initials Package",
    clientRate: "340",
    deposit: "110",
    commission: "51",
  },
  // Additional real pricing from latest supplier sheets
  {
    category: "Photography",
    supplierName: "Thimisy",
    packageName: "Full Day",
    clientRate: "1495",
    deposit: "300",
    commission: "225",
    notes: "Updated from latest pricing sheet",
  },
  {
    category: "Photography",
    supplierName: "Thimisy",
    packageName: "Half Day",
    clientRate: "980",
    deposit: "220",
    commission: "147",
  },
  {
    category: "Photography",
    supplierName: "Thimisy",
    packageName: "Full Day + Drone",
    clientRate: "1780",
    deposit: "350",
    commission: "267",
  },
  {
    category: "Photography",
    supplierName: "Renoir Visuals",
    packageName: "Editorial Full Day",
    clientRate: "1650",
    deposit: "350",
    commission: "248",
  },
  {
    category: "Photography",
    supplierName: "Renoir Visuals",
    packageName: "Ceremony + Couples Session",
    clientRate: "950",
    deposit: "220",
    commission: "143",
  },
  {
    category: "Photo + Video",
    supplierName: "Thimisy",
    packageName: "Photo + Video Full Day",
    clientRate: "2490",
    deposit: "500",
    commission: "375",
  },
  {
    category: "Photo + Video",
    supplierName: "Renoir Visuals",
    packageName: "Signature Duo Coverage",
    clientRate: "2890",
    deposit: "600",
    commission: "434",
  },
  {
    category: "Videography",
    supplierName: "Thimisy",
    packageName: "Highlight Film",
    clientRate: "1250",
    deposit: "260",
    commission: "188",
  },
  {
    category: "Videography",
    supplierName: "Renoir Visuals",
    packageName: "Cinema Film + Speech Edit",
    clientRate: "1550",
    deposit: "320",
    commission: "233",
  },
  {
    category: "Hair & Makeup",
    supplierName: "Renoir Bridal",
    packageName: "Bridal",
    clientRate: "175",
    deposit: "40",
    commission: "15%",
  },
  {
    category: "Hair & Makeup",
    supplierName: "Renoir Bridal",
    packageName: "Bridal + Trial",
    clientRate: "240",
    deposit: "60",
    commission: "15%",
  },
  {
    category: "Hair & Makeup",
    supplierName: "Cyprus Bridal Hair",
    packageName: "Guest Hair Styling",
    clientRate: "55",
    deposit: "15",
    commission: "10%",
  },
  {
    category: "Hair & Makeup",
    supplierName: "Cyprus Bridal Hair",
    packageName: "Bridal Hair + Makeup",
    clientRate: "260",
    deposit: "60",
    commission: "15%",
  },
  {
    category: "Hair & Makeup",
    supplierName: "Makeup by Elena",
    packageName: "Mother of Bride Makeup",
    clientRate: "70",
    deposit: "20",
    commission: "12%",
  },
  {
    category: "Entertainment",
    supplierName: "Definitive Disco",
    packageName: "Essential DJ Set 4h",
    clientRate: "450",
    deposit: "120",
    commission: "68",
  },
  {
    category: "Entertainment",
    supplierName: "Definitive Disco",
    packageName: "Ceremony + Reception 6h",
    clientRate: "690",
    deposit: "180",
    commission: "104",
  },
  {
    category: "Entertainment",
    supplierName: "Definitive Disco",
    packageName: "All Day + Lighting",
    clientRate: "890",
    deposit: "230",
    commission: "134",
  },
  {
    category: "Entertainment",
    supplierName: "DJ Jason",
    packageName: "Essentials 4h",
    clientRate: "390",
    deposit: "100",
    commission: "59",
  },
  {
    category: "Entertainment",
    supplierName: "DJ Jason",
    packageName: "All Day Wedding Set 8h",
    clientRate: "760",
    deposit: "180",
    commission: "114",
  },
  {
    category: "Transport",
    supplierName: "Range Rover",
    packageName: "Transfer Package",
    clientRate: "185",
    deposit: "70",
    commission: "28",
  },
  {
    category: "Transport",
    supplierName: "Range Rover",
    packageName: "Two-Way Chauffeur",
    clientRate: "340",
    deposit: "120",
    commission: "51",
  },
  {
    category: "Transport",
    supplierName: "Range Rover",
    packageName: "Full Day Chauffeur 6h",
    clientRate: "620",
    deposit: "180",
    commission: "93",
  },
  {
    category: "Transport",
    supplierName: "Rolls Royce",
    packageName: "Town Transfer",
    clientRate: "390",
    deposit: "120",
    commission: "59",
  },
  {
    category: "Transport",
    supplierName: "Luxury Coaches Cyprus",
    packageName: "Guest Shuttle Premium (up to 55)",
    clientRate: "520",
    deposit: "150",
    commission: "78",
  },
  {
    category: "Extras",
    supplierName: "Love Island Cakes",
    packageName: "Signature Wedding Cake",
    clientRate: "560",
    deposit: "180",
    commission: "15%",
    notes: "15% comm",
  },
  {
    category: "Extras",
    supplierName: "Love Island Cakes",
    packageName: "Dessert Table + Cake Combo",
    clientRate: "780",
    deposit: "250",
    commission: "15%",
    notes: "15% comm",
  },
  {
    category: "Extras",
    supplierName: "Love Island Cakes",
    packageName: "Cutting Cake + 120 Cupcakes",
    clientRate: "640",
    deposit: "220",
    commission: "15%",
    notes: "15% comm",
  },
  {
    category: "Extras",
    supplierName: "Sparkler Moments",
    packageName: "Cold Sparks + Dancing on Clouds",
    clientRate: "690",
    deposit: "220",
    commission: "104",
  },
  {
    category: "Extras",
    supplierName: "Audio Memories",
    packageName: "Audio Guestbook Luxe + Neon Sign",
    clientRate: "390",
    deposit: "120",
    commission: "59",
  },
  {
    category: "Extras",
    supplierName: "Marquee Letters",
    packageName: "LOVE + MR & MRS Bundle",
    clientRate: "420",
    deposit: "130",
    commission: "63",
  },
  {
    category: "Extras",
    supplierName: "Dancefloors Cyprus",
    packageName: "Gloss Dancefloor 20x20",
    clientRate: "980",
    deposit: "280",
    commission: "147",
  },
  {
    category: "Extras",
    supplierName: "FX Events",
    packageName: "Indoor Fireworks + Sparks",
    clientRate: "560",
    deposit: "180",
    commission: "84",
  },
  // Venue packages
  {
    category: "venue",
    supplierName: "Alassos",
    packageName: "Sea Terrace Full Day",
    clientRate: "4500",
    deposit: "1000",
    commission: "520",
    notes: "Includes ceremony lawn and dinner terrace",
  },
  {
    category: "venue",
    supplierName: "Atlantida",
    packageName: "Beachfront Ceremony + Reception",
    clientRate: "5200",
    deposit: "1200",
    commission: "640",
    notes: "Sunset ceremony slot included",
  },
  {
    category: "venue",
    supplierName: "Liopetro",
    packageName: "Rustic Courtyard Wedding",
    clientRate: "3900",
    deposit: "900",
    commission: "460",
  },
  {
    category: "venue",
    supplierName: "Minthis",
    packageName: "Hillside Luxury Day Package",
    clientRate: "6100",
    deposit: "1500",
    commission: "740",
  },
  {
    category: "venue",
    supplierName: "Elea Estate",
    packageName: "Golf Estate Wedding Day",
    clientRate: "5800",
    deposit: "1400",
    commission: "700",
  },
  {
    category: "venue",
    supplierName: "L'Chateau",
    packageName: "Chateau Garden Celebration",
    clientRate: "6400",
    deposit: "1600",
    commission: "780",
  },
  // Flowers
  {
    category: "flowers",
    supplierName: "Thimisy",
    packageName: "Bridal Bouquet + Arrangements",
    clientRate: "800",
    deposit: "200",
    commission: "120",
  },
  {
    category: "flowers",
    supplierName: "Thimisy",
    packageName: "Full Floral Styling",
    clientRate: "1600",
    deposit: "400",
    commission: "240",
  },
  {
    category: "flowers",
    supplierName: "Renoir",
    packageName: "Ceremony Floral Arch + Aisle",
    clientRate: "1250",
    deposit: "300",
    commission: "185",
  },
  {
    category: "flowers",
    supplierName: "Renoir",
    packageName: "Reception Centerpiece Collection",
    clientRate: "980",
    deposit: "250",
    commission: "145",
  },
  // Cake
  {
    category: "cake",
    supplierName: "Renoir Patisserie",
    packageName: "3-Tier Wedding Cake",
    clientRate: "600",
    deposit: "200",
    commission: "90",
  },
  {
    category: "cake",
    supplierName: "Renoir Patisserie",
    packageName: "4-Tier Signature Cake",
    clientRate: "890",
    deposit: "250",
    commission: "130",
  },
  // Decor / Dressing
  {
    category: "decor",
    supplierName: "Renoir Events",
    packageName: "Full Venue Dressing (chairs, arches, lighting)",
    clientRate: "2500",
    deposit: "600",
    commission: "375",
  },
  {
    category: "decor",
    supplierName: "Renoir Events",
    packageName: "Ceremony Styling Collection",
    clientRate: "1450",
    deposit: "350",
    commission: "220",
  },
  {
    category: "decor",
    supplierName: "Renoir Events",
    packageName: "Reception Styling + Lighting",
    clientRate: "2100",
    deposit: "500",
    commission: "315",
  },
  // Planning fee
  {
    category: "planning_fee",
    supplierName: "Marry Me Cyprus",
    packageName: "Planning & Coordination Fee",
    clientRate: "2000",
    deposit: "500",
    commission: "0",
    notes: "Core planning service fee",
  },
  {
    category: "planning_fee",
    supplierName: "Marry Me Cyprus",
    packageName: "Full-Service Planning + Design",
    clientRate: "3200",
    deposit: "800",
    commission: "0",
  },
  // License / registrar fee
  {
    category: "license",
    supplierName: "Cyprus Civil Registry",
    packageName: "Civil Ceremony License & Registrar",
    clientRate: "500",
    deposit: "200",
    commission: "0",
    notes: "Government fee schedule",
  },
  {
    category: "license",
    supplierName: "Cyprus Civil Registry",
    packageName: "Express License Processing",
    clientRate: "650",
    deposit: "250",
    commission: "0",
  },
];

const ENTERTAINMENT_CSV_BACKFILL: SeedPackage[] = [
  { category: "Entertainment", supplierName: "Definitive Disco", packageName: "Standard (5 hours)", clientRate: "450", deposit: "120", commission: "20%" },
  { category: "Entertainment", supplierName: "Definitive Disco", packageName: "Advanced", clientRate: "650", deposit: "150", commission: "100" },
  { category: "Entertainment", supplierName: "DJ Jason", packageName: "5 hours Package", clientRate: "450", deposit: "100", commission: "164.40" },
  { category: "Entertainment", supplierName: "DJ Pizel", packageName: "Weekdays (6 hours)", clientRate: "500", deposit: "170", commission: "100" },
  { category: "Entertainment", supplierName: "DJ Pizel", packageName: "Weekends", clientRate: "650", deposit: "170", commission: "100" },
  { category: "Entertainment", supplierName: "Moditisax", packageName: "2 hours", clientRate: "525", deposit: "75", commission: "75" },
  { category: "Entertainment", supplierName: "Zack Evangelou", packageName: "1 hour", clientRate: "400", deposit: "75", commission: "55" },
  { category: "Entertainment", supplierName: "Zack Evangelou", packageName: "2 hours", clientRate: "525", deposit: "75", commission: "60" },
  { category: "Entertainment", supplierName: "Zack Evangelou", packageName: "3 hours", clientRate: "650", deposit: "75", commission: "75" },
  { category: "Entertainment", supplierName: "Victor Sax", packageName: "1 hour", clientRate: "400", deposit: "75", commission: "40" },
  { category: "Entertainment", supplierName: "Victor Sax", packageName: "2 hours", clientRate: "800", deposit: "75", commission: "80" },
  { category: "Entertainment", supplierName: "Christos Zenios (Sax)", packageName: "Ceremony (45 mins)", clientRate: "295", deposit: "75", commission: "30" },
  { category: "Entertainment", supplierName: "Christos Zenios (Sax)", packageName: "Cocktail Reception (1.5 hour)", clientRate: "475", deposit: "75", commission: "75" },
  { category: "Entertainment", supplierName: "Anna - Harpist", packageName: "1 hour PFO", clientRate: "325", deposit: "75", commission: "75" },
  { category: "Entertainment", supplierName: "Anna - Harpist", packageName: "2 Hours PFO", clientRate: "425", deposit: "75", commission: "75" },
  { category: "Entertainment", supplierName: "Anna - Harpist", packageName: "3 Hours PFO", clientRate: "525", deposit: "75", commission: "125" },
  { category: "Entertainment", supplierName: "Michalis - Violinist", packageName: "1 hour ISLAND WIDE", clientRate: "425", deposit: "100", commission: "75" },
  { category: "Entertainment", supplierName: "Michalis - Violinist", packageName: "2 hour ISLAND WIDE", clientRate: "495", deposit: "100", commission: "95" },
  { category: "Entertainment", supplierName: "Mr Gloss", packageName: "Small Set (1 hour)", clientRate: "550", deposit: "75", commission: "55" },
  { category: "Entertainment", supplierName: "Mr Gloss", packageName: "Full Set (1 Hour)", clientRate: "950", deposit: "75", commission: "95" },
  { category: "Entertainment", supplierName: "Mr Gloss", packageName: "Full Set (2 Hours)", clientRate: "1200", deposit: "75", commission: "120" },
  { category: "Entertainment", supplierName: "Greek Dancers", packageName: "45 minute", clientRate: "295", deposit: "75", commission: "95" },
  { category: "Entertainment", supplierName: "Bag Piper", packageName: "Short Package", clientRate: "250", deposit: "75", commission: "50" },
  { category: "Entertainment", supplierName: "Bag Piper", packageName: "Long Package", clientRate: "350", deposit: "75", commission: "50" },
  { category: "Entertainment", supplierName: "Bag Piper", packageName: "Short Package - Napa", clientRate: "300", deposit: "75", commission: "50" },
  { category: "Entertainment", supplierName: "Bag Piper", packageName: "Long Package - Napa", clientRate: "400", deposit: "75", commission: "50" },
  { category: "Entertainment", supplierName: "Wings of Love", packageName: "2 Doves", clientRate: "175", deposit: "50", commission: "55" },
  { category: "Entertainment", supplierName: "Magic Mirror & Photobooth", packageName: "2 hours", clientRate: "400", deposit: "125", commission: "40" },
  { category: "Entertainment", supplierName: "Magic Mirror & Photobooth", packageName: "3 hours", clientRate: "500", deposit: "125", commission: "50" },
  { category: "Entertainment", supplierName: "Flash Booth Events Cyprus", packageName: "2 Hours", clientRate: "420", deposit: "100", commission: "15%" },
  { category: "Entertainment", supplierName: "Flash Booth Events Cyprus", packageName: "3 Hours", clientRate: "520", deposit: "100", commission: "15%" },
  { category: "Entertainment", supplierName: "Flash Booth Events Cyprus", packageName: "4 Hours", clientRate: "620", deposit: "100", commission: "15%" },
  { category: "Entertainment", supplierName: "Mini Mania", packageName: "As per Brochure", clientRate: "450", deposit: "75", commission: "15%", notes: "Pricing can vary; 15% commission baseline." },
  { category: "Entertainment", supplierName: "The Illusionist", packageName: "1 hour", clientRate: "350", deposit: "100", commission: "50" },
  { category: "Entertainment", supplierName: "Stavos Flatley", packageName: "30 Minutes", clientRate: "2200", deposit: "500", commission: "400", notes: "Performance package; travel terms apply." },
  { category: "Entertainment", supplierName: "Jamie Johnson", packageName: "PLUS FLIGHTS", clientRate: "2500", commission: "600", notes: "UK performer, flights additional." },
  { category: "Entertainment", supplierName: "Amie Wild Entertainment", packageName: "2 hours - cocktail/dinner", clientRate: "565", deposit: "200", commission: "60" },
  { category: "Entertainment", supplierName: "Sean Lynch", packageName: "Ceremony", clientRate: "250", deposit: "100", commission: "50" },
  { category: "Entertainment", supplierName: "Sean Lynch", packageName: "Ceremony & 1 hours Cocktail Reception", clientRate: "425", deposit: "100", commission: "30" },
  { category: "Entertainment", supplierName: "Sean Lynch", packageName: "1 Hours Cocktail Reception", clientRate: "325", deposit: "100", commission: "50" },
  { category: "Entertainment", supplierName: "Sean Lynch", packageName: "1.5 Hour Cocktail Reception", clientRate: "400", deposit: "100", commission: "100" },
  { category: "Entertainment", supplierName: "Sean Lynch", packageName: "Evening 1 hour", clientRate: "375", deposit: "100", commission: "75" },
  { category: "Entertainment", supplierName: "Sean Lynch", packageName: "Evening 2 x 45 mins", clientRate: "450", deposit: "100", commission: "75" },
  { category: "Entertainment", supplierName: "Louise Vreony", packageName: "Ceremony 1 hour", clientRate: "250", deposit: "75", commission: "20" },
  { category: "Entertainment", supplierName: "Louise Vreony", packageName: "Cocktail Reception 2 hours", clientRate: "350", deposit: "75", commission: "70" },
  { category: "Entertainment", supplierName: "Louise Vreony", packageName: "Reception 1 hour", clientRate: "250", deposit: "75", commission: "20" },
  { category: "Entertainment", supplierName: "Louise Vreony", packageName: "Reception 2 hour", clientRate: "350", deposit: "75", commission: "70" },
  { category: "Entertainment", supplierName: "Louise Vreony", packageName: "Evening Party 3 hours", clientRate: "475", deposit: "75", commission: "95" },
  { category: "Entertainment", supplierName: "Melanie Ballard", packageName: "Ceremony - 3 songs", clientRate: "250", deposit: "100", commission: "50" },
  { category: "Entertainment", supplierName: "Melanie Ballard", packageName: "Ceremony and 1 Hour cocktail", clientRate: "450", deposit: "100", commission: "50" },
  { category: "Entertainment", supplierName: "Melanie Ballard", packageName: "Cocktail Reception 1 hour", clientRate: "350", deposit: "100", commission: "50" },
  { category: "Entertainment", supplierName: "Melanie Ballard", packageName: "Cocktail Reception 2 hours", clientRate: "500", deposit: "100", commission: "50" },
  { category: "Entertainment", supplierName: "Michael Antoniou", packageName: "1 hour 2026-2027", clientRate: "595", deposit: "150", commission: "59.5" },
  { category: "Entertainment", supplierName: "Michael Antoniou", packageName: "2 hours 2026-2027", clientRate: "695", deposit: "150", commission: "40.5" },
  { category: "Entertainment", supplierName: "Michael Antoniou", packageName: "3 hours 2026-2027", clientRate: "795", deposit: "150", commission: "81" },
  { category: "Entertainment", supplierName: "Caricatures", packageName: "2 hours", clientRate: "350", deposit: "50", commission: "110" },
  { category: "Entertainment", supplierName: "Caricatures", packageName: "3 hours", clientRate: "425", deposit: "50", commission: "115" },
  { category: "Entertainment", supplierName: "Balloon Modelling", packageName: "1 hour", clientRate: "195", deposit: "50", commission: "45" },
  { category: "Entertainment", supplierName: "Face Painting & Glitter Art", packageName: "1 hour", clientRate: "195", deposit: "50", commission: "95" },
  { category: "Entertainment", supplierName: "Shisha", packageName: "3 hours", clientRate: "275", deposit: "52", commission: "40" },
  { category: "Entertainment", supplierName: "Fireworks", packageName: "As per quote", clientRate: "700", deposit: "200", commission: "100", notes: "Price varies by display type." },
  { category: "Entertainment", supplierName: "Fireshow - Rico", packageName: "20 Minutes", clientRate: "225", deposit: "50", commission: "55" },
  { category: "Entertainment", supplierName: "Kirstyn McCann Piano", packageName: "1 event (Ceremony OR Cocktail OR Dinner)", clientRate: "310", deposit: "75", commission: "15%" },
  { category: "Entertainment", supplierName: "Kirstyn McCann Piano", packageName: "2 events (Ceremony OR Cocktail OR Dinner)", clientRate: "440", deposit: "75", commission: "15%" },
  { category: "Entertainment", supplierName: "Kirstyn McCann Piano", packageName: "3 events (Ceremony OR Cocktail OR Dinner)", clientRate: "635", deposit: "75", commission: "15%" },
  { category: "Entertainment", supplierName: "Magician (Joe)", packageName: "1 hour", clientRate: "350", deposit: "50", commission: "85" },
  { category: "Entertainment", supplierName: "360 Video Booth", packageName: "2 hours", clientRate: "450", deposit: "125", commission: "100" },
  { category: "Entertainment", supplierName: "360 Video Booth", packageName: "3 hours", clientRate: "550", deposit: "125", commission: "100" },
  { category: "Entertainment", supplierName: "Audio Guest Book", packageName: "Whole Evening PFO", clientRate: "150", deposit: "50", commission: "40" },
  { category: "Entertainment", supplierName: "Video Guest Book", packageName: "Whole Evening PFO", clientRate: "250", deposit: "50", commission: "35" },
  { category: "Entertainment", supplierName: "Champagne Fountain", packageName: "14 Glasses (3 tier)", clientRate: "75", deposit: "50", commission: "20" },
  { category: "Entertainment", supplierName: "Champagne Fountain", packageName: "30 Glasses (4 tier)", clientRate: "110", deposit: "50", commission: "35" },
  { category: "Entertainment", supplierName: "Champagne Fountain", packageName: "55 Glasses (5 tier)", clientRate: "149", deposit: "50", commission: "54" },
  { category: "Entertainment", supplierName: "Hadrow Entertainment", packageName: "Ceremony & guests arrival", clientRate: "350", deposit: "75", commission: "35" },
  { category: "Entertainment", supplierName: "Hadrow Entertainment", packageName: "Cocktail Reception 1 Hour", clientRate: "350", deposit: "75", commission: "35" },
  { category: "Entertainment", supplierName: "Hadrow Entertainment", packageName: "Cocktail Reception 1.5 Hour", clientRate: "450", deposit: "75", commission: "45" },
  { category: "Entertainment", supplierName: "Hadrow Entertainment", packageName: "Dinner 1 Hour", clientRate: "350", deposit: "75", commission: "35" },
  { category: "Entertainment", supplierName: "Hadrow Entertainment", packageName: "Dinner 1.5 hours", clientRate: "450", deposit: "75", commission: "45" },
  { category: "Entertainment", supplierName: "Hadrow Entertainment", packageName: "Ceremony & Reception 1 Hour", clientRate: "600", deposit: "75", commission: "60" },
  { category: "Entertainment", supplierName: "Hadrow Entertainment", packageName: "Ceremony & Reception 1.5 Hour", clientRate: "700", deposit: "75", commission: "70" },
  { category: "Entertainment", supplierName: "Erika Soteri Entertainment", packageName: "Ceremony Duo", clientRate: "550", deposit: "110", commission: "55" },
  { category: "Entertainment", supplierName: "Erika Soteri Entertainment", packageName: "Cocktail Reception Duo", clientRate: "825", deposit: "165", commission: "82.5" },
  { category: "Entertainment", supplierName: "Erika Soteri Entertainment", packageName: "Cocktail Reception Trio", clientRate: "1210", deposit: "242", commission: "121" },
  { category: "Entertainment", supplierName: "Erika Soteri Entertainment", packageName: "Cocktail Reception Quartet", clientRate: "1650", deposit: "330", commission: "165" },
  { category: "Entertainment", supplierName: "Erika Soteri Entertainment", packageName: "Dinner Duo", clientRate: "880", deposit: "176", commission: "88" },
  { category: "Entertainment", supplierName: "Erika Soteri Entertainment", packageName: "Dinner Trio", clientRate: "1320", deposit: "264", commission: "132" },
  { category: "Entertainment", supplierName: "Erika Soteri Entertainment", packageName: "Dinner Quartet", clientRate: "1760", deposit: "352", commission: "176" },
  { category: "Entertainment", supplierName: "Erika Soteri Entertainment", packageName: "Dinner Quintet", clientRate: "2090", deposit: "418", commission: "209" },
  { category: "Entertainment", supplierName: "Erika Soteri Entertainment", packageName: "Evening Duo", clientRate: "880", deposit: "176", commission: "88" },
  { category: "Entertainment", supplierName: "Erika Soteri Entertainment", packageName: "Evening Trio", clientRate: "1320", deposit: "264", commission: "132" },
  { category: "Entertainment", supplierName: "Erika Soteri Entertainment", packageName: "Evening Quartet", clientRate: "1760", deposit: "352", commission: "176" },
  { category: "Entertainment", supplierName: "Erika Soteri Entertainment", packageName: "Evening Quintet", clientRate: "2090", deposit: "418", commission: "209" },
  { category: "Entertainment", supplierName: "Erika Soteri Entertainment", packageName: "Evening 6 piece", clientRate: "2420", deposit: "484", commission: "242" },
  { category: "Entertainment", supplierName: "Erika Soteri Entertainment", packageName: "Evening 7 piece", clientRate: "2640", deposit: "528", commission: "264" },
  { category: "Entertainment", supplierName: "Paphos Wedding Singer", packageName: "The Ceremony", clientRate: "350", deposit: "175", commission: "35" },
  { category: "Entertainment", supplierName: "Paphos Wedding Singer", packageName: "The Drinks", clientRate: "350", deposit: "175", commission: "35" },
  { category: "Entertainment", supplierName: "Paphos Wedding Singer", packageName: "The Ceremony & The Drinks", clientRate: "450", deposit: "225", commission: "45" },
  { category: "Entertainment", supplierName: "Paphos Wedding Singer", packageName: "The Dinner", clientRate: "450", deposit: "225", commission: "45" },
  { category: "Entertainment", supplierName: "Paphos Wedding Singer", packageName: "The First Dance", clientRate: "350", deposit: "175", commission: "35" },
  { category: "Entertainment", supplierName: "Paphos Wedding Singer", packageName: "The Party", clientRate: "550", deposit: "275", commission: "55" },
  { category: "Entertainment", supplierName: "Paphos Wedding Singer", packageName: "The Dinner & The Party", clientRate: "650", deposit: "325", commission: "65" },
  { category: "Entertainment", supplierName: "Singing Waiters", packageName: "Singing Waiters PFO or DUO sets for 1 Hour", clientRate: "375", deposit: "100", commission: "75" },
  { category: "Entertainment", supplierName: "Singing Waiters", packageName: "45 Minute Singing Waiters", clientRate: "275", deposit: "100", commission: "20" },
  { category: "Entertainment", supplierName: "Silent Disco", packageName: "Simona", clientRate: "450", deposit: "100", commission: "50", notes: "See notes in CSV for package options." },
  { category: "Entertainment", supplierName: "Natalia - Violinist", packageName: "45 minutes", clientRate: "275", deposit: "75", commission: "40" },
  { category: "Entertainment", supplierName: "Natalia - Violinist", packageName: "1.50 hours", clientRate: "450", deposit: "75", commission: "50" },
];

const parseCsv = (source: string): string[][] => {
  const parsed = Papa.parse<string[]>(source, {
    header: false,
    skipEmptyLines: false,
    transform: value => value.trim(),
  });
  if (parsed.errors.length > 0) {
    console.warn(
      "[seed:supplierPackages] CSV parse warnings:",
      parsed.errors.map(err => `${err.code}:${err.message}`)
    );
  }
  return parsed.data.filter(row => row.some(cell => String(cell ?? "").trim().length > 0));
};

const normalizeHeader = (value: string) =>
  value
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s&]/g, "")
    .trim();

const normalizeFileKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/\.csv$/i, "")
    .replace(/[^a-z0-9]/g, "");

const CSV_CATEGORY_BY_FILE_KEY: Record<string, string> = {
  photovideotable1: "Photography & Videography",
  entertainmenttable1: "Entertainment",
  hairmakeuptable1: "Hair & Makeup",
  transporttable1: "Transport",
  extrastable1: "Extras",
};

const parseMoneyToken = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const text = value.replace(/\s+/g, " ").trim();
  if (!text) return undefined;
  const match = text.match(/-?\d[\d,]*\.?\d*/);
  if (!match) return undefined;
  const num = Number(match[0].replace(/,/g, ""));
  if (!Number.isFinite(num) || num <= 0) return undefined;
  return num.toFixed(2);
};

const toRatioString = (value: number) => {
  const ratio = value / 100;
  const rounded = Math.round((ratio + Number.EPSILON) * 10000) / 10000;
  return rounded.toString();
};

const parseCommissionToken = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const text = value.replace(/\s+/g, " ").trim();
  if (!text) return undefined;
  const pctMatch = text.match(/(\d+(?:\.\d+)?)\s*%/);
  if (pctMatch) return toRatioString(Number(pctMatch[1]));
  return parseMoneyToken(text);
};

const loadCsvSeedPackages = async (): Promise<{
  items: SeedPackageWithSource[];
  parsedByFile: Record<string, number>;
}> => {
  const baseDir = path.dirname(fileURLToPath(import.meta.url));
  const candidateDirs = [
    path.resolve(baseDir, "../../../public/data"),
    path.resolve(baseDir, "../../../client/public/data"),
  ];
  const csvPackages: SeedPackageWithSource[] = [];
  const parsedByFile: Record<string, number> = {};

  let dataDir = "";
  let files: string[] = [];
  for (const dir of candidateDirs) {
    try {
      const dirFiles = await fs.readdir(dir);
      const csvFiles = dirFiles.filter(file => file.toLowerCase().endsWith(".csv"));
      if (csvFiles.length > 0) {
        dataDir = dir;
        files = dirFiles;
        break;
      }
      console.warn(`[seed:supplierPackages] No CSV files in candidate path: ${dir}`);
    } catch (err) {
      console.warn(`[seed:supplierPackages] CSV path unavailable: ${dir}`, err);
    }
  }

  if (!dataDir) {
    console.warn("[seed:supplierPackages] No readable CSV directory found.");
    return { items: csvPackages, parsedByFile };
  }

  const csvFiles = files.filter(file => file.toLowerCase().endsWith(".csv"));
  if (csvFiles.length === 0) {
    console.warn("[seed:supplierPackages] No CSV files found in:", dataDir);
    return { items: csvPackages, parsedByFile };
  }

  for (const file of csvFiles) {
    const filePath = path.join(dataDir, file);
    const fallbackCategory =
      CSV_CATEGORY_BY_FILE[file] ??
      CSV_CATEGORY_BY_FILE_KEY[normalizeFileKey(file)] ??
      "Extras";
    parsedByFile[file] = 0;
    try {
      const content = await fs.readFile(filePath, "utf8");
      const records = parseCsv(content);
      const headerIndex = records.findIndex(record => {
        const normalized = record.map(normalizeHeader);
        return (
          normalized.some(col => col.includes("supplier name")) &&
          normalized.some(col => col.includes("package"))
        );
      });
      if (headerIndex < 0) {
        console.warn(
          `[seed:supplierPackages] No recognized header row in ${file}. Skipping file.`
        );
        continue;
      }

      const header = records[headerIndex].map(normalizeHeader);
      const supplierIdx = header.findIndex(col => col.includes("supplier name"));
      const packageIdx = header.findIndex(col => col === "package");
      if (supplierIdx < 0 || packageIdx < 0) {
        console.warn(
          `[seed:supplierPackages] Missing supplier/package columns in ${file}. Skipping file.`
        );
        continue;
      }
      const categoryIdx = header.findIndex(col => col.includes("category"));
      const notesIdx = header.findIndex(
        col => col.includes("notes") || col.includes("services")
      );
      const commissionIdx = header.findIndex(col => col.includes("commission"));
      const depositIdx = header.findIndex(col => col.includes("deposit"));
      const rateIdxs = header
        .map((col, idx) => ({ col, idx }))
        .filter(
          h =>
            h.col.includes("rate to client") ||
            h.col === "2026" ||
            h.col === "2027" ||
            h.col === "2025"
        )
        .map(h => h.idx);

      let lastSupplier = "";
      for (const record of records.slice(headerIndex + 1)) {
        const supplierCell = (record[supplierIdx] ?? "").trim();
        const packageCell = (record[packageIdx] ?? "").trim();
        const notesCell = notesIdx >= 0 ? (record[notesIdx] ?? "").trim() : "";
        const commissionCell =
          commissionIdx >= 0 ? (record[commissionIdx] ?? "").trim() : "";
        const depositCell = depositIdx >= 0 ? (record[depositIdx] ?? "").trim() : "";

        if (supplierCell) lastSupplier = supplierCell;
        if (!packageCell || !lastSupplier) continue;
        if (packageCell.toLowerCase() === "package") continue;

        const clientRateRaw =
          rateIdxs
            .map(idx => parseMoneyToken(record[idx]))
            .find(value => !!value) ?? parseMoneyToken(record[packageIdx + 1]);
        if (!clientRateRaw) continue;

        const categoryRaw =
          categoryIdx >= 0 && record[categoryIdx]?.trim()
            ? record[categoryIdx].trim()
            : fallbackCategory;
        const category = categoryRaw;
        const commission =
          parseCommissionToken(commissionCell) ??
          parseCommissionToken(notesCell) ??
          undefined;
        const deposit = parseMoneyToken(depositCell);

        csvPackages.push({
          category,
          supplierName: lastSupplier,
          packageName: packageCell,
          clientRate: clientRateRaw,
          deposit,
          commission,
          notes: notesCell || undefined,
          sourceFile: file,
        });
        parsedByFile[file] += 1;
      }
    } catch (err) {
      console.warn(
        `[seed:supplierPackages] Failed parsing CSV ${file}. Skipping file.`,
        err
      );
    }
  }

  return { items: csvPackages, parsedByFile };
};

const toAmount = (value: string | undefined, clientRate: string): string => {
  if (!value) return "0";
  const trimmed = value.trim();
  if (trimmed.endsWith("%")) {
    const pct = Number(trimmed.replace("%", "")) / 100;
    const base = Number(clientRate);
    const amt = Number.isFinite(base) ? base * pct : 0;
    return amt.toFixed(2);
  }
  const num = Number(trimmed);
  if (!Number.isFinite(num)) return "0";
  // Support decimal ratios such as "0.15" to mean 15% of clientRate.
  if (num > 0 && num < 1) {
    const base = Number(clientRate);
    const amt = Number.isFinite(base) ? base * num : 0;
    return amt.toFixed(2);
  }
  return num.toFixed(2);
};

async function seed() {
  const db = await getDb();
  if (!db) {
    console.warn("[seed:supplierPackages] Database not available. Skipping.");
    return;
  }

  // Build existing key set to make the script idempotent.
  const existing = await db
    .select({
      id: supplierPackages.id,
      category: supplierPackages.category,
      supplierName: supplierPackages.supplierName,
      packageName: supplierPackages.packageName,
      clientRate: supplierPackages.clientRate,
      deposit: supplierPackages.deposit,
      commission: supplierPackages.commission,
      notes: supplierPackages.notes,
    })
    .from(supplierPackages);

  const existingByKey = new Map(
    existing.map(row => [
      `${row.supplierName}||${row.packageName}`.toLowerCase(),
      row,
    ])
  );

  const { items: csvSeedData, parsedByFile } = await loadCsvSeedPackages();
  const staticFallbackData = seedData.filter(
    item => !CSV_PRIMARY_CATEGORIES.has(item.category)
  );
  const allSeedData: SeedPackageWithSource[] = [
    ...staticFallbackData.map(item => ({ ...item, sourceFile: "__static__" })),
    ...ENTERTAINMENT_CSV_BACKFILL.map(item => ({
      ...item,
      sourceFile: "__entertainment_backfill__",
    })),
    ...csvSeedData,
  ];

  // Dedupe by supplier+package, keeping later entries (CSV overrides static when same key).
  const dedupedByKey = new Map<string, SeedPackageWithSource>();
  for (const item of allSeedData) {
    const key = `${item.supplierName}||${item.packageName}`.toLowerCase();
    dedupedByKey.set(key, item);
  }

  const rows = [...dedupedByKey.values()].map(item => {
    const clientRate = Number(item.clientRate);
    const commission = toAmount(item.commission, item.clientRate);
    const deposit = toAmount(item.deposit, item.clientRate);
    return {
      category: item.category,
      supplierName: item.supplierName,
      packageName: item.packageName,
      clientRate: Number.isFinite(clientRate) ? clientRate.toFixed(2) : "0.00",
      deposit,
      commission,
      notes: item.notes ?? null,
      sourceFile: item.sourceFile,
    };
  });

  const toInsert: Array<Omit<(typeof rows)[number], "sourceFile">> = [];
  const toUpdate: Array<{ id: number; row: Omit<(typeof rows)[number], "sourceFile"> }> =
    [];
  let skipped = 0;
  const actionCountsByFile: Record<
    string,
    { inserted: number; updated: number; unchanged: number }
  > = {};

  for (const row of rows) {
    const sourceFile = row.sourceFile;
    if (!actionCountsByFile[sourceFile]) {
      actionCountsByFile[sourceFile] = { inserted: 0, updated: 0, unchanged: 0 };
    }
    const rowForDb = {
      category: row.category,
      supplierName: row.supplierName,
      packageName: row.packageName,
      clientRate: row.clientRate,
      deposit: row.deposit,
      commission: row.commission,
      notes: row.notes,
    };
    const key = `${row.supplierName}||${row.packageName}`.toLowerCase();
    const current = existingByKey.get(key);
    if (!current) {
      toInsert.push(rowForDb);
      actionCountsByFile[sourceFile].inserted += 1;
      continue;
    }
    const same =
      current.category === row.category &&
      String(current.clientRate ?? "0.00") === row.clientRate &&
      String(current.deposit ?? "0.00") === row.deposit &&
      String(current.commission ?? "0.00") === row.commission &&
      (current.notes ?? null) === (row.notes ?? null);

    if (same) {
      skipped += 1;
      actionCountsByFile[sourceFile].unchanged += 1;
      continue;
    }

    toUpdate.push({ id: current.id, row: rowForDb });
    actionCountsByFile[sourceFile].updated += 1;
  }

  if (toInsert.length > 0) {
    await db.insert(supplierPackages).values(toInsert);
  }

  for (const update of toUpdate) {
    await db
      .update(supplierPackages)
      .set(update.row)
      .where(eq(supplierPackages.id, update.id));
  }

  const countsByCategory = rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.category] = (acc[row.category] ?? 0) + 1;
    return acc;
  }, {});
  const categoryCountText = Object.entries(countsByCategory)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([cat, count]) => `${cat}:${count}`)
    .join(", ");
  const entertainmentCount = countsByCategory.Entertainment ?? 0;
  const parsedCsvTotal = Object.values(parsedByFile).reduce((sum, v) => sum + v, 0);
  console.info(
    `[seed:supplierPackages] Total seed rows ${rows.length}. CSV rows parsed: ${parsedCsvTotal}. Inserted ${toInsert.length}, updated ${toUpdate.length}, skipped ${skipped}. Category counts => ${categoryCountText}`
  );
  console.info(`[seed:supplierPackages] Entertainment total rows: ${entertainmentCount}`);

  for (const [file, parsedCount] of Object.entries(parsedByFile).sort((a, b) =>
    a[0].localeCompare(b[0])
  )) {
    const action = actionCountsByFile[file] ?? {
      inserted: 0,
      updated: 0,
      unchanged: 0,
    };
    const skippedForFile = Math.max(
      0,
      parsedCount - action.inserted - action.updated
    );
    console.info(
      `[seed:supplierPackages] ${file} => parsed ${parsedCount}, inserted ${action.inserted}, updated ${action.updated}, skipped ${skippedForFile}`
    );
  }
}

const isDirectRun =
  typeof process !== "undefined" &&
  !!process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  seed()
    .then(() => process.exit(0))
    .catch(err => {
      console.error("[seed:supplierPackages] Failed:", err);
      process.exit(1);
    });
}
