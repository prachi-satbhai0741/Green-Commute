"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Leaf, ArrowUpRight, LogOut, Menu, X, Sparkles, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { useSession } from "./session";
import { useToast } from "./toast";
import { api } from "@/lib/api";

export default function Navigation() {
  const { user, loading, setUser, demo } = useSession();
  const path = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [error, setError] = useState("");

  async function logout() {
    try {
      await api("/auth/logout", { method: "POST" });
      setUser(null);
      toast("Signed out successfully", "info");
      router.push("/");
    } catch {
      setError("Could not sign out. Please retry.");
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      <header className="navbar">
        <Link href="/" className="logo">
          <span className="logo-mark">
            <Leaf size={20} />
          </span>
          green<span className="logo-accent">commute</span>
          <span className="logo-dot">.</span>
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Main navigation" className="desktop-nav">
          <Link className={path === "/" ? "nav-item active" : "nav-item"} href="/">
            Overview
          </Link>
          <Link className={path === "/plan" ? "nav-item active" : "nav-item"} href="/plan">
            Plan a Trip
          </Link>
          <Link className={path === "/history" ? "nav-item active" : "nav-item"} href="/history">
            My Impact
          </Link>
        </nav>

        <div className="nav-account">
          {user ? (
            <div className="user-profile-badge">
              <span className="points-pill">
                <Sparkles size={14} className="sparkle-icon" />
                <strong>{user.ecoPoints.toLocaleString()}</strong> pts
              </span>
              <div className="user-avatar" title={user.name}>
                {getInitials(user.name)}
              </div>
              <button
                className="icon-button logout-btn"
                aria-label="Sign out"
                title="Sign out"
                onClick={logout}
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="nav-auth-buttons">
              <Link className="nav-signin" href="/signin">
                {loading ? "Loading…" : "Sign In"}
              </Link>
              <Link className="button button-sm" href="/register">
                Get Started <ArrowUpRight size={15} />
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="mobile-menu-toggle icon-button"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <nav>
            <Link
              className={path === "/" ? "mobile-link active" : "mobile-link"}
              href="/"
              onClick={() => setMobileMenuOpen(false)}
            >
              Overview
            </Link>
            <Link
              className={path === "/plan" ? "mobile-link active" : "mobile-link"}
              href="/plan"
              onClick={() => setMobileMenuOpen(false)}
            >
              Plan a Trip
            </Link>
            <Link
              className={path === "/history" ? "mobile-link active" : "mobile-link"}
              href="/history"
              onClick={() => setMobileMenuOpen(false)}
            >
              My Impact
            </Link>
          </nav>
          {user ? (
            <div className="mobile-user-box">
              <div className="mobile-user-info">
                <UserIcon size={18} />
                <span>{user.name}</span>
                <span className="mobile-points-badge">{user.ecoPoints} pts</span>
              </div>
              <button type="button" className="button secondary full" onClick={() => { setMobileMenuOpen(false); void logout(); }}>
                Sign Out <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="mobile-auth-actions">
              <Link href="/signin" className="button secondary full" onClick={() => setMobileMenuOpen(false)}>
                Sign In
              </Link>
              <Link href="/register" className="button full" onClick={() => setMobileMenuOpen(false)}>
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}

      {demo && (
        <div className="demo-banner">
          <span className="demo-dot" /> Demo Environment · Accounts and trips reset periodically.
        </div>
      )}
      {error && (
        <div role="alert" className="notice error wrap">
          {error}
        </div>
      )}
    </>
  );
}
