"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Leaf,
  Route,
  Star,
  Calendar,
  Trash2,
  ArrowUpRight,
  Award,
  Search,
  Download,
  Filter,
  Sparkles,
  Bike,
  Bus,
  Footprints,
  Car,
} from "lucide-react";
import Guard from "@/components/guard";
import { useSession } from "@/components/session";
import { useToast } from "@/components/toast";
import { api, ApiError, Trip, User } from "@/lib/api";
import ImpactChart from "@/components/impact-chart";
import EcoEquivalents from "@/components/eco-equivalents";

export default function History() {
  return (
    <Guard>
      <Impact />
    </Guard>
  );
}

function Impact() {
  const { user, setUser } = useSession();
  const { toast } = useToast();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState("");
  const [removing, setRemoving] = useState(false);
  const [filterMode, setFilterMode] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const load = useCallback(
    () =>
      api<Trip[]>("/user/trips")
        .then((history) => {
          setTrips(history);
          setError("");
        })
        .catch((e) => {
          if (e instanceof ApiError && e.status === 401) setUser(null);
          setError(e instanceof Error ? e.message : "Unable to load trips.");
        })
        .finally(() => setLoading(false)),
    [setUser],
  );

  useEffect(() => {
    void load();
  }, [load]);

  async function remove(id: string) {
    setRemoving(true);
    try {
      const updatedUser = await api<User>(`/user/trips/${id}`, { method: "DELETE" });
      setUser(updatedUser);
      setTrips((t) => t.filter((x) => x._id !== id));
      setPending("");
      setError("");
      toast("Trip deleted and impact stats updated", "info");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unable to delete trip.";
      setError(msg);
      toast(msg, "error");
    } finally {
      setRemoving(false);
    }
  }

  function exportCSV() {
    if (!trips.length) return;
    const headers = ["Date", "From", "To", "Mode", "Distance (km)", "CO2 Avoided (kg)", "Eco Points"];
    const rows = trips.map((t) => [
      new Date(t.createdAt).toLocaleDateString(),
      `"${t.source.replace(/"/g, '""')}"`,
      `"${t.destination.replace(/"/g, '""')}"`,
      t.mode,
      t.distanceKm,
      t.co2Saved.toFixed(2),
      t.ecoPoints || Math.round(t.co2Saved * 100),
    ]);
    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `green_commute_impact_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Impact report CSV downloaded!", "success");
  }

  if (!user) return null;

  const stats = [
    { icon: Route, value: user.totalTrips, label: "Journeys Completed", color: "var(--emerald)" },
    { icon: Leaf, value: `${user.co2Saved.toFixed(2)} kg`, label: "Estimated CO₂ Avoided", color: "#10b981" },
    { icon: Star, value: user.ecoPoints.toLocaleString(), label: "Eco Points Earned", color: "#f59e0b" },
    { icon: Calendar, value: user.daysActive, label: "Active Days Recorded", color: "#06b6d4" },
  ];

  const badges = [
    {
      name: "First Step",
      hint: "Complete 1 trip",
      unlocked: user.totalTrips >= 1,
      progress: Math.min(100, (user.totalTrips / 1) * 100),
    },
    {
      name: "Habit Builder",
      hint: "Complete 10 trips",
      unlocked: user.totalTrips >= 10,
      progress: Math.min(100, (user.totalTrips / 10) * 100),
    },
    {
      name: "Carbon Saver",
      hint: "Avoid 5 kg of CO₂",
      unlocked: user.co2Saved >= 5,
      progress: Math.min(100, (user.co2Saved / 5) * 100),
    },
    {
      name: "Green Champion",
      hint: "Earn 1,000 points",
      unlocked: user.ecoPoints >= 1000,
      progress: Math.min(100, (user.ecoPoints / 1000) * 100),
    },
  ];

  const modeIcons: Record<string, typeof Bike> = {
    bike: Bike,
    transit: Bus,
    walk: Footprints,
    car: Car,
  };

  const filteredTrips = trips.filter((t) => {
    const matchesMode = filterMode === "all" || t.mode === filterMode;
    const matchesSearch =
      !searchQuery ||
      t.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.destination.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMode && matchesSearch;
  });

  return (
    <div className="wrap impact-page">
      <header className="page-heading">
        <div className="eyebrow-pill">
          <Sparkles size={14} className="text-emerald" /> SMALL CHOICES • GROWING DIFFERENCE
        </div>
        <h1>Your Everyday Impact</h1>
        <p>Every journey you record is another step towards cleaner, healthier cities.</p>
      </header>

      {/* STAT CARDS GRID */}
      <div className="stat-grid">
        {stats.map(({ icon: Icon, value, label, color }) => (
          <article className="stat-card" key={label}>
            <div className="stat-card-icon-box" style={{ color }}>
              <Icon size={22} />
            </div>
            <strong>{value}</strong>
            <span>{label}</span>
          </article>
        ))}
      </div>

      {/* WEEKLY IMPACT TREND CHART */}
      <section className="impact-chart-section">
        <ImpactChart trips={trips} co2SavedTotal={user.co2Saved} />
      </section>

      {/* CARBON EQUIVALENTS WIDGET */}
      <section className="impact-equivalents-section">
        <EcoEquivalents co2SavedKg={user.co2Saved || 8.4} />
      </section>

      {/* ACHIEVEMENTS & BADGES */}
      <section className="achievement-section">
        <div className="achievement-heading">
          <div className="eyebrow-pill">
            <Award size={14} className="text-emerald" /> MILESTONES & REWARDS
          </div>
          <h2>Achievement Badges</h2>
          <p>
            Earn 100 Eco Points for every 1.0 kg of CO₂ avoided. Track your progress to unlock milestones.
          </p>
        </div>

        <div className="badges-grid">
          {badges.map((b) => (
            <div
              className={`badge-card ${b.unlocked ? "unlocked" : "locked"}`}
              key={b.name}
            >
              <div className="badge-icon-wrapper">
                <Award size={26} />
              </div>
              <strong>{b.name}</strong>
              <span className="badge-status">
                {b.unlocked ? "Unlocked 🎉" : b.hint}
              </span>
              <div className="badge-progress-bar">
                <div
                  className="badge-progress-fill"
                  style={{ width: `${b.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TRIP HISTORY LIST SECTION */}
      <section className="history-section">
        <div className="section-heading flex-between">
          <div>
            <span className="eyebrow">YOUR JOURNEY LOG</span>
            <h2>Trip History</h2>
          </div>
          <div className="history-heading-actions">
            {trips.length > 0 && (
              <button type="button" className="button secondary button-sm" onClick={exportCSV}>
                <Download size={15} /> Export CSV
              </button>
            )}
            <Link href="/plan" className="button button-sm">
              Plan New Trip <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>

        {/* SEARCH & FILTER STRIP */}
        <div className="history-controls-bar">
          <div className="search-input-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search trips by location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-chips">
            <span className="filter-label"><Filter size={13} /> Mode:</span>
            {["all", "bike", "transit", "walk", "car"].map((m) => (
              <button
                key={m}
                type="button"
                className={`filter-chip ${filterMode === m ? "active" : ""}`}
                onClick={() => setFilterMode(m)}
              >
                {m === "all" ? "All" : m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="notice error" role="alert">
            {error}
            <button onClick={() => void load()} className="retry-btn">Retry</button>
          </div>
        )}

        {loading ? (
          <div className="results-empty">
            <div className="loading-orbit">
              <Leaf size={32} className="spinning-leaf" />
            </div>
            <p>Loading your commute history...</p>
          </div>
        ) : filteredTrips.length ? (
          <div className="trip-list">
            {filteredTrips.map((t) => {
              const Icon = modeIcons[t.mode] || Route;
              return (
                <article className="trip-row" key={t._id}>
                  <div className="trip-symbol">
                    <Icon size={20} />
                  </div>
                  <div className="trip-detail">
                    <h3>
                      {t.source} <span className="arrow-sep">→</span> {t.destination}
                    </h3>
                    <p>
                      {new Date(t.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      ·{" "}
                      <span className="mode-badge-text">
                        {
                          (
                            {
                              car: "Drive",
                              bike: "Cycle",
                              transit: "Public Transport",
                              walk: "Walk",
                            } as Record<string, string>
                          )[t.mode] || t.mode
                        }
                      </span>{" "}
                      · {t.distanceKm} km
                    </p>
                  </div>

                  <strong className="trip-saving">
                    −{t.co2Saved.toFixed(2)} kg
                    <span className="trip-saving-label">estimated CO₂ avoided</span>
                  </strong>

                  {pending === t._id ? (
                    <div className="delete-confirm">
                      <span>Delete?</span>
                      <button
                        disabled={removing}
                        className="delete-yes-btn"
                        onClick={() => void remove(t._id)}
                      >
                        Delete
                      </button>
                      <button disabled={removing} className="delete-no-btn" onClick={() => setPending("")}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      className="icon-button delete-icon-btn"
                      aria-label={`Delete trip from ${t.source}`}
                      title="Delete trip"
                      onClick={() => setPending(t._id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="history-empty">
            <Leaf size={36} className="text-emerald" />
            <h3>{trips.length === 0 ? "Your story starts with your first trip." : "No matching trips found."}</h3>
            <p>
              {trips.length === 0
                ? "Calculate and log a completed commute from the planner to track your progress here."
                : "Try clearing your search or mode filter to view all trips."}
            </p>
            <Link href="/plan" className="button">
              Plan Your First Trip <ArrowUpRight size={16} />
            </Link>
          </div>
        )}

        <p className="small-note">
          Displaying your latest trips. Cumulative stats reflect all logged journeys. Deleting a trip updates your personal CO₂ total and points balance.
        </p>
      </section>
    </div>
  );
}
