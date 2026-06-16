"use client";

import { useState, useEffect } from "react";
import { MapPin, ArrowDownUp, Leaf, CarFront, Bike, Navigation, Info, Award, Calendar, CheckCircle2, Trophy, Crown, Star, Route as RouteIcon } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Real Data State
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalTrips: 0,
    co2Saved: 0.0,
    ecoPoints: 0,
    daysActive: 1
  });

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await fetch("http://localhost:5000/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
            setStats({
              totalTrips: userData.totalTrips,
              co2Saved: userData.co2Saved,
              ecoPoints: userData.ecoPoints,
              daysActive: userData.daysActive
            });
          }
        } catch (error) {
          console.error("Failed to fetch user", error);
        }
      }
    };
    fetchUser();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!source || !destination) return;
    
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/commute/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, destination })
      });
      const data = await res.json();
      if (data.routes) {
        setRoutes(data.routes);
        setHasSearched(true);
      }
    } catch (err) {
      console.error(err);
      setHasSearched(true);
    }
    setLoading(false);
  };

  const handleSelectRoute = async (route: any) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please sign in to select a route and start earning points!");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/user/select-route", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ co2Saved: route.co2Saved || 0 })
      });

      if (res.ok) {
        const updatedStats = await res.json();
        setStats(updatedStats);
        alert(`Route selected! You earned points and saved ${route.co2Saved || 0}kg of CO2.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        {!user && (
           <div style={{ position: 'absolute', top: '1rem', right: '1.5rem', background: 'rgba(0,0,0,0.5)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
              <Link href="/signin" style={{ color: 'white', fontWeight: 'bold' }}>Sign In</Link>
           </div>
        )}
        <div className="hero-badge">
          <Leaf size={14} className="text-primary" /> {user ? `Welcome back, ${user.name}!` : 'Join 50,000+ eco-conscious commuters'}
        </div>
        <h1 className="hero-title">Travel Smart,<br /><span>Travel Green</span></h1>
        <p className="hero-subtitle">Discover eco-friendly routes that minimize carbon emissions while getting you where you need to go</p>

        <div className="journey-card">
          <div className="journey-header">
            <Navigation size={20} className="text-primary" /> Plan Your Journey
          </div>
          <form onSubmit={handleSearch}>
            <div className="input-wrapper">
              <MapPin size={18} className="input-icon" />
              <input 
                type="text" 
                placeholder="Starting point" 
                className="journey-input"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            </div>
            <div className="swap-icon">
              <ArrowDownUp size={16} />
            </div>
            <div className="input-wrapper">
              <MapPin size={18} className="input-icon" />
              <input 
                type="text" 
                placeholder="Destination" 
                className="journey-input"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Calculating..." : "Find Eco-Friendly Routes"}
            </button>
          </form>
        </div>
      </section>

      {/* Dynamic Routes Section */}
      {hasSearched && (
        <section className="section container" style={{ background: '#f8fafc', borderRadius: '1rem', marginTop: '-2rem', position: 'relative', zIndex: 10, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h2 className="section-title text-center">Routes from <span style={{color: 'var(--primary)'}}>{source || 'nasik'}</span> to <span style={{color: 'var(--primary)'}}>{destination || 'panchavati'}</span></h2>
          <p className="section-subtitle text-center">Choose the route that best balances your time and environmental impact</p>
          
          <div className="route-grid">
            {routes.map((route, i) => {
              const isFastest = route.type.includes('Fastest');
              const isBest = route.type.includes('Best');
              const cardClass = isFastest ? 'fastest' : (isBest ? 'best' : 'eco');
              const Icon = isFastest ? CarFront : (isBest ? Bike : RouteIcon);

              return (
                <div key={i} className={`route-card ${cardClass}`}>
                  {route.recommended && (
                    <div className="route-badge-recommended">
                      <CheckCircle2 size={12} /> Recommended
                    </div>
                  )}
                  
                  <div className="route-header">
                    <div className="route-type">
                      <Icon size={20} /> {route.type}
                    </div>
                    <div className="score-circle">
                      {route.score}
                      <span className="score-label">SCORE</span>
                    </div>
                  </div>

                  <div className="route-stats">
                    <div className="stat-item"><Info size={16} className="text-muted" /> {route.time}</div>
                    <div className="stat-item"><Navigation size={16} className="text-muted" /> {route.distance}</div>
                  </div>

                  <div className="stat-item" style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                    <Leaf size={16} className="text-muted" /> Pollution: 
                    <span className={`pollution-badge pollution-${route.pollution.toLowerCase()}`}>{route.pollution}</span>
                  </div>

                  {route.co2Saved > 0 ? (
                    <div className="co2-saved">
                      <Leaf size={16} /> CO₂ Saved: {route.co2Saved} kg
                    </div>
                  ) : (
                    <div style={{ height: '52px', marginBottom: '1rem' }}></div> 
                  )}

                  <button className="select-btn" onClick={() => handleSelectRoute(route)}>Select Route</button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="section container">
        <h2 className="section-title text-center">How It Works</h2>
        <p className="section-subtitle text-center">Making sustainable choices has never been easier</p>
        
        <div className="steps-grid">
          <div className="step-card text-center">
            <MapPin size={32} className="text-primary" style={{ margin: '0 auto 1rem' }} />
            <p className="text-muted">Input your starting point and destination to get started</p>
          </div>
          <div className="step-card text-center">
            <RouteIcon size={32} className="text-primary" style={{ margin: '0 auto 1rem' }} />
            <p className="text-muted">Review multiple options with green scores and environmental impact</p>
          </div>
          <div className="step-card text-center">
            <Leaf size={32} className="text-primary" style={{ margin: '0 auto 1rem' }} />
            <p className="text-muted">Choose eco-friendly routes and earn points for sustainable travel</p>
          </div>
        </div>
      </section>

      {/* Impact Dashboard */}
      <section className="section container" style={{ background: 'white' }}>
        <h2 className="section-title text-center">Your Impact</h2>
        <p className="section-subtitle text-center">Track your contribution to a greener planet</p>
        
        <div className="impact-grid">
          <div className="impact-card">
            <div>
              <div className="impact-value">{stats.totalTrips}</div>
              <div className="impact-label">Total Trips</div>
              <div className="impact-sub" style={{ color: 'var(--primary)' }}>Making progress</div>
            </div>
            <div className="impact-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <RouteIcon size={20} />
            </div>
          </div>
          
          <div className="impact-card">
            <div>
              <div className="impact-value">{stats.co2Saved}kg</div>
              <div className="impact-label">CO₂ Saved</div>
              <div className="impact-sub" style={{ color: 'var(--primary)' }}>Making a difference!</div>
            </div>
            <div className="impact-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <Leaf size={20} />
            </div>
          </div>
          
          <div className="impact-card">
            <div>
              <div className="impact-value">{stats.ecoPoints}</div>
              <div className="impact-label">Eco Points</div>
            </div>
            <div className="impact-icon" style={{ background: '#fef08a', color: '#a16207' }}>
              <Star size={20} />
            </div>
          </div>

          <div className="impact-card">
            <div>
              <div className="impact-value">{stats.daysActive}</div>
              <div className="impact-label">Days Active</div>
            </div>
            <div className="impact-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
              <Calendar size={20} />
            </div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="section container text-center" style={{ paddingBottom: '6rem' }}>
        <h2 className="section-title">Achievements</h2>
        <p className="section-subtitle">Unlock badges as you make sustainable choices</p>
        
        <div className="badges-container">
          <div className={`badge-item ${stats.totalTrips >= 1 ? 'badge-unlocked' : ''}`}>
            <div className="badge-icon"><Leaf size={28} /></div>
            <div className="badge-title">First Steps</div>
            {stats.totalTrips >= 1 && <div className="badge-status">Unlocked</div>}
          </div>
          <div className={`badge-item ${stats.totalTrips >= 10 ? 'badge-unlocked' : ''}`}>
            <div className="badge-icon"><Award size={28} /></div>
            <div className="badge-title">Eco Warrior</div>
            {stats.totalTrips >= 10 && <div className="badge-status">Unlocked</div>}
          </div>
          <div className={`badge-item ${stats.ecoPoints >= 250 ? 'badge-unlocked' : ''}`}>
            <div className="badge-icon"><Trophy size={28} /></div>
            <div className="badge-title">Green Champion</div>
            {stats.ecoPoints >= 250 && <div className="badge-status">Unlocked</div>}
          </div>
          <div className={`badge-item ${stats.co2Saved > 0 ? 'badge-unlocked' : ''}`}>
            <div className="badge-icon" style={stats.co2Saved > 0 ? { color: '#ec4899', background: '#fce7f3' } : undefined}><Leaf size={28} /></div>
            <div className="badge-title">Carbon Saver</div>
            {stats.co2Saved > 0 && <div className="badge-status" style={{ color: '#ec4899', background: '#fce7f3' }}>Unlocked</div>}
          </div>
          <div className={`badge-item ${stats.ecoPoints >= 50 ? 'badge-unlocked' : ''}`}>
            <div className="badge-icon" style={stats.ecoPoints >= 50 ? { color: '#eab308', background: '#fef08a' } : undefined}><Star size={28} /></div>
            <div className="badge-title">Point Collector</div>
            {stats.ecoPoints >= 50 && <div className="badge-status" style={{ color: '#eab308', background: '#fef08a' }}>Unlocked</div>}
          </div>
          <div className={`badge-item ${stats.totalTrips >= 100 ? 'badge-unlocked' : ''}`}>
            <div className="badge-icon"><Crown size={28} /></div>
            <div className="badge-title">Eco Legend</div>
            {stats.totalTrips >= 100 && <div className="badge-status">Unlocked</div>}
          </div>
        </div>
      </section>

    </div>
  );
}
