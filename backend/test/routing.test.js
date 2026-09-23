const { test } = require("node:test");
const assert = require("node:assert/strict");
const { roadDistance, options } = require("../services/routing");
test("all modes preserve nonnegative emissions and baseline savings", () => {
  for (const distance of [0.1, 1, 10, 500]) {
    const routes = options(distance);
    assert.equal(routes.filter((r) => r.recommended).length, 1);
    assert.equal(routes.find((r) => r.mode === "car").co2Saved, 0);
    for (const route of routes) {
      assert.ok(route.co2Saved >= 0);
      assert.ok(route.emissionsKg >= 0);
      assert.ok(Number.isInteger(route.durationMinutes));
    }
  }
});
test("location adapter uses road distance, caches searches and surfaces failure", async () => {
  const original = global.fetch;
  const calls = [];
  global.fetch = async (url) => {
    calls.push(String(url));
    if (String(url).includes("/search"))
      return {
        ok: true,
        json: async () => [
          {
            display_name: String(url).includes("Origin")
              ? "Resolved origin"
              : "Resolved destination",
            lat: "19.9",
            lon: "73.8",
          },
        ],
      };
    return {
      ok: true,
      json: async () => ({
        code: "Ok",
        routes: [{ distance: 12345, duration: 1200 }],
      }),
    };
  };
  try {
    const r = await roadDistance("Origin test", "Destination test");
    assert.equal(r.distanceKm, 12.35);
    assert.equal(r.drivingMinutes, 20);
    assert.equal(r.source, "Resolved origin");
    await roadDistance("Origin test", "Destination test");
    assert.equal(calls.filter((x) => x.includes("/search")).length, 2);
    global.fetch = async () => ({
      ok: true,
      json: async () => ({ code: "NoRoute", routes: [] }),
    });
    await assert.rejects(
      roadDistance("Origin test", "Destination test"),
      /distinct locations/,
    );
    global.fetch = async () => ({ ok: false });
    await assert.rejects(
      roadDistance("Origin test", "Destination test"),
      /unavailable/,
    );
  } finally {
    global.fetch = original;
  }
});
