const { start } = require("repl");
const prisma = require("../lib/prisma");
const { sendModeratorEmail } = require("../services/emailService");
// async function getTodaysChallenges() {
//   try {
//     const now = new Date();

//     const year = now.getUTCFullYear();
//     const month = now.getUTCMonth();
//     const day = now.getUTCDate();

//     let effectiveDay = day;
//     if (now.getUTCHours() < 7) {
//       effectiveDay = day - 1;
//     }

//     const startOfEffectiveDay = new Date(
//       Date.UTC(year, month, effectiveDay, 0, 0, 0, 0)
//     );

//     const startOfNextDay = new Date(startOfEffectiveDay);
//     startOfNextDay.setUTCDate(startOfEffectiveDay.getUTCDate() + 1);

//     console.log(
//       "Querying between (UTC dates):",
//       startOfEffectiveDay.toISOString(),
//       "and",
//       startOfNextDay.toISOString()
//     );

//     let challenges = await prisma.challenges.findMany({
//       where: {
//         solving_date: {
//           gte: startOfEffectiveDay,
//           lt: startOfNextDay,
//         },
//         expired: false,
//       },
//       include: {
//         test_cases: true,
//       },
//     });

//     if (challenges.length > 0) {
//       console.log(`Found ${challenges.length} challenge(s) for today:`);
//       console.log(challenges);
//     } else {
//       console.log("No challenges found for today.");
//     }
//   } catch (error) {
//     console.error("Error fetching today's challenges:", error);
//     process.exitCode = 1;
//   } finally {
//     await prisma.$disconnect();
//     console.log("Disconnected from database.");
//   }
// }

// getTodaysChallenges();

// async function resetUsers() {
//   try {
//     const usersOutput = await prisma.users.updateMany({
//       data: {
//         solvedDailyChallenge: false,
//         daily_test_case_id: null,
//         daily_points: 0,
//         attempts: 0,
//       },
//     });
//     console.log(
//       `Daily reset process completed successfully. Updated ${usersOutput.count} users to reset their daily challenge status.`
//     );
//   } catch (error) {
//     console.error("Error resetting users:", error);
//     process.exitCode = 1;
//   }
// }

// resetUsers();

async function sendmailToModerators() {
  try {
    // 1. Define the time threshold (24 hours ago)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate());

    // 2. Check if there are any posts older than the threshold
    const postsToReviewCount = await prisma.to_be_reviewed.count({
      where: {
        created_at: {
          lt: oneDayAgo, // 'lt' means "less than"
        },
      },
    });

    console.log(`Found ${postsToReviewCount} post(s) older than 24 hours.`);

    // 3. If no old posts, exit gracefully
    if (postsToReviewCount === 0) {
      console.log("No old posts to review. No emails sent.");
      return;
    }

    // 4. If there are old posts, get all moderators
    const moderators = await prisma.users.findMany({
      where: {
        isModerator: true,
      },
      select: {
        email: true, // Only select the email field
      },
    });

    if (moderators.length === 0) {
      console.log(
        "Found old posts, but no moderators are defined in the system."
      );
      return;
    }

    const moderatorEmails = moderators.map((m) => m.email);

    moderatorEmails.forEach((email) => {
      sendModeratorEmail(email, postsToReviewCount);
    });
  } catch (error) {
    console.error("Error in sendEmailToModerators script:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

sendmailToModerators();
