import { useState, useEffect, useRef } from "react";

const slides = [
  {
    title: "Wedding Venues",
    sub: "Exclusive Cyprus locations with sea views and sunsets",
    cta: "Discover Venues",
    link: "/venues",
    trust: "Curated Cyprus venues",
    bg: "https://bridesmaidforhire.com/wp-content/uploads/2025/11/cyprus-wedding-venues.jpg",
  },
  {
    title: "Collections",
    sub: "Curated wedding collections designed around your vision",
    cta: "Explore Collections",
    link: "/collections",
    trust: "Designed around you",
    bg: "https://images.pexels.com/photos/14452884/pexels-photo-14452884.jpeg",
  },
  {
    title: "Dossiers",
    sub: "Planning guides, service overviews, and inspiration resources",
    cta: "Explore Dossiers",
    link: "/dossiers",
    trust: "Trusted by 500+ couples",
    bg: "https://media.vrbo.com/lodging/34000000/33930000/33921200/33921120/9a97aeec.jpg",
  },
  {
    title: "Wedding Request",
    sub: "Share your vision and priorities with your planner",
    cta: "Build Wedding Request",
    link: "/my-quote",
    trust: "Your preferences in one place",
    bg: "https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg",
  },
];


export default function Discover() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);

  const prevSlide = () =>
    setCurrentIndex(prev => (prev === 0 ? slides.length - 1 : prev - 1));
  const nextSlide = () =>
    setCurrentIndex(prev => (prev === slides.length - 1 ? 0 : prev + 1));

  useEffect(() => {
    const timer = setInterval(nextSlide, 9000);
    return () => clearInterval(timer);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current) return;
    const deltaX = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0) nextSlide();
      else prevSlide();
    }
    touchStartX.current = 0;
  };

  return (
    <div className="relative h-[100svh] w-full overflow-hidden bg-black">
      {/* Motion keyframes with reduced-motion respect */}
      <style>{`
        @keyframes kenburns {
          0% {
            transform: scale(1.03) translateY(0);
          }
          100% {
            transform: scale(1.08) translateY(-1%);
          }
        }

        .slide {
          transition: opacity 1400ms ease-in-out;
        }

        .kenburns-active {
          animation: kenburns 12s ease-out infinite alternate;
        }

        @media (prefers-reduced-motion: reduce) {
          .slide {
            transition-duration: 0ms !important;
          }
          .kenburns-active {
            animation: none !important;
          }
        }

        /* Ensure no reflow/shift */
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>

      {/* Stacked absolute slides with fade; swipe on mobile, arrows on desktop */}
      <div
        className="relative h-full w-full"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 slide ${
              index === currentIndex
                ? "opacity-100 z-20"
                : "opacity-0 z-10 pointer-events-none"
            }`}
          >
            {/* Cinematic full-screen background */}
            <div
              className={`absolute inset-0 w-full h-full object-cover bg-center kenburns-active will-change-transform [transform:translateZ(0)] ${
                index === 0 ? "bg-no-repeat bg-cover" : ""
              }`}
              style={{ backgroundImage: `url(${slide.bg})` }}
            />

            {/* Soft vignette */}
            <div
              className="absolute inset-0 z-10 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.55) 100%)",
                opacity: 0.55,
              }}
            />

            {/* Editorial text-zone gradient */}
            <div
              className="absolute inset-0 z-10 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 35%, rgba(0,0,0,0.10) 60%, rgba(0,0,0,0.05) 100%)",
              }}
            />

            {/* Film grain texture */}
            <div
              className="absolute inset-0 z-[15] pointer-events-none opacity-[0.04]"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E\")",
                backgroundRepeat: "repeat",
                mixBlendMode: "soft-light",
              }}
            />

            {/* Content — simple opacity fade with slide */}
            <div className="relative z-30 flex flex-col items-center justify-center h-full text-center text-white max-w-2xl mx-auto px-6 gap-5 will-change-opacity [transform:translateZ(0)]">
              <p className="text-xs tracking-[0.25em] uppercase text-white/80">
                Wedding Experiences
              </p>
              <h1 className="text-4xl md:text-5xl font-serif leading-[1.05] text-white drop-shadow-sm font-semibold tracking-tight">
                {slide.title}
              </h1>
              <p className="text-base md:text-lg text-white/85 leading-relaxed max-w-md mx-auto">
                {slide.sub}
              </p>
              <p className="text-[11px] md:text-xs uppercase tracking-[0.25em] text-white/60 font-medium mt-4">
                {slide.trust}
              </p>
              <a
                href={slide.link}
                className="mx-auto w-fit mt-6 rounded-none px-7 py-3.5 md:px-9 md:py-4 text-sm md:text-base tracking-wide font-medium bg-white/90 text-black shadow-lg shadow-black/20 backdrop-blur hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-2 focus:ring-offset-black/20"
              >
                {slide.cta}
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop-only arrows — hidden on mobile (swipe-only) */}
      <button
        onClick={prevSlide}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-9 h-9 md:w-10 md:h-10 rounded-none bg-white/10 border border-white/20 backdrop-blur-md text-white/80 hover:bg-white/15 hover:text-white transition-all duration-200 ease-out flex items-center justify-center"
        aria-label="Previous slide"
      >
        <span className="text-3xl md:text-4xl block leading-none">{"\u2190"}</span>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-9 h-9 md:w-10 md:h-10 rounded-none bg-white/10 border border-white/20 backdrop-blur-md text-white/80 hover:bg-white/15 hover:text-white transition-all duration-200 ease-out flex items-center justify-center"
        aria-label="Next slide"
      >
        <span className="text-3xl md:text-4xl block leading-none">{"\u2192"}</span>
      </button>

      {/* Minimal pagination bars */}
      <div className="absolute bottom-24 md:bottom-28 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-[2px] transition-all duration-300 ease-out ${
              i === currentIndex ? "bg-white/80 w-10" : "bg-white/25 w-6 md:w-8"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Persistent bottom CTA — editorial glass bar */}
      <div className="absolute bottom-8 md:bottom-10 left-1/2 -translate-x-1/2 z-30 max-w-[92vw] w-fit bottom-[calc(env(safe-area-inset-bottom)+84px)] md:bottom-10">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="/dossiers"
            className="flex items-center justify-center gap-2 px-5 py-3 md:px-7 md:py-3.5 bg-black/35 backdrop-blur-md border border-white/25 shadow-lg shadow-black/30 text-white hover:bg-black/45 transition-all duration-200 ease-out rounded-none"
          >
            <span className="text-xs uppercase tracking-[0.2em] text-white/75">
              Explore
            </span>
            <div className="w-px h-4 bg-white/20" />
            <span className="text-sm font-medium">Dossiers</span>
          </a>
          <a
            href="/my-quote"
            className="flex items-center justify-center gap-2 px-5 py-3 md:px-7 md:py-3.5 bg-white/10 backdrop-blur-md border border-white/20 shadow-lg shadow-black/30 text-white hover:bg-white/15 transition-all duration-200 ease-out rounded-none"
          >
            <span className="text-xs uppercase tracking-[0.2em] text-white/75">
              Build
            </span>
            <div className="w-px h-4 bg-white/20" />
            <span className="text-sm font-medium">Quote Request</span>
          </a>
        </div>
      </div>
    </div>
  );
}
