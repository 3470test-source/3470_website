// 





require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running ✅");
});

app.post("/register", (req, res) => {
  res.json({ success: true, message: "Register API working" });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("Server started on port", PORT);
});
