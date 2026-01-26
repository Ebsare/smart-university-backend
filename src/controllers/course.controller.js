const { poolPromise, sql } = require("../config/mssql");

exports.createCourse = async (req, res) => {
  try {
    const { name, type } = req.body;
    const pool = await poolPromise;

    await pool.request()
      .input("name", sql.NVarChar, name)
      .input("type", sql.NVarChar, type)
      .query(`
        INSERT INTO Courses (name, type)
        VALUES (@name, @type)
      `);
    
    await ActivityLog.create({
        userId: req.user?.id, // admin nga JWT
        action: "ADMIN_CREATE_COURSE",
        action: "ADMIN_UPDATE_COURSE",
        action: "ADMIN_DELETE_COURSE",
        details: `Admin created course ${name}`
    });

    res.json({ message: "Course created successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
exports.getCoursesWithEvents = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT 
        c.id AS course_id,
        c.name AS course_name,
        c.type AS course_type,
        e.id AS event_id,
        e.name AS event_name,
        e.time AS event_time
      FROM Courses c
      LEFT JOIN CourseEvents e ON c.id = e.course_id
      ORDER BY c.id
    `);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    const result = await pool.request()
      .input("id", sql.Int, id)
      .query(`
        SELECT id, name, type
        FROM Courses
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type } = req.body;
    const pool = await poolPromise;

    await pool.request()
      .input("id", sql.Int, id)
      .input("name", sql.NVarChar, name)
      .input("type", sql.NVarChar, type)
      .query(`
        UPDATE Courses
        SET name = @name,
            type = @type
        WHERE id = @id
      `);

    res.json({ message: "Course updated successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    // 1️⃣ Fshij eventet e course-it
    await pool.request()
      .input("id", sql.Int, id)
      .query(`
        DELETE FROM CourseEvents
        WHERE course_id = @id
      `);

    // 2️⃣ Fshij course-in
    await pool.request()
      .input("id", sql.Int, id)
      .query(`
        DELETE FROM Courses
        WHERE id = @id
      `);

    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

