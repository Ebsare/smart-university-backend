const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// SQL Server
const { poolPromise, sql } = require("../config/mssql");

// MongoDB (NoSQL) – Activity Logs
const ActivityLog = require("../models/activityLog.model");


// ======================
// REGISTER
// ======================
exports.register = async (req, res) => {
  try {
    const {
      email,
      password,
      first_name,
      last_name,
      birth_date,
      previous_education,
      average_grade,
      role = "user"
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const pool = await poolPromise;

    // Insert user into SQL Server
    await pool.request()
      .input("email", sql.NVarChar, email)
      .input("password", sql.NVarChar, hashedPassword)
      .input("first_name", sql.NVarChar, first_name)
      .input("last_name", sql.NVarChar, last_name)
      .input("birth_date", sql.Date, birth_date)
      .input("previous_education", sql.NVarChar, previous_education)
      .input("average_grade", sql.Decimal(4, 2), average_grade)
      .input("role", sql.NVarChar, role)
      .query(`
        INSERT INTO users 
          (email, password, first_name, last_name, birth_date, previous_education, average_grade, role)
        VALUES 
          (@email, @password, @first_name, @last_name, @birth_date, @previous_education, @average_grade, @role)
      `);

    // MongoDB log (REGISTER)
    await ActivityLog.create({
      action: "REGISTER",
      details: `New user registered with email ${email}`
    });

    res.json({ message: "User registered successfully" });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// ======================
// LOGIN
// ======================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const pool = await poolPromise;

    // Get user from SQL
    const result = await pool.request()
      .input("email", sql.NVarChar, email)
      .query("SELECT * FROM users WHERE email = @email");

    const user = result.recordset[0];
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // MongoDB log (LOGIN)
    await ActivityLog.create({
      userId: user.id,
      action: "LOGIN",
      details: `User ${user.email} logged in`
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
