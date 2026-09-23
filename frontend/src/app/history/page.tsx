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
} from "lucide-react";
import Guard from "@/components/guard";
import { useSession } from "@/components/session";
import { api, ApiError, Trip, User } from "@/lib/api";
export default function History() {
  return (
    <Guard>
      <Impact />
    </Guard>
  );
}
function Impact() {
  const { user, setUser } = useSession();
  const [trips, setTrips] = useState<Trip[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [pending, setPending] = useState(""),
    [removing, setRemoving] = useState(false);
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
      setUser(await api<User>(`/user/trips/${id}`, { method: "DELETE" }));
      setTrips((t) => t.filter((x) => x._id !== id));
      setPending("");
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to delete trip.");
    } finally {
      setRemoving(false);
    }
  }
  if (!user) return null;
  const stats = [
    { icon: Route, value: user.totalTrips, label: "Journeys completed" },
    {
      icon: Leaf,
      value: `${user.co2Saved.toFixed(2)} kg`,
      label: "Estimated CO₂ avoided",
    },
    { icon: Star, value: user.ecoPoints, label: "Eco points earned" },
    { icon: Calendar, value: user.daysActive, label: "Active days (UTC)" },
  ];
  const badges = [
    {
      name: "First step",
      hint: "Complete 1 trip",
      unlocked: user.totalTrips >= 1,
    },
    {
      name: "Habit builder",
      hint: "Complete 10 trips",
      unlocked: user.totalTrips >= 10,
    },
    {
      name: "Carbon saver",
      hint: "Avoid 5 kg of CO₂",
      unlocked: user.co2Saved >= 5,
    },
    {
      name: "Green champion",
      hint: "Earn 1,000 points",
      unlocked: user.ecoPoints >= 1000,
    },
  ];
  return (
    <div className="wrap impact-page">
      <header className="page-heading">
        <span className="eyebrow">SMALL CHOICES. A GROWING DIFFERENCE.</span>
        <h1>Your everyday impact.</h1>
        <p>Every journey is another step in the right direction.</p>
      </header>
      <div className="stat-grid">
        {stats.map(({ icon: Icon, value, label }) => (
          <article className="stat-card" key={label}>
            <Icon size={21} />
            <strong>{value}</strong>
            <span>{label}</span>
          </article>
        ))}
      </div>
      <section className="achievement-section">
        <div>
          <span className="eyebrow">MILESTONES ALONG THE WAY</span>
          <h2>A little recognition.</h2>
          <p>
            100 eco points for each estimated kg of CO₂ avoided. Points are
            personal milestones with no cash value.
          </p>
        </div>
        <div className="badges">
          {badges.map((b) => (
            <div
              className={`badge ${b.unlocked ? "unlocked" : ""}`}
              key={b.name}
            >
              <Award size={29} />
              <strong>{b.name}</strong>
              <span>
                {b.unlocked ? "Unlocked · " : ""}
                {b.hint}
              </span>
            </div>
          ))}
        </div>
      </section>
      <section className="history-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">YOUR JOURNEYS, ALL IN ONE PLACE</span>
            <h2>Trip history</h2>
          </div>
          <Link href="/plan" className="button">
            Plan a trip <ArrowUpRight size={18} />
          </Link>
        </div>
        {error && (
          <div className="notice error" role="alert">
            {error}
            <button onClick={() => void load()}>Retry</button>
          </div>
        )}
        {loading ? (
          <p role="status">Loading your trips…</p>
        ) : trips.length ? (
          <div className="trip-list">
            {trips.map((t) => (
              <article className="trip-row" key={t._id}>
                <div className="trip-symbol">
                  <Route size={21} />
                </div>
                <div className="trip-detail">
                  <h3>
                    {t.source} <span>→</span> {t.destination}
                  </h3>
                  <p>
                    {new Date(t.createdAt).toLocaleDateString()} ·{" "}
                    {
                      (
                        {
                          car: "Drive",
                          bike: "Cycle",
                          transit: "Public transport",
                          walk: "Walk",
                        } as Record<string, string>
                      )[t.mode]
                    }{" "}
                    · {t.distanceKm} km ·{" "}
                    {t.basis === "manual"
                      ? "Provided distance"
                      : "Road-distance estimate"}
                  </p>
                </div>
                <strong className="trip-saving">
                  −{t.co2Saved.toFixed(2)} kg<span>estimated CO₂</span>
                </strong>
                {pending === t._id ? (
                  <div className="delete-confirm">
                    <span>Delete this trip?</span>
                    <button
                      disabled={removing}
                      onClick={() => void remove(t._id)}
                    >
                      Delete
                    </button>
                    <button disabled={removing} onClick={() => setPending("")}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    className="icon-button"
                    aria-label={`Delete trip from ${t.source}`}
                    onClick={() => setPending(t._id)}
                  >
                    <Trash2 size={17} />
                  </button>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="history-empty">
            <Leaf size={32} />
            <h3>Your story starts with the next trip.</h3>
            <p>Log a completed journey from the planner to see it here.</p>
            <Link href="/plan" className="text-link">
              Plan your first trip →
            </Link>
          </div>
        )}
        <p className="small-note">
          Showing your latest 100 trips. Totals include all logged trips. Impact
          is self-reported and estimated against driving alone; deleting a trip
          updates your totals and milestones.
        </p>
      </section>
    </div>
  );
}
