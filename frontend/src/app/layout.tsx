import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Leaf, Moon, Search } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GreenCommute | Plan Smarter Routes",
  description: "Sustainability-focused web application that encourages eco-friendly commuting choices.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="navbar">
          <Link href="/" className="logo-container">
            <div className="logo-icon">
              <Leaf size={20} />
            </div>
            GreenCommute
          </Link>
          <div className="nav-actions">
            <div className="points-badge">
              <Search size={14} /> 0 points
            </div>
            <button style={{ background: 'transparent', color: 'var(--text-muted)' }}>
              <Moon size={20} />
            </button>
          </div>
        </nav>
        <main>
          {children}
        </main>
        <footer>
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="logo-container justify-center" style={{ marginBottom: '0.5rem' }}>
              <div className="logo-icon">
                <Leaf size={20} />
              </div>
              GreenCommute
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Making sustainable travel choices easier for everyone</p>
            <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '1rem' }}>© 2025 GreenCommute. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
