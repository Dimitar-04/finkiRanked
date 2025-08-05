const nodemailer = require("nodemailer");
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

const sendApprovalEmail = async (userEmail, postTitle) => {
  const mailOptions = {
    from: '"FinkiRanked" <finkiranked@gmail.com>',
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
    from: '"FinkiRanked" <finkiranked@gmail.com>',
    to: userEmail,
    subject: "Your Forum Post has been Discarded",
    html: `
        <h1>Your Forum Post contains harmfull or inappropriate language</h1>
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
const sendDeletedFromForumEmail = async (userEmail, postTitle) => {
  const mailOptions = {
    from: '"FinkiRanked" <finkiranked@gmail.com>',
    to: userEmail,
    subject: "Your Forum Post has been deleted",
    html: `
        <h1>Your Forum Post contains harmfull or inappropriate language</h1>
        <p>We have reviewed your recent forum post, "<strong>${postTitle}</strong>".</p>
        <p>Unfortunately, it was found to be in violation of our community guidelines.</p>
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

const sendDeletedCommentEmail = async (
  userEmail,
  postTitle,
  commentContent
) => {
  const mailOptions = {
    from: '"FinkiRanked" <finkiranked@gmail.com>',
    to: userEmail,
    subject: "Your Comment has been deleted",
    html: `
        <h1>Your Comment contains harmfull or inappropriate language</h1>
        <p>We have reviewed your recent comment on "${postTitle}", "<strong>${commentContent}</strong>".</p>
        <p>Unfortunately, it was found to be in violation of our community guidelines.</p>
        <p>We encourage you to review our content policies before submitting a new comment in the future.</p>
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
const sendModeratorEmail = async (userEmail, posts) => {
  const postsList = posts
    .map((post, index) => {
      const date = new Date(post.created_at);
      const formattedDate = date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      return `<li style="margin-bottom: 8px;"><strong>${post.title}</strong> (Created: ${formattedDate})</li>`;
    })
    .join("");
  const mailOptions = {
    from: '"FinkiRanked" <finkiranked@gmail.com>',
    to: userEmail,
    subject: "Action Required: Posts Awaiting Review",
    html: `
        <h1>Action Required: Posts Awaiting Review</h1>
        <p>This is an automated notification to let you know that there are <strong>${posts.length}</strong> forum post(s) that have been waiting for review for more than 24 hours.</p>
        
        <h3>Posts requiring review:</h3>
        <ul style="padding-left: 20px;">
          ${postsList}
        </ul>
        
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

const sendModeratorManyPendingPostsEmail = async (userEmail, postsLength) => {
  const mailOptions = {
    from: '"FinkiRanked" <finkiranked@gmail.com>',
    to: userEmail,
    subject: "Action Required: Posts Awaiting Review",
    html: `
        <h1>Action Required: Posts Awaiting Review</h1>
        <p>This is an automated notification to let you know that there are <strong>${postsLength}</strong> forum post(s) waiting for review.</p>
      
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
const sendHourlyReviewNotification = async (userEmail, posts) => {
  const postsList = posts
    .map((post) => {
      const date = new Date(post.created_at);
      const formattedDate = date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      return `<li style="margin-bottom: 8px;"><strong>${post.title}</strong> (Created: ${formattedDate})</li>`;
    })
    .join("");
  const mailOptions = {
    from: '"FinkiRanked" <finkiranked@gmail.com>',
    to: userEmail,
    subject: "Hourly Reminder: Daily Challenge Posts Awaiting Review",
    html: `
        <h1>Hourly Reminder: Daily Challenge Posts Awaiting Review</h1>
        <p>This is an automated notification to let you know that there are <strong>${posts.length}</strong> daily challenge forum post(s) waiting for review.</p>
        <h3>Posts requiring review:</h3>
        <ul style="padding-left: 20px;">
          ${postsList}
        </ul>
        <p>Please log in to the moderator dashboard at your earliest convenience to review and approve or reject these submissions.</p>
        <br>
        <p>Thank you for your help in maintaining our community standards.</p>
        <p>The FinkiRanked System</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Failed to send approval email to ${userEmail}:`, error);
  }
};
const sendCommentedNotificationEmail = async (
  userEmail,
  postTitle,
  commentBy
) => {
  const mailOptions = {
    from: '"FinkiRanked" <finkiranked@gmail.com>',
    to: userEmail,
    subject: `New Comment on Your Post: "${postTitle}"`,
    html: `
        <h1>You've got a new comment!</h1>
        <p><strong>${commentBy}</strong> has left a new comment on your forum post: "<strong>${postTitle}</strong>".</p>
        <p>You can view the new comment by visiting the post on our forum.</p>
        <br>
        <p>The FinkiRanked Team</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Moderator email sent successfully to ${userEmail}`);
  } catch (error) {
    console.error(`Failed to send approval email to ${userEmail}:`, error);
  }
};
module.exports = {
  sendApprovalEmail,
  sendDeletionEmail,
  sendModeratorEmail,
  sendDeletedFromForumEmail,
  sendDeletedCommentEmail,
  sendModeratorManyPendingPostsEmail,
  sendHourlyReviewNotification,
  sendCommentedNotificationEmail,
};
