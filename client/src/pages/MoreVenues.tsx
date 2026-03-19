import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";

type MoreVenue = {
  name: string;
  location?: string;
  intro: string;
  writeup: string;
  image: string;
};

const MORE_VENUES: MoreVenue[] = [
  {
    name: "Nissaki",
    intro: "A beachfront setting for relaxed, romantic celebrations.",
    writeup:
      "Nissaki is a beachfront venue, perfect for a relaxed and romantic wedding. With golden sands, crystal-clear waters, and a laid-back vibe, it offers an idyllic setting for couples seeking an intimate celebration by the sea. Its natural beauty and stunning sunsets create the perfect backdrop for unforgettable moments on the rooftop terrace or lower garden.",
    image: "/venues/more-venues/nissaki__w375__h214.webp",
  },
  {
    name: "Agia Thekla Church",
    location: "Agia Napa",
    intro: "A picturesque seaside chapel with authentic Cypriot charm.",
    writeup:
      "Agia Thekla Church is a picturesque seaside chapel, perfect for a romantic and intimate wedding ceremony. With its traditional whitewashed walls, blue accents, and stunning views of the Mediterranean, it offers a truly authentic Cypriot charm. The serene setting and breathtaking surroundings make it an unforgettable place to say “I do.”",
    image: "/venues/more-venues/agia-thekla-church__w375__h214.jpg",
  },
  {
    name: "The Baths of Aphrodite Polis",
    location: "Polis",
    intro: "A legendary location steeped in myth and natural beauty.",
    writeup:
      "The Baths of Aphrodite Polis is a legendary and enchanting location, perfect for a romantic wedding steeped in myth and natural beauty. Surrounded by lush greenery and overlooking the sparkling Mediterranean, this unique spot is said to be where the goddess of love herself once bathed. Ideal for couples seeking a magical, timeless setting for their special day.",
    image: "/venues/more-venues/baths-of-aphrodite-polis__w375__h214.jpg",
  },
  {
    name: "Elea Estate Paphos",
    location: "Paphos",
    intro: "Contemporary elegance with sweeping Mediterranean views.",
    writeup:
      "Elea Estate Paphos is a sophisticated venue offering breathtaking views over rolling green landscapes and the Mediterranean Sea. Perfect for a stylish wedding, it combines contemporary elegance with serene surroundings. With its world-class golf course, refined event spaces, and exceptional service, Elea Estate provides an unforgettable setting for couples seeking a chic and memorable celebration.",
    image: "/venues/more-venues/elea-estate-paphos__w375__h214.png",
  },
  {
    name: "Cava Zoe Protaras",
    location: "Protaras",
    intro: "A charming, intimate venue with authentic Cypriot character.",
    writeup:
      "Cava Zoe Protaras is a charming and intimate venue, perfect for a romantic celebration with authentic Cypriot character. Surrounded by rustic stone architecture, lush gardens, and a warm, inviting atmosphere, it offers a beautiful blend of tradition and romance. Ideal for couples seeking a unique setting for an unforgettable wedding experience.",
    image: "/venues/more-venues/cava-zoe-protaras__w375__h214.jpg",
  },
  {
    name: "King Evelthon Paphos",
    location: "Paphos",
    intro: "A vibrant beachfront resort with sunset ceremony options.",
    writeup:
      "King Evelthon Paphos is a family beachfront resort, ideal for a vibrant and memorable wedding celebration. Overlooking the crystal-clear waters of the Mediterranean, it offers a variety of beautiful ceremony spots, from lush gardens to beachfront. With all-inclusive dining, great service, and breathtaking sunset views, King Evelthon sets the perfect stage for your dream day.",
    image: "/venues/more-venues/king-evelthon-paphos__w375__h214.jpg",
  },
  {
    name: "Grecian Park Protaras",
    location: "Protaras",
    intro: "Elegant sea-view ceremonies above Konnos Bay.",
    writeup:
      "Grecian Park Protaras is a stylish and elegant hotel, perfect for a romantic wedding with breathtaking views. Perched above the famous Konnos Bay, it offers stunning ceremony settings overlooking the turquoise sea, surrounded by natural beauty. With exceptional service, refined venues, and a serene atmosphere, Grecian Park provides an unforgettable backdrop for your special day.",
    image: "/venues/more-venues/grecian-park-protaras__w375__h214.jpg",
  },
  {
    name: "Kefalos Beach Village",
    location: "Paphos",
    intro: "A warm, welcoming coastal venue with sunset backdrops.",
    writeup:
      "Kefalos Beach Village in Paphos is a warm and welcoming venue for an unforgettable wedding by the sea. Set along the stunning coastline, it combines breathtaking Mediterranean views with a friendly, relaxed atmosphere. With beautiful ceremony spots, sunset backdrops, and excellent hospitality, Kefalos Hotel makes it easy to celebrate your big day in a setting that’s as special as the occasion itself.",
    image: "/venues/more-venues/kefalos-beach-village-paphos__w375__h214.jpg",
  },
  {
    name: "Thalassines Beach Villas",
    location: "Agia Napa",
    intro: "Private, secluded coastline for intimate seaside vows.",
    writeup:
      "Thalassines Beach Villas Agia Napa offers a private and romantic setting for an unforgettable wedding by the sea. Tucked away on a secluded stretch of coastline, this exclusive venue combines natural beauty with intimate charm. Say your vows with the sound of gentle waves, celebrate under the stars, and enjoy a truly personalized experience in a serene, picture-perfect paradise.",
    image: "/venues/more-venues/thalassines-beach-villas__w375__h214.jpg",
  },
  {
    name: "Sirenes Beach",
    location: "Agia Napa",
    intro: "A peaceful beach for simple, intimate ceremonies.",
    writeup:
      "Sirenes Beach Agia Napa is a tranquil and romantic spot, perfect for a seaside wedding. With its soft sands, crystal-clear waters, and peaceful atmosphere, it offers a beautiful backdrop for saying “I do.” Ideal for intimate ceremonies, this charming beach captures the simple magic of a Mediterranean celebration.",
    image: "/venues/more-venues/sirenes-beach-agia-napa__w375__h214.webp",
  },
  {
    name: "Elysium Hotel",
    location: "Paphos",
    intro: "Five-star luxury with timeless architecture and gardens.",
    writeup:
      "Elysium Hotel in Paphos is a luxurious, five-star venue perfect for an elegant wedding celebration. Blending timeless architecture, lush gardens, and breathtaking views of the Mediterranean, it offers a truly romantic setting. With world-class service, exquisite dining, and stunning ceremony spaces, Elysium Hotel creates an unforgettable experience where every detail is flawlessly executed.",
    image: "/venues/more-venues/elysium-hotel-paphos__w375__h214.png",
  },
  {
    name: "Lemba Vrisi",
    location: "Paphos",
    intro: "Traditional Cypriot character in a serene village setting.",
    writeup:
      "Lemba Vrisi Paphos is a charming and authentic Cypriot venue, perfect for couples seeking a unique, traditional setting for their wedding. Surrounded by rustic stonework, natural beauty, and a serene village atmosphere, it offers an intimate backdrop full of character and charm. Ideal for those who want a romantic celebration with a touch of cultural heritage.",
    image: "/venues/more-venues/lemba-vrisi-paphos__w375__h214.jpg",
  },
  {
    name: "Lighthouse Beach",
    location: "Paphos",
    intro: "Golden sands and iconic lighthouse sunset views.",
    writeup:
      "Lighthouse Beach in Paphos offers a stunning coastal setting for a wedding with a view. Known for its golden sands, clear blue waters, and the iconic lighthouse standing proudly nearby, it creates a uniquely romantic backdrop. Perfect for sunset ceremonies, this beautiful beach combines natural charm with unforgettable Mediterranean scenery.",
    image: "/venues/more-venues/lighthouse-beach-paphos__w375__h214.jpg",
  },
  {
    name: "Agios Georgios Beach",
    location: "Paphos",
    intro: "Dramatic cliffs and a charming harbor in a peaceful bay.",
    writeup:
      "Agios Georgios Beach in Paphos is a picturesque and peaceful spot, perfect for a romantic wedding by the sea. Framed by dramatic cliffs, golden sands, and a charming little harbor, it offers an intimate setting with authentic Cypriot charm. Ideal for couples looking for a serene atmosphere and breathtaking views for their special day.",
    image: "/venues/more-venues/agios-georgios-beach-paphos__w375__h214.jpg",
  },
  {
    name: "White Cliffs Sea Caves",
    location: "Paphos",
    intro: "A dramatic, one-of-a-kind setting for extraordinary ceremonies.",
    writeup:
      "White Cliffs Sea Caves, Paphos is a breathtakingly dramatic location for a truly unforgettable wedding. With striking white cliffs, crystal-clear waters, and naturally formed sea caves, it offers a one-of-a-kind backdrop for couples seeking something extraordinary. Perfect for adventurous spirits and stunning sunset ceremonies, this unique spot captures the wild beauty of Cyprus at its finest.",
    image: "/venues/more-venues/white-cliffs-sea-caves-paphos__w375__h214.jpg",
  },
  {
    name: "Atlantida Beach",
    location: "Paphos",
    intro: "A relaxed shoreline for effortless intimate celebrations.",
    writeup:
      "Atlantida Beach Paphos is a relaxed and beautiful setting, perfect for a laid-back seaside wedding. With soft golden sand, gentle waves, and stunning views of the Mediterranean, it’s ideal for couples wanting a simple yet unforgettable celebration by the water. Its peaceful vibe and natural charm make it a favorite for romantic, intimate ceremonies.",
    image: "/venues/more-venues/atlantida-beach-paphos__w375__h214.jpg",
  },
  {
    name: "Galu",
    location: "Larnaca",
    intro: "Contemporary seaside style with refined sunset ambience.",
    writeup:
      "Galu Larnaca is a serene chic and stylish venue, perfect for a modern seaside wedding. Set along a beautiful stretch of coastline, it combines a relaxed beachfront vibe with contemporary elegance. With stunning sea views, romantic sunsets, and exceptional service, Galu offers the ideal setting for a celebration that’s both effortless and unforgettable. Minimum 80 Guests.",
    image: "/venues/more-venues/galu-larnaca__w375__h214.jpg",
  },
  {
    name: "Legacy Venue",
    location: "Agia Napa",
    intro: "A new sophisticated space with indoor and outdoor elegance.",
    writeup:
      "Legacy Venue Agia Napa is a new sophisticated and versatile space, ideal for an unforgettable wedding celebration. Blending modern elegance with timeless charm, it offers beautifully designed interiors, stunning outdoor areas, and a warm, inviting atmosphere. With exceptional service and attention to detail, Legacy Venue provides the perfect backdrop for creating memories that will last a lifetime.",
    image: "/venues/more-venues/legacy-venue-agia-napa__w375__h214.jpg",
  },
  {
    name: "HoneyLi Hill",
    location: "Larnaca",
    intro: "Panoramic hillside scenery with romantic outdoor charm.",
    writeup:
      "HoneyLi Hill, Larnaca is a charming hillside venue surrounded by natural beauty, perfect for a romantic outdoor wedding. With panoramic views, serene landscapes, and a peaceful, intimate atmosphere, it offers a truly picturesque backdrop for your special day. Ideal for couples seeking a unique setting that blends rustic charm with unforgettable scenery.",
    image: "/venues/more-venues/honeyli-hill-larnaca__w375__h214.webp",
  },
  {
    name: "Anassa",
    location: "Polis",
    intro: "World-class coastal luxury with timeless Mediterranean elegance.",
    writeup:
      "Anassa is a world-class, luxury resort offering an enchanting setting for an unforgettable wedding. Nestled along the pristine coastline of Polis, it combines breathtaking Mediterranean views with timeless elegance. From its stunning terraces and lush gardens to its impeccable service and gourmet dining, Anassa creates a truly magical experience where every detail is flawlessly curated for your perfect day.",
    image: "/venues/more-venues/anassa-polis__w375__h214.jpg",
  },
  {
    name: "Vasilikon Winery",
    location: "Paphos",
    intro: "Countryside vineyard romance with authentic character.",
    writeup:
      "Vasilikon Winery Paphos is a beautiful countryside venue, perfect for a romantic and unique wedding celebration. Surrounded by lush vineyards and rolling hills, it offers an authentic Cypriot charm with a warm, inviting atmosphere. With elegant wine cellars, breathtaking views, and exceptional local wines, Vasilikon Winery sets the stage for a celebration filled with character and unforgettable moments.",
    image: "/venues/more-venues/vasilikon-winery-paphos__w375__h214.webp",
  },
  {
    name: "Paphos Town Hall",
    location: "Paphos",
    intro: "Classic neoclassical civil ceremonies in the city center.",
    writeup:
      "Paphos Town Hall is a charming and elegant venue, ideal for a classic civil wedding. With its beautiful neoclassical architecture, grand entrance, and central location, it offers a timeless setting for couples seeking a simple yet stylish ceremony. Perfect for intimate gatherings, it blends tradition with convenience in the heart of Paphos.",
    image: "/venues/more-venues/paphos-town-hall__w300__h168.jpg",
  },
  {
    name: "Pegia Gardens",
    location: "Paphos",
    intro: "Lush greenery and relaxed outdoor celebration spaces.",
    writeup:
      "Pegia Gardens is a picturesque venue surrounded by lush greenery and traditional Cypriot charm, perfect for a romantic outdoor wedding. Offering stunning views, a peaceful atmosphere, and beautiful spaces for both ceremonies and receptions, it’s an ideal setting for couples seeking a relaxed yet unforgettable celebration.",
    image: "/venues/more-venues/pegeia-gardens__w375__h214.jpg",
  },
  {
    name: "Almyra",
    location: "Paphos",
    intro: "Chic, contemporary seafront style for modern weddings.",
    writeup:
      "Almyra is a chic, contemporary seaside hotel perfect for a stylish, modern wedding. Overlooking the Mediterranean in the heart of Paphos, it blends sleek design with breathtaking sea views. With exceptional service, exquisite dining, and stunning venues from sun-drenched terraces to elegant indoor spaces, Almyra sets the stage for an effortlessly sophisticated celebration.",
    image: "/venues/more-venues/almyra-paphos__w375__h214.jpg",
  },
  {
    name: "Annabelle",
    location: "Paphos",
    intro: "Timeless seafront elegance with classic luxury service.",
    writeup:
      "Annabelle is a timelessly elegant hotel, perfect for a romantic and refined wedding. Set along Paphos’ stunning seafront, it combines classic luxury with beautiful Mediterranean views. With lush gardens, exquisite dining, and exceptional service, Annabelle provides an enchanting backdrop for a celebration filled with style, romance, and unforgettable moments.",
    image: "/venues/more-venues/annabelle-paphos__w375__h214.jpg",
  },
  {
    name: "Paphos Shipwreck",
    location: "Paphos",
    intro: "A bold and cinematic seaside setting by Edro III.",
    writeup:
      "Paphos Shipwreck is a striking and unique location, perfect for a one-of-a-kind seaside wedding. With the dramatic backdrop of the famous Edro III shipwreck against stunning sunsets over the Mediterranean, it offers an unforgettable setting for breathtaking photos and a truly memorable celebration. Ideal for couples seeking something bold, romantic, and extraordinary.",
    image: "/venues/more-venues/paphos-shipwreck-edro-iii__w375__h214.jpg",
  },
  {
    name: "Amavi",
    location: "Paphos",
    intro: "Adults-only five-star romance on the Paphos coastline.",
    writeup:
      "Amavi Paphos is a luxurious, adults-only, five-star hotel designed for romance, making it an exceptional choice for weddings. Set along the pristine Paphos coastline, it offers elegant ceremony spaces, breathtaking sea views, and world-class service. With its serene ambiance, gourmet dining, and sophisticated style, Amavi creates the perfect backdrop for an intimate, unforgettable celebration of love.",
    image: "/venues/more-venues/amavi-paphos__w375__h214.jpg",
  },
];

export default function MoreVenues() {
  const firstVenue = MORE_VENUES[0];
  const remainingVenues = MORE_VENUES.slice(1);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main className="container mx-auto px-4 pt-[120px] md:pt-[140px] pb-[calc(140px+env(safe-area-inset-bottom))] md:pb-[calc(160px+env(safe-area-inset-bottom))]">
        <section className="max-w-4xl mx-auto text-center mb-16 md:mb-20">
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/55 mb-4">
            Curated Collection
          </p>
          <h1 className="font-serif text-4xl md:text-6xl tracking-tight mb-6">
            More Wedding Venues
          </h1>
          <p className="text-white/72 text-base md:text-lg leading-relaxed">
            An extended curated collection of Cyprus venues, selected for couples
            seeking distinctive settings beyond the core shortlist.
          </p>
        </section>

        <section className="max-w-6xl mx-auto space-y-8 md:space-y-10">
          {firstVenue ? (
            <Card className="group bg-white/[0.03] border-white/10 overflow-hidden rounded-none transition-all duration-[1200ms] ease-out hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
              <div className="relative aspect-[16/8] bg-white/5">
                <img
                  src={firstVenue.image}
                  alt={firstVenue.name}
                  className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                  loading="lazy"
                />
                <div
                  className="absolute -inset-5 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 85%, rgba(0,0,0,0.95) 100%)",
                  }}
                />
              </div>
              <div className="p-8 md:p-10">
                <div className="mb-4">
                  <h2 className="font-serif text-3xl md:text-4xl leading-tight">
                    {firstVenue.name}
                  </h2>
                  {firstVenue.location ? (
                    <p className="text-[11px] uppercase tracking-[0.2em] text-white/55 mt-2">
                      {firstVenue.location}
                    </p>
                  ) : null}
                </div>
                <p className="text-white/80 leading-relaxed mb-6 max-w-4xl">
                  {firstVenue.intro}
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
                  <div className="overflow-hidden transition-all duration-500 ease-out max-h-0 opacity-0 group-open/details:max-h-[540px] group-open/details:opacity-100">
                    <p className="mt-4 border-l border-white/10 pl-4 text-white/78 leading-relaxed text-[15px] max-w-3xl">
                      {firstVenue.writeup}
                    </p>
                  </div>
                </details>
              </div>
            </Card>
          ) : null}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {remainingVenues.map(venue => (
              <Card
                key={venue.name}
                className="group bg-white/[0.03] border-white/10 overflow-hidden rounded-none transition-all duration-[1200ms] ease-out hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
              >
                <div className="relative aspect-[16/10] bg-white/5">
                  <img
                    src={venue.image}
                    alt={venue.name}
                    className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                  <div
                    className="absolute -inset-5 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 85%, rgba(0,0,0,0.95) 100%)",
                    }}
                  />
                </div>
                <div className="p-6 md:p-7">
                  <div className="mb-3">
                    <h2 className="font-serif text-2xl md:text-3xl leading-tight">
                      {venue.name}
                    </h2>
                    {venue.location ? (
                      <p className="text-[11px] uppercase tracking-[0.2em] text-white/55 mt-2">
                        {venue.location}
                      </p>
                    ) : null}
                  </div>
                  <p className="text-white/80 leading-relaxed mb-6">{venue.intro}</p>
                  <details className="group/details border-t border-white/10 pt-4">
                    <summary className="list-none cursor-pointer text-xs uppercase tracking-[0.2em] text-white/70 group-open/details:text-white transition-colors">
                      <span className="inline-flex items-center gap-2">
                        Discover Venue
                        <span className="text-white/50 transition-transform duration-200 group-open/details:rotate-45">
                          +
                        </span>
                      </span>
                    </summary>
                    <div className="overflow-hidden transition-all duration-500 ease-out max-h-0 opacity-0 group-open/details:max-h-[540px] group-open/details:opacity-100">
                      <p className="mt-4 border-l border-white/10 pl-4 text-white/78 leading-relaxed text-[15px]">
                        {venue.writeup}
                      </p>
                    </div>
                  </details>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <div className="max-w-6xl mx-auto mt-16 text-center">
          <Link href="/venues">
            <span className="inline-flex items-center justify-center border border-white/20 bg-white/5 px-7 py-3 text-xs uppercase tracking-[0.2em] text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer">
              Back to Core Venues
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
}

