// Planning assumptions, not audited lifecycle emission factors (kg per passenger-km).
const MODES = [
  { mode: "car", label: "Drive", factor: 0.171, speed: 30 },
  { mode: "transit", label: "Public transport", factor: 0.06, speed: 20 },
  { mode: "bike", label: "Cycle", factor: 0, speed: 15 },
  { mode: "walk", label: "Walk", factor: 0, speed: 5 },
];
function options(distanceKm, drivingMinutes) {
  return MODES.map((m) => ({
    mode: m.mode,
    label: m.label,
    distanceKm,
    durationMinutes: Math.max(
      1,
      Math.round(
        m.mode === "car" && drivingMinutes
          ? drivingMinutes
          : (distanceKm / m.speed) * 60 + (m.mode === "transit" ? 10 : 0),
      ),
    ),
    emissionsKg: Number((distanceKm * m.factor).toFixed(2)),
    co2Saved: Number((distanceKm * (0.171 - m.factor)).toFixed(2)),
    recommended:
      distanceKm <= 5
        ? m.mode === "walk"
        : distanceKm <= 15
          ? m.mode === "bike"
          : m.mode === "transit",
  }));
}
const cache = new Map();
let queue = Promise.resolve();
let lastRequest = 0;
async function getJSON(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        process.env.GEOCODER_USER_AGENT ||
        "GreenCommute/1.0 (https://github.com/prachi-satbhai0741/Green-Commute)",
    },
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok)
    throw new Error(
      "Location service unavailable. Try again or enter a known distance.",
    );
  return response.json();
}
function geocode(text) {
  const key = text.toLowerCase();
  const run = queue.then(async () => {
    const cached = cache.get(key);
    if (cached && cached.expires > Date.now()) return cached.value;
    await new Promise((resolve) =>
      setTimeout(resolve, Math.max(0, 1100 - (Date.now() - lastRequest))),
    );
    lastRequest = Date.now();
    const url = new URL(
      "/search",
      process.env.GEOCODER_URL || "https://nominatim.openstreetmap.org",
    );
    url.search = new URLSearchParams({
      q: text,
      format: "jsonv2",
      limit: "1",
    }).toString();
    const results = await getJSON(url);
    if (!results[0])
      throw new Error(
        `Could not find “${text}”. Include the city or use a known distance.`,
      );
    const value = {
      name: results[0].display_name,
      lat: Number(results[0].lat),
      lon: Number(results[0].lon),
    };
    if (!Number.isFinite(value.lat) || !Number.isFinite(value.lon))
      throw new Error("Invalid location response.");
    if (cache.size >= 500) cache.delete(cache.keys().next().value);
    cache.set(key, { value, expires: Date.now() + 86400000 });
    return value;
  });
  queue = run.catch(() => {});
  return run;
}
async function roadDistance(source, destination) {
  const start = await geocode(source),
    end = await geocode(destination);
  const url = `${process.env.ROUTER_URL || "https://router.project-osrm.org"}/route/v1/driving/${start.lon},${start.lat};${end.lon},${end.lat}?overview=false`;
  const result = await getJSON(url);
  const route = result.routes?.[0];
  if (
    result.code !== "Ok" ||
    !route ||
    !Number.isFinite(route.distance) ||
    route.distance < 100 ||
    route.distance > 500000
  )
    throw new Error("Choose distinct locations within a 500 km road journey.");
  return {
    source: start.name,
    destination: end.name,
    distanceKm: Number((route.distance / 1000).toFixed(2)),
    drivingMinutes: route.duration / 60,
  };
}
module.exports = { options, roadDistance };
