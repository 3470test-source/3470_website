// require("dotenv").config();
// const mysql = require("mysql2");

// // Create a connection pool
// const db = mysql.createPool({
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT || 3306, // default MySQL port
//   user: process.env.DB_USER,
//   password: process.env.DB_PASS,
//   database: process.env.DB_NAME,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// // Test the database connection
// db.getConnection((err, connection) => {
//   if (err) {
//     console.error("❌ DB Connection Error:", err.message);
//     process.exit(1); // stop the app if DB connection fails
//   } else {
//     console.log("✅ DB Connected!");
//     connection.release(); // release the test connection
//   }
// });

// module.exports = db;








require("dotenv").config();
const mysql = require("mysql2/promise");

// CREATE PROMISE POOL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
}); 

// TEST CONNECTION
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ DB Connected!");
    conn.release();
  } catch (err) {
    console.error("❌ DB Connection Error:", err.message);
    process.exit(1);
  }
})();

module.exports = pool;
