import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import {
  ChevronDown,
  ChevronUp,
  Mail,
  Calendar,
  Users,
  MapPin,
  MessageSquare,
  FileText,
} from "lucide-react";
import { useLocation, Link } from "wouter";

type StatusFilter = "all" | "pending" | "contacted" | "booked";

export default function AdminInquiries() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const {
    data: inquiries = [],
    isLoading,
    refetch,
  } = trpc.inquiries.getAllInquiries.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
    retry: false,
  });

  const updateStatusMutation = trpc.inquiries.updateStatus.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Redirect non-admin users
  if (!authLoading && (!user || user.role !== "admin")) {
    setLocation("/dashboard");
    return null;
  }

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container pt-32">
          <p className="font-sans text-center">Loading...</p>
        </div>
      </div>
    );
  }

  // Filter inquiries
  const filteredInquiries =
    statusFilter === "all"
      ? inquiries
      : inquiries.filter(inq => inq.status === statusFilter);

  const handleStatusUpdate = (
    inquiryId: number,
    newStatus: "pending" | "contacted" | "booked"
  ) => {
    updateStatusMutation.mutate({ inquiryId, status: newStatus });
  };

  const toggleExpanded = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const statusCounts = {
    all: inquiries.length,
    pending: inquiries.filter(i => i.status === "pending").length,
    contacted: inquiries.filter(i => i.status === "contacted").length,
    booked: inquiries.filter(i => i.status === "booked").length,
  };

  const statusColors = {
    pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    contacted: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    booked: "bg-green-500/20 text-green-300 border-green-500/30",
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container pt-32 pb-16">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-serif text-5xl md:text-6xl text-white mb-4">
              Inquiry Management
            </h1>
            <p className="font-sans text-lg text-white/70">
              View and manage all venue and collection enquiries
            </p>
          </div>
          <Link href="/admin/quotes">
            <Button
              variant="outline"
              className="border-[#C6B4AB] text-[#C6B4AB] hover:bg-[#C6B4AB] hover:text-black"
            >
              <FileText className="h-4 w-4 mr-2" />
              Quote Management
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="bg-white/5 border-[#C6B4AB]/20 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="font-serif text-2xl text-white">
              Filter by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {(
                ["all", "pending", "contacted", "booked"] as StatusFilter[]
              ).map(status => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  onClick={() => setStatusFilter(status)}
                  className={
                    statusFilter === status
                      ? "bg-[#C6B4AB] text-black hover:bg-[#C6B4AB]/90"
                      : "border-[#C6B4AB] text-[#C6B4AB] hover:bg-[#C6B4AB] hover:text-black"
                  }
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)} (
                  {statusCounts[status]})
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Inquiries Table */}
        <Card className="bg-white/5 border-[#C6B4AB]/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-serif text-3xl text-white flex items-center gap-3">
              <Mail className="text-[#C6B4AB]" size={28} />
              All Inquiries
            </CardTitle>
            <CardDescription className="text-gray-400 font-sans">
              {filteredInquiries.length}{" "}
              {filteredInquiries.length === 1 ? "inquiry" : "inquiries"} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredInquiries.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60 font-sans">
                  No inquiries found for this filter.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInquiries.map(inquiry => {
                  const isExpanded = expandedId === inquiry.id;
                  const formattedDate = new Date(
                    inquiry.createdAt
                  ).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={inquiry.id}
                      className="border border-white/10 rounded-lg overflow-hidden hover:border-[#C6B4AB]/30 transition-colors"
                    >
                      {/* Main Row */}
                      <div className="p-4 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                        {/* Name & Email */}
                        <div className="md:col-span-2">
                          <h4 className="font-serif text-lg text-white mb-1">
                            {inquiry.name}
                          </h4>
                          <p className="text-white/60 font-sans text-sm">
                            {inquiry.email}
                          </p>
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-2 text-white/70 font-sans text-sm">
                          <Calendar className="w-4 h-4" />
                          {formattedDate}
                        </div>

                        {/* Venue/Collection */}
                        <div className="flex items-center gap-2 text-white/70 font-sans text-sm">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">
                            {inquiry.venueName ||
                              inquiry.collectionName ||
                              "General"}
                          </span>
                        </div>

                        {/* Status Dropdown */}
                        <div>
                          <Select
                            value={inquiry.status}
                            onValueChange={value =>
                              handleStatusUpdate(
                                inquiry.id,
                                value as "pending" | "contacted" | "booked"
                              )
                            }
                          >
                            <SelectTrigger
                              className={`w-full border capitalize ${statusColors[inquiry.status as keyof typeof statusColors]}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="contacted">
                                Contacted
                              </SelectItem>
                              <SelectItem value="booked">Booked</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Expand Button */}
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(inquiry.id)}
                            className="text-[#C6B4AB] hover:text-white hover:bg-white/10"
                          >
                            {isExpanded ? (
                              <ChevronUp size={20} />
                            ) : (
                              <ChevronDown size={20} />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="p-4 border-t border-white/10 bg-white/5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-4">
                              <div>
                                <h5 className="font-serif text-white mb-2 flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-[#C6B4AB]" />
                                  Contact Details
                                </h5>
                                <div className="space-y-1 text-sm font-sans">
                                  <p className="text-white/70">
                                    Email: {inquiry.email}
                                  </p>
                                  {inquiry.phone && (
                                    <p className="text-white/70">
                                      Phone: {inquiry.phone}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {inquiry.weddingDate && (
                                <div>
                                  <h5 className="font-serif text-white mb-2 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-[#C6B4AB]" />
                                    Wedding Date
                                  </h5>
                                  <p className="text-white/70 text-sm font-sans">
                                    {inquiry.weddingDate}
                                  </p>
                                </div>
                              )}

                              {inquiry.guestCount && (
                                <div>
                                  <h5 className="font-serif text-white mb-2 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-[#C6B4AB]" />
                                    Guest Count
                                  </h5>
                                  <p className="text-white/70 text-sm font-sans">
                                    {inquiry.guestCount} guests
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                              {(inquiry.venueName ||
                                inquiry.collectionName) && (
                                <div>
                                  <h5 className="font-serif text-white mb-2 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-[#C6B4AB]" />
                                    Venue / Collection
                                  </h5>
                                  <div className="space-y-1 text-sm font-sans">
                                    {inquiry.venueName && (
                                      <p className="text-white/70">
                                        Venue: {inquiry.venueName}
                                        {inquiry.venueLocation &&
                                          ` (${inquiry.venueLocation})`}
                                      </p>
                                    )}
                                    {inquiry.collectionName && (
                                      <p className="text-white/70">
                                        Collection: {inquiry.collectionName}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}

                              <div>
                                <h5 className="font-serif text-white mb-2 flex items-center gap-2">
                                  <MessageSquare className="w-4 h-4 text-[#C6B4AB]" />
                                  Message
                                </h5>
                                <p className="text-white/70 text-sm font-sans whitespace-pre-wrap">
                                  {inquiry.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
