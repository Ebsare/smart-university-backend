const mongoose = require("mongoose");

const ActivityLogSchema = new mongoose.Schema({
  userId: Number,          // nga SQL (users.id)
  action: String,          // LOGIN | ENROLL | ADMIN_CREATE_COURSE | etj.
  details: String,         // përshkrim i shkurtër
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ActivityLog", ActivityLogSchema);
