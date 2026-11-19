import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config();

async function sendReport() {
  try {
    let transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let info = await transporter.sendMail({
      from: `"Report Bot" <${process.env.EMAIL_USER}>`,
      to: process.env.REPORT_RECIPIENT || "your-email@example.com",
      subject: "Daily Report",
      text: "This is your daily report content.",
    });

    console.log("✅ Report sent:", info.messageId);
  } catch (err) {
    console.error("❌ Error sending report:", err);
  }
}

sendReport();
