require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});
const { sendModeratorEmail } = require("../services/emailService");
const schedule = require("node-schedule");
const prisma = require("../lib/prisma");

async function sendmailToModerators() {
  const scriptExecutionTime = new Date();
  console.log(
    `[${scriptExecutionTime.toISOString()}] Starting moderator email check process`
  );

  try {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const posts = await prisma.to_be_reviewed.findMany({
      where: {
        created_at: {
          lte: oneDayAgo,
        },
      },
      select: {
        title: true,
        created_at: true,
      },
      orderBy: {
        created_at: "asc",
      },
    });

    console.log(
      `[${scriptExecutionTime.toISOString()}] Found ${
        posts.length
      } post(s) older than 24 hours.`
    );

    if (posts.length === 0) {
      console.log("No old posts to review. No emails sent.");
      return;
    }

    const moderators = await prisma.users.findMany({
      where: {
        isModerator: true,
      },
      select: {
        email: true,
      },
    });

    if (moderators.length === 0) {
      console.log(
        `[${scriptExecutionTime.toISOString()}] Found old posts, but no moderators are defined in the system.`
      );
      return;
    }

    const moderatorEmails = moderators.map((m) => m.email);
    console.log(
      `[${scriptExecutionTime.toISOString()}] Sending emails to ${
        moderatorEmails.length
      } moderators`
    );

    for (const email of moderatorEmails) {
      try {
        await sendModeratorEmail(email, posts);
        console.log(
          `[${scriptExecutionTime.toISOString()}] Email sent to ${email}`
        );
      } catch (emailError) {
        console.error(
          `[${scriptExecutionTime.toISOString()}] Error sending email to ${email}:`,
          emailError
        );
      }
    }

    console.log(
      `[${scriptExecutionTime.toISOString()}] Moderator notification process completed`
    );
  } catch (error) {
    console.error(
      `[${scriptExecutionTime.toISOString()}] Error in sendEmailToModerators script:`,
      error
    );
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    console.log(
      `[${scriptExecutionTime.toISOString()}] Prisma client disconnected.`
    );
  }
}

const job = schedule.scheduleJob("0 7 * * *", function () {
  console.log(
    `[${new Date().toISOString()}] Running scheduled moderator email check`
  );
  sendmailToModerators();
});

console.log(
  `[${new Date().toISOString()}] Next scheduled run: ${job.nextInvocation()}`
);

process.on("SIGINT", function () {
  job.cancel();
  console.log(
    `[${new Date().toISOString()}] Moderator email scheduler stopped`
  );
  process.exit(0);
});

console.log(
  `[${new Date().toISOString()}] Running initial moderator email check...`
);
