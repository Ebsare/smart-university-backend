const ActivityLog = require("../models/activityLog.model");

exports.getAllLogs = async (req, res) => {
  try {
    const logs = await ActivityLog
      .find()
      .sort({ createdAt: -1 }) // më të rejat lart
      .limit(100);

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
