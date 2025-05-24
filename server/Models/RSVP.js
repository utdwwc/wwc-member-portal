const mongoose = require('mongoose');

const rsvpSchema = new mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "RegularEvent", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["Going", "Not Going", "Maybe"], default: "Going" },
    timestamp: { type: Date, default: Date.now },
    guests: { type: Number, default: 0 },
  });
  
  // Prevent duplicate RSVPs for the same event-user pair
  rsvpSchema.index({ event: 1, user: 1 }, { unique: true });
  
  const RSVP = mongoose.model("RSVP", rsvpSchema);
  
  module.exports = RSVP;