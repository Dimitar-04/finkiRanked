const nodemailer = require("nodemailer");
require("dotenv").config();

const port = parseInt(process.env.EMAIL_PORT, 10);

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port,
  secure: port === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const mailOptions = {
  from: process.env.EMAIL_USER, // Must match your Yahoo address!
  //   to: "dimitar.arsov@students.finki.ukim.mk",
  to: "dimitararsov04@gmail.com",
  subject: "Test Email from FinkiRanked Yahoo SMTP",
  text: "This is a test email sent from your Yahoo account using Nodemailer.",
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.error("Error sending email:", error);
  }
  console.log("Email sent:", info.response);
});
