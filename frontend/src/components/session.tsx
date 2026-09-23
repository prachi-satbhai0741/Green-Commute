"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { api, ApiError, User } from "@/lib/api";
const Context = createContext<{
  user: User | null;
  loading: boolean;
  error: string;
  demo: boolean;
  refresh: () => Promise<void>;
  setUser: (user: User | null) => void;
}>({
  user: null,
  loading: true,
  error: "",
  demo: false,
  refresh: async () => {},
  setUser: () => {},
});
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [demo, setDemo] = useState(false);
  const refresh = useCallback(
    () =>
      api<User>("/auth/me")
        .then((current) => {
          setUser(current);
          setError("");
        })
        .catch((e) => {
          if (e instanceof ApiError && e.status === 401) {
            setUser(null);
            setError("");
          } else
            setError(
              e instanceof Error ? e.message : "Unable to load your account.",
            );
        })
        .finally(() => setLoading(false)),
    [],
  );
  useEffect(() => {
    void refresh();
    api<{ demo: boolean }>("/health")
      .then((h) => setDemo(h.demo))
      .catch(() => {});
  }, [refresh]);
  return (
    <Context.Provider value={{ user, loading, error, demo, refresh, setUser }}>
      {children}
    </Context.Provider>
  );
}
export const useSession = () => useContext(Context);
