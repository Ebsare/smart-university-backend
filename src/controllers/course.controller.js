const { poolPromise, sql } = require("../config/mssql");
const ActivityLog = require("../models/activityLog.model");

// Helper për logging (mos e blloko request-in nëse log dështojnë)
async function safeLog({ userId, action, details }) {
  try {
    await ActivityLog.create({ userId, action, details });
  } catch (e) {
    console.warn("ActivityLog failed:", e.message);
  }
}

/**
 * CREATE course
 * body: { name, type }
 */
exports.createCourse = async (req, res) => {
  try {
    const { name, type } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: "Name and type are required" });
    }

    const pool = await poolPromise;

    await pool.request()
      .input("name", sql.NVarChar, name)
      .input("type", sql.NVarChar, type)
      .query(`
        INSERT INTO Courses (name, type)
        VALUES (@name, @type)
      `);

    await safeLog({
      userId: req.user?.id,
      action: "ADMIN_CREATE_COURSE",
      details: `Admin created course ${name} (${type})`,
    });

    res.json({ message: "Course created successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * READ all courses
 */
exports.getCourses = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT id, name, type
      FROM Courses
      ORDER BY id DESC
    `);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * READ one course by id
 */
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

/**
 * UPDATE course
 * body: { name, type }
 */
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: "Name and type are required" });
    }

    const pool = await poolPromise;

    const existing = await pool.request()
      .input("id", sql.Int, id)
      .query(`SELECT id, name, type FROM Courses WHERE id=@id`);

    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    await pool.request()
      .input("id", sql.Int, id)
      .input("name", sql.NVarChar, name)
      .input("type", sql.NVarChar, type)
      .query(`
        UPDATE Courses
        SET name = @name, type = @type
        WHERE id = @id
      `);

    await safeLog({
      userId: req.user?.id,
      action: "ADMIN_UPDATE_COURSE",
      details: `Admin updated course id=${id} -> ${name} (${type})`,
    });

    res.json({ message: "Course updated successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * DELETE course
 */
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    const existing = await pool.request()
      .input("id", sql.Int, id)
      .query(`SELECT id, name, type FROM Courses WHERE id=@id`);

    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    // fshij eventet e course-it
    await pool.request()
      .input("id", sql.Int, id)
      .query(`DELETE FROM CourseEvents WHERE course_id = @id`);

    // fshij course-in
    await pool.request()
      .input("id", sql.Int, id)
      .query(`DELETE FROM Courses WHERE id = @id`);

    await safeLog({
      userId: req.user?.id,
      action: "ADMIN_DELETE_COURSE",
      details: `Admin deleted course id=${id}`,
    });

    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * (Opsionale) courses me events
 */
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
