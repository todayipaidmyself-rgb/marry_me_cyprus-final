import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { motion, useReducedMotion } from "framer-motion";

type CollectionInfo = {
  title: string;
  intro: string;
  image: string;
  pricing: string[];
  additionalGuests: string[];
  included: string[];
  depositPayments: string[];
};

const COLLECTIONS: CollectionInfo[] = [
  {
    title: "Alassos — Beachfront Wedding",
    intro:
      "Alassos is a private beachfront wedding collection designed for couples who want elegant coastal celebration with relaxed luxury.",
    image: "/images/collections/alassos-collections.jpg",
    pricing: [
      "30 guests: €8,995",
      "40 guests: €10,195",
      "50 guests: €11,395",
      "60 guests: €12,595",
      "Weekend supplement (Sat–Sun): +€1,800 (venue fee & planner)",
      "Menu note: Cypriot BBQ menu +€10 per person",
      "Packages apply Monday–Friday only",
    ],
    additionalGuests: [
      "Adults: +€140 per person",
      "Children (2–12): +€60 per child",
      "Infants (under 2): complimentary",
    ],
    included: [
      "Dedicated Marry Me Cyprus wedding planner",
      "Full legal assistance and day coordination",
      "Luxury ceremony and reception decor package from extensive selections",
      "Chiavari or wooden bistro chairs",
      "Bridal hair and makeup of choice",
      "Bridal rose hand-tied bouquet and groom buttonhole",
      "2 bridesmaids mini rose posies",
      "2 groomsmen buttonholes",
      "One-tier wedding cake with sugar-rose florals",
      "Full-day professional photography with online digital gallery",
      "5-hour party DJ and wedding host/MC",
      "Wedding dress travel box",
      "Return guest bus transport from Paphos",
      "Bridal transport to venue (+3 guests)",
      "Exclusive private venue",
      "Welcome glass of prosecco or beer on arrival",
      "1-hour cocktail reception with alcoholic and non-alcoholic fruit punch",
      "Luxury live-grill English BBQ wedding menu",
      "Cypriot BBQ available at +€10 per person",
      "4-hour unlimited evening drinks package with local wines, beers, and soft drinks",
      "Bridal day room use at the venue",
    ],
    depositPayments: [
      "Booking and payment terms: please refer to the package Terms & Conditions, available on request",
    ],
  },
  {
    title: "L'Chateau — Your Countryhouse Wedding",
    intro:
      "L'Chateau is a private countryhouse wedding collection ideal for couples wanting a refined countryside atmosphere and exclusive venue use.",
    image: "/images/collections/lchateau-collections.jpg",
    pricing: [
      "20 guests: €9,295",
      "30 guests: €10,695",
      "40 guests: €12,295",
      "50 guests: €13,695",
      "60 guests: €14,995",
    ],
    additionalGuests: [
      "Adults: +€155 per person",
      "Children (2–10): +€55 per child",
      "Children (11–17): +€85 per child",
    ],
    included: [
      "Dedicated personal wedding planner",
      "Legal assistance and day coordination",
      "Luxury wedding decor and styling package",
      "Bridal hair and makeup",
      "Bridal rose hand-tied bouquet and groom buttonhole",
      "One-tier decorated wedding cake",
      "Full-day professional photography with online digital gallery",
      "5-hour party DJ and wedding host",
      "Return coach transport from Paphos for guests",
      "Bridal transport to the venue (+3 guests)",
      "Wedding dress travel box",
      "Exclusive private countryhouse-style venue",
      "On-site day-use bridal suite",
      "Honeymoon suite",
      "Welcome glass of prosecco or beer on arrival",
      "Reception glass of prosecco",
      "Traditional ice-cream bike for 30 minutes",
      "Luxury Live Grill BBQ wedding menu",
      "Unlimited 3-hour local drinks package including wines, beers, and soft drinks",
    ],
    depositPayments: ["Terms & Conditions are available upon request"],
  },
  {
    title: "Liopetro — Your Heritage Wedding",
    intro:
      "Liopetro is a heritage-style wedding collection with authentic Cypriot character, private exclusivity, and structured full-service planning.",
    image: "/images/collections/liopetro-collections.jpg",
    pricing: [
      "30 guests: €9,795",
      "40 guests: €11,395",
      "50 guests: €12,995",
      "60 guests: €14,595",
    ],
    additionalGuests: [
      "Adults: +€160 per person",
      "Children (2–12): +€80 per child",
      "Additional guests up to 70",
    ],
    included: [
      "MMC enquiry handling",
      "Dedicated Cyprus-based planner from booking through on-the-day coordination",
      "Licence guidance",
      "Document checks before travel",
      "Town-hall visit support on arrival",
      "Exclusive private venue",
      "Welcome prosecco or beer",
      "1-hour cocktail reception with sparkling wine, beer, and soft drinks",
      "Luxury Live Grill Cypriot BBQ",
      "3-hour evening drinks package with local wines, beers, and soft drinks",
      "Bridal suite day-use from noon",
      "Full-day professional photography coverage, approximately 8 hours",
      "Curated online gallery",
      "5-hour party DJ and wedding host/MC",
      "Tailored pre-event questionnaire",
      "Return wedding bus from Paphos for up to 74 seats and up to 3 pick-ups",
      "Dedicated 6-seater bridal transport to the venue",
    ],
    depositPayments: [
      "Full Terms & Conditions, including deposits and payment timings, are available upon request from Marry Me Cyprus",
    ],
  },
  {
    title: "Paliomonastiro — Cliffside Garden Wedding",
    intro:
      "Paliomonastiro is a cliffside garden wedding collection for couples who want panoramic views and dramatic outdoor celebration energy.",
    image: "/images/collections/paliomonastiro-collections.jpg",
    pricing: [
      "40 guests: €9,795",
      "50 guests: €11,095",
      "60 guests: €12,395",
    ],
    additionalGuests: [
      "Adults: +€130 per person",
      "Children (2–12): €85 per child, includes all-day drinks",
      "Infants (under 2): complimentary",
    ],
    included: [
      "Dedicated MMC planner",
      "Full legal assistance",
      "On-the-day coordination",
      "Luxury decor and styling package",
      "Wooden bistro chairs",
      "Bridal bouquet and groom buttonhole",
      "2 bridesmaids mini rose posies",
      "2 groomsmen buttonholes",
      "Hair and makeup allowance (€200 total)",
      "Full-day professional photography with online gallery",
      "5-hour party DJ and wedding host/MC",
      "Wedding dress travel box",
      "Return guest bus from Paphos",
      "Bridal transport to venue (+3 guests)",
      "Exclusive private hire with panoramic cliffside views",
      "Welcome prosecco or beer",
      "1-hour cocktail reception with sparkling wine, beer, and soft drinks",
      "Traditional Cyprus menu in Luxury Live Grill style",
      "5-hour evening drinks package with local wines, beers, and soft drinks",
      "Bridal day room use",
    ],
    depositPayments: [
      "Deposits and payment schedule as per the Paliomonastiro 2026–2027 Special Offer",
      "Terms & Conditions are available upon request",
    ],
  },
];

function CollectionSection({ collection }: { collection: CollectionInfo }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="group overflow-hidden rounded-none border border-white/10 bg-white/[0.02]">
        <div className="relative aspect-square overflow-hidden bg-transparent sm:aspect-square">
          <img
            src={collection.image}
            alt={collection.title}
            className="w-full h-full object-cover opacity-[0.95] transition-transform duration-700 ease-out motion-reduce:transform-none group-hover:scale-[1.02]"
            loading="lazy"
          />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/10 via-black/18 to-black/40" />
        </div>
        <div className="pt-2 pb-6 px-4 sm:pt-5 sm:pb-7 md:px-6">
          <p className="mx-auto mb-5 max-w-[90%] text-center text-[14px] leading-relaxed text-white/72 sm:mb-6">
            {collection.intro}
          </p>

          {[
            { title: "Pricing", items: collection.pricing },
            { title: "Additional Guests", items: collection.additionalGuests },
            { title: "What’s Included", items: collection.included },
            { title: "Deposit & Payments", items: collection.depositPayments },
          ].map(section => (
            <details key={section.title} className="group/details mt-2 border-t border-white/5 pt-3 sm:mt-5 sm:pt-5">
              <summary className="list-none cursor-pointer text-center text-[11px] uppercase tracking-[0.24em] text-white/40 transition-colors group-open/details:text-white/82">
                <span className="inline-flex items-center justify-center gap-2">
                  {section.title}
                  <span className="text-white/40 transition-transform duration-200 group-open/details:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <div className="overflow-hidden transition-all duration-500 ease-out max-h-0 opacity-0 group-open/details:max-h-[1200px] group-open/details:opacity-100">
                <div className="mt-4 space-y-3 border-t border-white/5 pt-4 text-center sm:mt-5 sm:pt-5">
                  {section.items.map(item => (
                    <p key={item} className="text-[14px] leading-relaxed text-white/72">
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            </details>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

export default function Collections() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main className="container mx-auto px-4 pt-[128px] md:pt-[152px] pb-[calc(144px+env(safe-area-inset-bottom))] md:pb-[calc(168px+env(safe-area-inset-bottom))]">
        <section className="max-w-4xl mx-auto text-center mb-20 md:mb-24">
          <h1 className="font-serif text-4xl md:text-6xl tracking-tight mb-6">
            Wedding Collections
          </h1>
          <p className="mx-auto max-w-3xl text-white/68 text-base md:text-lg leading-relaxed">
            Discover four signature wedding collections, each designed to offer
            a distinct setting, atmosphere, and level of celebration — from
            beachfront elegance to countryhouse charm, heritage character, and
            dramatic cliffside views.
          </p>
        </section>

        <section className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {COLLECTIONS.map(collection => (
              <CollectionSection key={collection.title} collection={collection} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
