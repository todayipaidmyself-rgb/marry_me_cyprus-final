import { useState } from "react";
import { Card } from "@/components/ui/card";

// Paths match exact filenames in client/public/venues/new-venues/
const venues = [
  {
    name: "Alassos",
    slug: "alassos",
    image: "/venues/new-venues/alassos.jpg",
    intro: "Exclusive beachfront elegance with private ceremony lawn and starlit dining.",
    info: "Alassos is a refined coastal venue in central Paphos designed for elevated destination celebrations. Couples can move from a private beachfront-style ceremony lawn into relaxed cocktail terraces and then into elegant evening dining under fairy lights. The setting balances natural sea-facing atmosphere with polished hosting flow, making it ideal for full-day wedding experiences with a calm luxury feel.",
  },
  {
    name: "Atlantida Beach Venue",
    slug: "atlantida",
    image: "/venues/new-venues/atlantida.jpg",
    intro: "A laid-back shoreline setting with golden sand and sea-view vows.",
    info: "Atlantida Beach Venue offers a naturally romantic shoreline atmosphere with direct beach access and open Mediterranean views. It is especially suited to couples who want a relaxed but still elegant seaside celebration where sunset timing, soft light, and simple styling create a memorable ceremony backdrop. The overall energy is intimate, effortless, and warm.",
  },
  {
    name: "Coral Residence",
    slug: "coral-residence",
    image: "/venues/new-venues/coral-residence.jpg",
    intro: "Modern coastal style with private-villa intimacy and sea-view moments.",
    info: "Coral Residence combines contemporary design and coastal intimacy, making it a strong choice for couples seeking a private and design-led wedding setting. The venue supports elegant outdoor movement between ceremony, drinks, and reception moments while preserving a boutique residential atmosphere. Its sea-view character keeps the experience bright, romantic, and distinctly Mediterranean.",
  },
  {
    name: "Elea Estate",
    slug: "elea-estate",
    image: "/venues/new-venues/elea-estate.jpg",
    intro: "Sophisticated event spaces framed by panoramic golf and sea views.",
    info: "Elea Estate delivers a sophisticated estate experience with panoramic landscape and sea-facing outlooks. It is well suited to couples planning a polished, style-forward wedding with strong visual scenery and premium hosting standards. Ceremony and reception moments can be framed by dramatic open views, giving the day a modern and elevated sense of place.",
  },
  {
    name: "L'Chateau",
    slug: "lchateau",
    image: "/venues/new-venues/lchateau.jpg",
    intro: "French-inspired romance with grand architecture and formal gardens.",
    info: "L'Chateau brings French-inspired romance to Cyprus through grand architecture, formal garden character, and classic event proportions. It is an ideal setting for couples who want timeless elegance and a statement backdrop for both ceremony and reception. The venue supports refined styling and larger-scale celebration flow while keeping an unmistakably romantic tone.",
  },
  {
    name: "Liopetro",
    slug: "liopetro",
    image: "/venues/new-venues/liopetro.jpg",
    intro: "Rustic stone character and authentic Cypriot heritage atmosphere.",
    info: "Liopetro offers authentic Cypriot heritage character with restored stone textures and a warm, intimate atmosphere. It is especially appealing for couples who want a wedding with strong local identity, rustic charm, and timeless simplicity. The venue creates a grounded, emotional setting where traditional architecture and relaxed celebration energy work beautifully together.",
  },
  {
    name: "Minthis",
    slug: "minthis",
    image: "/venues/new-venues/minthis.jpg",
    intro: "Contemporary hillside luxury with wide panoramic outlooks.",
    info: "Minthis pairs contemporary hillside luxury with serene panoramic views, creating a calm and high-end destination wedding environment. Couples can design a modern celebration with clean styling, premium guest comfort, and memorable scenic framing throughout the day. The balance of architecture, landscape, and resort-level service gives the venue a distinctly refined character.",
  },
  {
    name: "Paliomonastiros",
    slug: "palaiomonastiro",
    image: "/venues/new-venues/paliomonastiros.jpg",
    intro: "Historic atmosphere with peaceful grounds and meaningful ceremony tone.",
    info: "Paliomonastiros is a heritage-rich venue with peaceful grounds and a meaningful ceremony atmosphere. It suits couples looking for intimacy, timeless character, and a deeper sense of place in their wedding setting. The environment feels calm and authentic, allowing the ceremony moment to remain central while still supporting an elegant full celebration.",
  },
  {
    name: "Vasilias",
    slug: "vasilias",
    image: "/venues/new-venues/vasilias.jpg",
    intro: "Grand heritage setting designed for larger, elegant celebrations.",
    info: "Vasilias is a grand heritage-style venue made for elegant celebrations at scale. With formal garden presence and stately reception potential, it supports classic wedding formats that benefit from space, structure, and visual drama. Couples seeking a majestic atmosphere with traditional luxury cues will find it a strong fit for a polished destination wedding day.",
  },
];

export default function HighlightedVenues() {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Debug: log image paths on first render (remove in production)
  if (typeof window !== "undefined" && !(window as any).__hvLogged) {
    (window as any).__hvLogged = true;
    venues.forEach(v => console.log(`[HighlightedVenues] ${v.slug} → ${v.image}`));
  }

  const handleImageError = (slug: string, src: string) => {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[HighlightedVenues] Image failed to load: ${src}`);
    }
    setImageErrors(prev => ({ ...prev, [slug]: true }));
  };

  return (
    <section className="py-16 px-4 md:px-8">
      <h2 className="text-4xl md:text-5xl font-serif text-center mb-12 text-white">
        Highlighted Cyprus Venues
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
        {venues.map(venue => (
          <Card
            key={venue.slug}
            className="bg-white/5 border-white/10 overflow-hidden rounded-none"
          >
            <div className="aspect-[16/10] relative bg-white/5">
              {imageErrors[venue.slug] ? (
                <div className="w-full h-full border border-white/10 flex flex-col items-center justify-center text-white/60 text-center px-4">
                  <p>Image not available</p>
                  <p className="mt-2 text-[10px] text-white/30 break-all">
                    {venue.image}
                  </p>
                </div>
              ) : (
                <img
                  src={venue.image}
                  alt={venue.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={() => handleImageError(venue.slug, venue.image)}
                />
              )}
            </div>
            <div className="p-6 md:p-7">
              <p className="mx-auto mb-5 max-w-2xl text-center leading-relaxed text-white/80">
                {venue.intro}
              </p>
              <details className="group border-t border-white/10 pt-4">
                <summary className="list-none cursor-pointer text-center text-sm uppercase tracking-[0.18em] text-white/70 group-open:text-white transition-colors">
                  <span className="inline-flex items-center justify-center gap-2">
                    Venue Information
                    <span className="text-white/50 transition-transform duration-200 group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <div className="mt-4 border-l border-white/10 pl-4">
                  <p className="text-white/78 leading-relaxed text-[15px]">
                    {venue.info}
                  </p>
                </div>
              </details>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
