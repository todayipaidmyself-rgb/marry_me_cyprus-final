import { LayoutDashboard, Send, MoreHorizontal } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

interface MobileContactBarProps {
  onMoreClick: () => void;
}

export function MobileContactBar({ onMoreClick }: MobileContactBarProps) {
  const { user } = useAuth();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-[#C6B4AB]/30 z-30 safe-area-inset-bottom">
      <div className="grid grid-cols-3 divide-x divide-[#C6B4AB]/20">
        {/* Hub (for authenticated users) */}
        {user ? (
          <Link
            href="/dashboard"
            className="flex flex-col items-center justify-center py-3 px-2 hover:bg-white/5 active:bg-white/10 transition-colors"
            aria-label="Go to Planning Hub"
          >
            <LayoutDashboard className="text-[#C6B4AB] mb-1" size={24} />
            <span className="text-white text-xs font-sans">Hub</span>
          </Link>
        ) : (
          <div className="flex flex-col items-center justify-center py-3 px-2 opacity-0 pointer-events-none">
            <LayoutDashboard className="text-[#C6B4AB] mb-1" size={24} />
            <span className="text-white text-xs font-sans">Hub</span>
          </div>
        )}

        {/* Enquire */}
        <Link
          href="/contact"
          className="flex flex-col items-center justify-center py-3 px-2 hover:bg-white/5 active:bg-white/10 transition-colors"
          aria-label="Make an enquiry"
        >
          <Send className="text-[#C6B4AB] mb-1" size={24} />
          <span className="text-white text-xs font-sans">Enquire</span>
        </Link>

        {/* More */}
        <button
          onClick={onMoreClick}
          className="flex flex-col items-center justify-center py-3 px-2 hover:bg-white/5 active:bg-white/10 transition-colors"
          aria-label="More contact options"
        >
          <MoreHorizontal className="text-[#C6B4AB] mb-1" size={24} />
          <span className="text-white text-xs font-sans">More</span>
        </button>
      </div>
    </div>
  );
}
