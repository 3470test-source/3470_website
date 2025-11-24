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




























// const express = require("express");
// const multer = require("multer");
// const nodemailer = require("nodemailer");
// const cors = require("cors");

// const upload = multer();
// const app = express();

// //Allow frontend 127.0.0.1 to call backend

// app.use(
//   cors({
//     origin: "http://127.0.0.1:5500",
//   })
// );

// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
// app.use(upload.none());

// // 🔹 Gmail Transporter
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: "3470test@gmail.com", // your Gmail
//     pass: "oprb rroy kumw nzns", // Gmail App password
//   },
// });

// /*------------------------------------------------------------------
//     1) USER SENDS REQUEST (email + mobile)
// -------------------------------------------------------------------*/

// app.post("/send-request", async (req, res) => {
//   const email = req.body.email;
//   const mobile = req.body.mobile;

//   console.log("Request From:", email, mobile);

//   const mailOptions = {
//     from: "3470test@gmail.com",
//     to: "vignesh.g@3470healthcare.com", // owner
//     replyTo: email,
//     subject: "New Course Video Access Request",
//     text: `New access request:\n\nEmail: ${email}\nMobile: ${mobile}`,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log("Request Mail Sent");
//     res.send("SUCCESS");
//   } catch (err) {
//     console.error("Email error:", err);
//     res.send("ERROR");
//   }
// });

// /*------------------------------------------------------------------
//     2) OWNER GRANTS ACCESS → USER SHOULD BE NOTIFIED
//     (Admin calls this endpoint)
// -------------------------------------------------------------------*/

// app.post("/grant-access", async (req, res) => {
//   const email = req.body.email; // user email

//   if (!email) return res.status(400).send("MISSING_EMAIL");

//   console.log("Granting access to:", email);

//   const mailOptions = {
//     from: "3470test@gmail.com",
//     to: email, // user gets email
//     subject: "Your Course Video Access is Approved!",
//     text: `Hi,\n\nYour access request has been APPROVED.\nYou can now access the course.\n\nThanks,\nCourse Team`,
//     html: `
//       <p>Hi,</p>
//       <p>Your access request has been <strong style="color:green;">APPROVED</strong>.</p>
//       <p>You can now watch the course videos.</p>
//       <br/>
//       <p>Regards,<br/>Course Team</p>
//     `,
//   };


//   try {
//     await transporter.sendMail(mailOptions);
//     console.log("Approval Mail Sent to User");
//     res.send("GRANTED_AND_NOTIFIED");
//   } catch (err) {
//     console.error("Approval email failed:", err);
//     res.send("ERROR");
//   }
// });

// /*------------------------------------------------------------------
//     START SERVER
// -------------------------------------------------------------------*/
// app.listen(3000, () => {
//   console.log("Server running on http://localhost:3000");
// });
































// const express = require("express");
// const multer = require("multer");
// const nodemailer = require("nodemailer");
// const cors = require("cors");

// const upload = multer();
// const app = express();

// // Allow frontend
// app.use(
//   cors({
//     origin: "http://127.0.0.1:5500",
//   })
// );

// // Parse ONLY FormData
// app.post("/send-request", upload.none(), async (req, res) => {
//   const username = req.body.username;
//   const email = req.body.email;
//   const mobile = req.body.mobile;

//   console.log("Received:", username, email, mobile);

//   if (!username || !email || !mobile) {
//     return res.send("ERROR");
//   }

//   // Gmail transporter
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: "3470test@gmail.com",
//       pass: "oprbrroykumwnzns", // app password
//     },
//   });

//   const mailOptions = {
//     from: email,             // user email
//     to: "vignesh.g@3470healthcare.com",
//     replyTo: email,
//     subject: "New Course Video Access Request",
//     html: `
//       <p><strong>Username:</strong> ${username}</p>
//       <p><strong>Email:</strong> ${email}</p>
//       <p><strong>Mobile:</strong> ${mobile}</p>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     res.send("SUCCESS");
//   } catch (err) {
//     console.error("Mail Error:", err);
//     res.send("ERROR");
//   }
// });

// // Grant access API
// app.post("/grant-access", upload.none(), async (req, res) => {
//   const email = req.body.email;

//   if (!email) return res.send("MISSING_EMAIL");

//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: "3470test@gmail.com",
//       pass: "oprbrroykumwnzns",
//     },
//   });

//   const mailOptions = {
//     from: "3470test@gmail.com",
//     to: email,
//     subject: "Your Course Access Is Approved",
//     html: `
//       <p>Hi,</p>
//       <p>Your access request has been <b style="color:green;">APPROVED</b>.</p>
//       <p>You can now watch the course videos.</p>
//       <br/>
//       <p>Regards,<br/>Course Team</p>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     res.send("GRANTED_AND_NOTIFIED");
//   } catch (err) {
//     console.error("Approval mail error:", err);
//     res.send("ERROR");
//   }
// });

// app.listen(3000, () => {
//   console.log("Server running on http://localhost:3000");
// });








































// const express = require("express");
// const multer = require("multer");
// const nodemailer = require("nodemailer");
// const cors = require("cors");

// const upload = multer();
// const app = express();

// // Allow frontend
// app.use(
//   cors({
//     origin: "http://127.0.0.1:5500",
//   })
// );

// // Gmail transporter
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: "3470test@gmail.com",
//     pass: "oprbrroykumwnzns", // your app password
//   },
// });

// /*------------------------------------------------------------------
//    1) USER SENDS REQUEST → EMAIL GOES TO ADMIN
// -------------------------------------------------------------------*/
// app.post("/send-request", upload.none(), async (req, res) => {
//   const { username, email, mobile } = req.body;

//   console.log("Received:", username, email, mobile);

//   if (!username || !email || !mobile) {
//     return res.send("ERROR");
//   }

//   // Forced Reply-To headers
//   const adminMail = {
//     from: `"Course Access" <3470test@gmail.com>`,
//     sender: "3470test@gmail.com",
//     to: "vignesh.g@3470healthcare.com",
//     replyTo: email,
//     headers: {
//       "Reply-To": email,
//       "X-Reply-To": email,
//       "Return-Path": "3470test@gmail.com",
//     },
//     subject: "New Course Video Access Request",
//     html: `
//       <p><strong>Username:</strong> ${username}</p>
//       <p><strong>Email:</strong> ${email}</p>
//       <p><strong>Mobile:</strong> ${mobile}</p>

//       <br><br>
//       <p><b>⚠ Replying should go to:</b> ${email}</p>
//     `,
//   };

//   try {
//     await transporter.sendMail(adminMail);
//     console.log("Admin mail sent");
//     res.send("SUCCESS");
//   } catch (err) {
//     console.log("Mail Error:", err);
//     res.send("ERROR");
//   }
// });

// /*------------------------------------------------------------------
//    2) ADMIN APPROVES ACCESS → USER GETS EMAIL
// -------------------------------------------------------------------*/
// app.post("/grant-access", upload.none(), async (req, res) => {
//   const { email } = req.body;

//   if (!email) return res.send("MISSING_EMAIL");

//   const userMail = {
//     from: `"Course Access" <3470test@gmail.com>`,
//     to: email,
//     subject: "Your Course Access Is Approved",
//     html: `
//       <p>Hi,</p>
//       <p>Your access request has been <b style="color:green;">APPROVED</b>.</p>
//       <p>You can now watch the course videos.</p>
//       <br/>
//       <p>Regards,<br/>Course Team</p>
//     `,
//   };

//   try {
//     await transporter.sendMail(userMail);
//     console.log("Approval mail sent to user");
//     res.send("GRANTED_AND_NOTIFIED");
//   } catch (err) {
//     console.log("Approval Mail Error:", err);
//     res.send("ERROR");
//   }
// });

// /*------------------------------------------------------------------
//    START SERVER
// -------------------------------------------------------------------*/
// app.listen(3000, () => {
//   console.log("Server running on http://localhost:3000");
// });
































































const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const cors = require("cors");

const upload = multer();
const app = express();

// Allow frontend
app.use(
  cors({
    origin: "http://127.0.0.1:5500",
  })
);

// Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "3470test@gmail.com",
    pass: "oprbrroykumwnzns", // Gmail app password
  },
});

/*------------------------------------------------------------------
   1) USER SENDS REQUEST → EMAIL GOES TO OWNER
-------------------------------------------------------------------*/
app.post("/send-request", upload.none(), async (req, res) => {
  const { username, email, mobile } = req.body;

  if (!username || !email || !mobile) {
    return res.send("ERROR");
  }

  // Mail to owner with reply-to + cc
  const adminMail = {
  from: `"Course Access" <3470test@gmail.com>`,
  sender: "3470test@gmail.com",

  to: "vignesh.g@3470healthcare.com",
  
  // CC show for user
  cc: email,

  replyTo: email,

  headers: {
    "Cc": email,
    "X-CC": email,
    "Carbon-Copy": email,
    "Reply-To": email,
    "X-Reply-To": email,
    "Return-Path": "3470test@gmail.com"
  },

  subject: "New Course Video Access Request",
  html: `
    <p><strong>Username:</strong> ${username}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Mobile:</strong> ${mobile}</p>

    <br>
    <p><b>Reply-To:</b> ${email}</p>
    <p><b>CC:</b> ${email}</p>
  `,
};


  try {
    await transporter.sendMail(adminMail);
    console.log("Admin mail sent");
    res.send("SUCCESS");
  } catch (err) {
    console.log("Mail Error:", err);
    res.send("ERROR");
  }
});

/*------------------------------------------------------------------
   2) OWNER APPROVES ACCESS → USER GETS EMAIL
-------------------------------------------------------------------*/
app.post("/grant-access", upload.none(), async (req, res) => {
  const { email } = req.body;

  if (!email) return res.send("MISSING_EMAIL");

  const userMail = {
    from: `"Course Access" <3470test@gmail.com>`,
    to: email,
    subject: "Your Course Access Is Approved",
    html: `
      <p>Hi,</p>
      <p>Your video access request has been <b style="color:green;">APPROVED</b>.</p>
      <p>You may now watch all course videos.</p>
      <br/>
      <p>Regards,<br/>Course Team</p>
    `,
  };

  try {
    await transporter.sendMail(userMail);
    console.log("Approval mail sent to user");
    res.send("GRANTED_AND_NOTIFIED");
  } catch (err) {
    console.log("Approval Mail Error:", err);
    res.send("ERROR");
  }
});

/*------------------------------------------------------------------
   START SERVER
-------------------------------------------------------------------*/
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});





