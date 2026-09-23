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
} from "lucide-react";
import Link from "next/link";
import Guard from "@/components/guard";
import { useSession } from "@/components/session";
import { api, ApiError, Comparison, RouteOption, User } from "@/lib/api";
const icons: Record<string, typeof Bike> = {
  car: Car,
  transit: Bus,
  bike: Bike,
  walk: Footprints,
};
export default function Plan() {
  const { user, setUser } = useSession();
  const [source, setSource] = useState(""),
    [destination, setDestination] = useState(""),
    [manual, setManual] = useState(false),
    [distance, setDistance] = useState("");
  const [result, setResult] = useState<Comparison | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [saving, setSaving] = useState(false),
    [saved, setSaved] = useState(""),
    [sort, setSort] = useState("green");
  function failure(e: unknown) {
    if (e instanceof ApiError && e.status === 401) setUser(null);
    setError(e instanceof Error ? e.message : "Please try again.");
  }
  async function search(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSaved("");
    setResult(null);
    try {
      setResult(
        await api<Comparison>("/commute/calculate", {
          method: "POST",
          body: JSON.stringify({
            source,
            destination,
            ...(manual ? { distanceKm: Number(distance) } : {}),
          }),
        }),
      );
    } catch (e) {
      failure(e);
    } finally {
      setBusy(false);
    }
  }
  async function log(route: RouteOption) {
    if (!result || saving || saved) return;
    setSaving(true);
    setError("");
    try {
      setUser(
        await api<User>("/user/select-route", {
          method: "POST",
          body: JSON.stringify({ quote: result.quote, mode: route.mode }),
        }),
      );
      setSaved(route.label);
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
          : a.emissionsKg - b.emissionsKg ||
            a.durationMinutes - b.durationMinutes,
      )
    : [];
  return (
    <Guard>
      <div className="wrap planner">
        <header className="page-heading">
          <span className="eyebrow">MAKE TODAY’S JOURNEY A LITTLE GREENER</span>
          <h1>Where to, {user?.name.split(" ")[0]}?</h1>
          <p>A thoughtful commute starts with a simple comparison.</p>
        </header>
        <div className="planner-layout">
          <section className="planner-form panel">
            <div className="panel-heading">
              <MapPin size={21} />
              <h2>Your journey</h2>
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
                    placeholder="Area or landmark, city"
                  />
                </label>
                <button
                  type="button"
                  className="swap-button"
                  aria-label="Swap starting point and destination"
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
                    placeholder="Where are you headed?"
                  />
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={manual}
                    onChange={(e) => setManual(e.target.checked)}
                  />{" "}
                  I already know the distance
                </label>
                {manual && (
                  <label>
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
                <button className="button full" disabled={busy || saving}>
                  {busy ? "Finding your journey…" : "Compare my options"}{" "}
                  <ArrowUpRight size={18} />
                </button>
              </fieldset>
            </form>
            <p className="small-note">
              {manual
                ? "Your distance is used for every mode. All results are estimates."
                : "Include your city for a closer match. Location searches are sent to OpenStreetMap and OSRM."}
            </p>
          </section>
          <section className="results" aria-live="polite">
            {error && (
              <p role="alert" className="notice error">
                {error}
              </p>
            )}
            {saved && (
              <div className="notice success">
                <Check size={19} />
                <div>
                  {saved} trip logged. Your impact is up to date.{" "}
                  <Link href="/history">View my trips →</Link>
                </div>
              </div>
            )}
            {busy ? (
              <div className="results-empty">
                <div className="loading-orbit">
                  <Leaf size={32} />
                </div>
                <h2>Finding a better way.</h2>
                <p>Looking up your journey. This can take a few seconds.</p>
              </div>
            ) : result ? (
              <>
                <div className="result-heading">
                  <div>
                    <span className="eyebrow">YOUR COMMUTE, COMPARED</span>
                    <h2>{result.routes[0].distanceKm} km of possibilities</h2>
                  </div>
                  <label className="sort-label">
                    Sort by
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                    >
                      <option value="green">Lowest carbon</option>
                      <option value="time">Shortest time</option>
                    </select>
                  </label>
                </div>
                <p className="resolved-route">
                  <strong>From</strong> {result.source}
                  <br />
                  <strong>To</strong> {result.destination}
                </p>
                <div className="route-grid">
                  {sorted.map((route) => {
                    const Icon = icons[route.mode];
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
                              Low-carbon pick
                            </span>
                          )}
                        </div>
                        <h3>{route.label}</h3>
                        <div className="route-time">
                          {route.durationMinutes}
                          <span> min · estimated</span>
                        </div>
                        <div className="route-metrics">
                          <span>
                            Estimated CO₂{" "}
                            <strong>{route.emissionsKg.toFixed(2)} kg</strong>
                          </span>
                          <span>
                            vs. driving alone{" "}
                            <strong className="green">
                              −{route.co2Saved.toFixed(2)} kg
                            </strong>
                          </span>
                        </div>
                        <button
                          className="button secondary full"
                          disabled={saving || !!saved}
                          onClick={() => void log(route)}
                        >
                          {saved
                            ? "Journey logged"
                            : saving
                              ? "Saving…"
                              : "I completed this trip"}
                          <Check size={16} />
                        </button>
                      </article>
                    );
                  })}
                </div>
                <div className="method-note">
                  <Leaf size={19} />
                  <p>
                    <strong>A comparison, not turn-by-turn directions.</strong>{" "}
                    {result.basis === "road"
                      ? "Uses a driving road distance from OSRM. Walking, cycling and transit may follow different routes."
                      : "Uses the distance you provided."}{" "}
                    Transit availability is not verified. Time estimates exclude
                    live traffic. CO₂ uses illustrative per-km factors: car
                    0.171 kg, transit 0.060 kg, cycle/walk 0 tailpipe emissions.
                    Check a navigation app before traveling. Only log a trip
                    after completing it.
                  </p>
                </div>
              </>
            ) : (
              <div className="results-empty">
                <div className="empty-icon">
                  <RouteIllustration />
                </div>
                <span className="eyebrow">THE FIRST STEP IS A SIMPLE ONE</span>
                <h2>
                  Good things are just
                  <br />a journey away.
                </h2>
                <p>
                  Tell us where you’re going.
                  <br />
                  We’ll help you compare the possibilities.
                </p>
                <div className="empty-modes">
                  <Footprints />
                  <Bike />
                  <Bus />
                  <Car />
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </Guard>
  );
}
function RouteIllustration() {
  return (
    <svg viewBox="0 0 140 100" width="140" height="100" aria-hidden="true">
      <path
        d="M20 75C110 95 35 10 120 25"
        fill="none"
        stroke="#39775b"
        strokeWidth="3"
        strokeDasharray="6 6"
      />
      <circle cx="20" cy="75" r="9" fill="#39775b" />
      <circle
        cx="120"
        cy="25"
        r="9"
        fill="#d4e598"
        stroke="#39775b"
        strokeWidth="3"
      />
    </svg>
  );
}
