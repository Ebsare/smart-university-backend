const sql = require("mssql");

const config = {
  user: "appuser",
  password: "AppPass123!",
  server: "DESKTOP-J3V7L6N",
  database: "SmartUniversity",
  options: {
    trustServerCertificate: true
  }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log("Connected to SQL Server");
    return pool;
  })
  .catch(err => {
    console.error("SQL Server connection failed:", err.message);
  });

module.exports = { sql, poolPromise };
