const prisma = require("../lib/prisma");

async function resetDailyTestCaseIds() {
  try {
    // IMPORTANT: Replace 'user' with the actual name of your user model in schema.prisma
    // (e.g., if your model is `model Users { ... }`, use `prisma.users.updateMany`)
    // IMPORTANT: Ensure 'daily_test_case_id' is the correct field name.
    const result = await prisma.users.updateMany({
      where: {}, // An empty where clause applies the update to all records
      data: {
        daily_test_case_id: null, // Set the field to an empty string
      },
    });

    console.log(
      `Successfully reset daily_test_case_id for ${result.count} users.`
    );
  } catch (error) {
    console.error("Error resetting daily_test_case_id:", error);
    process.exitCode = 1; // Indicate an error occurred
  } finally {
    await prisma.$disconnect();
    console.log("Disconnected from database.");
  }
}

resetDailyTestCaseIds();
