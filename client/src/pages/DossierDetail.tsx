import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { FileText, ArrowLeft, Star, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { DOSSIER_CATALOG } from "@/lib/dossierCatalog";

export default function DossierDetail() {
  const params = useParams();
  const dossierId = params.id as string;

  const { data: dossier, isLoading } = trpc.dossiers.getById.useQuery({
    id: dossierId,
  });
  const staticDossier =
    DOSSIER_CATALOG.find(d => d.id === dossierId) ??
    DOSSIER_CATALOG.find(d => String(d.id) === String(dossierId));
  const normalizedDossier = dossier
    ? {
        id: String((dossier as any).id),
        title: String((dossier as any).title ?? staticDossier?.title ?? "Dossier"),
        description: String(
          (dossier as any).description ?? staticDossier?.description ?? ""
        ),
        category: String((dossier as any).category ?? staticDossier?.category ?? "Other"),
        fileUrl: String(
          (dossier as any).fileUrl ??
            staticDossier?.fileUrl ??
            ""
        ).startsWith("/dossiers/")
          ? String((dossier as any).fileUrl ?? staticDossier?.fileUrl ?? "")
          : `/dossiers/${String((dossier as any).fileUrl ?? staticDossier?.fileUrl ?? "").split("/").pop()}`,
        isFeatured: Boolean((dossier as any).isFeatured ?? staticDossier?.isFeatured),
        updatedAt: String(
          (dossier as any).updatedAt ?? staticDossier?.updatedAt ?? new Date().toISOString()
        ),
      }
    : staticDossier;

  // Show loading state while fetching dossier data
  if (isLoading && !staticDossier) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="container py-24 text-center">
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  if (!normalizedDossier) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="container py-24 text-center">
          <div className="text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-white/20" />
            <p className="text-white/50 text-lg mb-4">Dossier not found</p>
            <Button asChild variant="outline" className="border-white/10">
              <Link href="/dossiers">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dossier Library
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <div className="container py-12 md:py-16">
        {/* Back Link */}
        <Button
          asChild
          variant="ghost"
          className="mb-8 text-white/70 hover:text-white hover:bg-white/5"
        >
          <Link href="/dossiers">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dossier Library
          </Link>
        </Button>

        {/* Dossier Detail Card */}
        <Card className="bg-white/5 border-white/10 max-w-3xl mx-auto">
          <div className="p-8 md:p-12">
            {/* Category + Featured Tag */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-[#C6B4AB] uppercase tracking-wider">
                {normalizedDossier.category}
              </span>
              {normalizedDossier.isFeatured && (
                <span className="flex items-center gap-1 text-sm text-white/50">
                  <Star className="w-4 h-4 fill-current" />
                  Featured
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-serif text-3xl md:text-4xl mb-6">
              {normalizedDossier.title}
            </h1>

            {/* Description */}
            <p className="text-white/70 text-lg mb-8 leading-relaxed">
              {normalizedDossier.description}
            </p>

            {/* Metadata */}
            <div className="flex items-center gap-4 text-sm text-white/50 mb-8 pb-8 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  Updated{" "}
                  {new Date(normalizedDossier.updatedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <Button
              asChild
              size="lg"
              className="w-full bg-[#C6B4AB] hover:bg-[#B5A39A] text-black"
            >
              <a
                href={normalizedDossier.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileText className="w-5 h-5 mr-2" />
                Open dossier
              </a>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
