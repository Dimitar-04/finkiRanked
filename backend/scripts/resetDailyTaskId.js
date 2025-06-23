const prisma = require("../lib/prisma");

async function resetDailyTestCaseIds() {
  try {
    const result = await prisma.users.updateMany({
      where: {},
      data: {
        daily_test_case_id: null,
      },
    });

    console.log(
      `Successfully reset daily_test_case_id for ${result.count} users.`
    );
  } catch (error) {
    console.error("Error resetting daily_test_case_id:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    console.log("Disconnected from database.");
  }
}

resetDailyTestCaseIds();
