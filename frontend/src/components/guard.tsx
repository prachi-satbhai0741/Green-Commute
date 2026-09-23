"use client";
import Link from "next/link";
import { useSession } from "./session";
export default function Guard({ children }: { children: React.ReactNode }) {
  const { user, loading, error, refresh } = useSession();
  if (loading)
    return (
      <div className="empty-state" role="status">
        Loading your account…
      </div>
    );
  if (error)
    return (
      <div className="empty-state">
        <p role="alert">{error}</p>
        <button className="button" onClick={() => void refresh()}>
          Try again
        </button>
      </div>
    );
  if (!user)
    return (
      <div className="empty-state">
        <span className="eyebrow">YOUR NEXT JOURNEY STARTS HERE</span>
        <h1>Make your commute count.</h1>
        <p>
          Sign in to compare travel options and keep your impact in one place.
        </p>
        <Link className="button" href="/signin">
          Sign in
        </Link>
        <Link className="text-link" href="/register">
          Create an account
        </Link>
      </div>
    );
  return children;
}
