const express = require("express");
const cors = require("cors");
const app = express();
app.disable("x-powered-by");

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(
  cors({
    origin: function(origin, callback) {
      // Allow requests with no origin (same-origin, Vercel/Netlify functions, curl)
      if (!origin) return callback(null, true);
      if (origin === allowedOrigin) return callback(null, true);
      if (process.env.URL && origin === process.env.URL) return callback(null, true);
      if (process.env.VERCEL_URL && (origin === `https://${process.env.VERCEL_URL}` || origin === `http://${process.env.VERCEL_URL}`)) return callback(null, true);
      if (process.env.VERCEL_PROJECT_PRODUCTION_URL && (origin === `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` || origin === `http://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)) return callback(null, true);
      callback(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "16kb" }));
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  const isVercelOrigin = process.env.VERCEL_URL && (req.headers.origin === `https://${process.env.VERCEL_URL}` || req.headers.origin === `http://${process.env.VERCEL_URL}`);
  const isVercelProdOrigin = process.env.VERCEL_PROJECT_PRODUCTION_URL && (req.headers.origin === `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` || req.headers.origin === `http://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  if (
    !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
    req.headers.origin &&
    req.headers.origin !== allowedOrigin &&
    (!process.env.URL || req.headers.origin !== process.env.URL) &&
    !isVercelOrigin &&
    !isVercelProdOrigin
  )
    return res.status(403).json({ message: "Origin not allowed." });
  next();
});
// Single-instance abuse control. Use a shared rate-limit store behind multiple API instances.
const attempts = new Map();
app.use("/api", (req, res, next) => {
  const now = Date.now(),
    key = req.ip;
  if (attempts.size > 10000)
    for (const [k, v] of attempts) if (v.until < now) attempts.delete(k);
  const entry = attempts.get(key);
  const limit =
    entry && entry.until > now ? entry : { count: 0, until: now + 60000 };
  attempts.set(key, limit);
  if (++limit.count > 60)
    return res
      .status(429)
      .json({ message: "Too many requests. Please wait a minute." });
  next();
});
app.get("/api/health", (req, res) =>
  res.json({
    status: "ok",
    demo: process.env.DEMO_MODE === "true" && !process.env.MONGODB_URI,
  }),
);
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/commute", require("./routes/commuteRoutes"));
app.use("/api/user", require("./routes/userRoutes"));
app.use((req, res) => res.status(404).json({ message: "Endpoint not found." }));
app.use((err, req, res, next) => {
  console.error(err.message);
  res
    .status(err.status || 500)
    .json({
      message:
        err.status === 400
          ? "Invalid JSON request."
          : "Something went wrong. Please try again.",
    });
});
module.exports = app;
