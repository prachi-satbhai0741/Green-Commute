"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Leaf, Eye, EyeOff, ShieldCheck, Sparkles } from "lucide-react";
import { api, User } from "@/lib/api";
import { useSession } from "./session";
import { useToast } from "./toast";

export default function AuthForm({ register = false }: { register?: boolean }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { setUser } = useSession();
  const { toast } = useToast();

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const user = await api<User>(
        register ? "/auth/register" : "/auth/login",
        { method: "POST", body: JSON.stringify(Object.fromEntries(form)) }
      );
      setUser(user);
      toast(register ? "Account created! Welcome to GreenCommute 🌱" : "Welcome back! 🚴", "success");
      router.push("/plan");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Please try again.";
      setError(msg);
      toast(msg, "error");
    } finally {
      setBusy(false);
    }
  }

  // Demo user quick login feature for easy testing!
  async function loginAsDemo() {
    setBusy(true);
    setError("");
    try {
      const user = await api<User>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "demo@greencommute.app", password: "demopassword123" }),
      });
      setUser(user);
      toast("Signed in as Demo User!", "success");
      router.push("/plan");
    } catch {
      // If demo user doesn't exist yet, try registering demo user
      try {
        const user = await api<User>("/auth/register", {
          method: "POST",
          body: JSON.stringify({
            name: "Eco Commuter",
            email: "demo@greencommute.app",
            password: "demopassword123",
          }),
        });
        setUser(user);
        toast("Demo Account Created!", "success");
        router.push("/plan");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not sign in with demo account.");
      }
    } finally {
      setBusy(false);
    }
  }

  // Password strength calculation for registration
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass)) score += 25;
    if (/[^A-Za-z0-9]/.test(pass)) score += 25;
    return score;
  };

  const strength = register ? getPasswordStrength(password) : 0;

  return (
    <div className="auth-layout">
      <aside className="auth-story">
        <div className="auth-story-icon">
          <Leaf size={40} />
        </div>
        <h2>
          A little greener.
          <br />
          Every single day.
        </h2>
        <p>
          Your everyday journey is an opportunity to make a positive impact. Compare routes, track your carbon savings, and earn eco rewards.
        </p>

        <div className="auth-story-perks">
          <div className="story-perk"><ShieldCheck size={16} /> Privacy First & Free</div>
          <div className="story-perk"><Sparkles size={16} /> Open Data Powered</div>
        </div>

        <span className="story-footer-text">THOUGHTFUL TRAVEL STARTS WITH YOU</span>
      </aside>

      <section className="auth-card">
        <div className="eyebrow-pill">
          <Sparkles size={14} className="text-emerald" /> WELCOME TO GREENCOMMUTE
        </div>
        <h1>
          {register ? "Start your green journey." : "Good to see you again."}
        </h1>
        <p className="auth-subtitle">
          {register
            ? "Create your free account. Make every commute count."
            : "Sign in to pick up where you left off."}
        </p>

        <form onSubmit={submit}>
          {register && (
            <label>
              Full name
              <input
                name="name"
                autoComplete="name"
                required
                maxLength={80}
                placeholder="e.g. Alex Morgan"
              />
            </label>
          )}

          <label>
            Email address
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              maxLength={254}
              placeholder="you@example.com"
            />
          </label>

          <label>
            Password
            <div className="password-field">
              <input
                type={show ? "text" : "password"}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={register ? "new-password" : "current-password"}
                required
                minLength={register ? 8 : 1}
                maxLength={72}
                placeholder={
                  register ? "At least 8 characters" : "Your password"
                }
              />
              <button
                type="button"
                className="icon-button pass-toggle-btn"
                aria-label={show ? "Hide password" : "Show password"}
                onClick={() => setShow(!show)}
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          {register && password && (
            <div className="strength-meter">
              <div className="strength-bar-track">
                <div
                  className="strength-bar-fill"
                  style={{
                    width: `${strength}%`,
                    backgroundColor: strength > 75 ? "#10b981" : strength > 50 ? "#84cc16" : "#f59e0b",
                  }}
                />
              </div>
              <span className="strength-text">
                Password Strength: {strength > 75 ? "Strong" : strength > 50 ? "Medium" : "Weak"}
              </span>
            </div>
          )}

          {error && (
            <div className="notice error" role="alert">
              {error}
            </div>
          )}

          <button className="button button-lg full" disabled={busy}>
            {busy ? "Please wait…" : register ? "Create Account" : "Sign In"}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="demo-login-divider">
          <span>OR QUICK TEST</span>
        </div>

        <button
          type="button"
          className="button secondary full demo-quick-btn"
          disabled={busy}
          onClick={loginAsDemo}
        >
          <Sparkles size={16} className="text-amber" /> One-Click Demo Sign In
        </button>

        <p className="auth-switch">
          {register ? "Already have an account?" : "New to GreenCommute?"}{" "}
          <Link href={register ? "/signin" : "/register"} className="text-link underline">
            {register ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </section>
    </div>
  );
}
