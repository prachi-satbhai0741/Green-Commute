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
} from "lucide-react";
export default function Home() {
  return (
    <>
      <section className="home-hero wrap">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="status-dot" /> A SMALLER FOOTPRINT. A BETTER
            EVERYDAY.
          </span>
          <h1>
            Your destination.
            <br />A <em>greener</em> way
            <br />
            to get there.
          </h1>
          <p>
            Better journeys begin with better choices. Compare your commute,
            find a lighter footprint, and see the difference you make.
          </p>
          <div className="hero-actions">
            <Link href="/plan" className="button">
              Plan my commute <ArrowUpRight size={19} />
            </Link>
            <a href="#how-it-works" className="text-link">
              See how it works <ArrowRight size={17} />
            </a>
          </div>
          <div className="hero-note">
            <Leaf size={17} /> Good for your day. Better for the planet.
          </div>
        </div>
        <div
          className="journey-visual"
          aria-label="Illustration of a greener journey"
        >
          <div className="visual-top">
            <span>
              <span className="status-dot" /> YOUR EVERYDAY, REIMAGINED
            </span>
            <ArrowUpRight size={20} />
          </div>
          <svg
            className="journey-map"
            viewBox="0 0 500 400"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M-10 80H510M-10 190H510M-10 300H510M80 -10V410M210 -10V410M350 -10V410M470 -10V410"
              stroke="#cdddcd"
              strokeWidth="18"
            />
            <path
              d="M-10 80H510M-10 190H510M-10 300H510M80 -10V410M210 -10V410M350 -10V410M470 -10V410"
              stroke="#f7faf1"
              strokeWidth="13"
            />
            <rect
              x="102"
              y="104"
              width="84"
              height="61"
              rx="16"
              fill="#c5d6ae"
            />
            <rect
              x="374"
              y="213"
              width="73"
              height="64"
              rx="15"
              fill="#c5d6ae"
            />
            <path
              d="M70 310C130 310 145 250 205 248C275 245 269 140 342 140C380 140 390 83 432 83"
              stroke="#fcfff5"
              strokeWidth="15"
            />
            <path
              d="M70 310C130 310 145 250 205 248C275 245 269 140 342 140C380 140 390 83 432 83"
              stroke="#246443"
              strokeWidth="5"
              strokeDasharray="10 7"
            />
            <circle
              cx="70"
              cy="310"
              r="13"
              fill="#246443"
              stroke="white"
              strokeWidth="5"
            />
            <circle
              cx="432"
              cy="83"
              r="13"
              fill="#246443"
              stroke="white"
              strokeWidth="5"
            />
          </svg>
          <div className="map-label start">
            <MapPin size={16} /> Your starting point
          </div>
          <div className="map-label finish">
            <Leaf size={16} /> A better arrival
          </div>
          <div className="bike-bubble">
            <Bike size={48} strokeWidth={1.5} />
          </div>
          <div className="visual-bottom">
            <div>
              <span className="eyebrow">ONE JOURNEY. MORE POSSIBILITIES.</span>
              <strong>Take the scenic side of change.</strong>
            </div>
            <span className="round-arrow">
              <ArrowUpRight />
            </span>
          </div>
        </div>
      </section>
      <div className="mode-strip">
        <span>EVERY JOURNEY HAS OPTIONS</span>
        <div>
          <Footprints size={21} /> Walk a little
        </div>
        <div>
          <Bike size={23} /> Ride a bike
        </div>
        <div>
          <Bus size={22} /> Share the journey
        </div>
        <div>
          <Car size={22} /> Compare your drive
        </div>
      </div>
      <section id="how-it-works" className="wrap how-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">LESS GUESSWORK. MORE GOOD.</span>
            <h2>
              A better commute,
              <br />
              in three simple steps.
            </h2>
          </div>
          <p>
            You don’t have to change everything.
            <br />
            Start with the way you get there.
          </p>
        </div>
        <div className="feature-grid">
          {[
            {
              icon: MapPin,
              n: "01",
              title: "Where are you headed?",
              text: "Enter your starting point and destination, or use a distance you already know.",
            },
            {
              icon: Route,
              n: "02",
              title: "Find your kind of green.",
              text: "Compare estimated travel time and carbon impact across four ways to travel.",
            },
            {
              icon: TrendingUp,
              n: "03",
              title: "Watch small choices add up.",
              text: "Log the journeys you complete and track your personal impact over time.",
            },
          ].map(({ icon: Icon, n, title, text }) => (
            <article key={n} className="feature">
              <div className="feature-top">
                <Icon size={25} />
                <span>{n}</span>
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="cta wrap">
        <div>
          <span className="eyebrow">YOUR NEXT TRIP CAN BE A FRESH START</span>
          <h2>
            A little less carbon.
            <br />A little more possibility.
          </h2>
        </div>
        <Link className="button light" href="/register">
          Let’s get moving <ArrowUpRight size={20} />
        </Link>
      </section>
    </>
  );
}
