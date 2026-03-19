import { useRoute, Link } from "wouter";
import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Users, ArrowLeft, Check, Heart } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import InquiryFormModal from "@/components/InquiryFormModal";

const staticVenues: Record<
  string,
  {
    title: string;
    subtitle: string;
    description: string;
    highlights: string[];
    folder: string;
    heroImage: string;
  }
> = {
  alassos: {
    title: "Alassos",
    subtitle: "Timeless elegance in nature",
    description:
      "Exclusive beachfront venue on the Paphos coastline with a private ceremony lawn, cocktail terraces and fairy-light dinners under the stars.",
    highlights: [
      "Central Paphos location with full privacy and exclusivity",
      "Beachfront ceremony lawn with stunning sea views",
      "Lounge and patio cocktail reception spaces",
      "Elegant dinner under fairy lights and starlit skies",
      "Choice of BBQ buffet or formal set menu",
      "White Chiavari chairs and bistro-style furnishings",
      "Day-use bridal suite for bride and groom",
      "Late-night party option until 3am",
    ],
    folder: "alassos",
    heroImage: "/highlighted-venues/Alassos.jpg",
  },
  atlantida: {
    title: "Atlantida Beach Venue",
    subtitle: "Sea + sunsets",
    description:
      "Atlantida Beach Venue is a stunning beachfront location offering direct access to golden sands and crystal-clear Mediterranean waters. Perfect for intimate ceremonies with the sea as your backdrop, this venue combines natural beauty with elegant simplicity.",
    highlights: [
      "Direct beach access",
      "Sunset ceremony option",
      "Capacity up to 150 guests",
      "Exclusive use available",
      "On-site coordination support",
    ],
    folder: "atlantida",
    heroImage: "/highlighted-venues/atlantida.jpg",
  },
  "coral-residence": {
    title: "Coral Residence",
    subtitle: "Modern coastal elegance",
    description:
      "Coral Residence combines contemporary design with coastal charm. Private villas and sea views create an intimate, sophisticated wedding atmosphere.",
    highlights: [
      "Private villa accommodation",
      "Sea view ceremony locations",
      "Capacity up to 100 guests",
      "Modern minimalist styling",
      "Poolside reception area",
    ],
    folder: "coral-residence",
    heroImage: "/highlighted-venues/coral-residence.jpg",
  },
  elysium: {
    title: "Elysium Sunset Villa",
    subtitle: "Luxury hillside retreat",
    description:
      "Perched on a hillside with panoramic sea views, Elysium offers exclusive privacy and breathtaking sunsets. The perfect blend of modern luxury and Cypriot charm.",
    highlights: [
      "Panoramic sea views",
      "Private pool & terrace",
      "Capacity up to 80 guests",
      "Indoor/outdoor options",
      "Luxury accommodation on-site",
    ],
    folder: "elysium",
    heroImage: "/highlighted-venues/elysium.jpg",
  },
  "olympic-lagoon": {
    title: "Olympic Lagoon Resort",
    subtitle: "All-inclusive luxury resort",
    description:
      "A five-star resort experience with multiple ceremony locations, from beachfront to lush gardens. Full wedding packages available with dedicated planning team.",
    highlights: [
      "Multiple ceremony locations",
      "All-inclusive packages",
      "Capacity up to 300 guests",
      "On-site accommodation",
      "Dedicated wedding coordinator",
    ],
    folder: "olympic-lagoon",
    heroImage: "/highlighted-venues/olympic-lagoon.jpg",
  },
  anassa: {
    title: "Anassa Luxury Estate",
    subtitle: "Exclusive private estate",
    description:
      "Anassa is a private luxury estate offering complete exclusivity. With manicured gardens, private beach access, and opulent interiors, it's the ultimate in bespoke weddings.",
    highlights: [
      "Complete privacy",
      "Private beach & gardens",
      "Capacity up to 200 guests",
      "Luxury villa accommodation",
      "Bespoke planning service",
    ],
    folder: "anassa",
    heroImage: "/highlighted-venues/anassa.jpg",
  },
  "elea-estate": {
    title: "Elea Estate",
    subtitle: "Championship golf course views",
    description:
      "Elea Estate offers dramatic golf course and sea views with world-class facilities. An exclusive venue for sophisticated celebrations.",
    highlights: [
      "Golf course backdrop",
      "Luxury clubhouse reception",
      "Capacity up to 200 guests",
      "Professional event team",
      "Championship standard facilities",
    ],
    folder: "Elea-Estate",
    heroImage: "/highlighted-venues/elea-estate.jpg",
  },
  lchateau: {
    title: "L'Chateau",
    subtitle: "French-inspired romance",
    description:
      "L'Chateau brings French château elegance to Cyprus with manicured gardens and grand architecture. Perfect for fairytale weddings.",
    highlights: [
      "Grand ballroom option",
      "Formal gardens",
      "Capacity up to 250 guests",
      "French-inspired interiors",
      "Exclusive hire available",
    ],
    folder: "Lchateau",
    heroImage: "/highlighted-venues/lchateau.jpg",
  },
  liopetro: {
    title: "Liopetro",
    subtitle: "Rustic stone village charm",
    description:
      "Liopetro is a restored stone village offering authentic Cypriot character with modern comforts. Ideal for intimate, characterful celebrations.",
    highlights: [
      "Restored traditional buildings",
      "Courtyard ceremony area",
      "Capacity up to 80 guests",
      "Rustic authentic styling",
      "Village atmosphere",
    ],
    folder: "Liopetro",
    heroImage: "/highlighted-venues/liopetro.jpg",
  },
  minthis: {
    title: "Minthis",
    subtitle: "Hillside luxury resort",
    description:
      "Minthis is a hillside resort with stunning views and world-class amenities. Contemporary design meets natural beauty for unforgettable weddings.",
    highlights: [
      "Hillside panoramic views",
      "Modern resort facilities",
      "Capacity up to 180 guests",
      "Spa & wellness options",
      "Golf course setting",
    ],
    folder: "Minthis",
    heroImage: "/highlighted-venues/minthis.jpg",
  },
  palaiomonastiro: {
    title: "Palaiomonastiro",
    subtitle: "Ancient monastery grounds",
    description:
      "Palaiomonastiro offers historic monastery grounds with peaceful gardens. A spiritual and serene setting for meaningful ceremonies.",
    highlights: [
      "Historic monastery location",
      "Peaceful garden ceremony",
      "Capacity up to 100 guests",
      "Spiritual atmosphere",
      "Traditional Cypriot architecture",
    ],
    folder: "paliomonastiros",
    heroImage: "/highlighted-venues/palaiomonastiro.jpg",
  },
  vasilias: {
    title: "Vasilias",
    subtitle: "Royal heritage venue",
    description:
      "Vasilias combines royal heritage with modern luxury. Grand halls and gardens create a majestic wedding experience.",
    highlights: [
      "Grand reception halls",
      "Formal gardens",
      "Capacity up to 300 guests",
      "Heritage architecture",
      "Full service team",
    ],
    folder: "vasilias",
    heroImage: "/highlighted-venues/vasilias.jpg",
  },
};

export default function VenueDetail() {
  const [, params] = useRoute("/venues/:slug");
  const venueId = params?.slug || "";
  const staticVenue = useMemo(() => staticVenues[venueId], [venueId]);
  const { isAuthenticated } = useAuth();
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [hiddenImages, setHiddenImages] = useState<Set<string>>(new Set());
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const { data: venue, isLoading } = trpc.venues.getById.useQuery(
    { venueId },
    {
      enabled: !staticVenue,
      retry: false,
    }
  );
  const { data: favoriteIds = [] } = trpc.venues.getFavoriteIds.useQuery(
    undefined,
    {
      enabled: isAuthenticated,
      retry: false,
    }
  );

  const utils = trpc.useUtils();
  const toggleFavorite = trpc.venues.toggleFavorite.useMutation({
    onMutate: async ({ venueId }) => {
      await utils.venues.getFavoriteIds.cancel();
      const previousFavorites = utils.venues.getFavoriteIds.getData();
      const isFavorited = previousFavorites?.includes(venueId);
      const newFavorites = isFavorited
        ? previousFavorites?.filter(id => id !== venueId)
        : [...(previousFavorites || []), venueId];
      utils.venues.getFavoriteIds.setData(undefined, newFavorites);
      return { previousFavorites };
    },
    onError: (err, variables, context) => {
      if (context?.previousFavorites) {
        utils.venues.getFavoriteIds.setData(
          undefined,
          context.previousFavorites
        );
      }
    },
    onSettled: () => {
      utils.venues.getFavoriteIds.invalidate();
    },
  });

  const isFavorited = favoriteIds.includes(venueId);

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      toast.info("Create a profile to save venues");
      return;
    }
    toggleFavorite.mutate({ venueId });
  };

  if (isLoading && !staticVenue) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#C6B4AB] border-r-transparent"></div>
          <p className="text-white/60 mt-4">Loading venue...</p>
        </div>
      </div>
    );
  }

  if (!venue && staticVenue) {
    const galleryImages =
      venueId === "alassos"
        ? Array.from(
            { length: 6 },
            (_, i) => `/venues/alassos/Alassos-Gallery${i + 1}.jpg`
          )
        : Array.from(
            { length: 6 },
            (_, i) => `/venues/${staticVenue.folder}/${i + 1}.jpg`
          );

    const handleImageError = (src: string) => {
      setHiddenImages(prev => {
        const next = new Set(prev);
        next.add(src);
        return next;
      });
    };

    const handleImageLoad = (src: string) => {
      setLoadedImages(prev => {
        const next = new Set(prev);
        next.add(src);
        return next;
      });
    };

    const visibleImages = galleryImages.filter(src => !hiddenImages.has(src));

    return (
      <div className="min-h-screen bg-black text-white pb-[calc(84px+env(safe-area-inset-bottom))]">
        <Navigation />

        {/* Hero */}
        <div className="relative h-screen">
          <img
            src={staticVenue.heroImage}
            alt={staticVenue.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
            <h1 className="text-5xl md:text-7xl font-serif mb-4">
              {staticVenue.title}
            </h1>
            <p className="text-2xl md:text-3xl">{staticVenue.subtitle}</p>
          </div>
        </div>

        {/* Description & Highlights */}
        <div className="max-w-4xl mx-auto px-8 py-16 md:py-20">
          <p className="text-lg md:text-xl leading-relaxed mb-12">
            {staticVenue.description}
          </p>
          <ul className="space-y-4 text-lg">
            {staticVenue.highlights.map((highlight, i) => (
              <li key={i} className="flex items-start text-white/90">
                <span className="mr-4 text-[#C6B4AB]">•</span>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Gallery */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 pb-20">
          <h2 className="text-4xl font-serif text-center mb-12">Gallery</h2>
          {visibleImages.length === 0 ? (
            <Card className="bg-white/5 border-white/10 rounded-none">
              <div className="p-8 text-center text-white/60">
                Gallery images are being updated.
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {galleryImages.map((src, i) => {
                if (hiddenImages.has(src)) return null;

                return (
                  <Card
                    key={src}
                    className="aspect-square relative overflow-hidden bg-white/5 border-white/10 rounded-none"
                  >
                    {!loadedImages.has(src) ? (
                      <div className="absolute inset-0 animate-pulse bg-white/10" />
                    ) : null}
                    <img
                      src={src}
                      alt={`${staticVenue.title} gallery ${i + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onLoad={() => handleImageLoad(src)}
                      onError={() => handleImageError(src)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom CTA Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md p-4">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="w-full md:w-auto bg-[#C6B4AB] hover:bg-[#B5A49A] text-black font-serif text-lg px-12 py-6 rounded-none"
            >
              Begin Your Bespoke Quote
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full md:w-auto border-white text-white hover:bg-white/10 font-serif text-lg px-12 py-6 rounded-none"
            >
              Enquire Now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="font-serif text-4xl text-white mb-4">
            Venue Not Found
          </h1>
          <Link href="/venues">
            <Button
              variant="outline"
              className="border-[#C6B4AB] text-[#C6B4AB] hover:bg-[#C6B4AB] hover:text-black"
            >
              Back to Venues
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navigation />

      <main className="container mx-auto px-4 py-16 md:py-24">
        {/* Back Button */}
        <Link href="/venues">
          <button className="flex items-center gap-2 text-white/60 hover:text-[#C6B4AB] transition-colors mb-8 font-sans">
            <ArrowLeft className="w-4 h-4" />
            Back to Venues
          </button>
        </Link>

        {/* Hero Image */}
        <div className="relative aspect-[21/9] overflow-hidden mb-12 bg-white/5">
          <img
            src={venue.heroImageUrl}
            alt={venue.name}
            className="w-full h-full object-cover"
            onError={e => {
              e.currentTarget.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='500' viewBox='0 0 1200 500'%3E%3Crect fill='%23000' width='1200' height='500'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23C6B4AB' font-family='serif' font-size='32'%3E" +
                venue.name +
                "%3C/text%3E%3C/svg%3E";
            }}
          />
          {venue.isFeatured && (
            <div className="absolute top-6 right-6 bg-[#C6B4AB] text-black px-4 py-2 text-sm font-sans tracking-wider">
              FEATURED VENUE
            </div>
          )}
          {/* Heart Toggle */}
          <button
            onClick={handleToggleFavorite}
            className="absolute top-6 left-6 p-3 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors"
            aria-label={
              isFavorited ? "Remove from favorites" : "Add to favorites"
            }
          >
            <Heart
              className={`w-6 h-6 transition-all ${
                isFavorited ? "fill-[#C6B4AB] text-[#C6B4AB]" : "text-white"
              }`}
            />
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-3 gap-12 max-w-7xl mx-auto">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="font-serif text-4xl md:text-5xl text-white">
                  {venue.name}
                </h1>
                <span className="text-[#C6B4AB] text-sm font-sans whitespace-nowrap mt-2 px-3 py-1 border border-[#C6B4AB]/30">
                  {venue.type}
                </span>
              </div>

              <div className="flex items-center gap-6 text-white/60 font-sans">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#C6B4AB]" />
                  <span>{venue.location}</span>
                </div>
                {(venue.capacityMin || venue.capacityMax) && (
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#C6B4AB]" />
                    <span>
                      {venue.capacityMin && venue.capacityMax
                        ? `${venue.capacityMin}–${venue.capacityMax} guests`
                        : venue.capacityMax
                          ? `Up to ${venue.capacityMax} guests`
                          : `From ${venue.capacityMin} guests`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-white/10 pt-8">
              <p className="text-white/80 font-sans text-lg leading-relaxed">
                {venue.shortDescription}
              </p>
            </div>

            <div className="border-t border-white/10 pt-8">
              <h2 className="font-serif text-2xl text-white mb-6">
                Key Features
              </h2>
              <ul className="space-y-3">
                {venue.keyFeatures.map((feature: string, index: number) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-white/70 font-sans"
                  >
                    <Check className="w-5 h-5 text-[#C6B4AB] flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="border border-white/10 p-6 space-y-4">
                <h3 className="font-serif text-xl text-white">
                  Interested in this venue?
                </h3>
                <p className="text-white/60 font-sans text-sm">
                  Get in touch with our team to discuss availability, pricing
                  and your vision for your special day.
                </p>
                <Button
                  onClick={() => setIsInquiryModalOpen(true)}
                  className="w-full bg-[#C6B4AB] hover:bg-[#B5A49B] text-black font-sans"
                >
                  Enquire About This Venue
                </Button>
              </div>

              <div className="border border-white/10 p-6 space-y-4">
                <h3 className="font-serif text-xl text-white">
                  View Collections
                </h3>
                <p className="text-white/60 font-sans text-sm">
                  Explore curated wedding packages designed specifically for
                  this venue.
                </p>
                <Link href="/collections">
                  <Button
                    variant="outline"
                    className="w-full border-[#C6B4AB] text-[#C6B4AB] hover:bg-[#C6B4AB] hover:text-black font-sans"
                  >
                    Browse Collections
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Inquiry Modal */}
      <InquiryFormModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        venueId={venue?.id}
        venueName={venue?.name}
      />
    </div>
  );
}
