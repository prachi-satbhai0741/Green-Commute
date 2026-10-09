"use client";

import { useState } from "react";
import { TreePine, Smartphone, Car, Zap, Sparkles } from "lucide-react";

interface EcoEquivalentsProps {
  co2SavedKg?: number;
}

export default function EcoEquivalents({ co2SavedKg = 12.5 }: EcoEquivalentsProps) {
  const [activeTab, setActiveTab] = useState<"trees" | "phones" | "driving" | "energy">("trees");

  const equivalents = {
    trees: {
      title: "Tree Absorption",
      value: (co2SavedKg * 18.25).toFixed(1),
      unit: "Tree-Days",
      desc: `Avoiding ${co2SavedKg.toFixed(1)} kg CO₂ provides equivalent carbon absorption to 1 mature tree growing for ${(co2SavedKg * 18.25).toFixed(0)} days.`,
      icon: TreePine,
      color: "var(--emerald)",
      bg: "rgba(16, 185, 129, 0.12)",
    },
    phones: {
      title: "Phone Charges",
      value: Math.round(co2SavedKg * 125).toLocaleString(),
      unit: "Full Charges",
      desc: `That is enough clean energy saved to fully charge a smartphone ${Math.round(co2SavedKg * 125).toLocaleString()} times!`,
      icon: Smartphone,
      color: "#06b6d4",
      bg: "rgba(6, 182, 212, 0.12)",
    },
    driving: {
      title: "Car Miles Avoided",
      value: (co2SavedKg * 5.8).toFixed(1),
      unit: "km Driving",
      desc: `Equivalent to taking a petrol-powered passenger vehicle off the road for ${(co2SavedKg * 5.8).toFixed(1)} km!`,
      icon: Car,
      color: "#f59e0b",
      bg: "rgba(245, 158, 11, 0.12)",
    },
    energy: {
      title: "Clean Light Hours",
      value: Math.round(co2SavedKg * 260).toLocaleString(),
      unit: "LED Hours",
      desc: `Enough energy saved to power a bright 10W LED bulb for ${Math.round(co2SavedKg * 260).toLocaleString()} continuous hours!`,
      icon: Zap,
      color: "#84cc16",
      bg: "rgba(132, 204, 22, 0.12)",
    },
  };

  const current = equivalents[activeTab];
  const CurrentIcon = current.icon;

  return (
    <div className="eco-equivalents-card">
      <div className="equivalents-header">
        <div className="eyebrow">
          <Sparkles size={14} className="text-emerald" /> REAL-WORLD IMPACT EQUIVALENTS
        </div>
        <h3>What does {co2SavedKg.toFixed(1)} kg CO₂ saved actually mean?</h3>
      </div>

      <div className="equivalents-tabs">
        {(Object.keys(equivalents) as Array<keyof typeof equivalents>).map((key) => {
          const item = equivalents[key];
          const Icon = item.icon;
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              type="button"
              className={`equivalent-tab ${isActive ? "active" : ""}`}
              onClick={() => setActiveTab(key)}
            >
              <Icon size={18} />
              <span>{item.title}</span>
            </button>
          );
        })}
      </div>

      <div className="equivalent-display">
        <div className="display-icon-wrapper" style={{ backgroundColor: current.bg, color: current.color }}>
          <CurrentIcon size={38} />
        </div>
        <div className="display-content">
          <div className="display-value" style={{ color: current.color }}>
            {current.value} <span className="display-unit">{current.unit}</span>
          </div>
          <p className="display-desc">{current.desc}</p>
        </div>
      </div>
    </div>
  );
}
