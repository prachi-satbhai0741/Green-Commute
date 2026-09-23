const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
process.env.DEMO_MODE = "true";
process.env.MONGODB_URI = "";
process.env.NODE_ENV = "test";
process.env.MONGOMS_DOWNLOAD_DIR = require("node:path").join(require("node:os").tmpdir(), "green-commute-mongodb");
const { connectDB, closeDB } = require("../config/db");
const app = require("../app");
let server, base, cookie, otherCookie, quote, tripId;
async function request(
  path,
  body,
  auth = cookie,
  method = body ? "POST" : "GET",
) {
  const res = await fetch(base + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(auth ? { Cookie: auth } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return {
    status: res.status,
    data: await res.json(),
    cookie: res.headers.get("set-cookie")?.split(";")[0],
  };
}
before(async () => {
  await connectDB();
  server = app.listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  base = `http://127.0.0.1:${server.address().port}/api`;
});
after(async () => {
  if (server) await new Promise((r) => server.close(r));
  await closeDB();
});
test("protects route calculation and profile", async () => {
  assert.equal((await request("/auth/me", null, "")).status, 401);
  assert.equal(
    (
      await request(
        "/commute/calculate",
        { source: "Home", destination: "Work", distanceKm: 10 },
        "",
      )
    ).status,
    401,
  );
});
test("validates registration, normalizes email, excludes password", async () => {
  assert.equal(
    (
      await request("/auth/register", {
        name: "Test",
        email: "bad",
        password: "short",
      })
    ).status,
    400,
  );
  const r = await request("/auth/register", {
    name: "Test Rider",
    email: " Rider@Example.com ",
    password: "test-password-123",
  });
  assert.equal(r.status, 201);
  assert.equal(r.data.email, "rider@example.com");
  assert.equal(r.data.password, undefined);
  assert.equal(r.data.daysActive, 0);
  cookie = r.cookie;
  assert.equal(
    (
      await request("/auth/register", {
        name: "Test",
        email: "rider@example.com",
        password: "test-password-123",
      })
    ).status,
    409,
  );
});
test("rejects invalid credentials and supports login", async () => {
  assert.equal(
    (
      await request("/auth/login", {
        email: "rider@example.com",
        password: "bad",
      })
    ).status,
    401,
  );
  const r = await request("/auth/login", {
    email: "RIDER@EXAMPLE.COM",
    password: "test-password-123",
  });
  assert.equal(r.status, 200);
  cookie = r.cookie;
});
test("validates trip locations and numeric distances", async () => {
  for (const distanceKm of [-1, 0, 501, "10", null])
    assert.equal(
      (
        await request("/commute/calculate", {
          source: "Home",
          destination: "Work",
          distanceKm,
        })
      ).status,
      400,
    );
  assert.equal(
    (
      await request("/commute/calculate", {
        source: " Home ",
        destination: "home",
        distanceKm: 10,
      })
    ).status,
    400,
  );
  const r = await request("/commute/calculate", {
    source: "Home",
    destination: "Work",
    distanceKm: 10,
  });
  assert.equal(r.status, 200);
  assert.equal(r.data.routes.length, 4);
  assert.equal(r.data.basis, "manual");
  assert.equal(r.data.routes.find((x) => x.mode === "bike").co2Saved, 1.71);
  quote = r.data.quote;
});
test("rejects tampering and ignores supplied carbon totals", async () => {
  assert.equal(
    (
      await request("/user/select-route", {
        quote: quote + "tampered",
        mode: "bike",
      })
    ).status,
    400,
  );
  const r = await request("/user/select-route", {
    quote,
    mode: "bike",
    co2Saved: 999999,
  });
  assert.equal(r.status, 201);
  assert.equal(r.data.totalTrips, 1);
  assert.equal(r.data.co2Saved, 1.71);
  assert.equal(r.data.ecoPoints, 171);
  assert.equal(r.data.daysActive, 1);
  assert.equal(
    (await request("/user/select-route", { quote, mode: "walk" })).status,
    409,
  );
  const trips = await request("/user/trips");
  assert.equal(trips.data.length, 1);
  tripId = trips.data[0]._id;
});
test("isolates account histories, quotes and deletion", async () => {
  const r = await request("/auth/register", {
    name: "Other",
    email: "other@example.com",
    password: "test-password-123",
  });
  otherCookie = r.cookie;
  assert.equal(
    (await request("/user/trips", null, otherCookie)).data.length,
    0,
  );
  assert.equal(
    (await request("/user/select-route", { quote, mode: "car" }, otherCookie))
      .status,
    400,
  );
  assert.equal(
    (await request(`/user/trips/${tripId}`, null, otherCookie, "DELETE"))
      .status,
    404,
  );
});
test("concurrent duplicate submissions save exactly one trip", async () => {
  const r = await request("/commute/calculate", {
    source: "Park",
    destination: "Station",
    distanceKm: 2,
  });
  const results = await Promise.all([
    request("/user/select-route", { quote: r.data.quote, mode: "walk" }),
    request("/user/select-route", { quote: r.data.quote, mode: "walk" }),
  ]);
  assert.deepEqual(results.map((r) => r.status).sort(), [201, 409]);
  assert.equal((await request("/auth/me")).data.totalTrips, 2);
});
test("deletion recalculates totals and does not break password hashing", async () => {
  const r = await request(`/user/trips/${tripId}`, null, cookie, "DELETE");
  assert.equal(r.status, 200);
  assert.equal(r.data.totalTrips, 1);
  assert.equal(r.data.co2Saved, 0.34);
  assert.equal(
    (
      await request("/auth/login", {
        email: "rider@example.com",
        password: "test-password-123",
      })
    ).status,
    200,
  );
});
test("rejects cross-origin writes and clears session on logout", async () => {
  const r = await fetch(base + "/auth/logout", {
    method: "POST",
    headers: { Origin: "https://evil.example", Cookie: cookie },
  });
  assert.equal(r.status, 403);
  const out = await request("/auth/logout", {});
  assert.equal(out.status, 200);
  assert.equal(out.cookie, "gc_session=");
  assert.equal((await request("/auth/me", null, out.cookie)).status, 401);
});
