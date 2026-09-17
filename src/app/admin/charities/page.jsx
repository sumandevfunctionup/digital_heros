"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Heart,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Calendar,
  Sparkles,
  Users,
  Eye,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PaginationControl from "@/components/ui/PaginationControl";

export default function AdminCharitiesManagementPage() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCharities, setTotalCharities] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCharity, setEditingCharity] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    tagline: "",
    description: "",
    category: "Healthcare",
    logoUrl: "",
    bannerUrl: "",
    websiteUrl: "",
    isFeatured: false,
  });

  // Event Modal State (Charity Golf Days)
  const [eventModalCharity, setEventModalCharity] = useState(null);
  const [eventData, setEventData] = useState({
    title: "",
    date: "",
    location: "",
    ticketPrice: 150,
  });
  const [savingEvent, setSavingEvent] = useState(false);

  const fetchCharities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const res = await fetch(`/api/charities?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.charities) {
          setCharities(json.data.charities);
          setTotalCharities(json.meta?.total || 0);
          setTotalPages(json.meta?.totalPages || 1);
        }
      }
    } catch {
      toast.error("Failed to load charity partners.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharities();
  }, [page, limit]);

  const handleOpenCreateModal = () => {
    setEditingCharity(null);
    setFormData({
      name: "",
      slug: "",
      tagline: "",
      description: "",
      category: "Healthcare",
      logoUrl: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=400&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
      websiteUrl: "https://example.org",
      isFeatured: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (charity) => {
    setEditingCharity(charity);
    setFormData({
      name: charity.name || "",
      slug: charity.slug || "",
      tagline: charity.tagline || "",
      description: charity.description || "",
      category: charity.category || "Healthcare",
      logoUrl: charity.logoUrl || "",
      bannerUrl: charity.bannerUrl || "",
      websiteUrl: charity.websiteUrl || "",
      isFeatured: !!charity.isFeatured,
    });
    setIsModalOpen(true);
  };

  const handleSaveCharity = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.slug || !formData.tagline || !formData.description) {
      toast.error("Please fill in all required charity fields.");
      return;
    }

    try {
      setSaving(true);
      if (editingCharity) {
        // PUT update
        const res = await fetch(`/api/charities/${editingCharity.slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          toast.error(json.error?.message || "Failed to update charity.");
          return;
        }
        toast.success("Charity partner updated successfully!");
      } else {
        // POST create
        const res = await fetch("/api/charities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          toast.error(json.error?.message || "Failed to create charity.");
          return;
        }
        toast.success("Charity partner created successfully!");
      }

      setIsModalOpen(false);
      await fetchCharities();
    } catch {
      toast.error("Network error saving charity.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (charity) => {
    const willDeactivate = charity.isActive;
    if (willDeactivate && !confirm(`Are you sure you want to deactivate ${charity.name}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/charities/${charity.slug}`, {
        method: willDeactivate ? "DELETE" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: willDeactivate ? undefined : JSON.stringify({ isActive: true }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error?.message || "Failed to toggle status.");
        return;
      }

      toast.success(
        willDeactivate
          ? `${charity.name} deactivated.`
          : `${charity.name} reactivated.`
      );
      await fetchCharities();
    } catch {
      toast.error("Error toggling charity status.");
    }
  };

  const handleAddGolfDayEvent = async (e) => {
    e.preventDefault();
    if (!eventModalCharity) return;

    if (!eventData.title || !eventData.date || !eventData.location) {
      toast.error("Please fill in event title, date, and location.");
      return;
    }

    try {
      setSavingEvent(true);
      const updatedEvents = [
        ...(eventModalCharity.upcomingEvents || []),
        {
          title: eventData.title.trim(),
          date: new Date(eventData.date),
          location: eventData.location.trim(),
          ticketPrice: Number(eventData.ticketPrice) || 0,
        },
      ];

      const res = await fetch(`/api/charities/${eventModalCharity.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upcomingEvents: updatedEvents }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error?.message || "Failed to add event.");
        return;
      }

      toast.success("Charity Golf Day event added successfully!");
      setEventModalCharity(null);
      setEventData({ title: "", date: "", location: "", ticketPrice: 150 });
      await fetchCharities();
    } catch {
      toast.error("Network error adding event.");
    } finally {
      setSavingEvent(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-400" />
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Registered Charities Management
            </h2>
          </div>
          <p className="text-sm text-white/60 mt-1 max-w-3xl leading-relaxed">
            PRD § 08 & § 11: Register verified non-profit organizations, track donor funds raised, toggle featured spotlights, and organize Charity Golf Day tournaments.
          </p>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          className="bg-rose-500 hover:bg-rose-400 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-rose-500/20 flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Add Charity Partner
        </Button>
      </div>

      {/* Charities List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 py-16 text-center text-xs font-mono text-white/50">
            Loading charity partners...
          </div>
        ) : (
          charities.map((charity) => (
            <div
              key={charity._id}
              className="rounded-3xl border border-white/10 bg-[#0F1118]/80 p-6 backdrop-blur-xl relative flex flex-col justify-between"
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={charity.logoUrl}
                      alt={charity.name}
                      className="w-12 h-12 rounded-xl object-cover border border-white/10"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{charity.name}</h3>
                        {charity.isFeatured && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                            Featured
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-rose-400">
                        {charity.category} • /{charity.slug}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono uppercase font-bold ${
                      charity.isActive
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    }`}
                  >
                    {charity.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <p className="text-xs text-white/70 line-clamp-2 mb-4">
                  {charity.tagline}
                </p>

                {/* Metrics Pill Grid */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#121520] border border-white/10 text-xs text-center mb-4">
                  <div>
                    <span className="text-[9px] font-mono text-white/40 uppercase block">
                      Funds Raised
                    </span>
                    <span className="font-bold font-mono text-emerald-400">
                      ${charity.totalFundsRaised?.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-white/40 uppercase block">
                      Supporters
                    </span>
                    <span className="font-bold font-mono text-white">
                      {charity.supporterCount || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-white/40 uppercase block">
                      Golf Days
                    </span>
                    <span className="font-bold font-mono text-cyan-400">
                      {charity.upcomingEvents?.length || 0} Events
                    </span>
                  </div>
                </div>

                {/* Upcoming Charity Golf Days if any */}
                {charity.upcomingEvents?.length > 0 && (
                  <div className="mb-4 space-y-1.5">
                    <span className="text-[10px] font-mono text-white/40 uppercase block">
                      Upcoming Charity Tournaments:
                    </span>
                    {charity.upcomingEvents.map((evt, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-white/5 border border-white/10 text-[11px] flex items-center justify-between"
                      >
                        <span className="font-medium text-white">{evt.title}</span>
                        <span className="text-white/50 font-mono">
                          {new Date(evt.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                <Link
                  href={`/charities/${charity.slug}`}
                  target="_blank"
                  className="text-xs text-white/50 hover:text-white flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Public View</span>
                  <ExternalLink className="w-3 h-3 text-white/30" />
                </Link>

                <div className="flex items-center gap-1.5">
                  <Button
                    onClick={() => {
                      setEventModalCharity(charity);
                      setEventData({ title: "", date: "", location: "", ticketPrice: 150 });
                    }}
                    className="bg-white/10 hover:bg-white/15 text-cyan-300 text-xs px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    + Golf Day
                  </Button>

                  <Button
                    onClick={() => handleOpenEditModal(charity)}
                    className="bg-white/10 hover:bg-white/15 text-white text-xs px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </Button>

                  <Button
                    onClick={() => handleToggleActive(charity)}
                    className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                      charity.isActive
                        ? "bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
                        : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                    }`}
                  >
                    {charity.isActive ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      <PaginationControl
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalCharities}
        limit={limit}
        limitOptions={[6, 10, 20, 50]}
        onPageChange={(newPage) => setPage(newPage)}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
        itemName="charity partners"
        className="pt-2"
      />

      {/* Create / Edit Charity Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#0F1118] border-white/15 text-white max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400" />
              {editingCharity ? "Edit Registered Charity Partner" : "Register New Charity Partner"}
            </DialogTitle>
            <DialogDescription className="text-xs text-white/50">
              PRD § 08: Verified charity details where golfers can allocate minimum 10% subscriptions.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCharity} className="space-y-4 my-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-white/60 mb-1">
                  CHARITY NAME *
                </label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Starlight Children's Foundation"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-+|-+$/g, "");
                    setFormData({
                      ...formData,
                      name,
                      slug: editingCharity ? formData.slug : slug,
                    });
                  }}
                  className="bg-[#121520] border-white/15 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-white/60 mb-1">
                  URL SLUG *
                </label>
                <Input
                  type="text"
                  required
                  disabled={!!editingCharity}
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="bg-[#121520] border-white/15 text-white text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-white/60 mb-1">
                  CATEGORY *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-[#121520] border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Healthcare">Healthcare</option>
                  <option value="Youth & Education">Youth & Education</option>
                  <option value="Veterans">Veterans</option>
                  <option value="Environment">Environment</option>
                  <option value="Disaster Relief">Disaster Relief</option>
                  <option value="Community">Community</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-white/60 mb-1">
                  OFFICIAL WEBSITE URL
                </label>
                <Input
                  type="url"
                  placeholder="https://..."
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  className="bg-[#121520] border-white/15 text-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-white/60 mb-1">
                ONE-LINE TAGLINE *
              </label>
              <Input
                type="text"
                required
                placeholder="Brightening the lives of seriously ill children..."
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="bg-[#121520] border-white/15 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-white/60 mb-1">
                FULL MISSION DESCRIPTION *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Comprehensive overview of non-profit programs and community impact..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-[#121520] border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-white/60 mb-1">
                  LOGO IMAGE URL *
                </label>
                <Input
                  type="url"
                  required
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  className="bg-[#121520] border-white/15 text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-white/60 mb-1">
                  BANNER IMAGE URL *
                </label>
                <Input
                  type="url"
                  required
                  value={formData.bannerUrl}
                  onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                  className="bg-[#121520] border-white/15 text-white text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isFeaturedCheckbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="rounded accent-rose-500"
              />
              <label htmlFor="isFeaturedCheckbox" className="text-white cursor-pointer select-none">
                Pin as Featured Charity on Homepage Carousel
              </label>
            </div>

            <DialogFooter className="mt-6 flex justify-end gap-2 pt-2 border-t border-white/10">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                className="text-xs text-white/60 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-rose-500 hover:bg-rose-400 text-white font-semibold text-xs px-5"
              >
                {saving ? "Saving..." : editingCharity ? "Save Changes" : "Create Charity"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Charity Golf Day Event Dialog */}
      <Dialog
        open={!!eventModalCharity}
        onOpenChange={(open) => !open && setEventModalCharity(null)}
      >
        <DialogContent className="bg-[#0F1118] border-white/15 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              Schedule Charity Golf Day
            </DialogTitle>
            <DialogDescription className="text-xs text-white/50">
              Publish an upcoming fundraising golf tournament for {eventModalCharity?.name}.
            </DialogDescription>
          </DialogHeader>

          {eventModalCharity && (
            <form onSubmit={handleAddGolfDayEvent} className="space-y-4 my-2 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-white/60 mb-1">
                  TOURNAMENT TITLE *
                </label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. 2026 Annual Starlight Golf Classic"
                  value={eventData.title}
                  onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                  className="bg-[#121520] border-white/15 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-white/60 mb-1">
                    DATE *
                  </label>
                  <Input
                    type="date"
                    required
                    value={eventData.date}
                    onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
                    className="bg-[#121520] border-white/15 text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-white/60 mb-1">
                    ENTRY / TICKET PRICE ($)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={eventData.ticketPrice}
                    onChange={(e) =>
                      setEventData({ ...eventData, ticketPrice: Number(e.target.value) })
                    }
                    className="bg-[#121520] border-white/15 text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-white/60 mb-1">
                  VENUE / GOLF CLUB LOCATION *
                </label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. The Australian Golf Club, Sydney"
                  value={eventData.location}
                  onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                  className="bg-[#121520] border-white/15 text-white text-xs"
                />
              </div>

              <DialogFooter className="mt-6 flex justify-end gap-2 pt-2 border-t border-white/10">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEventModalCharity(null)}
                  className="text-xs text-white/60 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={savingEvent}
                  className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs px-5"
                >
                  {savingEvent ? "Scheduling..." : "Schedule Tournament"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
