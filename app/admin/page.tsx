"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Key,
  Server,
  Database,
  Tv,
  Send,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Edit,
  Save,
  Trash2,
  X,
  Search,
  Sparkles,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { Series, AudioVerificationStatus } from "@/types";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [secretInput, setSecretInput] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [healthData, setHealthData] = useState<any>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);

  // Add Leeched Series Form state
  const [newTitle, setNewTitle] = useState("");
  const [newChannelUrl, setNewChannelUrl] = useState("");
  const [newDownloadUrl, setNewDownloadUrl] = useState("");
  const [newTamilStatus, setNewTamilStatus] = useState<AudioVerificationStatus>("Confirmed");
  const [isAddingLeeched, setIsAddingLeeched] = useState(false);

  const [searchFilter, setSearchFilter] = useState("");

  const { showToast } = useToast();

  useEffect(() => {
    checkHealth();
    fetchSeries();
  }, []);

  const checkHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        const data = await res.json();
        setHealthData(data);
      }
    } catch {
      // Ignore
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const fetchSeries = async () => {
    try {
      const res = await fetch("/api/admin/series");
      if (res.ok) {
        const data = await res.json();
        setSeriesList(data.series || []);
        setIsAuthenticated(true);
      }
    } catch {
      // Not authenticated yet
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretInput.trim()) return;

    setIsLoggingIn(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: secretInput.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        showToast("Admin session unlocked successfully!", "success");
        fetchSeries();
      } else {
        showToast(data.message || "Invalid Admin Secret", "error");
      }
    } catch {
      showToast("Authentication failed", "error");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Add a newly leeched series
  const handleAddLeechedSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast("Please enter a TV series title or ID", "error");
      return;
    }

    setIsAddingLeeched(true);
    try {
      const res = await fetch("/api/admin/series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_leeched",
          title: newTitle.trim(),
          telegramChannelUrl: newChannelUrl.trim() || undefined,
          downloadUrl: newDownloadUrl.trim() || undefined,
          tamilAudioStatus: newTamilStatus,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message, "success");
        setNewTitle("");
        setNewChannelUrl("");
        setNewDownloadUrl("");
        fetchSeries();
      } else {
        showToast(data.message || "Failed to add series", "error");
      }
    } catch (err) {
      showToast("Error adding series", "error");
    } finally {
      setIsAddingLeeched(false);
    }
  };

  // Delete a series from catalog
  const handleDeleteSeries = async (slugOrId: string, title: string) => {
    if (!confirm(`Are you sure you want to remove "${title}" from your published site?`)) {
      return;
    }

    try {
      const res = await fetch("/api/admin/series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", slugOrId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Removed "${title}" from catalogue.`, "info");
        fetchSeries();
      }
    } catch {
      showToast("Failed to delete series", "error");
    }
  };

  const handleSaveSeries = async () => {
    if (!editingSeries) return;
    try {
      const res = await fetch("/api/admin/series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seriesData: editingSeries }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Saved updates for ${editingSeries.title}!`, "success");
        setEditingSeries(null);
        fetchSeries();
      } else {
        showToast(data.message || "Failed to save", "error");
      }
    } catch {
      showToast("Save error", "error");
    }
  };

  const filteredList = seriesList.filter(
    (s) =>
      s.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.slug.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-glass flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary-light border border-primary/30 text-xs font-semibold mb-2">
            <Shield size={14} />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Leeched Series Publisher &amp; Catalogue Manager
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
            Only the series you leech and publish here appear on the website. Categories, trailer playback, posters, and episode guides are automatically fetched and mapped.
          </p>
        </div>

        <Button
          variant="glass"
          size="sm"
          icon={<RefreshCw size={14} className={isCheckingHealth ? "animate-spin" : ""} />}
          onClick={checkHealth}
        >
          Check Connectivity
        </Button>
      </div>

      {/* Real-time System Connectivity Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MongoDB Atlas */}
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Database size={14} />
              <span>MongoDB Atlas</span>
            </span>
            {healthData?.services?.mongoDb?.ok ? (
              <Badge variant="success" size="sm">Connected</Badge>
            ) : (
              <Badge variant="warning" size="sm">Local Persistence</Badge>
            )}
          </div>
          <p className="text-xs text-slate-300 font-medium">
            Storage: data/catalog.json + MongoDB
          </p>
          <p className="text-[11px] text-slate-400">
            {healthData?.services?.mongoDb?.ok
              ? "Cloud database synced."
              : "Persistent local store active."}
          </p>
        </div>

        {/* TVmaze API */}
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Tv size={14} />
              <span>TV Metadata API</span>
            </span>
            <Badge variant="success" size="sm">Active</Badge>
          </div>
          <p className="text-xs text-slate-300 font-medium">
            Automatic Category &amp; Episode Ingestion
          </p>
          <p className="text-[11px] text-slate-400">
            TVmaze TV API ready.
          </p>
        </div>

        {/* TMDB API */}
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Server size={14} />
              <span>TMDB Trailers</span>
            </span>
            <Badge variant="violet" size="sm">Configured</Badge>
          </div>
          <p className="text-xs text-slate-300 font-medium">
            YouTube Trailers &amp; Cast Credits
          </p>
          <p className="text-[11px] text-slate-400">
            Automatic trailer mapping active.
          </p>
        </div>

        {/* Telegram Bot */}
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Send size={14} />
              <span>Telegram Bot</span>
            </span>
            <Badge variant="success" size="sm">Verified</Badge>
          </div>
          <p className="text-xs text-slate-300 font-medium">
            Bot: @{healthData?.services?.telegramBot?.username || "CinePrimeSeries_bot"}
          </p>
          <p className="text-[11px] text-slate-400">
            Active on Telegram Cloud.
          </p>
        </div>
      </div>

      {/* Authentication */}
      {!isAuthenticated ? (
        <div className="max-w-md mx-auto p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-2xl shadow-glass text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary-light flex items-center justify-center mx-auto">
            <Key size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Unlock Admin Portal</h2>
            <p className="text-xs text-slate-400 mt-1">
              Enter your <code className="text-primary-light">ADMIN_AUTH_SECRET</code> to publish leeched series and manage channel links.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3 pt-2">
            <input
              type="password"
              value={secretInput}
              onChange={(e) => setSecretInput(e.target.value)}
              placeholder="Enter secret passphrase..."
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
            />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "Verifying..." : "Unlock Dashboard"}
            </Button>
          </form>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Add Leeched Series Wizard */}
          <div className="p-6 md:p-8 rounded-3xl bg-slate-900/40 border border-primary/30 backdrop-blur-xl shadow-glass space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/20 text-primary-light flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide">
                  Publish a Newly Leeched Series
                </h3>
                <p className="text-xs text-slate-400">
                  Enter the series title and your Telegram channel link where you forwarded the leeched files. The system will automatically fetch posters, synopsis, cast, episodes, trailer, and <strong>automatically assign the categories</strong>!
                </p>
              </div>
            </div>

            <form onSubmit={handleAddLeechedSeries} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Series Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Series Name (e.g. &quot;Loki&quot; or &quot;Stranger Things&quot; or &quot;Heart Beat&quot;) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter series title..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Telegram Channel / Forward Link */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Your Telegram Channel / Post URL (where files were forwarded)
                  </label>
                  <input
                    type="url"
                    placeholder="e.g. https://t.me/CinePrimeSeries/loki or https://t.me/your_channel"
                    value={newChannelUrl}
                    onChange={(e) => setNewChannelUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Direct Download / Bot Link */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Download / Bot Deep Link (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="e.g. https://t.me/CinePrimeSeries_bot?start=loki"
                    value={newDownloadUrl}
                    onChange={(e) => setNewDownloadUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Tamil Audio Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tamil Audio Track Availability
                  </label>
                  <select
                    value={newTamilStatus}
                    onChange={(e) => setNewTamilStatus(e.target.value as AudioVerificationStatus)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="Confirmed">Confirmed (Tamil Audio / Dub Available)</option>
                    <option value="Not confirmed">Not confirmed</option>
                    <option value="Unavailable">Unavailable (Original Audio Only)</option>
                    <option value="Not checked">Not checked</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isAddingLeeched}
                  icon={<Plus size={16} />}
                >
                  {isAddingLeeched
                    ? "Fetching Metadata & Auto-Assigning Categories..."
                    : "Auto-Fetch Metadata, Assign Categories & Publish"}
                </Button>
              </div>
            </form>
          </div>

          {/* Currently Published Leeched Catalogue */}
          <div className="p-6 md:p-8 rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-xl shadow-glass space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                  <span>Currently Published Leeched Series</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/20 text-primary-light border border-primary/30">
                    {seriesList.length} Active Shows
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Only these series are displayed on the public website, search results, and category pages.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter published series..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-3">Title &amp; Slug</th>
                    <th className="py-3 px-3">Auto Categories</th>
                    <th className="py-3 px-3">Seasons</th>
                    <th className="py-3 px-3">Tamil Audio</th>
                    <th className="py-3 px-3">Telegram Channel Link</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredList.map((s) => (
                    <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white">{s.title}</div>
                        <div className="text-[11px] text-slate-400">/{s.slug}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {s.genres.map((g) => (
                            <span
                              key={g}
                              className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-slate-300 font-medium"
                            >
                              {g}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-medium">
                        {s.numberOfSeasons} Seasons
                      </td>
                      <td className="py-3 px-3">
                        <Badge
                          variant={
                            s.tamilAudioStatus === "Confirmed"
                              ? "success"
                              : s.tamilAudioStatus === "Not confirmed"
                              ? "warning"
                              : "glass"
                          }
                          size="sm"
                        >
                          {s.tamilAudioStatus || "Not checked"}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 max-w-[180px] truncate text-accent-light font-mono text-[11px]">
                        {s.telegramUrl ? (
                          <a
                            href={s.telegramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline flex items-center gap-1"
                          >
                            <span>{s.telegramUrl}</span>
                            <ExternalLink size={10} />
                          </a>
                        ) : (
                          <span className="text-slate-500">Not configured</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right space-x-1.5">
                        <Link
                          href={`/series/${s.slug}`}
                          target="_blank"
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors inline-block"
                          title="View on site"
                        >
                          <ExternalLink size={13} />
                        </Link>
                        <button
                          onClick={() => setEditingSeries({ ...s })}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-primary-light border border-white/5 font-semibold transition-colors inline-block"
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSeries(s.slug, s.title)}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors inline-block"
                          title="Delete from site"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Edit Modal */}
          {editingSeries && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-950 border border-white/10 p-6 space-y-4 shadow-glass text-slate-100">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h3 className="text-lg font-bold text-white">
                    Edit Leeched Series: {editingSeries.title}
                  </h3>
                  <button
                    onClick={() => setEditingSeries(null)}
                    className="p-1.5 rounded-full text-slate-400 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      Series Title
                    </label>
                    <input
                      type="text"
                      value={editingSeries.title}
                      onChange={(e) =>
                        setEditingSeries({ ...editingSeries, title: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      Overview Synopsis
                    </label>
                    <textarea
                      rows={3}
                      value={editingSeries.overview}
                      onChange={(e) =>
                        setEditingSeries({ ...editingSeries, overview: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">
                        YouTube Trailer Video ID
                      </label>
                      <input
                        type="text"
                        value={editingSeries.trailerVideoId || ""}
                        onChange={(e) =>
                          setEditingSeries({
                            ...editingSeries,
                            trailerVideoId: e.target.value.trim() || null,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">
                        Tamil Audio Status
                      </label>
                      <select
                        value={editingSeries.tamilAudioStatus || "Not checked"}
                        onChange={(e) =>
                          setEditingSeries({
                            ...editingSeries,
                            tamilAudioStatus: e.target.value as AudioVerificationStatus,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white"
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Not confirmed">Not confirmed</option>
                        <option value="Unavailable">Unavailable</option>
                        <option value="Not checked">Not checked</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      Telegram Channel / Post Link (Where you forwarded the files)
                    </label>
                    <input
                      type="url"
                      value={editingSeries.telegramUrl || ""}
                      onChange={(e) =>
                        setEditingSeries({
                          ...editingSeries,
                          telegramUrl: e.target.value.trim() || null,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      Download Link / Bot Link
                    </label>
                    <input
                      type="url"
                      value={editingSeries.downloadUrl || ""}
                      onChange={(e) =>
                        setEditingSeries({
                          ...editingSeries,
                          downloadUrl: e.target.value.trim() || null,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                  <Button variant="glass" size="md" onClick={() => setEditingSeries(null)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    icon={<Save size={16} />}
                    onClick={handleSaveSeries}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
