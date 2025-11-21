const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const cors = require("cors");


const upload = multer();
const app = express();


// Allow frontend 127.0.0.1 to call backend
app.use(cors({
  origin: "http://127.0.0.1:5500"
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(upload.none());

// POST route
app.post("/send-request", async (req, res) => {
  const email = req.body.email;
  const mobile = req.body.mobile;

  console.log("Email:", email);
  console.log("Mobile:", mobile);

  // EMAIL CONFIG
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "3470test@gmail.com",      // <-- YOUR Gmail here
      pass: "oprb rroy kumw nzns",          // <-- Your Google App Password
    },
  });

  // EMAIL CONTENT
  let mailOptions = {
    from: "3470test@gmail.com",        // Sender email
    to: "vignesh.g@3470healthcare.com",              // <-- OWNER email (receives requests)
    subject: "New Course Video Access Request",
    text: `A student requested access:\n\nEmail: ${email}\nMobile: ${mobile}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Mail sent!");

    res.send("SUCCESS");
  } catch (err) {
    console.error("Email error:", err);
    res.send("ERROR");
  }
});

// Start server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

