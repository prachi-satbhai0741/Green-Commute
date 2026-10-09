"use client";

import { useState } from "react";
import { Bike, Bus, Car, Footprints, MapPin, Navigation, Sparkles } from "lucide-react";

interface RouteMapVisualizerProps {
  source?: string;
  destination?: string;
  distanceKm?: number;
  selectedMode?: string;
  onModeSelect?: (mode: string) => void;
}

export default function RouteMapVisualizer({
  source = "Central Station",
  destination = "Eco Tech Park",
  distanceKm = 6.4,
  selectedMode = "bike",
  onModeSelect,
}: RouteMapVisualizerProps) {
  const [activeMode, setActiveMode] = useState(selectedMode);

  const handleModeChange = (mode: string) => {
    setActiveMode(mode);
    if (onModeSelect) onModeSelect(mode);
  };

  const modeDetails: Record<string, { label: string; icon: typeof Bike; time: number; co2: number; color: string }> = {
    walk: { label: "Walk", icon: Footprints, time: Math.round((distanceKm / 4.8) * 60), co2: 0, color: "#10b981" },
    bike: { label: "Bicycle", icon: Bike, time: Math.round((distanceKm / 16) * 60), co2: 0, color: "#34d399" },
    transit: { label: "Public Transit", icon: Bus, time: Math.round((distanceKm / 28) * 60 + 5), co2: Number((distanceKm * 0.06).toFixed(2)), color: "#06b6d4" },
    car: { label: "Drive Solo", icon: Car, time: Math.round((distanceKm / 35) * 60), co2: Number((distanceKm * 0.171).toFixed(2)), color: "#f59e0b" },
  };

  const current = modeDetails[activeMode] || modeDetails.bike;

  return (
    <div className="route-map-visualizer">
      <div className="visualizer-header">
        <div className="visualizer-title">
          <Navigation size={18} className="text-emerald" />
          <span>LIVE ROUTE VISUALIZATION</span>
        </div>
        <div className="distance-badge">
          {distanceKm} km estimated journey
        </div>
      </div>

      <div className="visualizer-canvas-container">
        <svg
          className="interactive-map-svg"
          viewBox="0 0 600 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background Grid Roads */}
          <path d="M0 60H600M0 160H600M0 260H600M120 0V320M300 0V320M480 0V320" stroke="rgba(209, 226, 211, 0.4)" strokeWidth="12" />
          <path d="M0 60H600M0 160H600M0 260H600M120 0V320M300 0V320M480 0V320" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="4" />

          {/* Park / Green Zones */}
          <rect x="140" y="80" width="140" height="70" rx="20" fill="rgba(16, 185, 129, 0.15)" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="2" />
          <rect x="340" y="180" width="120" height="60" rx="16" fill="rgba(16, 185, 129, 0.12)" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="2" />

          {/* Route Trail */}
          <path
            d="M 100 240 Q 200 240, 250 160 T 500 80"
            stroke={current.color}
            strokeWidth="8"
            strokeLinecap="round"
            className="animated-route-path"
          />
          <path
            d="M 100 240 Q 200 240, 250 160 T 500 80"
            stroke="#ffffff"
            strokeWidth="2"
            strokeDasharray="8 6"
            strokeLinecap="round"
          />

          {/* Origin Marker */}
          <circle cx="100" cy="240" r="16" fill="rgba(16, 185, 129, 0.2)" />
          <circle cx="100" cy="240" r="10" fill="var(--emerald)" stroke="#ffffff" strokeWidth="3" />

          {/* Destination Marker */}
          <circle cx="500" cy="80" r="18" fill="rgba(16, 185, 129, 0.25)" />
          <circle cx="500" cy="80" r="12" fill="var(--emerald-dark)" stroke="#ffffff" strokeWidth="3" />
        </svg>

        {/* Origin Label Floating Card */}
        <div className="map-node-card origin-node">
          <MapPin size={14} className="text-emerald" />
          <div className="node-text">
            <span className="node-label">START</span>
            <strong className="node-name">{source || "Starting Point"}</strong>
          </div>
        </div>

        {/* Destination Label Floating Card */}
        <div className="map-node-card dest-node">
          <Sparkles size={14} className="text-emerald" />
          <div className="node-text">
            <span className="node-label">DESTINATION</span>
            <strong className="node-name">{destination || "Destination"}</strong>
          </div>
        </div>

        {/* Animated Moving Vehicle Badge */}
        <div className="moving-mode-badge" style={{ borderColor: current.color }}>
          <current.icon size={22} style={{ color: current.color }} />
        </div>
      </div>

      {/* Mode Selector Strip */}
      <div className="visualizer-modes-strip">
        {(Object.keys(modeDetails) as Array<keyof typeof modeDetails>).map((mode) => {
          const m = modeDetails[mode];
          const Icon = m.icon;
          const isSelected = activeMode === mode;
          return (
            <button
              key={mode}
              type="button"
              className={`mode-pill ${isSelected ? "selected" : ""}`}
              onClick={() => handleModeChange(mode)}
            >
              <Icon size={18} />
              <span>{m.label}</span>
              <span className="mode-pill-time">{m.time}m</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
