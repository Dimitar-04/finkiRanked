const { start } = require("repl");
const prisma = require("../lib/prisma");

async function getTodaysChallenges() {
  try {
    // FIX: Work entirely in UTC to avoid all timezone issues.
    const now = new Date();

    // Get the current date parts from UTC
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const day = now.getUTCDate();

    // Determine the effective day in UTC
    let effectiveDay = day;
    if (now.getUTCHours() < 7) {
      // If it's before 7 AM UTC, use yesterday's UTC date
      effectiveDay = day - 1;
    }

    // Create the start date object directly from UTC parts
    const startOfEffectiveDay = new Date(
      Date.UTC(year, month, effectiveDay, 0, 0, 0, 0)
    );

    // Create the end date object
    const startOfNextDay = new Date(startOfEffectiveDay);
    startOfNextDay.setUTCDate(startOfEffectiveDay.getUTCDate() + 1);

    console.log(
      "Querying between (UTC dates):",
      startOfEffectiveDay.toISOString(),
      "and",
      startOfNextDay.toISOString()
    );

    let challenges = await prisma.challenges.findMany({
      where: {
        solving_date: {
          gte: startOfEffectiveDay,
          lt: startOfNextDay,
        },
        // expired: false,
      },
      include: {
        test_cases: true,
      },
    });

    if (challenges.length > 0) {
      console.log(`Found ${challenges.length} challenge(s) for today:`);
      console.log(challenges);
    } else {
      console.log("No challenges found for today.");
    }
  } catch (error) {
    console.error("Error fetching today's challenges:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    console.log("Disconnected from database.");
  }
}

getTodaysChallenges();
