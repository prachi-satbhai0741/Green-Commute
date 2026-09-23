"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Leaf, ArrowUpRight, LogOut } from "lucide-react";
import { useState } from "react";
import { useSession } from "./session";
import { api } from "@/lib/api";
export default function Navigation() {
  const { user, loading, setUser, demo } = useSession();
  const path = usePathname(),
    router = useRouter();
  const [error, setError] = useState("");
  async function logout() {
    try {
      await api("/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/");
    } catch {
      setError("Could not sign out. Please retry.");
    }
  }
  return (
    <>
      <header className="navbar">
        <Link href="/" className="logo">
          <span className="logo-mark">
            <Leaf size={22} />
          </span>
          green<span>commute</span>
          <span className="logo-dot">.</span>
        </Link>
        <nav aria-label="Main navigation">
          <Link className={path === "/plan" ? "active" : ""} href="/plan">
            Plan a trip
          </Link>
          <Link className={path === "/history" ? "active" : ""} href="/history">
            My impact
          </Link>
        </nav>
        <div className="nav-account">
          {user ? (
            <>
              <span className="points">
                {user.ecoPoints.toLocaleString()} eco points
              </span>
              <button
                className="icon-button"
                aria-label="Sign out"
                onClick={logout}
              >
                <LogOut size={19} />
              </button>
            </>
          ) : (
            <Link className="nav-signin" href="/signin">
              {loading ? "Loading…" : "Sign in"} <ArrowUpRight size={16} />
            </Link>
          )}
        </div>
      </header>
      {demo && (
        <div className="demo-banner">
          Demo database · Accounts and trips reset when the server restarts.
        </div>
      )}
      {error && (
        <p role="alert" className="notice error">
          {error}
        </p>
      )}
    </>
  );
}
