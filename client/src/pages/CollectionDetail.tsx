import { useRoute, Link } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { MapPin, Euro, ArrowLeft, Check } from "lucide-react";
import InquiryFormModal from "@/components/InquiryFormModal";

export default function CollectionDetail() {
  const [, params] = useRoute("/collections/:id");
  const collectionId = params?.id || "";
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  const { data: collection, isLoading: collectionLoading } =
    trpc.collections.getById.useQuery({ collectionId });
  const { data: venue } = trpc.venues.getById.useQuery(
    { venueId: collection?.venueId || "" },
    { enabled: !!collection?.venueId }
  );

  if (collectionLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#C6B4AB] border-r-transparent"></div>
          <p className="text-white/60 mt-4">Loading collection...</p>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="font-serif text-4xl text-white mb-4">
            Collection Not Found
          </h1>
          <Link href="/collections">
            <Button
              variant="outline"
              className="border-[#C6B4AB] text-[#C6B4AB] hover:bg-[#C6B4AB] hover:text-black"
            >
              Back to Collections
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
        <Link href="/collections">
          <button className="flex items-center gap-2 text-white/60 hover:text-[#C6B4AB] transition-colors mb-8 font-sans">
            <ArrowLeft className="w-4 h-4" />
            Back to Collections
          </button>
        </Link>

        {/* Hero Image - Full Square (Mobile-First) */}
        <div className="relative w-full mb-12 bg-white/5 px-4 md:px-0">
          <div className="w-full max-w-[600px] mx-auto">
            <img
              src={collection.heroImageUrl}
              alt={collection.name}
              className="w-full aspect-square object-cover"
              onError={e => {
                e.currentTarget.src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1000' height='1000' viewBox='0 0 1000 1000'%3E%3Crect fill='%23000' width='1000' height='1000'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23C6B4AB' font-family='serif' font-size='28'%3E" +
                  collection.name +
                  "%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-3 gap-12 max-w-7xl mx-auto">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            <div>
              <h1 className="font-serif text-4xl md:text-5xl text-white mb-4">
                {collection.name}
              </h1>

              <p className="text-[#C6B4AB] text-lg font-sans italic mb-6">
                {collection.tagline}
              </p>

              <div className="flex items-center gap-6 text-white/60 font-sans">
                {venue && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#C6B4AB]" />
                    <Link href={`/venues/${(venue as any).slug || venue.id}`}>
                      <span className="hover:text-[#C6B4AB] transition-colors cursor-pointer">
                        {venue.name}
                      </span>
                    </Link>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Euro className="w-5 h-5 text-[#C6B4AB]" />
                  <span className="text-sm">{collection.priceBand}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-8">
              <p className="text-white/80 font-sans text-lg leading-relaxed">
                {collection.shortDescription}
              </p>
            </div>

            <div className="border-t border-white/10 pt-8">
              <h2 className="font-serif text-2xl text-white mb-6">
                What's Included
              </h2>
              <ul className="space-y-3">
                {collection.keyHighlights.map(
                  (highlight: string, index: number) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-white/70 font-sans"
                    >
                      <Check className="w-5 h-5 text-[#C6B4AB] flex-shrink-0 mt-0.5" />
                      <span>{highlight}</span>
                    </li>
                  )
                )}
              </ul>
            </div>

            {venue && (
              <div className="border-t border-white/10 pt-8">
                <h2 className="font-serif text-2xl text-white mb-4">
                  About the Venue
                </h2>
                <p className="text-white/70 font-sans leading-relaxed mb-4">
                  {venue.shortDescription}
                </p>
                <Link href={`/venues/${(venue as any).slug || venue.id}`}>
                  <Button
                    variant="outline"
                    className="border-[#C6B4AB] text-[#C6B4AB] hover:bg-[#C6B4AB] hover:text-black"
                  >
                    View Full Venue Details
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="border border-white/10 p-6 space-y-4">
                <h3 className="font-serif text-xl text-white">
                  Interested in this collection?
                </h3>
                <p className="text-white/60 font-sans text-sm">
                  Speak with our team to customize this package for your wedding
                  day and discuss availability.
                </p>
                <Button
                  onClick={() => setIsInquiryModalOpen(true)}
                  className="w-full bg-[#C6B4AB] hover:bg-[#B5A49B] text-black font-sans"
                >
                  Enquire About This Collection
                </Button>
              </div>

              <div className="border border-white/10 p-6 space-y-4">
                <h3 className="font-serif text-xl text-white">
                  Pricing Information
                </h3>
                <p className="text-white/70 font-sans text-sm">
                  {collection.priceBand}
                </p>
                <p className="text-white/60 font-sans text-xs">
                  Final pricing depends on guest count, date, and customization
                  choices. Contact us for a detailed quote.
                </p>
              </div>

              <div className="border border-white/10 p-6 space-y-4">
                <h3 className="font-serif text-xl text-white">Explore More</h3>
                <Link href="/collections">
                  <Button
                    variant="outline"
                    className="w-full border-[#C6B4AB] text-[#C6B4AB] hover:bg-[#C6B4AB] hover:text-black font-sans"
                  >
                    View All Collections
                  </Button>
                </Link>
                <Link href="/venues">
                  <Button
                    variant="outline"
                    className="w-full border-[#C6B4AB] text-[#C6B4AB] hover:bg-[#C6B4AB] hover:text-black font-sans"
                  >
                    Browse All Venues
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
        collectionId={collection?.id}
        collectionName={collection?.name}
      />
    </div>
  );
}
