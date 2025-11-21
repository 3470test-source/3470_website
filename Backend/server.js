// const express = require("express");
// const multer = require("multer");
// const nodemailer = require("nodemailer");
// const cors = require("cors");


// const upload = multer();
// const app = express();


// // Allow frontend 127.0.0.1 to call backend
// app.use(cors({
//   origin: "http://127.0.0.1:5500"
// }));

// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
// app.use(upload.none());

// // POST route
// app.post("/send-request", async (req, res) => {
//   const email = req.body.email;
//   const mobile = req.body.mobile;

//   console.log("Email:", email);
//   console.log("Mobile:", mobile);

//   // EMAIL CONFIG
//   let transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: "3470test@gmail.com",      // <-- YOUR Gmail here
//       pass: "oprb rroy kumw nzns",          // <-- Your Google App Password
//     },
//   });

//   // EMAIL CONTENT
//   let mailOptions = {
//     from: "3470test@gmail.com",        // Sender email
//     to: "vignesh.g@3470healthcare.com",              // <-- OWNER email (receives requests)
//     replyTo: email,                              // <-- User's email for reply
//     subject: "New Course Video Access Request",
//     text: `A student requested access:
    
//     Email: ${email}
//     Mobile: ${mobile}`
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log("Mail sent!");

//     res.send("SUCCESS");
//   } catch (err) {
//     console.error("Email error:", err);
//     res.send("ERROR");
//   }
// });

// // Start server
// app.listen(3000, () => {
//   console.log("Server running on http://localhost:3000");
// });




























const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const cors = require("cors");

const upload = multer();
const app = express();

// Allow frontend 127.0.0.1 to call backend
app.use(
  cors({
    origin: "http://127.0.0.1:5500",
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(upload.none());

// 🔹 Gmail Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "3470test@gmail.com", // your Gmail
    pass: "oprb rroy kumw nzns", // Gmail App password
  },
});

/*------------------------------------------------------------------
    1) USER SENDS REQUEST (email + mobile)
-------------------------------------------------------------------*/
app.post("/send-request", async (req, res) => {
  const email = req.body.email;
  const mobile = req.body.mobile;

  console.log("Request From:", email, mobile);

  const mailOptions = {
    from: "3470test@gmail.com",
    to: "vignesh.g@3470healthcare.com", // owner
    replyTo: email,
    subject: "New Course Video Access Request",
    text: `New access request:\n\nEmail: ${email}\nMobile: ${mobile}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Request Mail Sent");
    res.send("SUCCESS");
  } catch (err) {
    console.error("Email error:", err);
    res.send("ERROR");
  }
});

/*------------------------------------------------------------------
    2) OWNER GRANTS ACCESS → USER SHOULD BE NOTIFIED
    (Admin calls this endpoint)
-------------------------------------------------------------------*/
app.post("/grant-access", async (req, res) => {
  const email = req.body.email; // user email

  if (!email) return res.status(400).send("MISSING_EMAIL");

  console.log("Granting access to:", email);

  const mailOptions = {
    from: "3470test@gmail.com",
    to: email, // user gets email
    subject: "Your Course Video Access is Approved!",
    text: `Hi,\n\nYour access request has been APPROVED.\nYou can now access the course.\n\nThanks,\nCourse Team`,
    html: `
      <p>Hi,</p>
      <p>Your access request has been <strong style="color:green;">APPROVED</strong>.</p>
      <p>You can now watch the course videos.</p>
      <br/>
      <p>Regards,<br/>Course Team</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Approval Mail Sent to User");
    res.send("GRANTED_AND_NOTIFIED");
  } catch (err) {
    console.error("Approval email failed:", err);
    res.send("ERROR");
  }
});

/*------------------------------------------------------------------
    START SERVER
-------------------------------------------------------------------*/
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
