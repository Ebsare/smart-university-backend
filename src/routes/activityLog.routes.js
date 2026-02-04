const router = require("express").Router();
const { verifyToken, requireAdmin } = require("../middlewares/auth.middleware");
const { getAllLogs } = require("../controllers/activityLog.controller");

router.get("/", verifyToken, requireAdmin, getAllLogs);

module.exports = router;
