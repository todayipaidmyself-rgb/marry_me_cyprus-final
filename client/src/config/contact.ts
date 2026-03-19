/**
 * Central contact configuration for Marry Me Cyprus
 * All contact methods read from this single source of truth
 */

export const CONTACT_CONFIG = {
  whatsapp: {
    label: "WhatsApp",
    description: "Fastest for most enquiries",
    url: "https://wa.me/35799512309",
  },
  phone: {
    cyprusPlanning: {
      label: "Call Cyprus office",
      description: "+357 26 323 209",
      tel: "tel:+35726323209",
    },
    showroomOrders: {
      label: "Showroom & orders",
      description: "+357 26 652 498",
      tel: "tel:+35726652498",
    },
    ukNumber: {
      label: "Call UK number",
      description: "07557 676 250",
      tel: "tel:+447557676250",
    },
  },
  email: {
    primaryEmail: {
      label: "Email us",
      description: "sales@marrymecyprus.co.uk",
      mailto: "mailto:sales@marrymecyprus.co.uk",
    },
    decorEmail: {
      description: "orders@marrymecyprus.co.uk",
      mailto: "mailto:orders@marrymecyprus.co.uk",
    },
  },
  social: {
    instagram: {
      label: "Instagram",
      description: "@marrymecyprusltd",
      url: "https://www.instagram.com/marrymecyprusltd?igsh=dGx1bDJlM3l3bWt2",
    },
    facebook: {
      label: "Facebook",
      description: "Marry Me Cyprus",
      url: "https://m.facebook.com/marrymecyprusltd/",
    },
  },
} as const;
