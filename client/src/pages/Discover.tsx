import { useEffect, useRef, useState, type TouchEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";

const SLIDE_FADE_MS = 1200;
const AUTOPLAY_MS = 9000;
const CONTENT_TRANSITION = {
  duration: 0.8,
  ease: [0.22, 1, 0.36, 1] as const,
};

const SLIDES = [
  {
    step: "STEP 1",
    label: "Wedding Request",
    title: "Build your vision",
    body:
      "Shape your direction through a guided wedding request designed to capture atmosphere, priorities, and the details that matter most.",
    detail:
      "Your planner receives a structured brief, so the conversation starts with clarity rather than back-and-forth.",
    cta: "Start your wedding request",
    href: "/my-quote-brief",
    bg: "https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg",
  },
  {
    step: "STEP 2",
    label: "Venues",
    title: "Explore with purpose",
    body:
      "Explore a curated set of Cyprus venues chosen for atmosphere, setting, and experience, then shortlist with greater intention.",
    detail:
      "The goal is not endless browsing, but finding places that genuinely support the kind of day you want to create.",
    cta: "Continue your request",
    href: "/venues",
    bg: "https://bridesmaidforhire.com/wp-content/uploads/2025/11/cyprus-wedding-venues.jpg",
  },
  {
    step: "STEP 3",
    label: "Collections",
    title: "We connect everything",
    body:
      "Collections bring together setting, scale, and style into elegant package-style starting points that make decision-making feel easier.",
    detail:
      "They are designed to help you understand what fits your vision before moving into something more tailored.",
    bridge:
      "Your inputs don’t disappear into a form — they become a working brief your planner builds from.",
    cta: "Continue your request",
    href: "/collections",
    bg: "https://images.pexels.com/photos/14452884/pexels-photo-14452884.jpeg",
  },
  {
    step: "STEP 4",
    label: "Dossiers",
    title: "Receive something truly tailored",
    body:
      "Dossiers bring together planning guidance, editorial resources, and structured reference points to help you move forward with confidence.",
    detail:
      "They are there to support the choices behind your wedding, not just inspire them visually.",
    cta: "Continue your request",
    href: "/dossiers",
    bg: "https://media.vrbo.com/lodging/34000000/33930000/33921200/33921120/9a97aeec.jpg",
  },
  {
    step: "STEP 5",
    label: "Contact Hub",
    title: "Stay close to your planner",
    body:
      "Use the Contact Hub whenever you need a quicker route — from WhatsApp and direct calls to showroom support, social channels, and key planning touchpoints.",
    detail:
      "It keeps communication simple, organised, and easy to access throughout the process.",
    cta: "Open Contact Hub",
    href: "/hub",
    bg: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg",
  },
];

export default function Discover() {
  const shouldReduceMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);

  const prevSlide = () =>
    setCurrentIndex(prev => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  const nextSlide = () =>
    setCurrentIndex(prev => (prev === SLIDES.length - 1 ? 0 : prev + 1));

  useEffect(() => {
    if (shouldReduceMotion) return;
    const timer = setInterval(nextSlide, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [shouldReduceMotion]);

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (!touchStartX.current) return;
    const deltaX = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0) nextSlide();
      else prevSlide();
    }
    touchStartX.current = 0;
  };

  return (
    <div className="fixed inset-0 h-[100dvh] min-h-[100svh] w-full overflow-hidden overscroll-none bg-black text-white">
      <style>{`
        .discover-slide {
          transition: opacity ${SLIDE_FADE_MS}ms ease-in-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .discover-slide {
            transition-duration: 0ms !important;
          }
        }
      `}</style>

      <div
        className="relative h-full w-full [touch-action:pan-x]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {SLIDES.map((slide, index) => (
          <div
            key={slide.label}
            className={`discover-slide absolute inset-0 ${
              index === currentIndex
                ? "pointer-events-auto z-20 opacity-100"
                : "pointer-events-none z-10 opacity-0"
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${slide.bg})` }}
            />
            <div className="absolute inset-0 bg-black/55" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/60 to-black/90" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_42%)]" />

            <div className="relative z-30 flex h-full flex-col px-6 pb-[calc(env(safe-area-inset-bottom)+72px)] pt-[128px] md:px-8 md:pt-[152px]">
              <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-center">
                <motion.div
                  className="relative mx-auto w-full max-w-[19rem] text-center sm:max-w-sm md:max-w-4xl"
                  initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                  animate={{ opacity: index === currentIndex ? 1 : 0, y: index === currentIndex ? 0 : 12 }}
                  transition={CONTENT_TRANSITION}
                >
                  <div className="absolute inset-x-[-1rem] top-[-1.5rem] bottom-[-2rem] -z-10 bg-gradient-to-b from-black/10 via-black/28 to-black/45 md:inset-x-[-3rem] md:top-[-2rem] md:bottom-[-2.5rem] md:from-black/0 md:via-black/18 md:to-black/26" />
                  <p className="mb-4 text-[10px] uppercase tracking-[0.25em] text-white/52">
                    {slide.step}
                  </p>
                  <h1 className="font-serif text-4xl leading-[1.02] tracking-tight text-white md:text-6xl">
                    {slide.title}
                  </h1>
                  <p className="mt-8 max-w-2xl text-base leading-relaxed text-white/78 md:mx-auto md:text-lg">
                    {slide.body}
                  </p>
                  <p className="mt-7 max-w-xl text-[15px] leading-relaxed text-white/64 md:mx-auto md:text-base">
                    {slide.detail}
                  </p>
                  {slide.bridge ? (
                    <p className="mt-7 max-w-xl text-sm leading-relaxed text-white/74 md:mx-auto md:text-[15px]">
                      {slide.bridge}
                    </p>
                  ) : null}
                  <a
                    href={slide.href}
                    className="mt-11 inline-flex items-center border border-white/16 bg-black/20 px-6 py-3 text-[11px] uppercase tracking-[0.22em] text-white/86 backdrop-blur-sm transition-colors duration-200 ease-out hover:bg-black/30 hover:text-white"
                  >
                    {slide.cta}
                  </a>
                  <div className="mt-10 hidden md:block">
                    <div className="inline-flex items-center gap-5 border border-white/10 bg-black/25 px-5 py-3 backdrop-blur-sm">
                      {SLIDES.map((slide, navIndex) => (
                        <div key={slide.href} className="flex items-center gap-5">
                          <a
                            href={slide.href}
                            className="text-[11px] uppercase tracking-[0.24em] text-white/60 transition-colors hover:text-white/88"
                          >
                            {slide.label}
                          </a>
                          {navIndex < SLIDES.length - 1 ? (
                            <span className="h-3.5 w-px bg-white/10" aria-hidden="true" />
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={prevSlide}
          className="absolute bottom-[calc(env(safe-area-inset-bottom)+56px)] left-5 z-30 flex h-9 w-9 items-center justify-center border border-white/16 bg-black/25 text-white/75 backdrop-blur-sm transition-all duration-200 ease-out hover:bg-black/35 hover:text-white md:left-8 md:top-1/2 md:bottom-auto md:h-10 md:w-10 md:-translate-y-1/2"
          aria-label="Previous slide"
        >
          <span className="block text-3xl leading-none md:text-4xl">{"\u2190"}</span>
        </button>

        <button
          onClick={nextSlide}
          className="absolute bottom-[calc(env(safe-area-inset-bottom)+56px)] right-5 z-30 flex h-9 w-9 items-center justify-center border border-white/16 bg-black/25 text-white/75 backdrop-blur-sm transition-all duration-200 ease-out hover:bg-black/35 hover:text-white md:right-8 md:top-1/2 md:bottom-auto md:h-10 md:w-10 md:-translate-y-1/2"
          aria-label="Next slide"
        >
          <span className="block text-3xl leading-none md:text-4xl">{"\u2192"}</span>
        </button>

        <p className="absolute bottom-[calc(env(safe-area-inset-bottom)+116px)] left-1/2 z-30 -translate-x-1/2 text-[11px] uppercase tracking-wide text-white/40 md:bottom-[64px]">
          Step {currentIndex + 1} of {SLIDES.length}
        </p>

        <div className="absolute bottom-[calc(env(safe-area-inset-bottom)+76px)] left-1/2 z-30 flex -translate-x-1/2 items-center justify-center gap-2 md:bottom-10">
          {SLIDES.map((slide, index) => (
            <button
              key={slide.label}
              onClick={() => setCurrentIndex(index)}
              className={`h-[2px] transition-all duration-300 ease-out ${
                index === currentIndex ? "w-10 bg-white/78" : "w-6 bg-white/28 md:w-8"
              }`}
              aria-label={`Go to ${slide.label}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
