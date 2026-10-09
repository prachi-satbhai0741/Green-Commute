"use client";

import { useState } from "react";
import {
  ArrowDownUp,
  ArrowUpRight,
  Bike,
  Bus,
  Car,
  Check,
  Footprints,
  Leaf,
  MapPin,
  Sparkles,
  Zap,
  Filter,
  Navigation,
} from "lucide-react";
import Link from "next/link";
import Guard from "@/components/guard";
import { useSession } from "@/components/session";
import { useToast } from "@/components/toast";
import { api, ApiError, Comparison, RouteOption, User } from "@/lib/api";
import RouteMapVisualizer from "@/components/route-map-visualizer";
import EcoEquivalents from "@/components/eco-equivalents";

const icons: Record<string, typeof Bike> = {
  car: Car,
  transit: Bus,
  bike: Bike,
  walk: Footprints,
};

const presets = [
  { label: "Office Commute", source: "Greenwich High St", destination: "Tech City Campus", km: 7.5 },
  { label: "University Loop", source: "North Residence Hall", destination: "Science Library", km: 3.2 },
  { label: "Weekend Market", source: "Oakwood Neighborhood", destination: "Farmers Market", km: 4.8 },
];

export default function Plan() {
  const { user, setUser } = useSession();
  const { toast } = useToast();
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [manual, setManual] = useState(false);
  const [distance, setDistance] = useState("");

  const [result, setResult] = useState<Comparison | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState("");
  const [sort, setSort] = useState("green");

  function failure(e: unknown) {
    if (e instanceof ApiError && e.status === 401) setUser(null);
    const msg = e instanceof Error ? e.message : "Please try again.";
    setError(msg);
    toast(msg, "error");
  }

  async function search(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSaved("");
    setResult(null);
    try {
      const data = await api<Comparison>("/commute/calculate", {
        method: "POST",
        body: JSON.stringify({
          source,
          destination,
          ...(manual ? { distanceKm: Number(distance) } : {}),
        }),
      });
      setResult(data);
      toast("Commute calculated successfully!", "success");
    } catch (e) {
      failure(e);
    } finally {
      setBusy(false);
    }
  }

  function applyPreset(preset: typeof presets[0]) {
    setSource(preset.source);
    setDestination(preset.destination);
    setManual(true);
    setDistance(String(preset.km));
  }

  async function log(route: RouteOption) {
    if (!result || saving || saved) return;
    setSaving(true);
    setError("");
    try {
      const updatedUser = await api<User>("/user/select-route", {
        method: "POST",
        body: JSON.stringify({ quote: result.quote, mode: route.mode }),
      });
      setUser(updatedUser);
      setSaved(route.label);
      toast(`Trip logged! +${Math.round(route.co2Saved * 100)} Eco Points earned 🎉`, "success");
    } catch (e) {
      failure(e);
    } finally {
      setSaving(false);
    }
  }

  const sorted = result
    ? [...result.routes].sort((a, b) =>
        sort === "time"
          ? a.durationMinutes - b.durationMinutes
          : a.emissionsKg - b.emissionsKg || a.durationMinutes - b.durationMinutes
      )
    : [];

  const maxEmissions = result ? Math.max(...result.routes.map((r) => r.emissionsKg), 0.1) : 1;

  return (
    <Guard>
      <div className="wrap planner-page">
        <header className="page-heading">
          <div className="eyebrow-pill">
            <Sparkles size={14} className="text-emerald" /> MAKE TODAY&apos;S JOURNEY GREENER
          </div>
          <h1>Where to, {user?.name.split(" ")[0]}?</h1>
          <p>Compare commute travel options side by side and log your lighter footprint.</p>
        </header>

        {/* Quick Presets Bar */}
        <div className="presets-bar">
          <span className="presets-label">Quick Presets:</span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              className="preset-btn"
              onClick={() => applyPreset(p)}
            >
              <Navigation size={13} /> {p.label} ({p.km} km)
            </button>
          ))}
        </div>

        <div className="planner-layout">
          {/* Planner Input Form Panel */}
          <section className="planner-form panel">
            <div className="panel-heading">
              <MapPin size={22} className="text-emerald" />
              <h2>Plan Your Route</h2>
            </div>
            <form onSubmit={search}>
              <fieldset disabled={busy || saving}>
                <label>
                  Starting point
                  <input
                    required
                    maxLength={200}
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="e.g. 10 Downing St, London"
                  />
                </label>

                <button
                  type="button"
                  className="swap-button"
                  aria-label="Swap starting point and destination"
                  title="Swap locations"
                  onClick={() => {
                    setSource(destination);
                    setDestination(source);
                  }}
                >
                  <ArrowDownUp size={16} />
                </button>

                <label>
                  Destination
                  <input
                    required
                    maxLength={200}
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Hyde Park, London"
                  />
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={manual}
                    onChange={(e) => setManual(e.target.checked)}
                  />
                  <span>I already know the distance in km</span>
                </label>

                {manual && (
                  <label className="manual-distance-field">
                    One-way distance (km)
                    <input
                      type="number"
                      required
                      min="0.1"
                      max="500"
                      step="0.1"
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                      placeholder="e.g. 8.5"
                    />
                  </label>
                )}

                <button className="button button-lg full" disabled={busy || saving}>
                  {busy ? "Calculating options…" : "Compare Travel Options"}
                  <ArrowUpRight size={18} />
                </button>
              </fieldset>
            </form>
            <p className="small-note">
              {manual
                ? "Calculations use your specified distance for all modes."
                : "Geocoding powered by OpenStreetMap & OSRM routing."}
            </p>
          </section>

          {/* Results Area */}
          <section className="results" aria-live="polite">
            {error && (
              <div role="alert" className="notice error">
                {error}
              </div>
            )}

            {saved && (
              <div className="notice success">
                <Check size={20} />
                <div>
                  <strong>{saved} trip logged!</strong> Your impact history and eco points have been updated.{" "}
                  <Link href="/history" className="text-link underline">
                    View My Impact →
                  </Link>
                </div>
              </div>
            )}

            {busy ? (
              <div className="results-empty">
                <div className="loading-orbit">
                  <Leaf size={36} className="spinning-leaf" />
                </div>
                <h2>Finding cleaner paths…</h2>
                <p>Retrieving distance data and calculating emissions. Please wait a moment.</p>
              </div>
            ) : result ? (
              <>
                <div className="result-heading">
                  <div>
                    <span className="eyebrow">YOUR COMMUTE COMPARED</span>
                    <h2>{result.routes[0].distanceKm} km Journey Options</h2>
                  </div>
                  <label className="sort-label">
                    <Filter size={14} /> Sort By
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                    >
                      <option value="green">Lowest CO₂ (Greener Pick)</option>
                      <option value="time">Shortest Duration</option>
                    </select>
                  </label>
                </div>

                <p className="resolved-route">
                  <strong>From:</strong> {result.source} &nbsp;→&nbsp; <strong>To:</strong> {result.destination}
                </p>

                {/* Map Visualizer for the calculated route */}
                <RouteMapVisualizer
                  source={result.source}
                  destination={result.destination}
                  distanceKm={result.routes[0].distanceKm}
                  selectedMode={sorted[0]?.mode}
                />

                {/* Route Cards */}
                <div className="route-grid">
                  {sorted.map((route) => {
                    const Icon = icons[route.mode] || Bike;
                    const emissionPercent = (route.emissionsKg / maxEmissions) * 100;
                    return (
                      <article
                        key={route.mode}
                        className={`route-card ${route.recommended ? "recommended" : ""}`}
                      >
                        <div className="route-top">
                          <span className="mode-icon">
                            <Icon size={24} />
                          </span>
                          {route.recommended && (
                            <span className="recommend-tag">
                              <Sparkles size={12} /> Low Carbon Pick
                            </span>
                          )}
                        </div>

                        <h3>{route.label}</h3>
                        <div className="route-time">
                          {route.durationMinutes} <span className="time-unit">mins est.</span>
                        </div>

                        {/* CO2 Emissions Progress Visualizer */}
                        <div className="emissions-bar-box">
                          <div className="emissions-bar-labels">
                            <span>CO₂ Emissions</span>
                            <strong>{route.emissionsKg.toFixed(2)} kg</strong>
                          </div>
                          <div className="emissions-track">
                            <div
                              className="emissions-fill"
                              style={{
                                width: `${Math.max(5, emissionPercent)}%`,
                                backgroundColor: route.emissionsKg === 0 ? "var(--emerald)" : route.emissionsKg < 0.5 ? "var(--cyan)" : "var(--amber)",
                              }}
                            />
                          </div>
                        </div>

                        <div className="route-metrics">
                          <span>
                            vs. solo driving:
                            <strong className="green-text">
                              −{route.co2Saved.toFixed(2)} kg CO₂
                            </strong>
                          </span>
                          <span>
                            Points to earn:
                            <strong className="text-amber">
                              +{Math.round(route.co2Saved * 100)} pts
                            </strong>
                          </span>
                        </div>

                        <button
                          type="button"
                          className={`button full ${route.recommended ? "button-accent" : "secondary"}`}
                          disabled={saving || !!saved}
                          onClick={() => void log(route)}
                        >
                          {saved === route.label
                            ? "Completed & Logged"
                            : saving
                            ? "Saving Trip…"
                            : "I Completed This Trip"}
                          <Check size={16} />
                        </button>
                      </article>
                    );
                  })}
                </div>

                {/* Real-time Equivalents Card */}
                {sorted[0] && (
                  <div className="route-equivalents-wrapper">
                    <EcoEquivalents co2SavedKg={sorted[0].co2Saved} />
                  </div>
                )}

                <div className="method-note">
                  <Leaf size={20} className="text-emerald" />
                  <p>
                    <strong>Emissions & Method Note:</strong>{" "}
                    {result.basis === "road"
                      ? "Distance is derived from OSRM road geometry. Actual walking, cycling, or transit routes may vary."
                      : "Distance provided manually by user."}{" "}
                    Factors: Car ~0.171 kg CO₂/km, Transit ~0.060 kg CO₂/km, Cycle & Walk 0 tailpipe emissions. Always verify transit schedules and safety conditions before traveling.
                  </p>
                </div>
              </>
            ) : (
              <div className="results-empty">
                <div className="empty-icon-wrapper">
                  <Leaf size={48} className="text-emerald" />
                </div>
                <span className="eyebrow">YOUR JOURNEY AWAITS</span>
                <h2>Good things start with a single trip</h2>
                <p>
                  Enter your starting point and destination on the left to compare carbon emissions, estimated times, and earn eco rewards.
                </p>
                <div className="empty-modes-row">
                  <div className="empty-mode-chip"><Footprints size={18} /> Walk</div>
                  <div className="empty-mode-chip"><Bike size={18} /> Bike</div>
                  <div className="empty-mode-chip"><Bus size={18} /> Transit</div>
                  <div className="empty-mode-chip"><Car size={18} /> Car</div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </Guard>
  );
}
