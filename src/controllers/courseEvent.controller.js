const { poolPromise, sql } = require("../config/mssql");

exports.createCourseEvent = async (req, res) => {
  try {
    const { name, time, course_id } = req.body;
    const pool = await poolPromise;

    await pool.request()
      .input("name", sql.NVarChar, name)
      .input("time", sql.NVarChar, time)
      .input("course_id", sql.Int, course_id)
      .query(`
        INSERT INTO CourseEvents (name, time, course_id)
        VALUES (@name, @time, @course_id)
      `);

    res.json({ message: "Course event created successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getEventsByCourse = async (req, res) => {
  try {
    const { courseId } = req.query;
    const pool = await poolPromise;

    const result = await pool.request()
      .input("courseId", sql.Int, courseId)
      .query(`
        SELECT 
          e.id,
          e.name,
          e.time,
          c.name AS course_name
        FROM CourseEvents e
        JOIN Courses c ON e.course_id = c.id
        WHERE c.id = @courseId
      `);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
