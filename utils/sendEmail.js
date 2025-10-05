// utils/sendEmail.js
const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail", // or use: host, port, secure
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Support" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log("Email sent successfully to:", to);
  } catch (err) {
    console.error("Email sending failed:", err);
    throw new Error("Email could not be sent");
  }
};

module.exports = sendEmail;
