const express = require("express");
const cors = require("cors");
const { poolPromise } = require("./config/mssql");

const authRoutes = require("./routes/auth.routes");
const courseRoutes = require("./routes/course.routes");
const courseEventRoutes = require("./routes/courseEvent.routes");
const userCourseRoutes = require("./routes/userCourse.routes");
const activityLogRoutes = require("./routes/activityLog.routes");




const app = express();


app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/course-events", courseEventRoutes);
app.use("/api/user-courses", userCourseRoutes);
app.use("/api/logs", activityLogRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Smart University API running" });
});

app.get("/db-test", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT GETDATE() AS now");
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;
