import { Link } from "wouter";
import { CONTACT_CONFIG } from "@/config/contact";
import { motion } from "framer-motion";
import {
  Facebook,
  FileText,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Package,
  Phone,
} from "lucide-react";

type HubAction = {
  icon: typeof MessageCircle;
  label: string;
  description: string;
  href: string;
  external: boolean;
};

const primaryActions: readonly HubAction[] = [
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
] as const;

const secondaryActions: readonly HubAction[] = [
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
] as const;

const pageLinks = [
  { icon: MapPin, label: "Venues", href: "/venues" },
  { icon: Package, label: "Collections", href: "/collections" },
  { icon: FileText, label: "Dossiers", href: "/dossiers" },
  { icon: MessageSquare, label: "My Quote", href: "/my-quote" },
] as const;

export default function HubPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto max-w-5xl px-4 pt-[104px] pb-[calc(132px+env(safe-area-inset-bottom))] sm:px-6 md:px-8 md:pt-[136px] md:pb-[calc(160px+env(safe-area-inset-bottom))]">
        <motion.section
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[10px] uppercase tracking-[0.28em] text-white/42">
            Marry Me Cyprus
          </p>
          <h1 className="mt-4 font-serif text-3xl tracking-tight text-white sm:text-4xl md:text-6xl">
            Contact Hub
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/62 sm:text-base md:text-lg">
            Fast access to planning, showroom, social, and enquiry channels in
            one calm place.
          </p>
        </motion.section>

        <motion.section
          className="mx-auto mt-10 max-w-5xl md:mt-14"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.26em] text-white/42">
              Primary Contact
            </p>
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">
              Fastest routes first
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {primaryActions.map(action => {
              const Icon = action.icon;
              return (
                <a
                  key={action.label}
                  href={action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group min-h-[118px] border border-white/10 bg-transparent px-4 py-4 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/[0.03]"
                >
                  <Icon className="h-4 w-4 text-white/70 transition-colors duration-300 group-hover:text-white/88" />
                  <p className="mt-4 font-serif text-lg leading-tight text-white md:text-[22px]">
                    {action.label}
                  </p>
                  <p className="mt-2 text-[11px] uppercase leading-relaxed tracking-[0.16em] text-white/52">
                    {action.description}
                  </p>
                </a>
              );
            })}
          </div>
        </motion.section>

        <motion.section
          className="mx-auto mt-10 max-w-5xl md:mt-12"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.26em] text-white/42">
              Social & Explore
            </p>
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">
              Follow or browse
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {secondaryActions.map(action => {
              const Icon = action.icon;
              return (
                <a
                  key={action.label}
                  href={action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group min-h-[108px] border border-white/10 bg-transparent px-4 py-4 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/[0.03]"
                >
                  <Icon className="h-4 w-4 text-white/68 transition-colors duration-300 group-hover:text-white/84" />
                  <p className="mt-4 font-serif text-lg leading-tight text-white md:text-[22px]">
                    {action.label}
                  </p>
                  <p className="mt-2 text-[11px] uppercase leading-relaxed tracking-[0.16em] text-white/50">
                    {action.description}
                  </p>
                </a>
              );
            })}

            {pageLinks.map(link => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group min-h-[108px] border border-white/10 bg-transparent px-4 py-4 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/[0.03]"
                >
                  <Icon className="h-4 w-4 text-white/68 transition-colors duration-300 group-hover:text-white/84" />
                  <p className="mt-4 font-serif text-lg leading-tight text-white md:text-[22px]">
                    {link.label}
                  </p>
                  <p className="mt-2 text-[11px] uppercase leading-relaxed tracking-[0.16em] text-white/40">
                    Open
                  </p>
                </Link>
              );
            })}
          </div>
        </motion.section>

        <section className="mx-auto mt-10 max-w-3xl text-center md:mt-12">
          <p className="text-[10px] uppercase tracking-[0.24em] text-white/32">
            Planning support available across Cyprus and the UK
          </p>
        </section>
      </main>
    </div>
  );
}
