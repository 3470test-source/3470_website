require("dotenv").config();
const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const db = require("./db");
const app = express();
const upload = multer();

const Razorpay = require("razorpay");
const ShortUniqueId = require("short-uuid");


const allowedOrigins = [
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "https://3470healthcare.net",
  "https://www.3470healthcare.net"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS blocked"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// ✅ THIS IS REQUIRED
app.options(/.*/, cors());


app.use(express.json());
app.use(bodyParser.json());


/* ==========================
       ENQUIRY FORM 
   ========================== */

// app.post("/api/enquiry", (req, res) => {
//   const { name, email, phone, course, location, message } = req.body;

//   if (!name || !email || !phone || !course || !location) {
//     return res.status(400).json({ message: "All fields required" });
//   }

//   const sql = `
//     INSERT INTO enquiries (name, email, phone, course, location, message)
//     VALUES (?, ?, ?, ?, ?, ?)
//   `;

//   db.query(
//     sql,
//     [name, email, phone, course, location, message],
//     (err) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({ message: "Database Error" });
//       }
//       res.json({ message: "Enquiry submitted successfully" });
//     }
//   );
// });



/* ==========================
   NODEMAILER (GMAIL)
========================== */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});


const FRONTEND_URL =
  process.env.NODE_ENV === "production"
    ? process.env.PROD_FRONTEND_URL
    : process.env.LOCAL_FRONTEND_URL;


/* ==========================
   OTP STORES (TEMP)
========================== */

const users = {
  "3470test@gmail.com": { password: "dummy" }
};

const otpStore = {};
const resetTokenStore = {};

/* ==========================
   SEND OTP
========================== */

const sendOtp = (email, otp) => {
  return transporter.sendMail({
    from: `"3470 HealthCare" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "🔐 3470 HealthCare – Password Reset OTP",
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; background-color:#f4f6f8; padding:20px;">

        <div style="max-width:500px; margin:auto; background:#ffffff; border-radius:8px; padding:30px; box-shadow:0 0 10px rgba(0,0,0,0.1);">

          <h2 style="text-align:center; color:#068545; margin-bottom:10px;">
            3470 HealthCare Training & Certification Program
          </h2>

          <p style="text-align:center; color:#777; font-size:15px; margin-bottom:25px;">
            Account Security Verification
          </p>

          <p style="color:#555; font-size:14px;">Hello,</p>

          <p style="color:#555; font-size:14px;">
            We received a request to reset your password for your
            <b>3470 HealthCare Pvt Ltd</b> account.
          </p>

          <div style="text-align:center; margin:25px 0;">
            <span style="display:inline-block; font-size:24px; letter-spacing:4px; font-weight:bold; color:#ffffff; background-color:#068545; padding:12px 24px; border-radius:6px;">
              ${otp}
            </span>
          </div>

          <p style="color:#555; font-size:14px;">
            This OTP is valid for <b>5 minutes</b>.
          </p>

          <p style="color:#999; font-size:12px;">
            If you did not request this password reset, please ignore this email.
          </p>

          <hr style="margin:15px 0;">

          <p style="color:#11682e; font-size:15px; font-weight:bold;">
            3470 HealthCare Training & Certification Program
          </p>

          <p style="font-size:14px; font-weight:600;">
            Regards,<br>
            3470 HealthCare Pvt Ltd
          </p>

        </div>
      </div>
    `
  });
};

/* ==========================
   FORGOT PASSWORD
========================== */

app.post("/api/forgot-password", (req, res) => {
  const { email } = req.body;

  if (!users[email]) {
    return res.json({ success: false, message: "Email not registered" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = { otp, expiry: Date.now() + 5 * 60 * 1000 };

  sendOtp(email, otp);
  res.json({ success: true });
});

/* ==========================
   VERIFY OTP
========================== */

app.post("/api/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];

  if (!record || record.otp !== otp)
    return res.json({ success: false, message: "Invalid OTP" });

  if (Date.now() > record.expiry)
    return res.json({ success: false, message: "OTP expired" });

  const token = uuidv4();
  resetTokenStore[token] = {
    email,
    expiry: Date.now() + 10 * 60 * 1000
  };

  delete otpStore[email];
  res.json({ success: true, token });
});

/* ==========================
   RESET PASSWORD
========================== */

app.post("/api/reset-password", async (req, res) => {
  const { token, password } = req.body;
  const record = resetTokenStore[token];

  if (!record)
    return res.json({ success: false, message: "Invalid token" });

  if (Date.now() > record.expiry)
    return res.json({ success: false, message: "Token expired" });

  // users[record.email].password = await bcrypt.hash(password, 10);
  // users[record.email].password = hashedPassword;

  const hashedPassword = await bcrypt.hash(password, 10);
  users[record.email].password = hashedPassword;

  delete resetTokenStore[token];

  res.json({ success: true });
});

/* ==========================
   REGISTER USER
========================== */

app.post("/api/register", async (req, res) => {
  const { name, email, mobile, password } = req.body;

  // Basic validation
  if (!name || !email || !mobile || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required"
    });
  }

  // Mobile validation (server-side)
  const mobileRegex = /^[6-9]\d{9}$/;
  if (!mobileRegex.test(mobile)) {
    return res.status(400).json({
      success: false,
      message: "Invalid mobile number"
    });
  }

  // Strong password validation
  const strongPass = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$/;
  if (!strongPass.test(password)) {
    return res.status(400).json({
      success: false,
      message: "Weak password format"
    });
  }

  try {
    // TODO: SAVE USER IN DATABASE HERE (example)
    // await User.create({ name, email, mobile, password });

    // ✔ Only after successful registration → send email
    const mailOptions = {
      from: "3470test@gmail.com",
      to: email,
      subject: "Welcome to 3470 HealthCare! Your Registration is Complete 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; color:#333; line-height:1.5; max-width:600px; padding:20px; border:1px solid #d6ceceff; border-radius:10px;">

        <h2 style="color:#068545;">Welcome, ${name}!</h2>
        <p>Your account has been successfully created on <b>3470 HealthCare & Medical Coding Training Institute</b>.</p>

        <h3 style="color:#03521d;">Your Login Details:</h3>
        <p style="background:#f4f4f4; padding:10px; border-radius:5px;">
          <b>Username:</b> ${email}<br>
          <b>Password:</b> ${password}<br>
        </p>

        <p>Click below to <a href="${FRONTEND_URL}/login.html" style="color:#fff; background:#068545; padding:10px 20px; text-decoration:none; border-radius:5px;">Login Now</a></p>

        <p style="font-size:12px; color:#999; margin-top:20px;">If you did not register, please ignore this email.</p>

        <hr style="margin:15px 0;">

        <p style="color:#11682e;font-size:15px;margin-top:15px;font-weight:bold;">
         3470 Healthcare Training & Certification Program
        </p>

        <p style="margin-top:5px;font-size:14px;font-weight:600;">
         Regards,<br>
         3470 HealthCare Pvt Ltd
        </p>
       </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      message: "Your account has been created successfully. A confirmation email has been sent."
    });

  } catch (error) {
    console.error("Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Registration completed, but email failed to send."
    });
  }
});


/* ==========================
   SEND REQUEST → ADMIN
========================== */

app.post("/send-request", upload.none(), async (req, res) => {
  const { username, email, course, mobile } = req.body;

  if (!username || !email || !course || !mobile) {
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
      <p><strong>Course:</strong> ${course}</p>
      <p><strong>Mobile:</strong> ${mobile}</p>

      <hr style="margin:15px 0;">
    
      <p>Please review & provide access.</p>

      <p style="color:#11682e;font-size:15px;margin-top:15px;font-weight:bold;">
        3470 Healthcare Training & Certification Program
      </p>

      <p style="margin-top:5px;font-size:14px;font-weight:600;">
       Regards,<br>
       3470 HealthCare Pvt Ltd
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

/* ==========================
   GRANT ACCESS
========================== */

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
      3470 HealthCare Pvt Ltd
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











// ----------------------------------------------------------------------------------------------------------------------------------








/* ---------------- COURSE DATA ---------------- */

const courses = {
  "Medical Coding Training": { fee: 14000, discount: 2000 },
  "Basic Medical Coding Training": { fee: 14000, discount: 2000 },
  "Advanced Medical Coding Training": { fee: 14000, discount: 2000 },
  "Certified Professional Coder": { fee: 14000, discount: 2000 },
  "Certified Professional Medical Auditor": { fee: 14000, discount: 2000 },
  "Certified Risk Adjustment Coder": { fee: 14000, discount: 2000 },
  "Certified Coding Specialist": { fee: 14000, discount: 2000 },
  "Evaluation & Management": { fee: 14000, discount: 2000 },
  "Emergency Department": { fee: 14000, discount: 2000 },
  "Inpatient Coding Diagnosis Related Groups": { fee: 14000, discount: 2000 },
  "Interactive Voice Response": { fee: 14000, discount: 2000 },
  "Surgery Training": { fee: 14000, discount: 2000 }
};

/* ---------------- USER ID ---------------- */

const uid = new ShortUniqueId({ length: 8 });

const generateUserId = () => `MC-${uid()}`;

/* ---------------- RAZORPAY ---------------- */

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/* =======================================================
                FINAL ENQUIRY API
======================================================= */

app.post("/api/enquiry", async (req, res) => {

  const connection = await pool.getConnection();

  try {

    const { name, email, phone, course, location, message } = req.body;

    /* ---------- VALIDATION ---------- */

    if (!name || !email || !phone || !course || !location) {
      return res.status(400).json({
        message: "All fields required"
      });
    }

    if (!courses[course]) {
      return res.status(400).json({
        message: "Invalid course selected"
      });
    }

    const cleanPhone = phone.replace(/\D/g, '');

    if (cleanPhone.length < 10) {
      return res.status(400).json({
        message: "Invalid phone number"
      });
    }

    /* ---------- PRICE ---------- */

    const fee = courses[course].fee;
    const discount = courses[course].discount;
    const finalAmount = fee - discount;

    const userId = generateUserId();

    /* ===================================================
        START TRANSACTION (VERY IMPORTANT)
    =================================================== */

    await connection.beginTransaction();

    /* ---------- DUPLICATE CHECK ---------- */

    const [existing] = await connection.query(
      "SELECT id FROM enquiries WHERE phone=? LIMIT 1",
      [cleanPhone]
    );

    if (existing.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        message: "You have already submitted an enquiry. Our team will contact you."
      });
    }

    /* ---------- INSERT ENQUIRY ---------- */

    const insertSQL = `
      INSERT INTO enquiries
      (user_id, name, email, phone, course, location, message, fee, discount, final_amount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await connection.query(insertSQL, [
      userId,
      name,
      email,
      cleanPhone,
      course,
      location,
      message || null,
      fee,
      discount,
      finalAmount
    ]);

    /* ---------- CREATE PAYMENT LINK ---------- */

    const paymentLink = await razorpay.paymentLink.create({
      amount: finalAmount * 100,
      currency: "INR",
      description: course,
      customer: {
        name,
        email,
        contact: cleanPhone
      },
      notify: {
        sms: true,
        email: true
      },
      reminder_enable: true,
      notes: { userId }
    });

    /* ---------- COMMIT ---------- */

    await connection.commit();

    /* ---------- SEND EMAIL ---------- */

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Course Payment Link",
      html: `
        <h2>Hello ${name}</h2>

        <p><b>User ID:</b> ${userId}</p>
        <p><b>Course:</b> ${course}</p>

        <h3>Final Amount: ₹${finalAmount}</h3>

        <a href="${paymentLink.short_url}"
        style="padding:12px 20px;background:#28a745;color:white;text-decoration:none;border-radius:6px;">
        Pay Now
        </a>
      `
    });

    res.json({
      message: "Enquiry submitted successfully!",
      paymentUrl: paymentLink.short_url,
      userId
    });

  } catch (err) {

    await connection.rollback();

    console.error("SERVER ERROR:", err);

    res.status(500).json({
      message: "Something went wrong"
    });

  } finally {
    connection.release();
  }
});







// -------------------------------------------------------------------------------------------------------------------------------------------











/* ==========================
   START SERVER
========================== */

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

