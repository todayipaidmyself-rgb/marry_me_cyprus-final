import { useEffect, useState, useMemo } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Users, Search, X, Heart } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import HighlightedVenues from "@/components/HighlightedVenues";

const CAPACITY_RANGES = [
  { label: "Any size", value: "any" },
  { label: "Up to 40 guests", value: "0-40" },
  { label: "40–80 guests", value: "40-80" },
  { label: "80–150 guests", value: "80-150" },
  { label: "150+ guests", value: "150+" },
];

export default function Venues() {
  const { isAuthenticated } = useAuth();
  const { data: venues, isLoading } = trpc.venues.getAll.useQuery();
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
      // Cancel outgoing refetches
      await utils.venues.getFavoriteIds.cancel();

      // Snapshot previous value
      const previousFavorites = utils.venues.getFavoriteIds.getData();

      // Optimistically update
      const isFavorited = previousFavorites?.includes(venueId);
      const newFavorites = isFavorited
        ? previousFavorites?.filter(id => id !== venueId)
        : [...(previousFavorites || []), venueId];

      utils.venues.getFavoriteIds.setData(undefined, newFavorites);

      return { previousFavorites };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousFavorites) {
        utils.venues.getFavoriteIds.setData(
          undefined,
          context.previousFavorites
        );
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      utils.venues.getFavoriteIds.invalidate();
    },
  });

  const seedVenues = trpc.venues.seed.useMutation();
  const [, setLocation] = useLocation();
  const searchParams = useSearch();

  // Parse URL query parameters
  const urlParams = new URLSearchParams(searchParams);
  const initialLocation = urlParams.get("location") || "all";
  const initialType = urlParams.get("type") || "all";
  const initialCapacity = urlParams.get("capacity") || "any";
  const initialSearch = urlParams.get("search") || "";
  const initialFavoritesOnly = urlParams.get("favorites") === "true";

  // Filter state
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedCapacity, setSelectedCapacity] = useState(initialCapacity);
  const [searchText, setSearchText] = useState(initialSearch);
  const [showFavoritesOnly, setShowFavoritesOnly] =
    useState(initialFavoritesOnly);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedLocation !== "all") params.set("location", selectedLocation);
    if (selectedType !== "all") params.set("type", selectedType);
    if (selectedCapacity !== "any") params.set("capacity", selectedCapacity);
    if (searchText) params.set("search", searchText);
    if (showFavoritesOnly) params.set("favorites", "true");

    const queryString = params.toString();
    setLocation(`/venues${queryString ? `?${queryString}` : ""}`, {
      replace: true,
    });
  }, [
    selectedLocation,
    selectedType,
    selectedCapacity,
    searchText,
    showFavoritesOnly,
    setLocation,
  ]);

  // Seed venues on first load if empty
  useEffect(() => {
    if (venues && venues.length === 0 && !seedVenues.isPending) {
      seedVenues.mutate();
    }
  }, [venues, seedVenues]);

  const addGuestQuoteItem = (venue: { id: string; name: string }) => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("quote-guest-items");
    let items: { id: string; label: string; type: string }[] = [];
    if (saved) {
      try {
        items = JSON.parse(saved);
      } catch (_err) {
        items = [];
      }
    }
    if (!items.find(i => i.id === `venue-${venue.id}`)) {
      items.push({
        id: `venue-${venue.id}`,
        label: venue.name,
        type: "Venue",
      });
      localStorage.setItem("quote-guest-items", JSON.stringify(items));
    }
    toast.success("Added — sign in to persist", {
      description: "View in My Quote",
    });
    setLocation("/my-quote");
  };

  // Extract unique locations and types from venues
  const uniqueLocations = useMemo(() => {
    if (!venues) return [];
    const locations = Array.from(new Set(venues.map(v => v.location))).sort();
    return locations;
  }, [venues]);

  const uniqueTypes = useMemo(() => {
    if (!venues) return [];
    const types = Array.from(new Set(venues.map(v => v.type))).sort();
    return types;
  }, [venues]);

  // Filter venues based on all criteria
  const filteredVenues = useMemo(() => {
    if (!venues) return [];

    return venues.filter(venue => {
      // Location filter
      if (selectedLocation !== "all" && venue.location !== selectedLocation) {
        return false;
      }

      // Type filter
      if (selectedType !== "all" && venue.type !== selectedType) {
        return false;
      }

      // Capacity filter
      if (selectedCapacity !== "any") {
        const hasCapacity =
          venue.capacityMin !== null || venue.capacityMax !== null;

        if (selectedCapacity === "0-40") {
          if (!hasCapacity) return false;
          const min = venue.capacityMin || 0;
          const max = venue.capacityMax || 40;
          if (min > 40 || max < 0) return false;
        } else if (selectedCapacity === "40-80") {
          if (!hasCapacity) return false;
          const min = venue.capacityMin || 40;
          const max = venue.capacityMax || 80;
          if (min > 80 || max < 40) return false;
        } else if (selectedCapacity === "80-150") {
          if (!hasCapacity) return false;
          const min = venue.capacityMin || 80;
          const max = venue.capacityMax || 150;
          if (min > 150 || max < 80) return false;
        } else if (selectedCapacity === "150+") {
          if (!hasCapacity) return false;
          const max = venue.capacityMax || 999;
          if (max < 150) return false;
        }
      }

      // Text search filter
      if (searchText) {
        const search = searchText.toLowerCase();
        const matchesName = venue.name.toLowerCase().includes(search);
        const matchesDescription = venue.shortDescription
          .toLowerCase()
          .includes(search);
        if (!matchesName && !matchesDescription) {
          return false;
        }
      }

      // Favorites filter
      if (showFavoritesOnly && !favoriteIds.includes(venue.id)) {
        return false;
      }

      return true;
    });
  }, [
    venues,
    selectedLocation,
    selectedType,
    selectedCapacity,
    searchText,
    showFavoritesOnly,
    favoriteIds,
  ]);

  const handleClearFilters = () => {
    setSelectedLocation("all");
    setSelectedType("all");
    setSelectedCapacity("any");
    setSearchText("");
    setShowFavoritesOnly(false);
  };

  const hasActiveFilters =
    selectedLocation !== "all" ||
    selectedType !== "all" ||
    showFavoritesOnly ||
    selectedCapacity !== "any" ||
    searchText !== "";

  return (
    <div className="min-h-screen bg-black">
      <Navigation />

      <main className="container mx-auto px-4 pt-[120px] md:pt-[140px] pb-[calc(140px+env(safe-area-inset-bottom))] md:pb-[calc(160px+env(safe-area-inset-bottom))]">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
          <h1 className="font-serif text-4xl md:text-6xl text-white mb-6">
            Exclusive Cyprus Venues
          </h1>
          <p className="text-lg text-white/80 font-sans">
            Handpicked beachfront estates, country houses, heritage sites and
            cliffside gardens across Paphos and the surrounding coastline.
          </p>
        </div>

        {/* Featured section */}
        <HighlightedVenues />
        <div className="max-w-7xl mx-auto mt-2 mb-16 md:mb-20 flex justify-center">
          <Link href="/more-venues">
            <span className="inline-flex items-center justify-center border border-white/20 bg-white/5 px-7 py-3 text-xs uppercase tracking-[0.2em] text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer">
              Explore More Venues
            </span>
          </Link>
        </div>

        {/* Filter Bar */}
        {!isLoading && venues && venues.length > 0 && (
          <div className="max-w-7xl mx-auto mb-8">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 backdrop-blur-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Location Filter */}
                <div>
                  <label className="text-white/70 text-sm font-sans mb-2 block">
                    Location
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={e => setSelectedLocation(e.target.value)}
                    className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/20 text-white font-sans"
                  >
                    <option value="all">All locations</option>
                    {uniqueLocations.map(location => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type Filter */}
                <div>
                  <label className="text-white/70 text-sm font-sans mb-2 block">
                    Venue Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={e => setSelectedType(e.target.value)}
                    className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/20 text-white font-sans"
                  >
                    <option value="all">All venue types</option>
                    {uniqueTypes.map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Capacity Filter */}
                <div>
                  <label className="text-white/70 text-sm font-sans mb-2 block">
                    Capacity
                  </label>
                  <select
                    value={selectedCapacity}
                    onChange={e => setSelectedCapacity(e.target.value)}
                    className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/20 text-white font-sans"
                  >
                    {CAPACITY_RANGES.map(range => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Filter */}
                <div className="md:col-span-2 lg:col-span-1">
                  <label className="text-white/70 text-sm font-sans mb-2 block">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                      type="text"
                      value={searchText}
                      onChange={e => setSearchText(e.target.value)}
                      placeholder="Search by name or description..."
                      className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40 h-10"
                    />
                  </div>
                </div>
              </div>

              {/* Favorites Toggle */}
              {isAuthenticated && (
                <div className="flex items-center gap-2 mt-4">
                  <input
                    type="checkbox"
                    id="favorites-toggle"
                    checked={showFavoritesOnly}
                    onChange={e => setShowFavoritesOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-[#C6B4AB] bg-white/5 checked:bg-[#C6B4AB] checked:border-[#C6B4AB] cursor-pointer"
                  />
                  <label
                    htmlFor="favorites-toggle"
                    className="text-white/70 text-sm font-sans cursor-pointer"
                  >
                    Show favorites only
                  </label>
                </div>
              )}

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <p className="text-white/60 text-sm font-sans">
                    Showing {filteredVenues.length}{" "}
                    {filteredVenues.length === 1 ? "venue" : "venues"}
                  </p>
                  <Button
                    onClick={handleClearFilters}
                    variant="ghost"
                    size="sm"
                    className="text-[#C6B4AB] hover:text-white hover:bg-white/5"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results Counter */}
        {!isLoading && venues && venues.length > 0 && (
          <div className="max-w-7xl mx-auto mb-6">
            <p className="text-white/60 text-sm font-sans">
              {hasActiveFilters
                ? `Showing ${filteredVenues.length} of ${venues.length} venues`
                : `Showing all ${venues.length} venues`}
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-20">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#C6B4AB] border-r-transparent"></div>
            <p className="text-white/60 mt-4">Loading venues...</p>
          </div>
        )}

        {/* Venues Grid */}
        {!isLoading && filteredVenues.length > 0 && (
          <div className="max-w-7xl mx-auto space-y-8 md:space-y-10">
            {filteredVenues[0] ? (() => {
              const venue = filteredVenues[0]!;
              const slug = (venue as any).slug || venue.id;
              return (
                <div className="group relative overflow-hidden bg-white/[0.03] border border-white/10 transition-all duration-[1200ms] ease-out hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
                  {/* Image */}
                  <div className="relative aspect-[16/8] overflow-hidden mb-8 bg-white/5">
                    <img
                      src={venue.heroImageUrl}
                      alt={venue.name}
                      className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                      onError={e => {
                        e.currentTarget.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect fill='%23000' width='800' height='600'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23C6B4AB' font-family='serif' font-size='24'%3E" +
                          venue.name +
                          "%3C/text%3E%3C/svg%3E";
                      }}
                    />
                    <div
                      className="absolute -inset-5 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 85%, rgba(0,0,0,0.95) 100%)",
                      }}
                    />
                    {/* Heart Toggle */}
                    <button
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!isAuthenticated) {
                          toast.info("Create a profile to save venues");
                          return;
                        }
                        toggleFavorite.mutate({ venueId: venue.id });
                      }}
                      className="absolute top-4 left-4 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors"
                      aria-label={
                        favoriteIds.includes(venue.id)
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                    >
                      <Heart
                        className={`w-5 h-5 transition-all ${
                          favoriteIds.includes(venue.id)
                            ? "fill-[#C6B4AB] text-[#C6B4AB]"
                            : "text-white"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="px-8 pb-8 md:px-10 md:pb-10 space-y-4">
                    <div className="space-y-2">
                      <h2 className="font-serif text-3xl md:text-4xl text-white group-hover:text-[#C6B4AB] transition-colors">
                        {venue.name}
                      </h2>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-white/55">
                        {venue.location}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-white/60 text-sm font-sans">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        <span>{venue.location}</span>
                      </div>
                      {(venue.capacityMin || venue.capacityMax) && (
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4" />
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

                    <p className="text-white/76 font-sans leading-relaxed max-w-3xl">
                      {venue.shortDescription}
                    </p>
                    <details className="group/details border-t border-white/10 pt-4">
                      <summary className="list-none cursor-pointer text-xs uppercase tracking-[0.2em] text-white/70 group-open/details:text-white transition-colors">
                        <span className="inline-flex items-center gap-2">
                          Discover Venue
                          <span className="text-white/50 transition-transform duration-200 group-open/details:rotate-45">
                            +
                          </span>
                        </span>
                      </summary>
                      <div className="overflow-hidden transition-all duration-500 ease-out max-h-0 opacity-0 group-open/details:max-h-[520px] group-open/details:opacity-100">
                        <div className="mt-4 border-l border-white/10 pl-4 max-w-3xl">
                          <p className="text-white/78 leading-relaxed text-[15px]">
                            {venue.shortDescription}
                          </p>
                          <p className="mt-4 text-white/68 leading-relaxed text-sm">
                            {Array.isArray(venue.keyFeatures) &&
                            venue.keyFeatures.length > 0
                              ? venue.keyFeatures.join(" • ")
                              : "Additional venue details available upon enquiry."}
                          </p>
                          <div className="mt-5 flex items-center gap-3">
                            <Link href={`/venues/${slug}`}>
                              <span className="inline-block text-[11px] uppercase tracking-[0.18em] text-white/60 hover:text-white transition-colors cursor-pointer">
                                Open Full Venue Page
                              </span>
                            </Link>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-[#C6B4AB] text-white hover:bg-[#C6B4AB] hover:text-black"
                              onClick={e => {
                                e.preventDefault();
                                e.stopPropagation();
                                addGuestQuoteItem(venue);
                              }}
                            >
                              Add to Quote
                            </Button>
                          </div>
                        </div>
                      </div>
                    </details>
                  </div>
                </div>
              );
            })() : null}

            {filteredVenues.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredVenues.slice(1).map(venue => {
                  const slug = (venue as any).slug || venue.id;
                  return (
                    <div
                      key={venue.id}
                      className="group relative overflow-hidden bg-white/[0.03] border border-white/10 transition-all duration-[1200ms] ease-out hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden mb-6 bg-white/5">
                        <img
                          src={venue.heroImageUrl}
                          alt={venue.name}
                          className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                          onError={e => {
                            e.currentTarget.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect fill='%23000' width='800' height='600'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23C6B4AB' font-family='serif' font-size='24'%3E" +
                              venue.name +
                              "%3C/text%3E%3C/svg%3E";
                          }}
                        />
                        <div
                          className="absolute -inset-5 pointer-events-none"
                          style={{
                            background:
                              "linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 85%, rgba(0,0,0,0.95) 100%)",
                          }}
                        />
                        <button
                          onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!isAuthenticated) {
                              toast.info("Create a profile to save venues");
                              return;
                            }
                            toggleFavorite.mutate({ venueId: venue.id });
                          }}
                          className="absolute top-4 left-4 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors"
                          aria-label={
                            favoriteIds.includes(venue.id)
                              ? "Remove from favorites"
                              : "Add to favorites"
                          }
                        >
                          <Heart
                            className={`w-5 h-5 transition-all ${
                              favoriteIds.includes(venue.id)
                                ? "fill-[#C6B4AB] text-[#C6B4AB]"
                                : "text-white"
                            }`}
                          />
                        </button>
                      </div>
                      <div className="px-6 pb-7 md:px-7 md:pb-8 space-y-4">
                        <div className="space-y-2">
                          <h2 className="font-serif text-2xl md:text-3xl text-white group-hover:text-[#C6B4AB] transition-colors">
                            {venue.name}
                          </h2>
                          <p className="text-[11px] uppercase tracking-[0.2em] text-white/55">
                            {venue.location}
                          </p>
                        </div>
                        <p className="text-white/76 font-sans leading-relaxed">
                          {venue.shortDescription}
                        </p>
                        <details className="group/details border-t border-white/10 pt-4">
                          <summary className="list-none cursor-pointer text-xs uppercase tracking-[0.2em] text-white/70 group-open/details:text-white transition-colors">
                            <span className="inline-flex items-center gap-2">
                              Discover Venue
                              <span className="text-white/50 transition-transform duration-200 group-open/details:rotate-45">
                                +
                              </span>
                            </span>
                          </summary>
                          <div className="overflow-hidden transition-all duration-500 ease-out max-h-0 opacity-0 group-open/details:max-h-[520px] group-open/details:opacity-100">
                            <div className="mt-4 border-l border-white/10 pl-4">
                              <p className="text-white/78 leading-relaxed text-[15px]">
                                {venue.shortDescription}
                              </p>
                              <p className="mt-4 text-white/68 leading-relaxed text-sm">
                                {Array.isArray(venue.keyFeatures) &&
                                venue.keyFeatures.length > 0
                                  ? venue.keyFeatures.join(" • ")
                                  : "Additional venue details available upon enquiry."}
                              </p>
                              <div className="mt-5 flex items-center gap-3">
                                <Link href={`/venues/${slug}`}>
                                  <span className="inline-block text-[11px] uppercase tracking-[0.18em] text-white/60 hover:text-white transition-colors cursor-pointer">
                                    Open Full Venue Page
                                  </span>
                                </Link>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-[#C6B4AB] text-white hover:bg-[#C6B4AB] hover:text-black"
                                  onClick={e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    addGuestQuoteItem(venue);
                                  }}
                                >
                                  Add to Quote
                                </Button>
                              </div>
                            </div>
                          </div>
                        </details>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* No Results State */}
        {!isLoading &&
          venues &&
          venues.length > 0 &&
          filteredVenues.length === 0 && (
            <div className="text-center py-20">
              <p className="text-white/60 text-lg mb-4">
                No venues match your filters.
              </p>
              <p className="text-white/40 text-sm mb-6">
                Try adjusting your search criteria.
              </p>
              <Button
                onClick={handleClearFilters}
                variant="outline"
                className="border-[#C6B4AB] text-[#C6B4AB] hover:bg-[#C6B4AB] hover:text-black"
              >
                Clear all filters
              </Button>
            </div>
          )}

        {/* Empty State */}
        {!isLoading && venues && venues.length === 0 && (
          <div className="text-center py-20">
            <p className="text-white/60 text-lg mb-6">
              No venues available yet.
            </p>
            <Button
              onClick={() => seedVenues.mutate()}
              disabled={seedVenues.isPending}
              variant="outline"
              className="border-[#C6B4AB] text-[#C6B4AB] hover:bg-[#C6B4AB] hover:text-black"
            >
              {seedVenues.isPending ? "Loading..." : "Load Venues"}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
