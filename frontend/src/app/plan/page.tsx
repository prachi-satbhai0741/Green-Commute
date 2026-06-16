"use client";

import { useState } from "react";
import Link from "next/link";

export default function Plan() {
  // Simulating conditional access check
  const [isAuthenticated] = useState(true);

  if (!isAuthenticated) {
    return (
      <div className="form-container animate-fade-in" style={{ textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem' }}>Access Denied</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Please sign in to plan your commute.</p>
        <Link href="/signin" className="btn btn-primary">Go to Sign In</Link>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '4rem', maxWidth: '800px' }}>
      <h1 className="hero-title" style={{ fontSize: '2.5rem', textAlign: 'left', marginBottom: '0.5rem' }}>Plan Your Commute</h1>
      <p className="hero-subtitle" style={{ textAlign: 'left', marginBottom: '3rem' }}>Find the greenest route between your locations.</p>

      <div className="card">
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div className="input-group" style={{ flex: '1', minWidth: '250px', marginBottom: '0' }}>
              <label className="input-label" htmlFor="source">Source</label>
              <input type="text" id="source" className="input-field" placeholder="E.g., 123 Main St" />
            </div>
            
            <div className="input-group" style={{ flex: '1', minWidth: '250px', marginBottom: '0' }}>
              <label className="input-label" htmlFor="destination">Destination</label>
              <input type="text" id="destination" className="input-field" placeholder="E.g., Central Station" />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="preferences">Transport Preferences</label>
            <select id="preferences" className="input-field" style={{ appearance: 'none', cursor: 'pointer' }}>
              <option value="eco">Max Eco (Bicycle & Walk)</option>
              <option value="balanced">Balanced (Public Transit)</option>
              <option value="fast">Fastest (Carpool & Transit)</option>
            </select>
          </div>
          
          <button type="button" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Find Routes</button>
        </form>
      </div>

      {/* Mock Results Area */}
      <div style={{ marginTop: '3rem' }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Suggested Routes</h3>
        <div style={{ padding: '3rem 2rem', border: '2px dashed var(--border-color)', borderRadius: 'var(--radius)', textAlign: 'center', color: 'var(--text-muted)' }}>
          Enter your source and destination to see eco-friendly options.
        </div>
      </div>
    </div>
  );
}
