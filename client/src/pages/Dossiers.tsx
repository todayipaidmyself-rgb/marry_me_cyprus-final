import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { ChevronLeft, ChevronRight, FileText, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { DOSSIER_CATALOG, type DossierCatalogItem } from "@/lib/dossierCatalog";

const DOSSIER_STORIES = [
  "dreaming-of-a-wedding-in-cyprus",
  "how-we-plan-a-destination-wedding-step-by-step",
  "how-much-does-a-cyprus-wedding-cost",
  "how-to-avoid-a-destination-wedding-disaster",
  "how-to-choose-a-wedding-theme-that-fits-you",
  "mistakes-brides-make-when-planning-wedding-abroad",
  "the-colour-palette-ideas-for-2026-brides",
  "what-is-included-in-the-planner-package",
] as const;

const STORY_SLIDE_COUNTS: Record<(typeof DOSSIER_STORIES)[number], number> = {
  "dreaming-of-a-wedding-in-cyprus": 7,
  "how-we-plan-a-destination-wedding-step-by-step": 9,
  "how-much-does-a-cyprus-wedding-cost": 6,
  "how-to-avoid-a-destination-wedding-disaster": 6,
  "how-to-choose-a-wedding-theme-that-fits-you": 7,
  "mistakes-brides-make-when-planning-wedding-abroad": 8,
  "the-colour-palette-ideas-for-2026-brides": 5,
  "what-is-included-in-the-planner-package": 9,
};

const storyTitleFromSlug = (story: string) =>
  story
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const getStorySlideSrc = (story: string, slide: number) =>
  `/slides/${story}/${slide}.jpg`;

export default function Dossiers() {
  const { data: dossiers = [], isLoading } =
    trpc.dossiers.getByCategory.useQuery({
      category: "All",
    });
  const [selectedStory, setSelectedStory] = useState<string | null>(null);
  const [selectedSlide, setSelectedSlide] = useState(1);

  const normalizedDossiers = useMemo<DossierCatalogItem[]>(() => {
    const fromApi = (dossiers as any[]).map(dossier => ({
      id: String(dossier.id),
      title: String(dossier.title ?? "Untitled Dossier"),
      description: String(dossier.description ?? ""),
      category: String(dossier.category ?? "Other"),
      fileUrl: String(dossier.fileUrl ?? ""),
      isFeatured: Boolean(dossier.isFeatured),
      updatedAt: String(dossier.updatedAt ?? new Date().toISOString()),
    }));

    const fixedApi = fromApi
      .filter(d => d.fileUrl)
      .map(d => ({
        ...d,
        fileUrl: d.fileUrl.startsWith("/dossiers/")
          ? d.fileUrl
          : `/dossiers/${d.fileUrl.split("/").pop()}`,
      }));

    const byFileUrl = new Map<string, DossierCatalogItem>();
    for (const item of [...DOSSIER_CATALOG, ...fixedApi]) {
      byFileUrl.set(item.fileUrl, item);
    }
    return Array.from(byFileUrl.values());
  }, [dossiers]);

  const orderedDossiers = useMemo(
    () =>
      [...normalizedDossiers].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    [normalizedDossiers]
  );

  useEffect(() => {
    if (!selectedStory) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedStory(null);
        return;
      }

      if (event.key === "ArrowLeft") {
        setSelectedSlide(current => Math.max(1, current - 1));
      }

      if (event.key === "ArrowRight") {
        setSelectedSlide(current =>
          Math.min(STORY_SLIDE_COUNTS[selectedStory as keyof typeof STORY_SLIDE_COUNTS], current + 1)
        );
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedStory]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      {/* Header */}
      <div className="container pt-[118px] pb-8 md:pt-[146px] md:pb-10">
        <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-serif text-4xl md:text-5xl mb-4">
          Dossier Library
        </h1>
        <p className="text-white/70 text-lg max-w-2xl">
          Curated guides, venue dossiers and planning resources for your Cyprus
          wedding.
        </p>
        </div>
      </div>

      <div className="container pt-2 pb-4 md:pt-3 md:pb-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm leading-relaxed text-white/60 md:text-[15px]">
            Browse the editorial covers to open each visual guide.
            <br className="hidden sm:block" />
            <span className="sm:ml-1">
              The dossiers below are complimentary downloads to explore and
              keep.
            </span>
          </p>
        </div>
      </div>

      <div className="container py-4 md:py-6">
        <section className="mx-auto max-w-7xl">
          <p className="text-center text-[11px] uppercase tracking-[0.28em] text-white/45">
            Editorial Library
          </p>
          <div className="-mx-4 px-4 pt-3 md:mx-0 md:px-0 md:pt-4">
            <div className="flex items-stretch gap-6 overflow-x-auto pb-6 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:gap-8 md:pb-8">
              <div
                aria-hidden="true"
                className="w-[11vw] flex-shrink-0 sm:w-[19vw] md:w-[29vw] lg:w-[35vw] xl:w-[37vw]"
              />
              {DOSSIER_STORIES.map(story => (
                <article
                  key={story}
                  className="w-[78vw] flex-shrink-0 snap-center border border-white/10 bg-white/[0.02] p-3 opacity-95 transition-all duration-300 ease-out hover:scale-[1.01] hover:opacity-100 sm:w-[62vw] md:w-[42vw] lg:w-[30vw] xl:w-[26vw]"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStory(story);
                      setSelectedSlide(1);
                    }}
                    className="block w-full"
                    aria-label={`Open ${storyTitleFromSlug(story)} story`}
                  >
                    <img
                      src={getStorySlideSrc(story, 1)}
                      alt={storyTitleFromSlug(story)}
                      className="h-auto max-h-[72vh] w-full bg-black/20 object-contain"
                      loading="lazy"
                    />
                  </button>
                </article>
              ))}
              <div
                aria-hidden="true"
                className="w-[11vw] flex-shrink-0 sm:w-[19vw] md:w-[29vw] lg:w-[35vw] xl:w-[37vw]"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Dossier Grid */}
      <div className="container py-12">
        {isLoading ? (
          <div className="text-center py-20">
            <p className="text-white/50">Loading dossiers...</p>
          </div>
        ) : orderedDossiers.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 mx-auto mb-4 text-white/20" />
            <p className="text-white/50 text-lg">No dossiers available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orderedDossiers.map(dossier => (
              <Card
                key={dossier.id}
                className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#C6B4AB]/50 transition-all group"
              >
                <div className="p-6 text-center">
                  {/* Title */}
                  <h3 className="mb-3 font-serif text-xl text-white/88 transition-colors group-hover:text-[#C6B4AB]">
                    {dossier.title}
                  </h3>

                  {/* Description */}
                  <p className="mb-6 text-sm text-white/70 line-clamp-3">
                    {dossier.description}
                  </p>

                  {/* Actions */}
                  <div className="flex justify-center">
                    <Button
                      asChild
                      className="bg-[#C6B4AB] hover:bg-[#B5A39A] text-black"
                    >
                      <a
                        href={dossier.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Open dossier
                      </a>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedStory && (
        <div className="fixed inset-0 z-50 bg-black/95">
          <button
            type="button"
            onClick={() => setSelectedStory(null)}
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center border border-white/10 bg-black/40 text-white transition-colors hover:border-white/20 hover:bg-black/60"
            aria-label="Close story"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex h-full items-center justify-center px-4 py-16 md:px-10">
            <button
              type="button"
              onClick={() => setSelectedSlide(current => Math.max(1, current - 1))}
              disabled={selectedSlide === 1}
              className="mr-3 flex h-11 w-11 shrink-0 items-center justify-center border border-white/10 bg-black/40 text-white transition-colors disabled:opacity-30 md:mr-6"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex max-h-full max-w-5xl flex-1 flex-col items-center justify-center">
              <img
                src={getStorySlideSrc(selectedStory, selectedSlide)}
                alt={`${storyTitleFromSlug(selectedStory)} slide ${selectedSlide}`}
                className="max-h-[78vh] w-full object-contain"
              />
              <p className="mt-4 text-[11px] uppercase tracking-[0.22em] text-white/50">
                {selectedSlide} / {STORY_SLIDE_COUNTS[selectedStory as keyof typeof STORY_SLIDE_COUNTS]}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setSelectedSlide(current =>
                  Math.min(
                    STORY_SLIDE_COUNTS[selectedStory as keyof typeof STORY_SLIDE_COUNTS],
                    current + 1
                  )
                )
              }
              disabled={
                selectedSlide ===
                STORY_SLIDE_COUNTS[selectedStory as keyof typeof STORY_SLIDE_COUNTS]
              }
              className="ml-3 flex h-11 w-11 shrink-0 items-center justify-center border border-white/10 bg-black/40 text-white transition-colors disabled:opacity-30 md:ml-6"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
