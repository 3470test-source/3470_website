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
   1) USER SENDS REQUEST → EMAIL GOES TO OWNER  + SAVE TO EXCEL
-------------------------------------------------------------------*/
app.post("/send-request", upload.none(), async (req, res) => {
  const { username, email, mobile } = req.body;

  if (!username || !email || !mobile) {
    return res.status(400).send("ERROR — Missing required fields");
  }





  






  // Send email to admin
  const adminMail = {
    from: `"3470 Healthcare | Course Access Request" <3470test@gmail.com>`,
    to: "vignesh.g@3470healthcare.com",

    // WORKING REPLY-TO
    replyTo: email,

    // OPTIONAL CC (turn ON if you want)
    // cc: email,

    subject: `New Access Request - ${username}`,
    html: `
      <div style="font-family:Arial;padding:15px;border:1px solid #e5e5e5;border-radius:8px;
      background:#f9fbff;max-width:500px;">
      
      <h2 style='color:blue;'>New Course Video Access Request</h2>

      <p>Dear Admin,</p>

      <p>A new user has requested access to the course videos. Details are below:</p>
      <p><strong>Username:</strong> ${username}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Mobile:</strong> ${mobile}</p>

      <hr style="margin:15px 0;">
    
      <p>Please review & provide access.</p>

      <p style="color:#11682e;font-size:15px;margin-top:15px;font-weight:bold;">
        3470 Healthcare Training & Certification Program
      </p>

      <p style="margin-top:5px;font-size:14px;font-weight:600;">
       Regards,<br>
       Course Team
      </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(adminMail);
    console.log("Admin mail sent successfully");
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
    <div style="font-family:Arial;padding:20px;border:1px solid #e5e5e5;border-radius:8px;
      background:#f9fbff;max-width:550px;">

      <h2 style='color:green;'>Access Granted – You Can Now View the Course Videos</h2>

      <p>Dear student,</p>
      <p>Your request has been reviewed and <b>approved</b>.</p>
      <p>You can now watch all course videos anytime.</p>

      <hr style="margin:15px 0;">

      <p style="color:#11682e;font-size:15px;margin-top:15px;font-weight:bold;">
      3470 Healthcare Training & Certification Program
      </p>

      <p style="margin-top:5px;font-size:14px;font-weight:600;">
      Regards,<br>
      Course Team
      </p>
    </div>
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
