const { poolPromise, sql } = require("../config/mssql");
const ActivityLog = require("../models/activityLog.model");

// ======================
// ENROLL IN COURSE
// POST /api/user-courses/enroll
// body: { course_id }  or { courseId }
// ======================
exports.enrollInCourse = async (req, res) => {
  try {
    const userId = req.user.id; // nga JWT

    // prano të dy formatet: course_id ose courseId
    const courseId = req.body.course_id ?? req.body.courseId;

    if (!courseId) {
      return res.status(400).json({ message: "course_id (or courseId) is required" });
    }

    const pool = await poolPromise;

    // (Opsionale, por mirë) Mos e lejo enroll të dyfishtë
    const existing = await pool.request()
      .input("user_id", sql.Int, userId)
      .input("course_id", sql.Int, Number(courseId))
      .query(`
        SELECT id
        FROM UserCourses
        WHERE user_id = @user_id AND course_id = @course_id
      `);

    if (existing.recordset.length > 0) {
      return res.status(400).json({ message: "Already enrolled in this course" });
    }

    // Insert
    await pool.request()
      .input("user_id", sql.Int, userId)
      .input("course_id", sql.Int, Number(courseId))
      .query(`
        INSERT INTO UserCourses (user_id, course_id)
        VALUES (@user_id, @course_id)
      `);

    // MongoDB log
    await ActivityLog.create({
      userId,
      action: "ENROLL",
      details: `User enrolled in course ID ${courseId}`,
    });

    res.json({ message: "User enrolled in course" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ======================
// GET MY COURSES
// GET /api/user-courses/my-courses
// ======================
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
        ORDER BY c.id DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.unenrollFromCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    const pool = await poolPromise;

    const result = await pool.request()
      .input("user_id", sql.Int, userId)
      .input("course_id", sql.Int, Number(courseId))
      .query(`
        DELETE FROM UserCourses
        WHERE user_id = @user_id AND course_id = @course_id
      `);

    await ActivityLog.create({
      userId,
      action: "UNENROLL",
      details: `User unenrolled from course ID ${courseId}`,
    });

    res.json({ message: "User unenrolled from course" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
