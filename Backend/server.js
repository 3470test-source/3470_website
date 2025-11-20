const express = require("express");
const axios = require("axios");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());

// --- CONFIG ----
const API_KEY = "YOUR_YOUTUBE_API_KEY"; // Add your API key here
const OWNER_EMAIL = "owner@gmail.com";  // Owner of the private video
const ALERT_SENDER_EMAIL = "your-email@gmail.com"; // Sender
const ALERT_SENDER_PASSWORD = "your-email-password"; // App password

// --- CHECK IF VIDEO PRIVATE ----
app.get("/check-video/:videoId", async (req, res) => {
  const videoId = req.params.videoId;

  try {
    const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=status&key=${API_KEY}`;

    const response = await axios.get(url);

    if (response.data.items.length === 0) {
      return res.send({ status: "NOT_FOUND" });
    }

    const privacyStatus = response.data.items[0].status.privacyStatus;

    return res.send({
      status: privacyStatus.toUpperCase(),
    });
  } catch (error) {
    return res.status(500).send({ error: "API Error" });
  }
});

// --- SEND PERMISSION ALERT TO OWNER ----
app.post("/alert-owner", async (req, res) => {
  const { userEmail, videoId } = req.body;

  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: ALERT_SENDER_EMAIL,
        pass: ALERT_SENDER_PASSWORD,
      },
    });

    let info = await transporter.sendMail({
      from: ALERT_SENDER_EMAIL,
      to: OWNER_EMAIL,
      subject: "YouTube Video Access Request",
      html: `
        <h2>Permission Request</h2>
        <p>User Email: <b>${userEmail}</b></p>
        <p>Requested Video: <b>${videoId}</b></p>
        <p>Please open YouTube Studio → Video → Permissions → Add their email.</p>
      `,
    });

    return res.send({ success: true, message: "Owner alerted!" });
  } catch (error) {
    return res.status(500).send({ error: "Email send failed" });
  }
});

// --- SERVER START ----
app.listen(5000, () => {
  console.log("Backend running at http://localhost:5000");
});
