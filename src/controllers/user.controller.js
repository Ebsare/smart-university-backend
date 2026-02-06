const { poolPromise, sql } = require("../config/mssql");
const ActivityLog = require("../models/activityLog.model");
const bcrypt = require("bcryptjs");

async function safeLog({ userId, action, details }) {
  try { await ActivityLog.create({ userId, action, details }); }
  catch (e) { console.warn("ActivityLog failed:", e.message); }
}

exports.getUsers = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        id, email, role, created_at,
        first_name, last_name, birth_date,
        previous_education, average_grade
      FROM users
      ORDER BY id DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const {
      email, password, role,
      first_name, last_name, birth_date,
      previous_education, average_grade
    } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: "email, password, role are required" });
    }

    const pool = await poolPromise;

    // check existing
    const existing = await pool.request()
      .input("email", sql.NVarChar, email)
      .query(`SELECT id FROM users WHERE email=@email`);

    if (existing.recordset.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.request()
      .input("email", sql.NVarChar, email)
      .input("password", sql.NVarChar, hashed)
      .input("role", sql.NVarChar, role)
      .input("first_name", sql.NVarChar, first_name || null)
      .input("last_name", sql.NVarChar, last_name || null)
      .input("birth_date", sql.Date, birth_date ? new Date(birth_date) : null)
      .input("previous_education", sql.NVarChar, previous_education || null)
      .input("average_grade", sql.Float, average_grade !== "" && average_grade != null ? Number(average_grade) : null)
      .query(`
        INSERT INTO users (
          email, password, role, created_at,
          first_name, last_name, birth_date,
          previous_education, average_grade
        )
        OUTPUT INSERTED.id
        VALUES (
          @email, @password, @role, GETDATE(),
          @first_name, @last_name, @birth_date,
          @previous_education, @average_grade
        )
      `);

    const newId = result.recordset?.[0]?.id;

    await safeLog({
      userId: req.user?.id,
      action: "ADMIN_CREATE_USER",
      details: `Admin created user id=${newId} email=${email} role=${role}`,
    });

    res.json({ message: "User created", id: newId });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      email, role,
      first_name, last_name, birth_date,
      previous_education, average_grade
    } = req.body;

    if (!email || !role) {
      return res.status(400).json({ error: "email and role are required" });
    }

    const pool = await poolPromise;

    const existing = await pool.request()
      .input("id", sql.Int, id)
      .query(`SELECT id FROM users WHERE id=@id`);

    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    await pool.request()
      .input("id", sql.Int, id)
      .input("email", sql.NVarChar, email)
      .input("role", sql.NVarChar, role)
      .input("first_name", sql.NVarChar, first_name || null)
      .input("last_name", sql.NVarChar, last_name || null)
      .input("birth_date", sql.Date, birth_date ? new Date(birth_date) : null)
      .input("previous_education", sql.NVarChar, previous_education || null)
      .input("average_grade", sql.Float, average_grade !== "" && average_grade != null ? Number(average_grade) : null)
      .query(`
        UPDATE users
        SET
          email=@email,
          role=@role,
          first_name=@first_name,
          last_name=@last_name,
          birth_date=@birth_date,
          previous_education=@previous_education,
          average_grade=@average_grade
        WHERE id=@id
      `);

    await safeLog({
      userId: req.user?.id,
      action: "ADMIN_UPDATE_USER",
      details: `Admin updated user id=${id} email=${email} role=${role}`,
    });

    res.json({ message: "User updated" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) return res.status(400).json({ error: "password is required" });

    const pool = await poolPromise;
    const hashed = await bcrypt.hash(password, 10);

    await pool.request()
      .input("id", sql.Int, id)
      .input("password", sql.NVarChar, hashed)
      .query(`UPDATE users SET password=@password WHERE id=@id`);

    await safeLog({
      userId: req.user?.id,
      action: "ADMIN_RESET_USER_PASSWORD",
      details: `Admin reset password for user id=${id}`,
    });

    res.json({ message: "Password reset" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    await pool.request()
      .input("id", sql.Int, id)
      .query(`DELETE FROM users WHERE id=@id`);

    await safeLog({
      userId: req.user?.id,
      action: "ADMIN_DELETE_USER",
      details: `Admin deleted user id=${id}`,
    });

    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
