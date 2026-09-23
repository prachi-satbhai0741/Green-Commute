export type User = {
  _id: string;
  name: string;
  email: string;
  totalTrips: number;
  co2Saved: number;
  ecoPoints: number;
  daysActive: number;
};
export type RouteOption = {
  mode: string;
  label: string;
  distanceKm: number;
  durationMinutes: number;
  emissionsKg: number;
  co2Saved: number;
  recommended: boolean;
};
export type Comparison = {
  source: string;
  destination: string;
  basis: string;
  routes: RouteOption[];
  quote: string;
};
export type Trip = RouteOption & {
  _id: string;
  source: string;
  destination: string;
  createdAt: string;
  ecoPoints: number;
  basis: string;
};
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      ...options,
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", ...options.headers },
      signal: options.signal || AbortSignal.timeout(45000),
    });
  } catch {
    throw new ApiError(
      "Unable to reach the server. Check your connection and try again.",
      0,
    );
  }
  const data = await response
    .json()
    .catch(() => ({ message: "The server is unavailable. Please try again." }));
  if (!response.ok)
    throw new ApiError(data.message || "Request failed.", response.status);
  return data;
}
