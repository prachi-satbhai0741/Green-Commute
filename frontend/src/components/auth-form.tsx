"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Leaf, Eye, EyeOff } from "lucide-react";
import { api, User } from "@/lib/api";
import { useSession } from "./session";
export default function AuthForm({ register = false }: { register?: boolean }) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [show, setShow] = useState(false);
  const router = useRouter(),
    { setUser } = useSession();
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const user = await api<User>(
        register ? "/auth/register" : "/auth/login",
        { method: "POST", body: JSON.stringify(Object.fromEntries(form)) },
      );
      setUser(user);
      router.push("/plan");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-layout">
      <aside className="auth-story">
        <Leaf size={38} />
        <h2>
          A little greener.
          <br />
          Every single day.
        </h2>
        <p>
          Your everyday journey is an opportunity to make a difference. Let’s
          find a better way to get there.
        </p>
        <span>THOUGHTFUL TRAVEL STARTS WITH YOU</span>
      </aside>
      <section className="auth-card">
        <span className="eyebrow">WELCOME TO GREENCOMMUTE</span>
        <h1>
          {register ? "Start your green journey." : "Good to see you again."}
        </h1>
        <p>
          {register
            ? "Create your account. Make every commute count."
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
                placeholder="Your name"
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
            <span className="password-field">
              <input
                type={show ? "text" : "password"}
                name="password"
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
                className="icon-button"
                aria-label={show ? "Hide password" : "Show password"}
                onClick={() => setShow(!show)}
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>
          {error && (
            <p className="notice error" role="alert">
              {error}
            </p>
          )}
          <button className="button full" disabled={busy}>
            {busy ? "Please wait…" : register ? "Create account" : "Sign in"}
            <ArrowRight size={18} />
          </button>
        </form>
        <p className="auth-switch">
          {register ? "Already have an account?" : "New to GreenCommute?"}{" "}
          <Link href={register ? "/signin" : "/register"}>
            {register ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </section>
    </div>
  );
}
