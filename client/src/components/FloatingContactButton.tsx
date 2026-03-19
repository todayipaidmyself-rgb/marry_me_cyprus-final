import { MessageCircle } from "lucide-react";

interface FloatingContactButtonProps {
  onClick: () => void;
}

export function FloatingContactButton({ onClick }: FloatingContactButtonProps) {
  return (
    <button
      onClick={onClick}
      className="hidden md:flex fixed bottom-8 right-8 w-16 h-16 bg-[#C6B4AB] hover:bg-[#B5A49A] rounded-full shadow-2xl items-center justify-center transition-all hover:scale-110 z-30 group"
      aria-label="Open contact options"
    >
      <MessageCircle className="text-black" size={28} />
      <span className="absolute right-full mr-4 px-4 py-2 bg-black border border-[#C6B4AB]/30 rounded-lg text-white text-sm font-sans whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Get in Touch
      </span>
    </button>
  );
}
