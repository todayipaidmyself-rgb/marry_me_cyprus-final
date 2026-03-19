import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { toast } from "sonner";

interface InquiryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  venueId?: string;
  venueName?: string;
  collectionId?: string;
  collectionName?: string;
}

export default function InquiryFormModal({
  isOpen,
  onClose,
  venueId,
  venueName,
  collectionId,
  collectionName,
}: InquiryFormModalProps) {
  const { data: profile } = trpc.profile.get.useQuery();
  const submitInquiry = trpc.inquiries.submit.useMutation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    weddingDate: "",
    guestCount: "",
    message: "",
  });

  // Auto-fill from profile when modal opens
  useEffect(() => {
    if (isOpen && profile) {
      setFormData({
        name:
          `${profile.firstName || ""} ${profile.partnerName || ""}`.trim() ||
          "",
        email: profile.email || "",
        phone: profile.phone || "",
        weddingDate: profile.weddingDate || "",
        guestCount: profile.guestCount?.toString() || "",
        message: "",
      });
    }
  }, [isOpen, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Submit to database via tRPC
      await submitInquiry.mutateAsync({
        venueId,
        collectionId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        weddingDate: formData.weddingDate || undefined,
        guestCount: formData.guestCount
          ? parseInt(formData.guestCount)
          : undefined,
        message: formData.message,
      });

      // Send email via Web3Forms
      const emailSubject = `New App Enquiry — ${venueName || collectionName || "General"} — ${formData.weddingDate || "Date TBD"}`;

      const emailBody = `— ENQUIRY OVERVIEW —

Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone || "Not provided"}
Wedding Date: ${formData.weddingDate || "Not provided"}
Guest Count: ${formData.guestCount || "Not provided"}
Venue: ${venueName || "N/A"}
Collection: ${collectionName || "N/A"}
Status: Pending

Message:
${formData.message}`;

      const web3FormsData = {
        access_key: "492ef260-a4cb-401f-9f88-032feef82ebb",
        to: "forms@marrymecyprus.co.uk",
        from_name: "MMC APP ENQUIRY",
        replyto: formData.email,
        subject: emailSubject,
        message: emailBody,
      };

      await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(web3FormsData),
      });

      // Success
      toast.success(
        "Thank you — the Marry Me Cyprus team will contact you shortly."
      );

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        weddingDate: "",
        guestCount: "",
        message: "",
      });

      onClose();
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      toast.error("Failed to submit inquiry. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-black border border-[#C6B4AB]/30 rounded-lg p-8 mx-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="font-serif text-3xl text-white mb-2">
            Enquire About {venueName || collectionName}
          </h2>
          <p className="text-white/60 font-sans text-sm">
            Fill in the form below and the Marry Me Cyprus team will contact you
            shortly.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="text-white font-sans text-sm mb-2 block">
              Full Name <span className="text-[#C6B4AB]">*</span>
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
              className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
              placeholder="Your full name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-white font-sans text-sm mb-2 block">
              Email <span className="text-[#C6B4AB]">*</span>
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={e =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
              placeholder="your.email@example.com"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-white font-sans text-sm mb-2 block">
              Phone (optional)
            </label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={e =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
              placeholder="+44 7XXX XXXXXX"
            />
          </div>

          {/* Wedding Date */}
          <div>
            <label className="text-white font-sans text-sm mb-2 block">
              Wedding Date (optional)
            </label>
            <Input
              type="text"
              value={formData.weddingDate}
              onChange={e =>
                setFormData({ ...formData, weddingDate: e.target.value })
              }
              className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
              placeholder="e.g. June 2025"
            />
          </div>

          {/* Guest Count */}
          <div>
            <label className="text-white font-sans text-sm mb-2 block">
              Guest Count (optional)
            </label>
            <Input
              type="number"
              value={formData.guestCount}
              onChange={e =>
                setFormData({ ...formData, guestCount: e.target.value })
              }
              className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
              placeholder="e.g. 80"
            />
          </div>

          {/* Message */}
          <div>
            <label className="text-white font-sans text-sm mb-2 block">
              Message <span className="text-[#C6B4AB]">*</span>
            </label>
            <Textarea
              value={formData.message}
              onChange={e =>
                setFormData({ ...formData, message: e.target.value })
              }
              required
              rows={5}
              className="bg-white/5 border-white/20 text-white placeholder:text-white/40 resize-none"
              placeholder="Tell us about your wedding plans and any specific requirements..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 border-white/20 text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitInquiry.isPending}
              className="flex-1 bg-[#C6B4AB] text-black hover:bg-[#B5A49A]"
            >
              {submitInquiry.isPending ? "Sending..." : "Send Enquiry"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
