import {
  X,
  MessageCircle,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Send,
} from "lucide-react";
import { CONTACT_CONFIG } from "@/config/contact";
import { Link } from "wouter";

interface ContactHubProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactHub({ isOpen, onClose }: ContactHubProps) {
  if (!isOpen) return null;

  const contactMethods = [
    {
      icon: MessageCircle,
      label: CONTACT_CONFIG.whatsapp.label,
      description: CONTACT_CONFIG.whatsapp.description,
      href: CONTACT_CONFIG.whatsapp.url,
      external: true,
    },
    {
      icon: Phone,
      label: CONTACT_CONFIG.phone.cyprusPlanning.label,
      description: CONTACT_CONFIG.phone.cyprusPlanning.description,
      href: CONTACT_CONFIG.phone.cyprusPlanning.tel,
      external: true,
    },
    {
      icon: Phone,
      label: CONTACT_CONFIG.phone.ukNumber.label,
      description: CONTACT_CONFIG.phone.ukNumber.description,
      href: CONTACT_CONFIG.phone.ukNumber.tel,
      external: true,
    },
    {
      icon: Phone,
      label: CONTACT_CONFIG.phone.showroomOrders.label,
      description: CONTACT_CONFIG.phone.showroomOrders.description,
      href: CONTACT_CONFIG.phone.showroomOrders.tel,
      external: true,
    },
    {
      icon: Mail,
      label: CONTACT_CONFIG.email.primaryEmail.label,
      description: CONTACT_CONFIG.email.primaryEmail.description,
      href: CONTACT_CONFIG.email.primaryEmail.mailto,
      external: true,
    },
    {
      icon: Instagram,
      label: CONTACT_CONFIG.social.instagram.label,
      description: CONTACT_CONFIG.social.instagram.description,
      href: CONTACT_CONFIG.social.instagram.url,
      external: true,
    },
    {
      icon: Facebook,
      label: CONTACT_CONFIG.social.facebook.label,
      description: CONTACT_CONFIG.social.facebook.description,
      href: CONTACT_CONFIG.social.facebook.url,
      external: true,
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="fixed bottom-0 right-0 md:bottom-8 md:right-8 w-full md:w-96 bg-black border border-[#C6B4AB]/30 md:rounded-2xl shadow-2xl z-50 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-black border-b border-[#C6B4AB]/20 p-6 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-2xl text-white">Get in Touch</h3>
            <p className="text-white/60 text-sm font-sans mt-1">
              We're here to help plan your dream wedding
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors p-2 -mr-2"
            aria-label="Close contact panel"
          >
            <X size={24} />
          </button>
        </div>

        {/* Contact Methods */}
        <div className="p-6 space-y-3">
          {contactMethods.map((method, index) => {
            const Icon = method.icon;
            return (
              <a
                key={index}
                href={method.href}
                target={method.external ? "_blank" : undefined}
                rel={method.external ? "noopener noreferrer" : undefined}
                className="flex items-center gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#C6B4AB]/30 transition-all group"
                aria-label={`${method.label}: ${method.description}`}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#C6B4AB]/20 flex items-center justify-center group-hover:bg-[#C6B4AB]/30 transition-colors">
                  <Icon className="text-[#C6B4AB]" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-sans font-medium">
                    {method.label}
                  </p>
                  <p className="text-white/60 text-sm font-sans truncate">
                    {method.description}
                  </p>
                </div>
              </a>
            );
          })}

          {/* Make an Enquiry */}
          <Link
            href="/contact"
            onClick={onClose}
            className="flex items-center gap-4 p-4 rounded-lg bg-[#C6B4AB] hover:bg-[#B5A49A] transition-all group"
            aria-label="Make an enquiry"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-black/20 flex items-center justify-center">
              <Send className="text-black" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-black font-sans font-medium">
                Make an Enquiry
              </p>
              <p className="text-black/70 text-sm font-sans">
                Fill out our contact form
              </p>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
