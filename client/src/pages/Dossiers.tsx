import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { DOSSIER_CATALOG, type DossierCatalogItem } from "@/lib/dossierCatalog";

export default function Dossiers() {
  const { data: dossiers = [], isLoading } =
    trpc.dossiers.getByCategory.useQuery({
      category: "All",
    });

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

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      {/* Header */}
      <div className="container py-12 md:py-16">
        <h1 className="font-serif text-4xl md:text-5xl mb-4">
          Dossier Library
        </h1>
        <p className="text-white/70 text-lg max-w-2xl">
          Curated guides, venue dossiers and planning resources for your Cyprus
          wedding.
        </p>
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
                <div className="p-6">
                  {/* Title */}
                  <h3 className="font-serif text-xl mb-3 group-hover:text-[#C6B4AB] transition-colors">
                    {dossier.title}
                  </h3>

                  {/* Description */}
                  <p className="text-white/70 text-sm mb-6 line-clamp-3">
                    {dossier.description}
                  </p>

                  {/* Actions */}
                  <div>
                    <Button
                      asChild
                      className="w-full bg-[#C6B4AB] hover:bg-[#B5A39A] text-black"
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
    </div>
  );
}
