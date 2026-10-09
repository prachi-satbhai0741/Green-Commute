import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Bike,
  Leaf,
  MapPin,
  Route,
  TrendingUp,
  Footprints,
  Bus,
  Car,
  ShieldCheck,
  Zap,
  Award,
  Sparkles,
  TreePine,
  CheckCircle2,
} from "lucide-react";
import RouteMapVisualizer from "@/components/route-map-visualizer";
import EcoEquivalents from "@/components/eco-equivalents";
import FAQAccordion from "@/components/faq-accordion";

export default function Home() {
  return (
    <>
      {/* HERO SECTION */}
      <section className="home-hero wrap">
        <div className="hero-copy">
          <div className="eyebrow-pill">
            <span className="status-dot-pulse" />
            <span>A SMALLER FOOTPRINT • A BETTER EVERYDAY</span>
          </div>

          <h1 className="hero-title">
            Your destination.
            <br />
            A <span className="hero-highlight">greener way</span>
            <br />
            to get there.
          </h1>

          <p className="hero-subtitle">
            Better journeys begin with better choices. Compare travel modes,
            reduce your carbon footprint, earn eco rewards, and see your real impact grow.
          </p>

          <div className="hero-actions">
            <Link href="/plan" className="button button-lg">
              Plan My Commute <ArrowUpRight size={20} />
            </Link>
            <a href="#how-it-works" className="button secondary button-lg">
              See How It Works <ArrowRight size={18} />
            </a>
          </div>

          <div className="hero-stats-row">
            <div className="hero-stat">
              <span className="stat-num text-emerald">100%</span>
              <span className="stat-label">Tailpipe Free Modes</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="stat-num">0.17 kg</span>
              <span className="stat-label">CO₂ Saved per Car-km</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="stat-num text-amber">100 pts</span>
              <span className="stat-label">Per kg CO₂ Avoided</span>
            </div>
          </div>
        </div>

        {/* HERO MAP VISUALIZER */}
        <div className="hero-visual-wrapper">
          <RouteMapVisualizer
            source="Greenwich Park"
            destination="Financial Quarter"
            distanceKm={8.2}
            selectedMode="bike"
          />
        </div>
      </section>

      {/* MODE STRIP */}
      <div className="mode-strip">
        <span className="mode-strip-label">EVERY JOURNEY HAS GREENER OPTIONS</span>
        <div className="mode-strip-items">
          <div className="mode-tag"><Footprints size={20} className="text-emerald" /> Walk & Burn Calories</div>
          <div className="mode-tag"><Bike size={22} className="text-emerald" /> Ride a Bicycle</div>
          <div className="mode-tag"><Bus size={21} className="text-cyan" /> Share Public Transit</div>
          <div className="mode-tag"><Car size={21} className="text-amber" /> Compare Solo Drive</div>
        </div>
      </div>

      {/* INTERACTIVE IMPACT CALCULATOR SHOWCASE */}
      <section className="wrap eco-calculator-section">
        <EcoEquivalents co2SavedKg={14.8} />
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="wrap how-section">
        <div className="section-heading text-center">
          <span className="eyebrow">
            <Zap size={14} className="text-emerald" /> LESS GUESSWORK • MORE GOOD
          </span>
          <h2>A better commute in 3 simple steps</h2>
          <p>You don’t have to overhaul your routine. Just start with how you get there today.</p>
        </div>

        <div className="feature-grid">
          {[
            {
              icon: MapPin,
              n: "01",
              title: "Enter Your Route",
              text: "Input your starting location and destination, or enter a known distance in kilometers for instant calculation.",
              tag: "Instant Open Data",
            },
            {
              icon: Route,
              n: "02",
              title: "Compare Your Options",
              text: "Compare travel durations, estimated CO₂ emissions, and net carbon avoided across walking, cycling, transit, and driving.",
              tag: "Real-time Emissions",
            },
            {
              icon: TrendingUp,
              n: "03",
              title: "Log & Earn Points",
              text: "Complete your eco trip, log it in your dashboard, earn 100 points per kg of CO₂ avoided, and unlock achievements!",
              tag: "Gamified Badges",
            },
          ].map(({ icon: Icon, n, title, text, tag }) => (
            <article key={n} className="feature-card">
              <div className="feature-card-header">
                <div className="feature-icon-box">
                  <Icon size={26} />
                </div>
                <span className="feature-number">{n}</span>
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
              <div className="feature-badge-tag">
                <CheckCircle2 size={13} /> {tag}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* COMMUNITY & MILESTONE BANNER */}
      <section className="wrap banner-impact-grid">
        <div className="banner-card dark-green-gradient">
          <div className="banner-icon-bg"><TreePine size={120} /></div>
          <span className="eyebrow text-mint">WHY IT MATTERS</span>
          <h2>Transportation causes 24% of global CO₂ emissions</h2>
          <p>
            Switching just one 8km drive to cycling or walking each week avoids over 70kg of CO₂ per year—the equivalent of planting 3 full-grown trees!
          </p>
          <div className="banner-features">
            <div><ShieldCheck size={18} className="text-mint" /> Science-backed emissions metrics</div>
            <div><Award size={18} className="text-mint" /> Milestones & progress badges</div>
          </div>
        </div>

        <div className="banner-card light-sage-card">
          <span className="eyebrow">YOUR DAILY REWARDS</span>
          <h2>Every green choice counts</h2>
          <p>
            Track your streak, accumulate eco points, and watch your personal impact chart climb over time.
          </p>
          <Link href="/plan" className="button button-lg full">
            Start Planning Now <Sparkles size={18} />
          </Link>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="wrap faq-section">
        <FAQAccordion />
      </section>

      {/* CALL TO ACTION BANNER */}
      <section className="cta wrap">
        <div className="cta-content">
          <span className="eyebrow text-mint">READY FOR A FRESH START?</span>
          <h2>
            A little less carbon.
            <br />
            A lot more possibility.
          </h2>
          <p>Join commuters making every journey count for a cleaner tomorrow.</p>
        </div>
        <Link className="button button-accent button-xl" href="/register">
          Get Started Free <ArrowUpRight size={22} />
        </Link>
      </section>
    </>
  );
}
