const mongoose = require("mongoose");
const schema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    quoteId: { type: String, required: true },
    source: String,
    destination: String,
    mode: String,
    distanceKm: Number,
    durationMinutes: Number,
    co2Saved: Number,
    emissionsKg: Number,
    ecoPoints: Number,
    basis: String,
  },
  { timestamps: true },
);
schema.index({ user: 1, quoteId: 1 }, { unique: true });
module.exports = mongoose.model("Trip", schema);
