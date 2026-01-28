require("dotenv").config();
const mysql = require("mysql2");

// Create a connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306, // default MySQL port
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the database connection
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ DB Connection Error:", err.message);
    process.exit(1); // stop the app if DB connection fails
  } else {
    console.log("✅ DB Connected!");
    connection.release(); // release the test connection
  }
});

module.exports = db;
