"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Eye,
  Heart,
  Calendar,
  Target,
  Trophy,
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

export default function AdminUsersDirectoryPage() {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Inspect / Edit Modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailData, setUserDetailData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [editingRole, setEditingRole] = useState("user");
  const [editingStatus, setEditingStatus] = useState("active");
  const [editingPlan, setEditingPlan] = useState("monthly");
  const [savingOverrides, setSavingOverrides] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append("search", searchTerm.trim());
      if (roleFilter !== "All") params.append("role", roleFilter);
      if (statusFilter !== "All") params.append("subscriptionStatus", statusFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setUsers(json.data.users || []);
          setTotalUsers(json.meta?.total || 0);
        }
      }
    } catch {
      toast.error("Failed to load user directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleOpenUserDetail = async (user) => {
    setSelectedUser(user);
    setEditingRole(user.role || "user");
    setEditingStatus(user.subscriptionStatus || "none");
    setEditingPlan(user.subscriptionPlan || "monthly");
    try {
      setLoadingDetail(true);
      const res = await fetch(`/api/admin/users/${user._id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setUserDetailData(json.data);
        }
      }
    } catch {
      toast.error("Failed to fetch full user telemetry.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSaveOverrides = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setSavingOverrides(true);
      const res = await fetch(`/api/admin/users/${selectedUser._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: editingRole,
          subscriptionStatus: editingStatus,
          subscriptionPlan: editingPlan,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error?.message || "Failed to update user.");
        return;
      }

      toast.success("User role & subscription updated successfully!");
      setSelectedUser(null);
      await fetchUsers();
    } catch {
      toast.error("Network error updating user.");
    } finally {
      setSavingOverrides(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-amber-400" />
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Subscriber & Golfer Directory
          </h2>
        </div>
        <p className="text-sm text-white/60 mt-1 max-w-3xl leading-relaxed">
          Search registered accounts, inspect active 5-score draw entries, verify charity allocations, and override subscriber privileges.
        </p>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="rounded-2xl border border-white/10 bg-[#0F1118]/80 p-4 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#121520] border-white/15 text-white pl-9 text-xs"
            />
          </div>
          <Button
            type="submit"
            className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded-xl border border-white/15"
          >
            Search
          </Button>
        </form>

        {/* Dropdowns */}
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-2 text-xs text-white/60">
            <span className="font-mono text-[10px] uppercase text-white/40">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-[#121520] border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="All">All Roles</option>
              <option value="user">User / Golfer</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-white/60">
            <span className="font-mono text-[10px] uppercase text-white/40">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#121520] border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="active">Active</option>
              <option value="trialing">Trialing</option>
              <option value="none">None / Inactive</option>
              <option value="past_due">Past Due</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl border border-white/10 bg-[#0F1118]/80 p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono text-white/40">
            Showing {users.length} of {totalUsers} total registered accounts
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs font-mono text-white/50">
            Loading user roster...
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-white/10 rounded-2xl">
            <Users className="w-8 h-8 text-white/20 mx-auto mb-2" />
            <p className="text-sm text-white/50">No matching users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white/70">
              <thead className="bg-white/5 text-white/50 uppercase font-mono text-[10px] border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Subscription</th>
                  <th className="py-3 px-4">Charity Partner</th>
                  <th className="py-3 px-4">Pledge</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-white/5 transition-colors">
                    {/* User Identity */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-white">
                        {u.firstName} {u.lastName}
                      </div>
                      <div className="text-[11px] text-white/40 font-mono">{u.email}</div>
                    </td>

                    {/* Role */}
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          u.role === "admin"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            : "bg-white/5 text-white/60 border border-white/10"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    {/* Subscription */}
                    <td className="py-4 px-4">
                      {u.role === "admin" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          Staff / Exempt
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold capitalize ${
                            u.subscriptionStatus === "active" || u.subscriptionStatus === "trialing"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          }`}
                        >
                          {u.subscriptionStatus || "none"}
                          {u.subscriptionPlan && (
                            <span className="font-normal text-white/50">
                              ({u.subscriptionPlan})
                            </span>
                          )}
                        </span>
                      )}
                    </td>

                    {/* Charity */}
                    <td className="py-4 px-4">
                      {u.selectedCharityId ? (
                        <span className="text-white/80 font-medium">
                          {u.selectedCharityId.name}
                        </span>
                      ) : (
                        <span className="text-white/30 italic">Default Pool</span>
                      )}
                    </td>

                    {/* Pledge */}
                    <td className="py-4 px-4 font-mono font-bold text-emerald-400">
                      {u.charityContributionPercent || 10}%
                    </td>

                    {/* Joined */}
                    <td className="py-4 px-4 font-mono text-white/40 text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <Button
                        onClick={() => handleOpenUserDetail(u)}
                        className="bg-white/10 hover:bg-white/20 text-white text-xs px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        Inspect & Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect & Override Modal */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="bg-[#0F1118] border-white/15 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-400" />
              Golfer Profile & Privilege Management
            </DialogTitle>
            <DialogDescription className="text-xs text-white/50">
              Inspect active round entries, recorded prizes, and override subscription access.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6 my-2">
              {/* Profile Card */}
              <div className="p-4 rounded-2xl bg-[#121520] border border-white/10 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/40">Full Name:</span>
                  <span className="font-bold text-white">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Email:</span>
                  <span className="font-mono text-white">{selectedUser.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Charity Pledge:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {selectedUser.charityContributionPercent || 10}% to{" "}
                    {selectedUser.selectedCharityId?.name || "Default Pool"}
                  </span>
                </div>
              </div>

              {/* Live Scores & Winnings Stats */}
              {loadingDetail ? (
                <div className="py-4 text-center text-xs font-mono text-white/40">
                  Fetching user round telemetry...
                </div>
              ) : userDetailData ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                    <span className="text-[10px] font-mono uppercase text-white/40 block">
                      Rounds Logged
                    </span>
                    <div className="text-xl font-bold font-mono text-white mt-1">
                      {userDetailData.scores?.length || 0}
                    </div>
                    <span className="text-[10px] text-white/40">
                      Active Ticket:{" "}
                      {userDetailData.scores
                        ?.filter((s) => s.isCurrentActive)
                        .map((s) => s.score)
                        .join(" • ") || "None"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                    <span className="text-[10px] font-mono uppercase text-white/40 block">
                      Prize Records
                    </span>
                    <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                      {userDetailData.winnings?.length || 0} Won
                    </div>
                    <span className="text-[10px] text-white/40">
                      Matches achieved in monthly draws
                    </span>
                  </div>
                </div>
              ) : null}

              {/* Overrides Form */}
              <form onSubmit={handleSaveOverrides} className="space-y-4 pt-2 border-t border-white/10">
                <span className="text-xs font-mono uppercase text-amber-400 font-bold block">
                  Admin Overrides:
                </span>

                <div className="grid grid-cols-2 gap-3">
                  {/* Role */}
                  <div>
                    <label className="block text-xs font-mono text-white/60 mb-1">
                      USER ROLE
                    </label>
                    <select
                      value={editingRole}
                      onChange={(e) => setEditingRole(e.target.value)}
                      className="w-full bg-[#121520] border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="user">User / Golfer</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  {/* Subscription Status */}
                  <div>
                    <label className="block text-xs font-mono text-white/60 mb-1">
                      SUBSCRIPTION STATUS
                    </label>
                    <select
                      value={editingStatus}
                      onChange={(e) => setEditingStatus(e.target.value)}
                      className="w-full bg-[#121520] border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="active">Active</option>
                      <option value="trialing">Trialing</option>
                      <option value="none">None / Inactive</option>
                      <option value="past_due">Past Due</option>
                      <option value="canceled">Canceled</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/60 mb-1">
                    SUBSCRIPTION PLAN
                  </label>
                  <select
                    value={editingPlan}
                    onChange={(e) => setEditingPlan(e.target.value)}
                    className="w-full bg-[#121520] border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="monthly">Monthly ($25/mo)</option>
                    <option value="yearly">Yearly ($250/yr)</option>
                  </select>
                </div>

                <DialogFooter className="mt-6 flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setSelectedUser(null)}
                    className="text-xs text-white/60 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={savingOverrides}
                    className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold"
                  >
                    {savingOverrides ? "Saving..." : "Apply Overrides"}
                  </Button>
                </DialogFooter>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
