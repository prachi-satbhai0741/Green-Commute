import type { Metadata } from "next";
import Link from "next/link";
import { Leaf } from "lucide-react";
import "./globals.css";
import { SessionProvider } from "@/components/session";
import Navigation from "@/components/navigation";
export const metadata: Metadata = {
  title: "GreenCommute — A better way to get there",
  description:
    "Compare your commute, choose a lighter footprint, and track your everyday impact.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <a className="skip-link" href="#main">
            Skip to content
          </a>
          <Navigation />
          <main id="main">{children}</main>
          <footer>
            <Link href="/" className="footer-brand">
              <Leaf size={18} /> GreenCommute
            </Link>
            <span>Small journeys. Meaningful change.</span>
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noreferrer"
            >
              Location data © OpenStreetMap contributors
            </a>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
