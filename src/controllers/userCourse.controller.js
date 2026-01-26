const { poolPromise, sql } = require("../config/mssql");
const ActivityLog = require("../models/activityLog.model");


exports.enrollInCourse = async (req, res) => {
  try {
    const userId = req.user.id;        // nga JWT
    const { course_id } = req.body;
    const pool = await poolPromise;

    await pool.request()
      .input("user_id", sql.Int, userId)
      .input("course_id", sql.Int, course_id)
      .query(`
        INSERT INTO UserCourses (user_id, course_id)
        VALUES (@user_id, @course_id)
      `);
    
      await ActivityLog.create({
        userId,
        action: "ENROLL",
        etails: `User enrolled in course ID ${course_id}`
      });


    res.json({ message: "User enrolled in course" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
exports.getMyCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = await poolPromise;

    const result = await pool.request()
      .input("userId", sql.Int, userId)
      .query(`
        SELECT 
          c.id,
          c.name,
          c.type
        FROM UserCourses uc
        JOIN Courses c ON uc.course_id = c.id
        WHERE uc.user_id = @userId
      `);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

