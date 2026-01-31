require("dotenv").config();
const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
// const db = require("./db");
const app = express();
const upload = multer();

const pool = require("./db");

const Razorpay = require("razorpay");
const crypto = require("crypto");
// const { default: ShortUniqueId } = require("short-uuid");


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



    /* ---------------- RAZORPAY ---------------- */

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});


/* ---------------- COURSE DATA ---------------- */

const courses = {
  "Medical Coding Training": { fee: 10, discount: 9 },
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

/* ---------------- USER ID ---------------- */

// const uid = new ShortUniqueId({ length: 8 });

// const generateUserId = () => `MC-${uid()}`;

// const generateUserId = () => {
//   return `MC-${uuidv4().slice(0,8)}`;
// };




// =======================================================
// ✅ ENQUIRY API → CREATE PAYMENT LINK
// =======================================================

// app.post("/api/enquiry", async (req, res) => {

//   try {

//     const { name, email, phone, course, location, message } = req.body;

//     if (!name || !email || !phone || !course || !location) {
//       return res.status(400).json({
//         message: "All fields required"
//       });
//     }

//     if (!courses[course]) {
//       return res.status(400).json({
//         message: "Invalid course"
//       });
//     }

//     const finalAmount =
//       courses[course].fee - courses[course].discount;

//     /* CREATE PAYMENT LINK */

//     const paymentLink = await razorpay.paymentLink.create({
//       amount: finalAmount * 100,
//       currency: "INR",
//       description: course,
//       customer: { name, email, contact: phone }
//     });

//     /* SAVE AS PENDING */

//     await pool.query(`
//      INSERT INTO enquiries_3470_data
// (name,email,phone,course,location,message,final_amount,razorpay_link_id)
// VALUES (?,?,?,?,?,?,?,?)

//     `, [
//       name,
//       email,
//       phone,
//       course,
//       location,
//       message,
//       finalAmount,
//       paymentLink.id
//     ]);


//      /* 3️⃣ Send Email */
//     await transporter.sendMail({
//       from: `"3470 HealthCare" <${process.env.GMAIL_USER}>`,
//       to: email,
//       subject: "Complete Your Payment – 3470 HealthCare",
//       html: `
//         <h3>Hello ${name},</h3>
//         <p>Your payment link for <b>${course}</b> is ready.</p>
//         <p><b>Amount:</b> ₹${finalAmount}</p>
//         <p>
//           <a href="${paymentLink.short_url}"
//              style="padding:10px 20px;background:#068545;color:#fff;
//              text-decoration:none;border-radius:5px;">
//              Pay Now
//           </a>
//         </p>
//         <p>– 3470 HealthCare Team</p>
//       `
//     });


//     // res.json({
//     //   paymentUrl: paymentLink.short_url
//     // });

//     res.json({
//       success: true,
//       message: "Payment link sent to your email"
//     });

//   } catch (err) {

//     console.log("SERVER ERROR:", err);
//     res.status(500).json({
//       message: "Server error"
//     });
//   }
// });


app.post("/api/enquiry", async (req, res) => {
  try {
    const { name, email, phone, course, location, message } = req.body;

    if (!name || !email || !phone || !course || !location) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (!courses[course]) {
      return res.status(400).json({ message: "Invalid course" });
    }

    const finalAmount = courses[course].fee - courses[course].discount;

    /* 1️⃣ Create Razorpay Payment Link */
    const paymentLink = await razorpay.paymentLink.create({
      amount: finalAmount * 100,
      currency: "INR",
      description: course,
      customer: { name, email, contact: phone }
    });

    /* 2️⃣ Save to DB */
    await pool.query(`
      INSERT INTO enquiries_3470_data
      (name,email,phone,course,location,message,final_amount,razorpay_link_id,status)
      VALUES (?,?,?,?,?,?,?,?,'pending')
    `, [
      name,
      email,
      phone,
      course,
      location,
      message || "NA",
      finalAmount,
      paymentLink.id
    ]);

    /* 3️⃣ SEND ENQUIRY DETAILS TO ADMIN */
    await transporter.sendMail({
      from: `"3470 HealthCare Enquiry" <${process.env.GMAIL_USER}>`,
      to: "vignesh.g@3470healthcare.com",
      subject: "📝 New Enquiry Received – Payment Link Created",
      html: `
        <div style="font-family:Arial;padding:20px;border:1px solid #e5e5e5;border-radius:8px;
                    background:#f9fbff;max-width:550px;">
                    
        <h2 style="color:#068545;">New Enquiry Received</h2>

        <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;font-size:14px;color:#333;">
          <tr><td style="font-weight:bold;width:35%;"><b>Name</b></td><td>${name}</td></tr>
          <tr><td style="font-weight:bold;width:35%;"><b>Email</b></td><td>${email}</td></tr>
          <tr><td style="font-weight:bold;width:35%;"><b>Mobile</b></td><td>${phone}</td></tr>
          <tr><td style="font-weight:bold;width:35%;"><b>Course</b></td><td>${course}</td></tr>
          <tr><td style="font-weight:bold;width:35%;"><b>Location</b></td><td>${location}</td></tr>
          <tr><td style="font-weight:bold;vertical-align:top;""><b>Message</b></td><td style="word-break:break-word;">${message || "NA"}</td></tr>
          <tr><td style="font-weight:bold;width:35%;"><b>Amount</b></td><td>₹${finalAmount}</td></tr>
        </table>

        <p>
          <b>Payment Link:</b><br>
          <a href="${paymentLink.short_url}">
            ${paymentLink.short_url}
          </a>
        </p>
        
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
    });


     /* 4️⃣ SEND PAYMENT LINK TO USER */
   
    await transporter.sendMail({
  from: `"3470 HealthCare" <${process.env.GMAIL_USER}>`,
  to: email,
  subject: "Payment Confirmation for Your Course – 3470 HealthCare",
  html: `
  <div style="font-family:Arial;padding:20px;border:1px solid #e5e5e5;border-radius:8px;
      background:#f9fbff;max-width:550px;">

    <h3 style="color:#333;">Hello ${name},</h3>

    <p style="font-size:14px;color:#555;">
      Your payment link for <b>${course}</b> is ready.
    </p>

    <p style="font-size:14px;color:#555;">
      <b>Amount:</b> ₹${finalAmount}
    </p>

    <a href="${paymentLink.short_url}"
       style="display:inline-block;padding:12px 24px;background-color:#068545;color:#ffffff;text-decoration:none;border-radius:4px;
              font-size:14px;font-weight:bold;">
      Pay Now
    </a>

    <div style="margin:20px 0;padding:12px;background:#e9f7ef;border-left:4px solid #068545;">
      <p style="margin:0;font-size:13px;color:#11682e;">
        If you have any questions, feel free to contact our support team.
      </p>

      <p style="margin:6px 0 0;font-size:13px;color:#11682e;">
         📞 <b>Support:</b> +91 99766 14395 
      </p>
  
    </div>

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
});


    /* 4️⃣ Single Response */
    res.json({
      success: true,
      message: "Enquiry submitted successfully!. ✅ Payment link has been sent to your email."
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// =======================================================
// 🔥 RAZORPAY WEBHOOK (MOST IMPORTANT)
// =======================================================

app.post(
  "/razorpay-webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const expected = crypto
      .createHmac("sha256", secret)
      .update(req.body)
      .digest("hex");

    const signature = req.headers["x-razorpay-signature"];

    if (expected !== signature) {
      return res.status(400).send("Invalid signature");
    }

    // const body = JSON.parse(req.body);

    const body = JSON.parse(req.body.toString());


    if (body.event === "payment_link.paid") {

      const payment = body.payload.payment.entity;
      const link = body.payload.payment_link.entity;

      const userId = `MC-${uuidv4().slice(0,8)}`;

      try {

        await pool.query(`
          UPDATE enquiries_3470_data
          SET 
            status='paid',
            user_id=?,
            razorpay_payment_id=?
          WHERE razorpay_link_id=?
        `, [
          userId,
          payment.id,
          link.id
        ]);

        // SEND EMAIL AFTER SUCCESS
        await transporter.sendMail({
          to: payment.email,
          subject: "Payment Successful 🎉",
          html: `
            <h2>Payment Confirmed</h2>
            <p>Your User ID:</p>
            <h1>${userId}</h1>
          `
        });

        console.log("✅ Payment success. User:", userId);

      } catch (err) {
        console.log("DB ERROR:", err);
      }
    }

    res.json({ status: "ok" });
  }
);


// -------------------------------------------------------------------------------------------------------------------------------------------











/* ==========================
   START SERVER
========================== */

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

