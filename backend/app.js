const express = require("express");
const cors = require("cors");
const app = express();
app.disable("x-powered-by");
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json({ limit: "16kb" }));
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (
    !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
    req.headers.origin &&
    req.headers.origin !== (process.env.FRONTEND_URL || "http://localhost:3000")
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
