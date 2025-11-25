
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

  const adminMail = {
    from: `"Course Access" <3470test@gmail.com>`,
    to: "vignesh.g@3470healthcare.com",

    // WORKING REPLY-TO
    replyTo: email,

    // OPTIONAL CC (turn ON if you want)
    // cc: email,

    subject: "New Course Video Access Request",
    html: `
      <p><strong>Username:</strong> ${username}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Mobile:</strong> ${mobile}</p>
      <br>
      <p>You can directly reply to this email. The reply will go to the user.</p>
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
    from: "3470 Healthcare – Course Access Team <3470test@gmail.com>",
    to: email,
    subject: "Your Course Video Access Has Been Approved ✅",
    html: `
    <h2 style='color:green;'>Access Granted – You Can Now View the Course Videos</h2>

    <p>Dear student - ${email},</p>
    <p>Your request has been reviewed and <b>approved</b>.</p>
    <p>You can now watch all course videos anytime.</p>

    <br>
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















