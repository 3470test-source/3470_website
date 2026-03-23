require("dotenv").config();
const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");


const app = express();
const upload = multer();

const pool = require("./db");

const Razorpay = require("razorpay");
const crypto = require("crypto");



const fs = require("fs")
const path = require("path")

app.use(express.json())
app.use(cors())


/* ==========================
   PDF OTP STORE
========================== */

const pdfOtpStore = {};
const tokenStore = {}


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



/* =====================================================
   🔥 RAZORPAY WEBHOOK (MUST BE FIRST)
===================================================== */

app.post(
  "/webhook/payment",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(req.body)
        .digest("hex");

      const razorpaySignature = req.headers["x-razorpay-signature"];

      if (expectedSignature !== razorpaySignature) {
        console.log("❌ Signature mismatch", {
    expectedSignature,
    razorpaySignature
  });
        return res.status(400).send("Invalid signature");
      }

      const body = JSON.parse(req.body.toString());
      console.log("📦 Webhook Event:", body.event);

      if (body.event === "payment_link.paid") {
        const payment = body.payload.payment.entity;
        const link = body.payload.payment_link.entity;

        const customerEmail = link.customer.email;
        const userId = `MC-${uuidv4().slice(0, 8)}`;

        const [result] = await pool.query(
          `
          UPDATE enquiries_3470_data
          SET status='paid',
              user_id=?,
              razorpay_payment_id=?
          WHERE razorpay_link_id=? AND status!='paid'
        `,
          [userId, payment.id, link.id]
        );

        console.log("🗄️ DB Updated Rows:", result.affectedRows);


         // -------------------------------
        // 4️⃣ Fetch Razorpay Invoice PDF
        // -------------------------------
        let attachments = [];
        let invoicePdfUrl = null;

        if (payment.invoice_id) {
          try {
            const invoice = await razorpay.invoices.fetch(payment.invoice_id);
            invoicePdfUrl = invoice.pdf_url;

            console.log("📄 Invoice PDF URL:", invoicePdfUrl);

            if (invoicePdfUrl) {
              const response = await axios.get(invoicePdfUrl, {
                responseType: "arraybuffer"
              });

              attachments.push({
                filename: "Payment_Receipt.pdf",
                content: response.data,
                contentType: "application/pdf"
              });

              console.log("✅ Invoice downloaded & attached");
            }
          } catch (err) {
            console.log("❌ Invoice fetch/download failed:", err.message);
          }
        } else {
          console.log("⚠️ No invoice_id from Razorpay");
        }


        if (result.affectedRows > 0) {
          await transporter.sendMail({
            from: `"3470 HealthCare" <${process.env.GMAIL_USER}>`,
            to: customerEmail,
            subject: "Payment Successful 🎉",
            html: `
              <h2>Payment Confirmed</h2>
              <p>Your User ID:</p>
              <h1>${userId}</h1>
              <p>Please find your payment receipt attached.</p>
              <p>Thank you for choosing 3470 HealthCare.</p>
            `,
            attachments
          });

          console.log("📧 Confirmation email sent to", customerEmail);
        }
      }

      res.json({ status: "ok" });

    } catch (err) {
      console.error("🔥 Webhook Error:", err);
      res.status(500).send("Webhook error");
    }
  }
);

/* AFTER webhook */
app.use(express.json());

/* =====================================================
   MIDDLEWARES (AFTER WEBHOOK)
===================================================== */

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

    
     /* ----- 2️⃣ Save to DB ----- */

const [result] = await pool.query(`
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

const insertedId = result.insertId;
const enquiryNo = `3470-${insertedId}`;

await pool.query(`
  UPDATE enquiries_3470_data
  SET enquiry_no = ?
  WHERE id = ?
`, [enquiryNo, insertedId]);


    /* --------- 3️⃣ SEND ENQUIRY DETAILS TO ADMIN -------- */

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




app.get("/getUser", (req, res) => {
  if (req.session && req.session.user) {
    res.json({ username: req.session.user });
  } else {
    res.json({ username: null });
  }
});


// app.use(express.json());
app.use(bodyParser.json());
app.use(express.static("public"));


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

// app.post("/api/register", async (req, res) => {
//   const { name, email, mobile, password } = req.body;

//   // Basic validation
//   if (!name || !email || !mobile || !password) {
//     return res.status(400).json({
//       success: false,
//       message: "All fields are required"
//     });
//   }

//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   if (!emailRegex.test(email)) {
//     return res.status(400).json({ success: false, message: "Invalid email format" });
//   }



//   // Mobile validation (server-side)
//   const mobileRegex = /^[6-9]\d{9}$/;
//   if (!mobileRegex.test(mobile)) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid mobile number"
//     });
//   }

//   // Strong password validation
//   const strongPass = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$/;
//   if (!strongPass.test(password)) {
//     return res.status(400).json({
//       success: false,
//       message: "Weak password format"
//     });
//   }

//   try {

//      // ✅ Check duplicate email
//     const [existingUser] = await pool.query(
//       "SELECT * FROM users WHERE email = ?",
//       [email]
//     );

//     if (existingUser.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Email already registered"
//       });
//     }

//     // ✅ Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // ✅ Insert user
//     await pool.query(
//       "INSERT INTO users (name, email, mobile, password) VALUES (?, ?, ?, ?)",
//       [name, email, mobile, hashedPassword]
//     );


//     // TODO: SAVE USER IN DATABASE HERE (example)
//     // await User.create({ name, email, mobile, password });

//     // ✔ Only after successful registration → send email
//     const mailOptions = {
//       from: "3470test@gmail.com",
//       to: email,
//       subject: "Welcome to 3470 HealthCare! Your Registration is Complete 🎉",
//       html: `
//         <div style="font-family: Arial, sans-serif; color:#333; line-height:1.5; max-width:600px; padding:20px; border:1px solid #d6ceceff; border-radius:10px;">

//         <h2 style="color:#068545;">Welcome, ${name}!</h2>
//         <p>Your account has been successfully created on <b>3470 HealthCare & Medical Coding Training Institute</b>.</p>

//         <h3 style="color:#03521d;">Your Login Details:</h3>
//         <p style="background:#f4f4f4; padding:10px; border-radius:5px;">
//           <b>Username:</b> ${email}<br>
//           <b>Password:</b> ${password}<br>
//         </p>

//         <p>Click below to <a href="${FRONTEND_URL}/login.html" style="color:#fff; background:#068545; padding:10px 20px; text-decoration:none; border-radius:5px;">Login Now</a></p>

//         <p style="font-size:12px; color:#999; margin-top:20px;">If you did not register, please ignore this email.</p>

//         <hr style="margin:15px 0;">

//         <p style="color:#11682e;font-size:15px;margin-top:15px;font-weight:bold;">
//          3470 Healthcare Training & Certification Program
//         </p>

//         <p style="margin-top:5px;font-size:14px;font-weight:600;">
//          Regards,<br>
//          3470 HealthCare Pvt Ltd
//         </p>
//        </div>
//       `
//     };

//     await transporter.sendMail(mailOptions);

//     return res.json({
//       success: true,
//       message: "Your account has been created successfully. A confirmation email has been sent."
//     });

//   } catch (error) {
//     console.error("Error:", error.message);

//     return res.status(500).json({
//       success: false,
//       message: "Registration completed, but email failed to send."
//     });
//   }
// });




app.post("/api/register", async (req, res) => {
  try {
    // ✅ Trim inputs
    const name = req.body.name?.trim();
    const email = req.body.email?.trim();
    const mobile = req.body.mobile?.trim();
    const password = req.body.password?.trim();

    // ✅ Basic validation
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // ✅ Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    // ✅ Mobile validation
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mobile number"
      });
    }

    // ✅ Strong password validation
    const strongPass = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$/;
    if (!strongPass.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be strong (8+ chars, uppercase, lowercase, number, special char)"
      });
    }

    // ✅ Check duplicate email (fast query)
    const [existingUser] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Insert user
    await pool.query(
      "INSERT INTO users (name, email, mobile, password) VALUES (?, ?, ?, ?)",
      [name, email, mobile, hashedPassword]
    );

    // ✅ Send safe email (NO PASSWORD)
    await transporter.sendMail({
      from: `"3470 HealthCare" <3470test@gmail.com>`,
      to: email,
      subject: "Welcome to 3470 HealthCare 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; max-width:600px; padding:20px; border:1px solid #ddd; border-radius:10px;">
          
          <h2 style="color:#068545;">Welcome, ${name}!</h2>
          
          <p>Your account has been successfully created on 
          <b>3470 HealthCare & Medical Coding Training Institute</b>.</p>

          <p><b>Username:</b> ${email}</p>

          <p>You can now login using your registered email and password.</p>

          <a href="${FRONTEND_URL}/login.html"
             style="display:inline-block;margin-top:15px;padding:10px 20px;background:#068545;color:#fff;text-decoration:none;border-radius:5px;">
             Login Now
          </a>

          <hr style="margin:20px 0;">

          <p style="color:#11682e;font-weight:bold;">
            3470 Healthcare Training & Certification Program
          </p>

          <p>Regards,<br>3470 HealthCare Pvt Ltd</p>
        </div>
      `
    });

    return res.json({
      success: true,
      message: "Account created successfully. Email sent."
    });

  } catch (error) {
    console.error("Register Error:", error);

    // ✅ Handle duplicate from DB (important)
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});













app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.json({ success: false, message: "User not found" });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid password" });
    }

    res.json({
      success: true,
      user: {
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
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









/*---- pdf link otp popup alert ----*/

/* ======================
   GENERATE OTP
====================== */

app.post("/api/pdf/generate-otp",async(req,res)=>{

try{

const {file} = req.body

const fileName = path.basename(file)

const otp = Math.floor(100000 + Math.random()*900000).toString()

pdfOtpStore[file] = {
otp,
expiry:Date.now()+5*60*1000
}

console.log("OTP:",otp)

await transporter.sendMail({

    from: `"3470 HealthCare Secure Access" <${process.env.GMAIL_USER}>`,
    to: "3470test@gmail.com",
    subject: "🔐 OTP for Secure Document Access",
    html: `
  <div style="font-family:Arial,sans-serif;background:#f4f6f8;padding:30px;">
  
  <div style="max-width:500px;margin:auto;background:white;border-radius:8px;padding:30px;text-align:center;box-shadow:0 4px 10px rgba(0,0,0,0.1);">

    <h2 style="color:#2c3e50;margin-bottom:10px;">
      🔐 Secure Document Access
    </h2>

    <p style="font-size:15px;color:#555;">
      You requested access to view a secure document.
    </p>

    <p>
      Document: <b>${fileName}</b>
    </p>

    <p style="font-size:15px;color:#555;">
      Please use the following <b>One-Time Password (OTP)</b> to view the document.
    </p>

    <div style="font-size:28px;font-weight:bold;letter-spacing:5px;color:#007bff;margin:20px 0;">
      ${otp}
    </div>

    <p style="color:#777;font-size:14px;">
      This OTP is valid for <b>5 minutes</b>.
    </p>

    <hr style="margin:25px 0">

    <p style="font-size:12px;color:#999;">
      If you did not request this access, please ignore this email.
    </p>

    <p style="font-size:12px;color:#999;">
      © 3470 HealthCare Pvt Ltd
    </p>

  </div>

</div>
      `
})

res.json({success:true})

}catch(err){

console.log(err)
res.status(500).json({success:false})

}

})

/* ======================
   VERIFY OTP
====================== */

app.post("/api/pdf/verify-otp",(req,res)=>{

const {file,otp} = req.body

const record = pdfOtpStore[file]

if(!record)
return res.json({success:false,message:"OTP not found"})

if(Date.now()>record.expiry)
return res.json({success:false,message:"OTP expired"})

if(record.otp !== otp)
return res.json({success:false,message:"Invalid OTP"})

delete pdfOtpStore[file]

const token = Math.random().toString(36).substring(2)

tokenStore[token] = {
file:file,
expiry:Date.now() + (5 * 60 * 1000)
}

res.json({
success:true,
token:token,
expiry:Date.now() + (5 * 60 * 1000)
})

})

/* ======================
   CHECK TOKEN
====================== */

app.get("/api/pdf/check-token",(req,res)=>{

const {token,file} = req.query

const record = tokenStore[token]

if(!record)
return res.json({valid:false})

if(Date.now()>record.expiry){

delete tokenStore[token]
return res.json({valid:false})

}

if(record.file !== file)
return res.json({valid:false})

res.json({valid:true})

})

/* ======================
   STREAM PDF
====================== */

app.get("/api/pdf/stream",(req,res)=>{

const {file,token} = req.query

const record = tokenStore[token]

if(!record)
return res.status(403).send("Invalid token")

if(Date.now()>record.expiry){
delete tokenStore[token]
return res.status(403).send("Token expired")
}

if(record.file !== file)
return res.status(403).send("File access denied")

const safeFile = path.basename(file)

const safePath = path.join(__dirname,"CPC_PDF",safeFile)

if(!fs.existsSync(safePath))
return res.send("File not found")

res.sendFile(safePath)

})















app.post("/api/create-payment-link", async (req, res) => {
  try {
    const { name, email, phone, program, amount } = req.body;

    const paymentLink = await razorpay.paymentLink.create({
      amount: amount * 100,
      currency: "INR",
      description: `${program} Registration Fee`,

      customer: {
        name,
        email,
        contact: phone
      },

      notify: {
        sms: true,
        email: true
      },

      callback_url: "http://localhost:5500/success.html",
      callback_method: "get"
    });

    // 👉 Save link.id in DB (IMPORTANT for webhook match)
    await pool.query(
      `UPDATE enquiries_3470_data 
       SET razorpay_link_id=? 
       WHERE email=? 
       ORDER BY id DESC LIMIT 1`,
      [paymentLink.id, email]
    );

    res.json({
      success: true,
      payment_url: paymentLink.short_url
    });

  } catch (err) {
    console.error("Payment link error:", err);
    res.status(500).json({ success: false });
  }
});



/* ==========================
   START SERVER
========================== */

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});











// ___________________________________






// const express = require("express");
// const path = require("path");
// const fs = require("fs");
// const cors = require("cors");

// const app = express();

// app.use(cors());
// app.use(express.json());
// app.use(express.static("public"));

// /* CONFIG */
// const STATIC_OTP = "34347052";
// const LINK_EXPIRY = 50 * 24 * 60 * 60 * 1000; // 50 days
// const TOKEN_EXPIRY = 15 * 60 * 1000; // 15 mins

// const tokenOtpStore = {};

// /* ================= OTP VERIFY ================= */

// app.post("/api/pdf/verify-otp", (req, res) => {

//   const { file, otp, ts } = req.body;

//   if (!file || !otp || !ts) {
//     return res.json({ success: false, message: "Missing data" });
//   }

//   if (Date.now() > Number(ts) + LINK_EXPIRY) {
//     return res.json({ success: false, message: "Link expired" });
//   }

//   if (otp.trim() !== STATIC_OTP) {
//     return res.json({ success: false, message: "Invalid OTP" });
//   }

//   const token = Math.random().toString(36).substring(2);

//   tokenOtpStore[token] = {
//     file,
//     expiry: Date.now() + TOKEN_EXPIRY
//   };

//   res.json({ success: true, token });

// });

// /* ================= PDF STREAM ================= */

// app.get("/api/pdf/stream", (req, res) => {

//   const { file, token } = req.query;

//   if (!file || !token) {
//     return res.status(400).send("Missing params");
//   }

//   const record = tokenOtpStore[token];

//   if (!record) return res.status(403).send("Invalid token");

//   if (Date.now() > record.expiry)
//     return res.status(403).send("Token expired");

//   if (record.file !== file)
//     return res.status(403).send("Access denied");

//   // 🔐 SAFE FILE HANDLING
//   const safeFile = path.basename(file);
//   const filePath = path.join(__dirname, "CPC_PDF", safeFile);

//   console.log("Serving file:", filePath);

//   if (!fs.existsSync(filePath)) {
//     return res.status(404).send("File not found");
//   }

//   res.setHeader("Content-Type", "application/pdf");
//   res.setHeader("Content-Disposition", "inline");

//   res.sendFile(filePath);

// });

// /* CLEANUP */

// setInterval(() => {
//   const now = Date.now();
//   for (let t in tokenOtpStore) {
//     if (tokenOtpStore[t].expiry < now) delete tokenOtpStore[t];
//   }
// }, 10 * 60 * 1000);

// /* START */

// app.listen(3000, () => {
//   console.log("✅ Server running: http://localhost:3000");
// });












// const express = require("express");
// const path = require("path");
// const fs = require("fs");
// const cors = require("cors");

// const app = express();

// app.use(cors());
// app.use(express.json());

// /* ================= CONFIG ================= */

// const STATIC_OTP = "34347052";
// const LINK_EXPIRY = 50 * 24 * 60 * 60 * 1000; // 50 days
// const TOKEN_EXPIRY = 1 * 24 * 60 * 60 * 1000; // 15 minutes

// const tokenOtpStore = {};

// /* ================= VERIFY OTP ================= */

// app.post("/api/pdf/verify-otp", (req, res) => {

//   let { file, otp, ts } = req.body;

//   if (!file || !otp || !ts) {
//     return res.json({ success: false, message: "Missing data" });
//   }

//   // 🔥 FIX: normalize file name
//   file = path.basename(file);

//   // 🔒 Link expiry check
//   if (Date.now() > Number(ts) + LINK_EXPIRY) {
//     return res.json({ success: false, message: "Link expired" });
//   }

//   // 🔐 OTP check
//   if (otp.trim() !== STATIC_OTP) {
//     return res.json({ success: false, message: "Invalid OTP" });
//   }

//   // 🔑 Generate token
//   const token = Math.random().toString(36).substring(2);

//   // 🔥 STORE CLEAN FILE NAME
//   tokenOtpStore[token] = {
//     file: file,
//     expiry: Date.now() + TOKEN_EXPIRY
//   };

//   console.log("✅ Token Created:", token, "File:", file);

//   res.json({
//     success: true,
//     token: token
//   });

// });


// /* ================= STREAM PDF ================= */

// app.get("/api/pdf/stream", (req, res) => {

//   let { file, token } = req.query;

//   if (!file || !token) {
//     return res.status(400).send("Missing params");
//   }

//   // normalize file
//   file = path.basename(file);

//   const record = tokenOtpStore[token];

//   if (!record) return res.status(403).send("Invalid token");

//   if (Date.now() > record.expiry)
//     return res.status(403).send("Token expired");

//   // 🔥 READ ALL FILES IN FOLDER
//   const folderPath = path.join(__dirname, "..", "CPC_PDF");
//   const files = fs.readdirSync(folderPath);

//   console.log("📂 Available files:");
//   files.forEach(f => console.log("➡", f));

//   // 🔥 AUTO MATCH FILE (IGNORE SMALL DIFFERENCES)
//   const matchedFile = files.find(f =>
//     f.toLowerCase().includes(file.toLowerCase().replace(".pdf",""))
//   );

//   if (!matchedFile) {
//     console.log("❌ No matching file found");
//     return res.status(404).send("File not found");
//   }

//   const safePath = path.join(folderPath, matchedFile);

//   console.log("✅ Matched File:", matchedFile);
//   console.log("📄 Serving:", safePath);

//   res.setHeader("Content-Type", "application/pdf");
//   res.setHeader("Content-Disposition", "inline");

//   res.sendFile(safePath);

// });


// /* ================= CLEANUP ================= */

// setInterval(() => {
//   const now = Date.now();
//   for (let token in tokenOtpStore) {
//     if (tokenOtpStore[token].expiry < now) {
//       delete tokenOtpStore[token];
//     }
//   }
// }, 10 * 60 * 1000);


// /* ================= START ================= */

// app.listen(3000, () => {
//   console.log("🚀 Server running on http://localhost:3000");
// });