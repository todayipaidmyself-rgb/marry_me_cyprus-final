import { MessageSquare } from "lucide-react";

type FloatingContactLauncherProps = {
  onOpen: () => void;
};

/**
 * Dual launcher for the contact sheet/panel.
 * Pass the same handler you use for ContactHub (e.g., setIsContactHubOpen(true)).
 */
export function FloatingContactLauncher({ onOpen }: FloatingContactLauncherProps) {
  return (
    <>
      {/* Desktop launcher - hidden on mobile */}
      <button
        onClick={onOpen}
        className="hidden md:fixed md:bottom-8 md:right-8 z-40 w-14 h-14 rounded-none bg-black/35 border border-white/15 backdrop-blur-md shadow-lg shadow-black/30 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/45 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-2 focus:ring-offset-black/20"
        aria-label="Get in touch"
      >
        <MessageSquare className="h-6 w-6" />
        <span className="ml-2 text-sm font-medium hidden lg:block">
          Get in Touch
        </span>
      </button>

      {/* Mobile-only launcher */}
      <button
        onClick={onOpen}
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+84px)] right-4 z-40 w-11 h-11 md:hidden rounded-none bg-black/35 border border-white/15 backdrop-blur-md shadow-lg shadow-black/30 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/45 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-2 focus:ring-offset-black/20"
        aria-label="Get in touch"
      >
        <MessageSquare className="h-5 w-5" />
      </button>
    </>
  );
}

export default FloatingContactLauncher;
