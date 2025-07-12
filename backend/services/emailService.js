const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10),
  secure: process.env.EMAIL_PORT === "465",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendApprovalEmail = async (userEmail, postTitle) => {
  const mailOptions = {
    from: "FinkiRanked",
    to: userEmail,
    subject: "Your Forum Post has been Approved!",
    html: `
        <h1>Success!</h1>
        <p>Your forum post, "<strong>${postTitle}</strong>", has been reviewed and approved by a moderator.</p>
        <p>It is now live on the forum for everyone to see.</p>
        <p>Thank you for your contribution!</p>
        <br>
        <p>The FinkiRanked Team</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Approval email sent successfully to ${userEmail}`);
  } catch (error) {
    console.error(`Failed to send approval email to ${userEmail}:`, error);
  }
};

const sendDeletionEmail = async (userEmail, postTitle) => {
  const mailOptions = {
    from: "FinkiRanked",
    to: userEmail,
    subject: "Your Forum Post has been discared",
    html: `
        <h1>Your Forum Post contains harmfull or innapropriate language</h1>
        <p>We have reviewed your recent forum post, "<strong>${postTitle}</strong>".</p>
        <p>Unfortunately, it could not be approved as it was found to be in violation of our community guidelines.</p>
        <p>We encourage you to review our content policies before submitting a new post in the future.</p>
        <br>
        <p>Thank you for your understanding.</p>
        <p>The FinkiRanked Team</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Deletion email sent successfully to ${userEmail}`);
  } catch (error) {
    console.error(`Failed to send approval email to ${userEmail}:`, error);
  }
};
const sendModeratorEmail = async (userEmail, postsNumber) => {
  const mailOptions = {
    from: "FinkiRanked",
    to: userEmail,
    subject: "Action Required: Posts Awaiting Review",
    html: `
        <h1>Action Required: Posts Awaiting Review</h1>
        <p>This is an automated notification to let you know that there are <strong>${postsNumber}</strong> forum post(s) that have been waiting for review for more than 24 hours.</p>
        <p>Please log in to the moderator dashboard at your earliest convenience to review and approve or reject these submissions.</p>
        <br>
        <p>Thank you for your help in maintaining our community standards.</p>
        <p>The FinkiRanked System</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Moderator email sent successfully to ${userEmail}`);
  } catch (error) {
    console.error(`Failed to send approval email to ${userEmail}:`, error);
  }
};
module.exports = { sendApprovalEmail, sendDeletionEmail, sendModeratorEmail };
