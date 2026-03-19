import { Link } from "wouter";

export default function HubPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-20 px-6">
      <h1 className="text-4xl font-serif mb-12 text-center">Contact Hub</h1>
      <div className="grid gap-8 max-w-md mx-auto">
        <a
          href="tel:+357XXXXXXXX"
          className="block py-6 text-center bg-white/10 backdrop-blur-md border border-white/20 rounded-none hover:bg-white/15 transition"
        >
          Call Us
        </a>
        <a
          href="https://wa.me/357XXXXXXXX"
          className="block py-6 text-center bg-white/10 backdrop-blur-md border border-white/20 rounded-none hover:bg-white/15 transition"
        >
          WhatsApp
        </a>
        <a
          href="mailto:info@yourdomain.com"
          className="block py-6 text-center bg-white/10 backdrop-blur-md border border-white/20 rounded-none hover:bg-white/15 transition"
        >
          Email
        </a>
        <div className="block py-6 text-center bg-white/5 backdrop-blur-md border border-white/10 rounded-none text-white/60 cursor-not-allowed">
          Location &amp; Directions (coming soon)
        </div>
      </div>

      <div className="mt-16 text-center">
        <p className="text-white/60 mb-8 uppercase tracking-wider text-sm">
          Quick Links
        </p>
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          <Link href="/venues" className="py-4 bg-white/5 hover:bg-white/10 transition">
            Venues
          </Link>
          <Link href="/discover" className="py-4 bg-white/5 hover:bg-white/10 transition">
            Collections
          </Link>
          <Link href="/dossiers" className="py-4 bg-white/5 hover:bg-white/10 transition">
            Dossiers
          </Link>
          <Link href="/my-quote" className="py-4 bg-white/5 hover:bg-white/10 transition">
            Quote
          </Link>
        </div>
      </div>
    </div>
  );
}
