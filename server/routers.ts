import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import {
  publicProcedure,
  protectedProcedure,
  adminProcedure,
  router,
} from "./_core/trpc";
import {
  getUserProfile,
  upsertUserProfile,
  getUserPlanningTasks,
  createPlanningTasks,
  toggleTaskCompletion,
  getUserTimelineEvents,
  createTimelineEvents,
  createTimelineEvent,
  updateTimelineEvent,
  deleteTimelineEvent,
  getAllVenues,
  getVenueById,
  upsertVenues,
  getAllCollections,
  getCollectionById,
  upsertCollections,
  getUserFavoriteVenueIds,
  toggleVenueFavorite,
  createInquiry,
  getUserInquiries,
  getAllInquiries,
  updateInquiryStatus,
  getBudget,
  upsertBudget,
  getBudgetCategories,
  upsertBudgetCategory,
  initializeDefaultCategories,
  getBudgetExpenses,
  createBudgetExpense,
  deleteBudgetExpense,
  getAllDossiers,
  getDossiersByCategory,
  getDossierById,
} from "./db";
import { z } from "zod";
import { quoteRouter } from "./trpc/routers/quote";

// Default task templates for wedding planning
const DEFAULT_TASKS = [
  // 12+ months
  {
    timeframe: "12+ months",
    title: "Choose your wedding date",
    description: "Select a date that works for you and your key guests",
    sortOrder: 1,
  },
  {
    timeframe: "12+ months",
    title: "Research venues in Cyprus",
    description: "Explore different locations and venue styles",
    sortOrder: 2,
  },
  {
    timeframe: "12+ months",
    title: "Set your wedding budget",
    description: "Determine overall budget and allocate to categories",
    sortOrder: 3,
  },
  {
    timeframe: "12+ months",
    title: "Create guest list draft",
    description: "Start compiling names and addresses",
    sortOrder: 4,
  },

  // 9-12 months
  {
    timeframe: "9–12 months",
    title: "Book your venue",
    description: "Secure your ceremony and reception location",
    sortOrder: 5,
  },
  {
    timeframe: "9–12 months",
    title: "Confirm ceremony time and format",
    description: "Decide on ceremony style and timing",
    sortOrder: 6,
  },
  {
    timeframe: "9–12 months",
    title: "Hire wedding planner (optional)",
    description: "Consider professional planning support",
    sortOrder: 7,
  },
  {
    timeframe: "9–12 months",
    title: "Book accommodation for guests",
    description: "Reserve hotel blocks or villas",
    sortOrder: 8,
  },

  // 6-9 months
  {
    timeframe: "6–9 months",
    title: "Book photographer and videographer",
    description: "Secure your visual storytellers",
    sortOrder: 9,
  },
  {
    timeframe: "6–9 months",
    title: "Send save-the-date cards",
    description: "Give guests advance notice",
    sortOrder: 10,
  },
  {
    timeframe: "6–9 months",
    title: "Choose wedding party",
    description: "Ask bridesmaids and groomsmen",
    sortOrder: 11,
  },
  {
    timeframe: "6–9 months",
    title: "Start dress shopping",
    description: "Begin trying on wedding dresses",
    sortOrder: 12,
  },

  // 3-6 months
  {
    timeframe: "3–6 months",
    title: "Choose décor and styling theme",
    description: "Finalize color palette and aesthetic",
    sortOrder: 13,
  },
  {
    timeframe: "3–6 months",
    title: "Confirm catering details",
    description: "Finalize menu and dietary requirements",
    sortOrder: 14,
  },
  {
    timeframe: "3–6 months",
    title: "Book florist",
    description: "Arrange bouquets and venue flowers",
    sortOrder: 15,
  },
  {
    timeframe: "3–6 months",
    title: "Arrange wedding music/DJ",
    description: "Book ceremony and reception entertainment",
    sortOrder: 16,
  },
  {
    timeframe: "3–6 months",
    title: "Order wedding invitations",
    description: "Design and print formal invitations",
    sortOrder: 17,
  },

  // 1-3 months
  {
    timeframe: "1–3 months",
    title: "Finalize guest list",
    description: "Confirm RSVPs and final headcount",
    sortOrder: 18,
  },
  {
    timeframe: "1–3 months",
    title: "Create seating plan",
    description: "Arrange table assignments",
    sortOrder: 19,
  },
  {
    timeframe: "1–3 months",
    title: "Final dress fittings",
    description: "Complete alterations and accessories",
    sortOrder: 20,
  },
  {
    timeframe: "1–3 months",
    title: "Book hair and makeup artists",
    description: "Schedule beauty trials and wedding day",
    sortOrder: 21,
  },
  {
    timeframe: "1–3 months",
    title: "Arrange wedding transportation",
    description: "Book cars or transfers",
    sortOrder: 22,
  },

  // Final month
  {
    timeframe: "Final month",
    title: "Make final payments to vendors",
    description: "Settle outstanding balances",
    sortOrder: 23,
  },
  {
    timeframe: "Final month",
    title: "Confirm timings with planner",
    description: "Review day-of timeline",
    sortOrder: 24,
  },
  {
    timeframe: "Final month",
    title: "Break in wedding shoes",
    description: "Wear shoes around the house",
    sortOrder: 25,
  },
  {
    timeframe: "Final month",
    title: "Prepare wedding favors",
    description: "Assemble guest gifts",
    sortOrder: 26,
  },
  {
    timeframe: "Final month",
    title: "Write vows (if applicable)",
    description: "Prepare personal vows",
    sortOrder: 27,
  },

  // Wedding week
  {
    timeframe: "Wedding week",
    title: "Pack essentials for Cyprus",
    description: "Prepare luggage and wedding items",
    sortOrder: 28,
  },
  {
    timeframe: "Wedding week",
    title: "Attend rehearsal",
    description: "Practice ceremony with wedding party",
    sortOrder: 29,
  },
  {
    timeframe: "Wedding week",
    title: "Prepare vendor tip envelopes",
    description: "Organize gratuities",
    sortOrder: 30,
  },
  {
    timeframe: "Wedding week",
    title: "Relax and enjoy!",
    description: "Take time to breathe and celebrate",
    sortOrder: 31,
  },
];

// Default timeline events for wedding day
const DEFAULT_TIMELINE_EVENTS = [
  {
    title: "Getting ready",
    description: "Hair, makeup, and getting dressed",
    startTime: "10:00",
    endTime: null,
    sortOrder: 1,
  },
  {
    title: "First look / couple photos",
    description: "Private moment and couple portraits",
    startTime: "12:00",
    endTime: null,
    sortOrder: 2,
  },
  {
    title: "Guest arrival",
    description: "Guests arrive and take their seats",
    startTime: "14:30",
    endTime: null,
    sortOrder: 3,
  },
  {
    title: "Ceremony",
    description: "Exchange of vows",
    startTime: "15:00",
    endTime: "15:30",
    sortOrder: 4,
  },
  {
    title: "Drinks & canapés",
    description: "Cocktail hour with light refreshments",
    startTime: "15:30",
    endTime: "16:00",
    sortOrder: 5,
  },
  {
    title: "Group photos",
    description: "Family and wedding party photos",
    startTime: "16:00",
    endTime: "17:00",
    sortOrder: 6,
  },
  {
    title: "Dinner",
    description: "Wedding breakfast or reception dinner",
    startTime: "18:00",
    endTime: "20:00",
    sortOrder: 7,
  },
  {
    title: "Speeches",
    description: "Toasts from family and friends",
    startTime: "20:00",
    endTime: "21:00",
    sortOrder: 8,
  },
  {
    title: "Cake cutting",
    description: "Cutting the wedding cake",
    startTime: "21:00",
    endTime: null,
    sortOrder: 9,
  },
  {
    title: "First dance & party",
    description: "First dance followed by dancing",
    startTime: "21:30",
    endTime: null,
    sortOrder: 10,
  },
];

// Real venue data from Marry Me Cyprus
const REAL_VENUES = [
  {
    id: "alassos",
    name: "Ktima Alassos",
    location: "Paphos",
    type: "Beachfront",
    capacityMin: 20,
    capacityMax: 200,
    shortDescription:
      "Exclusive beachfront venue on the Paphos coastline with a private ceremony lawn, cocktail terraces and fairy-light dinners under the stars.",
    keyFeatures: JSON.stringify([
      "Central Paphos location with full privacy and exclusivity",
      "Beachfront ceremony lawn with stunning sea views",
      "Lounge and patio cocktail reception spaces",
      "Elegant dinner under fairy lights and starlit skies",
      "Choice of BBQ buffet or formal set menu",
      "White Chiavari chairs and bistro-style furnishings",
      "Day-use bridal suite for bride and groom",
      "Late-night party option until 3am",
    ]),
    heroImageUrl: "/images/collections/01_alassos_beachfront.jpg",
    galleryImageUrls: JSON.stringify([]),
    isFeatured: 1,
  },
  {
    id: "lchateau",
    name: "L'Chateau",
    location: "Tala, Paphos",
    type: "Country House Estate",
    capacityMin: null,
    capacityMax: null,
    shortDescription:
      "Exclusive country house estate in Tala with mountain and sea views, private gardens, and iconic Ferrari Dino 246 GTS photo moments.",
    keyFeatures: JSON.stringify([
      "Exclusive country house estate nestled in private gardens",
      "Sweeping mountain and sea vistas",
      "Iconic Classic Ferrari Dino 246 GTS as a signature prop",
      "Rustic and romantic ceremony spaces",
      "Luxury local cuisine with live-served BBQ grill",
      "Stylish bridal preparation suites",
      "Cinematic architecture and grand staircases",
      "Enchanting fairylight and firework finale",
      "Picture-perfect gardens for romantic portraits",
    ]),
    heroImageUrl: "/images/collections/02_lchateau_countryhouse.jpg",
    galleryImageUrls: JSON.stringify([]),
    isFeatured: 1,
  },
  {
    id: "liopetro",
    name: "Liopetro",
    location: "Kouklia",
    type: "Heritage / Rustic",
    capacityMin: null,
    capacityMax: null,
    shortDescription:
      "Rustic stone-and-wood retreat set on historic archaeological grounds with secluded gardens, gazebos and relaxed starlit dinners.",
    keyFeatures: JSON.stringify([
      "Private rustic escape built entirely from stone and wood",
      "Set on historic archaeological grounds",
      "Complete seclusion surrounded by gardens and countryside",
      "White-draped gazebo ceremony option",
      "Shaded lawn for cocktails",
      "Relaxed dinner under the stars",
      "Natural beauty with refined finishes",
      "Warm, intimate atmosphere",
      "Approx. 15 minutes from Paphos",
    ]),
    heroImageUrl: "/images/collections/03_liopetro_heritage.jpg",
    galleryImageUrls: JSON.stringify([]),
    isFeatured: 1,
  },
  {
    id: "paliomonastiros",
    name: "Paliomonastiros",
    location: "Paphos District",
    type: "Cliffside Garden",
    capacityMin: null,
    capacityMax: null,
    shortDescription:
      "Historic cliffside garden venue with dramatic rock formations, panoramic views and intimate ceremony spaces wrapped in Mediterranean nature.",
    keyFeatures: JSON.stringify([
      "Stunning natural stone architecture",
      "Rock formations and cliffside setting",
      "Intimate ceremony spaces nestled in historic formations",
      "Panoramic reception areas with sweeping views",
      "Evening celebrations with ambient lighting",
      "Mediterranean landscape setting",
      "Rustic elegance throughout",
    ]),
    heroImageUrl: "/images/collections/04_paliomonastiros_cliffside.jpg",
    galleryImageUrls: JSON.stringify([]),
    isFeatured: 1,
  },
  // Additional venues from More Venues page
  {
    id: "grecian_park_protaras",
    name: "Grecian Park Protaras",
    location: "Protaras",
    type: "Beachfront/Resort",
    capacityMin: null,
    capacityMax: null,
    shortDescription:
      "Scenic beachfront resort venue with professional wedding facilities and comprehensive services.",
    keyFeatures: JSON.stringify([
      "Professional wedding facilities",
      "Beachfront location",
      "Comprehensive services",
      "Resort amenities",
    ]),
    heroImageUrl: "/images/venues/08_grecian_park_protaras.webp",
    galleryImageUrls: JSON.stringify([]),
    isFeatured: 0,
  },
  {
    id: "baths_of_aphrodite",
    name: "Baths of Aphrodite",
    location: "Polis",
    type: "Beach/Scenic",
    capacityMin: null,
    capacityMax: null,
    shortDescription:
      "Iconic natural location with mythological significance and stunning coastal views.",
    keyFeatures: JSON.stringify([
      "Mythological significance",
      "Natural beauty",
      "Coastal views",
      "Unique location",
    ]),
    heroImageUrl: "/images/venues/04_baths_of_aphrodite_polis.webp",
    galleryImageUrls: JSON.stringify([]),
    isFeatured: 0,
  },
  {
    id: "kefalos_beach_village",
    name: "Kefalos Beach Village Paphos",
    location: "Paphos",
    type: "Beach Village",
    capacityMin: null,
    capacityMax: null,
    shortDescription:
      "Beachfront village venue with multiple ceremony and reception spaces.",
    keyFeatures: JSON.stringify([
      "Multiple ceremony spaces",
      "Beachfront location",
      "Village atmosphere",
      "Reception facilities",
    ]),
    heroImageUrl: "/images/venues/09_kefalos_beach_village_paphos.webp",
    galleryImageUrls: JSON.stringify([]),
    isFeatured: 0,
  },
  {
    id: "agia_thekla_church",
    name: "Agia Thekla Church",
    location: "Cyprus",
    type: "Church/Religious",
    capacityMin: null,
    capacityMax: null,
    shortDescription:
      "Historic church with distinctive blue dome architecture, ideal for religious ceremonies.",
    keyFeatures: JSON.stringify([
      "Historic architecture",
      "Blue dome",
      "Religious ceremonies",
      "Traditional setting",
    ]),
    heroImageUrl: "/images/venues/03_agia_thekla_church.webp",
    galleryImageUrls: JSON.stringify([]),
    isFeatured: 0,
  },
  {
    id: "cava_zoe_protaras",
    name: "Cava Zoe Protaras",
    location: "Protaras",
    type: "Venue",
    capacityMin: null,
    capacityMax: null,
    shortDescription:
      "Scenic venue with quality facilities and professional wedding services.",
    keyFeatures: JSON.stringify([
      "Quality facilities",
      "Professional services",
      "Scenic location",
      "Modern amenities",
    ]),
    heroImageUrl: "/images/venues/06_cava_zoe_protaras.webp",
    galleryImageUrls: JSON.stringify([]),
    isFeatured: 0,
  },
  {
    id: "nissaki",
    name: "Nissaki",
    location: "Cyprus",
    type: "Beachfront",
    capacityMin: null,
    capacityMax: null,
    shortDescription:
      "Seaside venue with elegant white chair setups and stunning waterfront views.",
    keyFeatures: JSON.stringify([
      "Beachfront setting",
      "Elegant furnishings",
      "Waterfront views",
      "Intimate atmosphere",
    ]),
    heroImageUrl: "/images/venues/02_nissaki.webp",
    galleryImageUrls: JSON.stringify([]),
    isFeatured: 0,
  },
  {
    id: "king_evelthon_paphos",
    name: "King Evelthon Paphos",
    location: "Paphos",
    type: "Hotel/Resort",
    capacityMin: null,
    capacityMax: null,
    shortDescription:
      "Resort hotel with elegant pavilion setups and comprehensive wedding services.",
    keyFeatures: JSON.stringify([
      "Resort facilities",
      "Pavilion setups",
      "Professional services",
      "Hotel amenities",
    ]),
    heroImageUrl: "/images/venues/07_king_evelthon_paphos.webp",
    galleryImageUrls: JSON.stringify([]),
    isFeatured: 0,
  },
  {
    id: "thalassines_beach_villas",
    name: "Thalassines Beach Villas",
    location: "Cyprus",
    type: "Beach Villas",
    capacityMin: null,
    capacityMax: null,
    shortDescription:
      "Exclusive beach villas offering intimate wedding celebrations by the sea.",
    keyFeatures: JSON.stringify([
      "Private villas",
      "Beach access",
      "Intimate celebrations",
      "Exclusive use",
    ]),
    heroImageUrl: "/images/venues/01_thalassines_beach_villas.webp",
    galleryImageUrls: JSON.stringify([]),
    isFeatured: 0,
  },
  {
    id: "elea_estate_paphos",
    name: "Elea Estate Paphos",
    location: "Paphos",
    type: "Estate",
    capacityMin: null,
    capacityMax: null,
    shortDescription:
      "Luxury estate property with refined gardens and elegant reception spaces.",
    keyFeatures: JSON.stringify([
      "Luxury property",
      "Estate gardens",
      "Elegant spaces",
      "Premium amenities",
    ]),
    heroImageUrl: "/images/venues/05_elea_estate_paphos.webp",
    galleryImageUrls: JSON.stringify([]),
    isFeatured: 0,
  },
  {
    id: "sirenes_beach_agia_napa",
    name: "Sirenes Beach Agia Napa",
    location: "Agia Napa",
    type: "Beach",
    capacityMin: null,
    capacityMax: null,
    shortDescription:
      "Beautiful beach venue with ceremony arches and stunning coastal backdrop.",
    keyFeatures: JSON.stringify([
      "Beach ceremonies",
      "Ceremony arches",
      "Coastal setting",
      "Natural beauty",
    ]),
    heroImageUrl: "/images/venues/10_sirenes_beach_agia_napa.webp",
    galleryImageUrls: JSON.stringify([]),
    isFeatured: 0,
  },
  {
    id: "elysium_hotel_paphos",
    name: "Elysium Hotel Paphos",
    location: "Paphos",
    type: "Hotel",
    capacityMin: null,
    capacityMax: null,
    shortDescription:
      "Prestigious hotel venue with elegant décor and professional wedding coordination.",
    keyFeatures: JSON.stringify([
      "Prestigious hotel",
      "Elegant décor",
      "Professional coordination",
      "Luxury amenities",
    ]),
    heroImageUrl: "/images/venues/11_elysium_hotel_paphos.webp",
    galleryImageUrls: JSON.stringify([]),
    isFeatured: 0,
  },
  {
    id: "lemba_vrisi_paphos",
    name: "Lemba Vrisi Paphos",
    location: "Paphos",
    type: "Garden Venue",
    capacityMin: null,
    capacityMax: null,
    shortDescription:
      "Charming outdoor garden venue with natural surroundings and intimate atmosphere.",
    keyFeatures: JSON.stringify([
      "Garden setting",
      "Outdoor ceremonies",
      "Natural surroundings",
      "Intimate atmosphere",
    ]),
    heroImageUrl: "/images/venues/12_lemba_vrisi_paphos.webp",
    galleryImageUrls: JSON.stringify([]),
    isFeatured: 0,
  },
  {
    id: "atlantida_beach_paphos",
    name: "Atlantida Beach Paphos",
    location: "Paphos",
    type: "Beach",
    capacityMin: null,
    capacityMax: null,
    shortDescription:
      "Beachfront venue with palm trees and tropical atmosphere for seaside celebrations.",
    keyFeatures: JSON.stringify([
      "Beachfront location",
      "Palm trees",
      "Tropical atmosphere",
      "Seaside celebrations",
    ]),
    heroImageUrl: "/images/venues/13_atlantida_beach_paphos.webp",
    galleryImageUrls: JSON.stringify([]),
    isFeatured: 0,
  },
  {
    id: "galu_larnaca",
    name: "Galu Larnaca",
    location: "Larnaca",
    type: "Venue",
    capacityMin: null,
    capacityMax: null,
    shortDescription:
      "Modern venue with elegant white ceremony setups and professional services.",
    keyFeatures: JSON.stringify([
      "Modern facilities",
      "Elegant setups",
      "Professional services",
      "Contemporary design",
    ]),
    heroImageUrl: "/images/venues/14_galu_larnaca.webp",
    galleryImageUrls: JSON.stringify([]),
    isFeatured: 0,
  },
  {
    id: "legacy_venue_agia_napa",
    name: "Legacy Venue Agia Napa",
    location: "Agia Napa",
    type: "Garden Venue",
    capacityMin: null,
    capacityMax: null,
    shortDescription:
      "Outdoor garden venue with elegant seating arrangements and natural beauty.",
    keyFeatures: JSON.stringify([
      "Outdoor gardens",
      "Elegant seating",
      "Natural setting",
      "Versatile spaces",
    ]),
    heroImageUrl: "/images/venues/15_legacy_venue_agia_napa.webp",
    galleryImageUrls: JSON.stringify([]),
    isFeatured: 0,
  },
  {
    id: "honeyli_hill_larnaca",
    name: "HoneyLi Hill Larnaca",
    location: "Larnaca",
    type: "Hilltop",
    capacityMin: null,
    capacityMax: null,
    shortDescription:
      "Elevated hilltop venue with pool features and stunning night-time ambiance.",
    keyFeatures: JSON.stringify([
      "Hilltop location",
      "Pool features",
      "Night-time ambiance",
      "Panoramic views",
    ]),
    heroImageUrl: "/images/venues/16_honeyLi_hill_larnaca.webp",
    galleryImageUrls: JSON.stringify([]),
    isFeatured: 0,
  },
  {
    id: "anassa_polis",
    name: "Anassa Polis",
    location: "Polis",
    type: "Coastal",
    capacityMin: null,
    capacityMax: null,
    shortDescription:
      "Hillside coastal venue with breathtaking sea views and luxury amenities.",
    keyFeatures: JSON.stringify([
      "Hillside location",
      "Sea views",
      "Luxury amenities",
      "Coastal setting",
    ]),
    heroImageUrl: "/images/venues/17_anassa_polis.webp",
    galleryImageUrls: JSON.stringify([]),
    isFeatured: 0,
  },
  {
    id: "vasilikon_winery_paphos",
    name: "Vasilikon Winery Paphos",
    location: "Paphos",
    type: "Winery",
    capacityMin: null,
    capacityMax: null,
    shortDescription:
      "Romantic vineyard setting with rustic charm and wine country atmosphere.",
    keyFeatures: JSON.stringify([
      "Vineyard setting",
      "Rustic charm",
      "Wine country",
      "Romantic atmosphere",
    ]),
    heroImageUrl: "/images/venues/18_vasilikon_winery_paphos.webp",
    galleryImageUrls: JSON.stringify([]),
    isFeatured: 0,
  },
  {
    id: "annabelle_paphos",
    name: "Annabelle Paphos",
    location: "Paphos",
    type: "Resort/Hotel",
    capacityMin: null,
    capacityMax: null,
    shortDescription:
      "Beachfront resort with palm-lined settings and comprehensive wedding packages.",
    keyFeatures: JSON.stringify([
      "Beachfront resort",
      "Palm-lined setting",
      "Wedding packages",
      "Resort amenities",
    ]),
    heroImageUrl: "/images/venues/19_annabelle_paphos.webp",
    galleryImageUrls: JSON.stringify([]),
    isFeatured: 0,
  },
  {
    id: "amavi_paphos",
    name: "Amavi Paphos",
    location: "Paphos",
    type: "Luxury",
    capacityMin: null,
    capacityMax: null,
    shortDescription:
      "Modern luxury venue with contemporary architecture and premium facilities.",
    keyFeatures: JSON.stringify([
      "Modern architecture",
      "Luxury facilities",
      "Contemporary design",
      "Premium services",
    ]),
    heroImageUrl: "/images/venues/20_amavi_paphos.webp",
    galleryImageUrls: JSON.stringify([]),
    isFeatured: 0,
  },
  {
    id: "paphos_shipwreck",
    name: "Paphos Shipwreck (Edro III)",
    location: "Paphos",
    type: "Unique/Scenic",
    capacityMin: null,
    capacityMax: null,
    shortDescription:
      "Dramatic and unique location featuring the iconic Edro III shipwreck backdrop.",
    keyFeatures: JSON.stringify([
      "Unique location",
      "Shipwreck backdrop",
      "Dramatic setting",
      "Iconic landmark",
    ]),
    heroImageUrl: "/images/venues/21_paphos_shipwreck_edro_iii.webp",
    galleryImageUrls: JSON.stringify([]),
    isFeatured: 0,
  },
  {
    id: "agios_georgios_beach",
    name: "Agios Georgios Beach",
    location: "Paphos",
    type: "Beach",
    capacityMin: null,
    capacityMax: null,
    shortDescription:
      "Picturesque coastal beach venue with stunning natural landscape and serene atmosphere.",
    keyFeatures: JSON.stringify([
      "Coastal landscape",
      "Beach setting",
      "Natural beauty",
      "Serene atmosphere",
    ]),
    heroImageUrl: "/images/venues/22_agios_georgios_beach_paphos.webp",
    galleryImageUrls: JSON.stringify([]),
    isFeatured: 0,
  },
];

// Real collection data from Marry Me Cyprus
const REAL_COLLECTIONS = [
  {
    id: "alassos_beachfront",
    name: "Alassos — Beachfront Wedding",
    venueId: "alassos",
    priceBand: "Approx. €15,000–€25,000+ depending on guest count and choices",
    tagline: "Exclusive beachfront celebrations on the Paphos coastline.",
    shortDescription:
      "A private coastal estate with a lawn ceremony, cocktail terraces and fairy-light dinners overlooking the sea.",
    keyHighlights: JSON.stringify([
      "Uninterrupted sea views and private ceremony lawn",
      "Versatile spaces for modern, rustic or contemporary styles",
      "Gourmet BBQ or formal set menu options",
      "Extended celebration hours until late",
    ]),
    heroImageUrl: "/images/collections/01_alassos_beachfront.jpg",
  },
  {
    id: "lchateau_countryhouse",
    name: "L'Chateau — Your Countryhouse Wedding",
    venueId: "lchateau",
    priceBand: "Approx. €20,000–€30,000+ depending on guest count and styling",
    tagline:
      "A private country house estate with cinematic architecture and iconic Ferrari entrances.",
    shortDescription:
      "Sweeping vistas, grand staircases, private gardens and a classic Ferrari Dino 246 GTS for unforgettable photo moments.",
    keyHighlights: JSON.stringify([
      "Personal story and vision of Katie & Matt",
      "Complete privacy and exclusivity",
      "Fairytale firework finale",
      "Iconic Ferrari for entrances and photography",
      "Multiple ceremony and reception spaces",
    ]),
    heroImageUrl: "/images/collections/02_lchateau_countryhouse.jpg",
  },
  {
    id: "liopetro_heritage",
    name: "Liopetro — Your Heritage Wedding",
    venueId: "liopetro",
    priceBand: "Approx. €15,000–€25,000+ depending on guest count and styling",
    tagline: "Rustic stone, wood and history wrapped in Cyprus countryside.",
    shortDescription:
      "A heritage venue built from stone and wood on archaeological grounds, perfect for intimate, rustic celebrations under the stars.",
    keyHighlights: JSON.stringify([
      "Historic archaeological setting",
      "Rustic aesthetic with modern comforts",
      "Intimate, secluded atmosphere",
      "Shaded lawns and starlit dining",
    ]),
    heroImageUrl: "/images/collections/03_liopetro_heritage.jpg",
  },
  {
    id: "paliomonastiros_cliffside",
    name: "Paliomonastiros — Cliffside Garden Wedding",
    venueId: "paliomonastiros",
    priceBand: "Custom pricing based on guest count and setup",
    tagline: "Cliffside gardens and rock formations with panoramic views.",
    shortDescription:
      "A dramatic cliffside garden venue with stone architecture, rock formations and panoramic vistas, designed for cinematic ceremonies and receptions.",
    keyHighlights: JSON.stringify([
      "Dramatic natural backdrop and rock formations",
      "Panoramic vistas and ambient evening lighting",
      "Intimate ceremony spaces carved into the landscape",
    ]),
    heroImageUrl: "/images/collections/04_paliomonastiros_cliffside.jpg",
  },
];

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  quote: quoteRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const profile = await getUserProfile(ctx.user.id);
      if (!profile) return null;

      // Parse JSON fields
      return {
        ...profile,
        styleTags: JSON.parse(profile.styleTags) as string[],
        preferredVenues: profile.preferredVenues
          ? (JSON.parse(profile.preferredVenues) as string[])
          : [],
        weddingStyles: profile.weddingStyles
          ? (JSON.parse(profile.weddingStyles) as string[])
          : [],
      };
    }),

    upsert: protectedProcedure
      .input(
        z.object({
          firstName: z.string().min(1),
          partnerName: z.string().min(1),
          weddingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          location: z.string().min(1),
          venueArea: z.string().optional(),
          guestCount: z.number().min(1).max(1000),
          styleTags: z.array(z.string()),
          // Contact details
          primaryContactName: z.string().optional(),
          email: z.string().email().optional(),
          phone: z.string().optional(),
          // Budget and preferences
          budgetRange: z.string().optional(),
          preferredVenues: z.array(z.string()).optional(),
          preferredVenueId: z.string().optional(),
          preferredArea: z.string().optional(),
          // Additional profile fields
          country: z.string().optional(),
          backupDate: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/)
            .optional(),
          preferredContactMethod: z.string().optional(),
          weddingStyles: z.array(z.string()).optional(),
          mustHaves: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const profile = await upsertUserProfile({
          userId: ctx.user.id,
          firstName: input.firstName,
          partnerName: input.partnerName,
          weddingDate: input.weddingDate,
          location: input.location,
          venueArea: input.venueArea || null,
          guestCount: input.guestCount,
          styleTags: JSON.stringify(input.styleTags),
          primaryContactName: input.primaryContactName || null,
          email: input.email || null,
          phone: input.phone || null,
          budgetRange: input.budgetRange || null,
          preferredVenues: input.preferredVenues
            ? JSON.stringify(input.preferredVenues)
            : null,
          preferredVenueId: input.preferredVenueId || null,
          preferredArea: input.preferredArea || null,
          country: input.country || null,
          backupDate: input.backupDate || null,
          preferredContactMethod: input.preferredContactMethod || null,
          weddingStyles: input.weddingStyles
            ? JSON.stringify(input.weddingStyles)
            : null,
          mustHaves: input.mustHaves || null,
        });

        return {
          ...profile,
          styleTags: JSON.parse(profile!.styleTags) as string[],
          preferredVenues: profile!.preferredVenues
            ? (JSON.parse(profile!.preferredVenues) as string[])
            : [],
          weddingStyles: profile!.weddingStyles
            ? (JSON.parse(profile!.weddingStyles) as string[])
            : [],
        };
      }),

    saveFastTrack: protectedProcedure
      .input(
        z.object({
          fullName: z.string().min(1),
          email: z.string().email(),
          phone: z.string().min(1),
          weddingDate: z.string().optional(),
          estimatedBudget: z.string().optional(),
          weddingLocation: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Save Fast Track data to onboardingData field
        const existingProfile = await getUserProfile(ctx.user.id);
        const onboardingData = existingProfile?.onboardingData
          ? JSON.parse(existingProfile.onboardingData)
          : {};

        const updatedOnboardingData = {
          ...onboardingData,
          fastTrack: input,
          fastTrackCompleted: true,
        };

        await upsertUserProfile({
          userId: ctx.user.id,
          firstName: input.fullName.split(" ")[0] || input.fullName,
          partnerName: "",
          weddingDate: input.weddingDate || "2025-01-01",
          location: input.weddingLocation || "Cyprus",
          guestCount: 50,
          styleTags: JSON.stringify([]),
          email: input.email,
          phone: input.phone,
          budgetRange: input.estimatedBudget || null,
          onboardingData: JSON.stringify(updatedOnboardingData),
          onboardingCompleted: 0, // Not fully complete yet
        });

        return { success: true };
      }),

    saveExtendedOnboarding: protectedProcedure
      .input(
        z.object({
          fullName: z.string(),
          email: z.string(),
          phone: z.string(),
          weddingDate: z.string().optional(),
          estimatedBudget: z.string().optional(),
          weddingLocation: z.string().optional(),
          partnerName: z.string().optional(),
          guestCount: z.string().optional(),
          venueType: z.array(z.string()).optional(),
          atmosphere: z.array(z.string()).optional(),
          colorPalette: z.string().optional(),
          priorities: z.array(z.string()).optional(),
          packageInterest: z.array(z.string()).optional(),
          ceremonyTiming: z.string().optional(),
          mustHaves: z.string().optional(),
          servicesNeeded: z.array(z.string()).optional(),
          additionalNotes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Save complete onboarding data
        const existingProfile = await getUserProfile(ctx.user.id);
        const onboardingData = existingProfile?.onboardingData
          ? JSON.parse(existingProfile.onboardingData)
          : {};

        const completeOnboardingData = {
          ...onboardingData,
          extended: {
            partnerName: input.partnerName,
            guestCount: input.guestCount,
            venueType: input.venueType,
            atmosphere: input.atmosphere,
            colorPalette: input.colorPalette,
            priorities: input.priorities,
            packageInterest: input.packageInterest,
            ceremonyTiming: input.ceremonyTiming,
            mustHaves: input.mustHaves,
            servicesNeeded: input.servicesNeeded,
            additionalNotes: input.additionalNotes,
          },
          extendedCompleted: true,
        };

        await upsertUserProfile({
          userId: ctx.user.id,
          firstName: input.fullName.split(" ")[0] || input.fullName,
          partnerName: input.partnerName || "",
          weddingDate: input.weddingDate || "2025-01-01",
          location: input.weddingLocation || "Cyprus",
          guestCount: input.guestCount ? parseInt(input.guestCount) : 50,
          styleTags: JSON.stringify(input.atmosphere || []),
          email: input.email,
          phone: input.phone,
          budgetRange: input.estimatedBudget || null,
          mustHaves: input.mustHaves || null,
          onboardingData: JSON.stringify(completeOnboardingData),
          onboardingCompleted: 1, // Fully complete
        });

        // TODO: Send email notification to planner

        return { success: true };
      }),

    checkOnboardingStatus: protectedProcedure.query(async ({ ctx }) => {
      const profile = await getUserProfile(ctx.user.id);

      if (!profile) {
        return { completed: false, hasProfile: false };
      }

      // Check if onboarding is completed
      const completed = profile.onboardingCompleted === 1;

      return { completed, hasProfile: true };
    }),

    saveBasicInfo: protectedProcedure
      .input(
        z.object({
          fullName: z.string().min(1),
          email: z.string().email(),
          phone: z.string().min(1),
          weddingDate: z.string().optional(),
          weddingLocation: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const existingProfile = await getUserProfile(ctx.user.id);
        const onboardingData = existingProfile?.onboardingData
          ? JSON.parse(existingProfile.onboardingData)
          : {};

        const updatedOnboardingData = {
          ...onboardingData,
          basicInfo: input,
        };

        await upsertUserProfile({
          userId: ctx.user.id,
          firstName: input.fullName.split(" ")[0] || input.fullName,
          partnerName: "",
          weddingDate: input.weddingDate || "2025-01-01",
          location: input.weddingLocation || "Cyprus",
          guestCount: 50,
          styleTags: JSON.stringify([]),
          email: input.email,
          phone: input.phone,
          onboardingData: JSON.stringify(updatedOnboardingData),
          onboardingCompleted: 0,
        });

        return { success: true };
      }),

    completeOnboarding: protectedProcedure.mutation(async ({ ctx }) => {
      // Mark onboarding as complete
      const existingProfile = await getUserProfile(ctx.user.id);
      if (!existingProfile) {
        throw new Error("Profile not found");
      }

      await upsertUserProfile({
        ...existingProfile,
        onboardingCompleted: 1,
      });

      return { success: true };
    }),

    saveVision: protectedProcedure
      .input(
        z.object({
          season: z.string().optional(),
          preferredDate: z.string().optional(),
          guestCount: z.string().optional(),
          venueTypes: z.array(z.string()).optional(),
          atmospheres: z.array(z.string()).optional(),
          colorPalette: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const existingProfile = await getUserProfile(ctx.user.id);
        const onboardingData = existingProfile?.onboardingData
          ? JSON.parse(existingProfile.onboardingData)
          : {};

        const updatedOnboardingData = {
          ...onboardingData,
          vision: input,
        };

        await upsertUserProfile({
          userId: ctx.user.id,
          firstName: existingProfile?.firstName || "User",
          partnerName: existingProfile?.partnerName || "",
          weddingDate:
            input.preferredDate || existingProfile?.weddingDate || "2025-01-01",
          location: existingProfile?.location || "Cyprus",
          guestCount: input.guestCount
            ? parseInt(input.guestCount)
            : existingProfile?.guestCount || 50,
          styleTags: JSON.stringify(input.atmospheres || []),
          onboardingData: JSON.stringify(updatedOnboardingData),
          onboardingCompleted: 0,
        });

        return { success: true };
      }),

    savePriorities: protectedProcedure
      .input(
        z.object({
          budgetRange: z.string().optional(),
          priorities: z.array(z.string()).optional(),
          packages: z.array(z.string()).optional(),
          travelHelp: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const existingProfile = await getUserProfile(ctx.user.id);
        const onboardingData = existingProfile?.onboardingData
          ? JSON.parse(existingProfile.onboardingData)
          : {};

        const updatedOnboardingData = {
          ...onboardingData,
          priorities: input,
        };

        await upsertUserProfile({
          userId: ctx.user.id,
          firstName: existingProfile?.firstName || "User",
          partnerName: existingProfile?.partnerName || "",
          weddingDate: existingProfile?.weddingDate || "2025-01-01",
          location: existingProfile?.location || "Cyprus",
          guestCount: existingProfile?.guestCount || 50,
          styleTags: existingProfile?.styleTags || JSON.stringify([]),
          budgetRange: input.budgetRange || null,
          onboardingData: JSON.stringify(updatedOnboardingData),
          onboardingCompleted: 0,
        });

        return { success: true };
      }),

    savePlannerNeeds: protectedProcedure
      .input(
        z.object({
          dateFlexibility: z.string().optional(),
          ceremonyTiming: z.string().optional(),
          accessibilityNeeds: z.string().optional(),
          mustHaves: z.string().optional(),
          absoluteNos: z.string().optional(),
          servicesNeeded: z.array(z.string()).optional(),
          culturalElements: z.string().optional(),
          venueRecommendation: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const existingProfile = await getUserProfile(ctx.user.id);
        const onboardingData = existingProfile?.onboardingData
          ? JSON.parse(existingProfile.onboardingData)
          : {};

        const updatedOnboardingData = {
          ...onboardingData,
          plannerNeeds: input,
        };

        await upsertUserProfile({
          userId: ctx.user.id,
          firstName: existingProfile?.firstName || "User",
          partnerName: existingProfile?.partnerName || "",
          weddingDate: existingProfile?.weddingDate || "2025-01-01",
          location: existingProfile?.location || "Cyprus",
          guestCount: existingProfile?.guestCount || 50,
          styleTags: existingProfile?.styleTags || JSON.stringify([]),
          mustHaves: input.mustHaves || null,
          onboardingData: JSON.stringify(updatedOnboardingData),
          onboardingCompleted: 0,
        });

        return { success: true };
      }),

    saveExtra: protectedProcedure
      .input(
        z.object({
          additionalNotes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const existingProfile = await getUserProfile(ctx.user.id);
        const onboardingData = existingProfile?.onboardingData
          ? JSON.parse(existingProfile.onboardingData)
          : {};

        const completeOnboardingData = {
          ...onboardingData,
          extra: input,
        };

        await upsertUserProfile({
          userId: ctx.user.id,
          firstName: existingProfile?.firstName || "User",
          partnerName: existingProfile?.partnerName || "",
          weddingDate: existingProfile?.weddingDate || "2025-01-01",
          location: existingProfile?.location || "Cyprus",
          guestCount: existingProfile?.guestCount || 50,
          styleTags: existingProfile?.styleTags || JSON.stringify([]),
          onboardingData: JSON.stringify(completeOnboardingData),
          onboardingCompleted: 1, // Mark as fully complete
        });

        // TODO: Send email notification to planner

        return { success: true };
      }),

    // Save full onboarding form data
    saveFullOnboarding: protectedProcedure
      .input(
        z.object({
          onboardingData: z.string(),
          intentData: z.string().nullable().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const formData = JSON.parse(input.onboardingData);
        const intentData = input.intentData
          ? JSON.parse(input.intentData)
          : null;

        await upsertUserProfile({
          userId: ctx.user.id,
          firstName: formData.fullName.split(" ")[0] || formData.fullName,
          partnerName: "",
          weddingDate: formData.weddingDate || "2025-01-01",
          location: formData.weddingLocation || "Cyprus",
          guestCount: formData.guestCount ? parseInt(formData.guestCount) : 50,
          styleTags: JSON.stringify(formData.atmospheres || []),
          email: formData.email,
          phone: formData.phone,
          budgetRange: formData.budgetRange || null,
          mustHaves: formData.compulsoryElements || null,
          onboardingData: JSON.stringify({
            full: formData,
            intent: intentData,
            completedAt: new Date().toISOString(),
          }),
          onboardingCompleted: 1,
        });

        return { success: true };
      }),

    // Reset test account to pre-onboarded state (test@marrymeapp.com only)
    resetTestAccount: protectedProcedure.mutation(async ({ ctx }) => {
      // Only allow resetting test account
      if (ctx.user.email !== "test@marrymeapp.com") {
        throw new Error("This function is only available for the test account");
      }

      // Get existing profile
      const profile = await getUserProfile(ctx.user.id);

      if (profile) {
        // Reset onboarding status
        await upsertUserProfile({
          ...profile,
          onboardingCompleted: 0,
          onboardingData: null,
        });
      }

      return { success: true, message: "Test account reset successfully" };
    }),
  }),

  planning: router({
    getTasks: protectedProcedure.query(async ({ ctx }) => {
      const tasks = await getUserPlanningTasks(ctx.user.id);

      // Convert isCompleted from int to boolean
      return tasks.map(task => ({
        ...task,
        isCompleted: task.isCompleted === 1,
      }));
    }),

    initializeTasks: protectedProcedure.mutation(async ({ ctx }) => {
      // Check if user already has tasks
      const existingTasks = await getUserPlanningTasks(ctx.user.id);
      if (existingTasks.length > 0) {
        return existingTasks.map(task => ({
          ...task,
          isCompleted: task.isCompleted === 1,
        }));
      }

      // Create default tasks for the user
      const tasksToCreate = DEFAULT_TASKS.map(template => ({
        userId: ctx.user.id,
        title: template.title,
        description: template.description || null,
        timeframe: template.timeframe,
        isCompleted: 0,
        dueOffsetInDays: null,
        sortOrder: template.sortOrder,
      }));

      const createdTasks = await createPlanningTasks(tasksToCreate);

      return createdTasks.map(task => ({
        ...task,
        isCompleted: task.isCompleted === 1,
      }));
    }),

    toggleTask: protectedProcedure
      .input(z.object({ taskId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const isCompleted = await toggleTaskCompletion(
          input.taskId,
          ctx.user.id
        );
        return { isCompleted };
      }),
  }),

  timeline: router({
    getEvents: protectedProcedure.query(async ({ ctx }) => {
      const events = await getUserTimelineEvents(ctx.user.id);
      return events;
    }),

    initializeEvents: protectedProcedure.mutation(async ({ ctx }) => {
      // Check if user already has events
      const existingEvents = await getUserTimelineEvents(ctx.user.id);
      if (existingEvents.length > 0) {
        return existingEvents;
      }

      // Create default timeline events for the user
      const eventsToCreate = DEFAULT_TIMELINE_EVENTS.map(template => ({
        userId: ctx.user.id,
        title: template.title,
        description: template.description || null,
        startTime: template.startTime,
        endTime: template.endTime,
        sortOrder: template.sortOrder,
      }));

      const createdEvents = await createTimelineEvents(eventsToCreate);
      return createdEvents;
    }),

    createEvent: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1),
          description: z.string().optional(),
          startTime: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM format
          endTime: z
            .string()
            .regex(/^\d{2}:\d{2}$/)
            .or(z.literal(""))
            .optional(),
          sortOrder: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const events = await getUserTimelineEvents(ctx.user.id);
        const maxSortOrder =
          events.length > 0 ? Math.max(...events.map(e => e.sortOrder)) : 0;

        const newEvent = {
          userId: ctx.user.id,
          title: input.title,
          description: input.description || null,
          startTime: input.startTime,
          endTime: input.endTime || null,
          sortOrder: input.sortOrder ?? maxSortOrder + 1,
        };

        const updatedEvents = await createTimelineEvent(newEvent);
        return updatedEvents;
      }),

    updateEvent: protectedProcedure
      .input(
        z.object({
          eventId: z.number(),
          title: z.string().min(1).optional(),
          description: z.string().optional(),
          startTime: z
            .string()
            .regex(/^\d{2}:\d{2}$/)
            .or(z.literal(""))
            .optional(),
          endTime: z
            .string()
            .regex(/^\d{2}:\d{2}$/)
            .or(z.literal(""))
            .optional(),
          sortOrder: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { eventId, ...updates } = input;

        // Convert empty strings to null for optional fields
        const cleanUpdates: any = {};
        if (updates.title !== undefined) cleanUpdates.title = updates.title;
        if (updates.description !== undefined)
          cleanUpdates.description = updates.description || null;
        if (updates.startTime !== undefined)
          cleanUpdates.startTime = updates.startTime;
        if (updates.endTime !== undefined)
          cleanUpdates.endTime = updates.endTime || null;
        if (updates.sortOrder !== undefined)
          cleanUpdates.sortOrder = updates.sortOrder;

        const updatedEvents = await updateTimelineEvent(
          eventId,
          ctx.user.id,
          cleanUpdates
        );
        return updatedEvents;
      }),

    deleteEvent: protectedProcedure
      .input(z.object({ eventId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const updatedEvents = await deleteTimelineEvent(
          input.eventId,
          ctx.user.id
        );
        return updatedEvents;
      }),
  }),

  venues: router({
    getAll: publicProcedure.query(async () => {
      const venues = await getAllVenues();
      return venues;
    }),

    getById: publicProcedure
      .input(z.object({ venueId: z.string() }))
      .query(async ({ input }) => {
        const venue = await getVenueById(input.venueId);
        return venue;
      }),

    seed: publicProcedure.mutation(async () => {
      // Seed the real venues
      const venues = await upsertVenues(REAL_VENUES);
      return { success: true, count: venues.length };
    }),

    getFavoriteIds: protectedProcedure.query(async ({ ctx }) => {
      const favoriteIds = await getUserFavoriteVenueIds(ctx.user.id);
      return favoriteIds;
    }),

    toggleFavorite: protectedProcedure
      .input(z.object({ venueId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const result = await toggleVenueFavorite(ctx.user.id, input.venueId);
        return result;
      }),
  }),

  collections: router({
    getAll: publicProcedure.query(async () => {
      const collections = await getAllCollections();
      return collections;
    }),

    getById: publicProcedure
      .input(z.object({ collectionId: z.string() }))
      .query(async ({ input }) => {
        const collection = await getCollectionById(input.collectionId);
        return collection;
      }),

    seed: publicProcedure.mutation(async () => {
      // Seed the real collections
      const collections = await upsertCollections(REAL_COLLECTIONS);
      return { success: true, count: collections.length };
    }),
  }),

  inquiries: router({
    submit: protectedProcedure
      .input(
        z.object({
          venueId: z.string().optional(),
          collectionId: z.string().optional(),
          name: z.string(),
          email: z.string().email(),
          phone: z.string().optional(),
          weddingDate: z.string().optional(),
          guestCount: z.number().optional(),
          message: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await createInquiry({
          userId: ctx.user.id,
          venueId: input.venueId || null,
          collectionId: input.collectionId || null,
          name: input.name,
          email: input.email,
          phone: input.phone || null,
          weddingDate: input.weddingDate || null,
          guestCount: input.guestCount || null,
          message: input.message,
        });
        return { success: true };
      }),

    getUserInquiries: protectedProcedure.query(async ({ ctx }) => {
      const inquiries = await getUserInquiries(ctx.user.id);
      return inquiries;
    }),

    // Admin procedures
    getAllInquiries: adminProcedure.query(async () => {
      const inquiries = await getAllInquiries();
      return inquiries;
    }),

    updateStatus: adminProcedure
      .input(
        z.object({
          inquiryId: z.number(),
          status: z.enum(["pending", "contacted", "booked"]),
        })
      )
      .mutation(async ({ input }) => {
        const result = await updateInquiryStatus(input.inquiryId, input.status);

        // Send email notification to user
        if (result.inquiry && input.status !== "pending") {
          const inquiry = result.inquiry;
          const statusLabels = {
            contacted: "We've Received Your Inquiry",
            booked: "Your Booking is Confirmed",
          };

          const emailBody =
            input.status === "contacted"
              ? `Dear ${inquiry.name},\n\nThank you for your inquiry with Marry Me Cyprus!\n\nWe have received your enquiry${inquiry.venueName ? ` about ${inquiry.venueName}${inquiry.venueLocation ? ` in ${inquiry.venueLocation}` : ""}` : inquiry.collectionName ? ` about our ${inquiry.collectionName} collection` : ""} and our team will be in touch with you shortly to discuss your wedding plans.\n\n${inquiry.weddingDate ? `Wedding Date: ${inquiry.weddingDate}\n` : ""}\nWe're excited to help you create your dream destination wedding in Cyprus!\n\nWarm regards,\nThe Marry Me Cyprus Team\n\n---\nThis is an automated notification from the Marry Me Cyprus Planning App.`
              : `Dear ${inquiry.name},\n\nCongratulations! Your wedding booking has been confirmed with Marry Me Cyprus!\n\n${inquiry.venueName ? `Venue: ${inquiry.venueName}${inquiry.venueLocation ? ` (${inquiry.venueLocation})` : ""}\n` : inquiry.collectionName ? `Collection: ${inquiry.collectionName}\n` : ""}${inquiry.weddingDate ? `Wedding Date: ${inquiry.weddingDate}\n` : ""}\nOur team will be in touch soon with next steps and detailed planning information.\n\nWe can't wait to help you celebrate your special day in Cyprus!\n\nWarm regards,\nThe Marry Me Cyprus Team\n\n---\nThis is an automated notification from the Marry Me Cyprus Planning App.`;

          try {
            await fetch("https://api.web3forms.com/submit", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                access_key: "492ef260-a4cb-401f-9f88-032feef82ebb",
                to: inquiry.email,
                from_name: "Marry Me Cyprus",
                subject: `Your Marry Me Cyprus Inquiry Update — ${statusLabels[input.status as keyof typeof statusLabels]}`,
                message: emailBody,
              }),
            });
          } catch (error) {
            console.error("Failed to send status update email:", error);
            // Don't fail the mutation if email fails
          }
        }

        return { success: true };
      }),
  }),

  budget: router({
    // Get user's budget
    get: protectedProcedure.query(async ({ ctx }) => {
      return await getBudget(ctx.user.id);
    }),

    // Upsert budget (create or update total budget and currency)
    upsert: protectedProcedure
      .input(
        z.object({
          totalBudget: z.number().min(0),
          currency: z.enum(["EUR", "GBP"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await upsertBudget({
          userId: ctx.user.id,
          totalBudget: input.totalBudget,
          currency: input.currency,
        });
      }),

    // Get user's budget categories
    getCategories: protectedProcedure.query(async ({ ctx }) => {
      return await getBudgetCategories(ctx.user.id);
    }),

    // Initialize default categories for new users
    initializeCategories: protectedProcedure.mutation(async ({ ctx }) => {
      return await initializeDefaultCategories(ctx.user.id);
    }),

    // Upsert budget category (create or update)
    upsertCategory: protectedProcedure
      .input(
        z.object({
          id: z.number().optional(),
          categoryName: z.string(),
          allocatedAmount: z.number().min(0),
          actualSpend: z.number().min(0).optional(),
          notes: z.string().nullable().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await upsertBudgetCategory({
          ...input,
          userId: ctx.user.id,
        });
      }),

    // Get expenses (all or by category)
    getExpenses: protectedProcedure
      .input(
        z.object({
          categoryId: z.number().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        return await getBudgetExpenses(ctx.user.id, input.categoryId);
      }),

    // Create expense
    createExpense: protectedProcedure
      .input(
        z.object({
          categoryId: z.number(),
          title: z.string(),
          vendor: z.string().nullable().optional(),
          cost: z.number().min(0),
          date: z.string(),
          notes: z.string().nullable().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await createBudgetExpense({
          ...input,
          userId: ctx.user.id,
        });
      }),

    // Delete expense
    deleteExpense: protectedProcedure
      .input(
        z.object({
          id: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await deleteBudgetExpense(input.id, ctx.user.id);
      }),
  }),

  // Share Links
  share: router({
    // Generate share link
    generateLink: protectedProcedure.mutation(async ({ ctx }) => {
      console.log("[generateLink] Starting for userId:", ctx.user.id);
      const { generateShareToken, createShareLink } = await import("./db");
      const shareToken = generateShareToken();
      console.log("[generateLink] Generated token:", shareToken);

      const shareLink = await createShareLink({
        userId: ctx.user.id,
        shareToken,
      });
      console.log("[generateLink] Created share link:", shareLink);

      if (!shareLink || !shareLink.shareToken) {
        console.error(
          "[generateLink] CRITICAL: createShareLink returned invalid data:",
          shareLink
        );
        throw new Error("Failed to create share link");
      }

      console.log(
        "[generateLink] Returning URL:",
        `/profile/${shareLink.shareToken}`
      );
      return {
        shareToken: shareLink.shareToken,
        url: `/profile/${shareLink.shareToken}`,
      };
    }),

    // Get shared profile by token
    getSharedProfile: publicProcedure
      .input(
        z.object({
          token: z.string(),
        })
      )
      .query(async ({ input }) => {
        const { getSharedProfile } = await import("./db");
        return await getSharedProfile(input.token);
      }),
  }),

  // Dossier Library
  dossiers: router({
    // Get all dossiers
    getAll: publicProcedure.query(async () => {
      return await getAllDossiers();
    }),

    // Get dossiers by category
    getByCategory: publicProcedure
      .input(
        z.object({
          category: z.string(),
        })
      )
      .query(async ({ input }) => {
        return await getDossiersByCategory(input.category);
      }),

    // Get dossier by ID
    getById: publicProcedure
      .input(
        z.object({
          id: z.string(),
        })
      )
      .query(async ({ input }) => {
        return await getDossierById(input.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
