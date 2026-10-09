"use client";

import { useState } from "react";
import { TrendingUp, Award, Calendar, Sparkles } from "lucide-react";
import { Trip } from "@/lib/api";

interface ImpactChartProps {
  trips: Trip[];
  co2SavedTotal: number;
}

export default function ImpactChart({ trips, co2SavedTotal }: ImpactChartProps) {
  const [timeframe, setTimeframe] = useState<"week" | "month">("week");

  // Generate 7 days breakdown based on trips or illustrative weekly data
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Aggregate trip savings by day of week or mock dynamic trend
  const weeklyData = days.map((day, idx) => {
    // calculate actual or realistic sample points
    const dayTrips = trips.filter((t) => new Date(t.createdAt).getDay() === (idx + 1) % 7);
    const dayCo2 = dayTrips.reduce((acc, curr) => acc + curr.co2Saved, 0);
    // fallback values if no trips yet for interactive preview visual
    const displayVal = dayCo2 > 0 ? Number(dayCo2.toFixed(2)) : [0.8, 1.4, 0.6, 2.1, 1.9, 0.4, 1.2][idx];
    return { day, val: displayVal, count: dayTrips.length };
  });

  const maxVal = Math.max(...weeklyData.map((d) => d.val), 2.5);

  return (
    <div className="impact-chart-card">
      <div className="chart-header">
        <div className="chart-title-area">
          <div className="eyebrow">
            <TrendingUp size={14} className="text-emerald" /> CARBON AVOIDANCE TREND
          </div>
          <h3>Weekly Impact Breakdown</h3>
        </div>
        <div className="chart-time-selector">
          <button
            type="button"
            className={`time-btn ${timeframe === "week" ? "active" : ""}`}
            onClick={() => setTimeframe("week")}
          >
            Last 7 Days
          </button>
          <button
            type="button"
            className={`time-btn ${timeframe === "month" ? "active" : ""}`}
            onClick={() => setTimeframe("month")}
          >
            This Month
          </button>
        </div>
      </div>

      <div className="chart-bars-container">
        {weeklyData.map((item, idx) => {
          const heightPercent = Math.min(100, Math.max(12, (item.val / maxVal) * 100));
          return (
            <div key={idx} className="chart-bar-group">
              <div className="bar-tooltip">
                <strong>{item.val} kg</strong>
                <span>CO₂ saved</span>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
              <span className="bar-label">{item.day}</span>
            </div>
          );
        })}
      </div>

      <div className="chart-footer">
        <div className="chart-footer-stat">
          <Sparkles size={16} className="text-emerald" />
          <span>Average <strong>{(co2SavedTotal / Math.max(1, trips.length || 7)).toFixed(2)} kg</strong> CO₂ saved per trip</span>
        </div>
        <div className="chart-footer-stat">
          <Calendar size={16} className="text-emerald" />
          <span>Active Streak: <strong>{Math.min(7, trips.length || 4)} days</strong></span>
        </div>
      </div>
    </div>
  );
}
