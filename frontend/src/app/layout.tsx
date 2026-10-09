import type { Metadata } from "next";
import Link from "next/link";
import { Leaf, Heart, Globe } from "lucide-react";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/session";
import { ToastProvider } from "@/components/toast";
import Navigation from "@/components/navigation";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GreenCommute — A Better Way to Get There",
  description:
    "Compare your commute, choose a lighter footprint, track your everyday impact, and earn eco rewards.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${outfit.variable}`}>
      <body>
        <SessionProvider>
          <ToastProvider>
            <a className="skip-link" href="#main">
              Skip to content
            </a>
            <Navigation />
            <main id="main">{children}</main>
            <footer className="site-footer">
              <div className="footer-content">
                <div className="footer-brand-section">
                  <Link href="/" className="footer-brand">
                    <span className="footer-brand-icon">
                      <Leaf size={20} />
                    </span>
                    Green<span className="text-emerald">Commute</span>
                  </Link>
                  <p className="footer-tagline">
                    Empowering greener journeys, one commute at a time.
                  </p>
                </div>

                <div className="footer-meta">
                  <div className="footer-badge">
                    <Globe size={14} /> Open Data Powered
                  </div>
                  <span>Made with <Heart size={13} className="heart-icon" /> for the planet</span>
                  <a
                    href="https://www.openstreetmap.org/copyright"
                    target="_blank"
                    rel="noreferrer"
                    className="footer-link"
                  >
                    Map data © OpenStreetMap
                  </a>
                </div>
              </div>
            </footer>
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
