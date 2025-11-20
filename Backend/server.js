const express = require("express");
const app = express();

// allow frontend to call backend
const cors = require("cors");
app.use(cors());

// test API
app.get("/", (req, res) => {
  res.send("Backend working!");
});

// start server
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
