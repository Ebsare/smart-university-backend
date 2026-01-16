const bcrypt = require("bcrypt");
const { poolPromise, sql } = require("../config/mssql");

// REGISTER
exports.register = async (req, res) => {
  try {
    const {
      email,
      password,
      first_name,
      last_name,
      birth_date,
      previous_education,
      average_grade
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const pool = await poolPromise;

    await pool.request()
      .input("email", sql.NVarChar, email)
      .input("password", sql.NVarChar, hashedPassword)
      .input("first_name", sql.NVarChar, first_name)
      .input("last_name", sql.NVarChar, last_name)
      .input("birth_date", sql.Date, birth_date)
      .input("previous_education", sql.NVarChar, previous_education)
      .input("average_grade", sql.Decimal(4, 2), average_grade)
      .query(`
        INSERT INTO users (email, password, first_name, last_name, birth_date, previous_education, average_grade)
        VALUES (@email, @password, @first_name, @last_name, @birth_date, @previous_education, @average_grade)
      `);

    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const pool = await poolPromise;

    const result = await pool.request()
      .input("email", sql.NVarChar, email)
      .query("SELECT * FROM users WHERE email = @email");

    const user = result.recordset[0];
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
