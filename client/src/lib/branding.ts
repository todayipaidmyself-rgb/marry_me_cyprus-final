export type Branding = {
  companyName: string;
  tagline?: string;
  logoUrl: string;
  faviconUrl?: string;
  primaryColor: string; // hex
  secondaryColor: string; // hex
  heroImageUrl?: string;
  emailSignature?: string;
};

export const defaultBranding: Branding = {
  companyName: "Marry Me Cyprus",
  tagline: "Luxury Destination Weddings Across Cyprus & the UK",
  logoUrl: "/logo.png",
  faviconUrl: "/favicon.ico",
  primaryColor: "#C6B4AB", // champagne taupe / gold accent
  secondaryColor: "#0B1224", // deep navy to pair with gold
  heroImageUrl: "/hero-background.jpg",
  emailSignature: "With love from Marry Me Cyprus",
};
