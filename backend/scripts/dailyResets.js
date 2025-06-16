const prisma = require("../lib/prisma");
const schedule = require("node-schedule");

async function dailyResets() {
  const scriptExecutionTime = new Date(); // Time when the script actually runs
  console.log(
    `[${scriptExecutionTime.toISOString()}] Starting daily reset process (executed at local server time).`
  );
  console.log(`Intended to correspond to 7 AM Macedonian Time.`);

  try {
    const dateToProcess = new Date(scriptExecutionTime);
    dateToProcess.setUTCDate(scriptExecutionTime.getUTCDate() - 1);

    const targetDateForQuery = new Date(
      Date.UTC(
        dateToProcess.getUTCFullYear(),
        dateToProcess.getUTCMonth(),
        dateToProcess.getUTCDate()
      )
    );

    console.log(
      `[${scriptExecutionTime.toISOString()}] Current script execution UTC date: ${
        scriptExecutionTime.toISOString().split("T")[0]
      }`
    );
    console.log(
      `[${scriptExecutionTime.toISOString()}] Target date for challenge expiry (YYYY-MM-DD UTC): ${
        targetDateForQuery.toISOString().split("T")[0]
      }`
    );

    const challengeUpdateResult = await prisma.challenges.updateMany({
      where: {
        solving_date: targetDateForQuery,
        expired: false,
      },
      data: {
        expired: true,
      },
    });

    const usersOutput = await prisma.users.updateMany({
      data: {
        solvedDailyChallenge: false,
        daily_test_case_id: null,
        daily_points: 0,
        attempts: 0,
      },
    });
    console.log(
      `[${scriptExecutionTime.toISOString()}] Marked ${
        challengeUpdateResult.count
      } challenges from ${
        targetDateForQuery.toISOString().split("T")[0]
      } as expired.`
    );

    console.log(
      `[${scriptExecutionTime.toISOString()}] Daily reset process completed successfully.`
    );
    console.log(
      `[${scriptExecutionTime.toISOString()}] Updated ${
        usersOutput.count
      } users to reset their daily challenge status.`
    );
  } catch (error) {
    console.error(
      `[${scriptExecutionTime.toISOString()}] Error during daily reset process:`,
      error
    );
  } finally {
    await prisma.$disconnect();
    console.log(
      `[${scriptExecutionTime.toISOString()}] Prisma client disconnected.`
    );
  }
}

const job = schedule.scheduleJob("0 7 * * *", function () {
  console.log(`Running scheduled daily reset at ${new Date().toISOString()}`);
  dailyResets();
});

process.on("SIGINT", function () {
  job.cancel();
  console.log("Daily reset scheduler stopped.");
  process.exit(0);
});

dailyResets();
