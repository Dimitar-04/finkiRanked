const prisma = require('../lib/prisma');

async function deleteAllTestCases() {
  try {
    console.log('Deleting all test cases...');

    const result = await prisma.test_cases.deleteMany({});

    console.log(`✅ Successfully deleted ${result.count} test cases`);
    return result.count;
  } catch (error) {
    console.error('❌ Error deleting test cases:', error);
    throw error;
  } finally {
    console.log('Disconnecting from database...');
    await prisma.$disconnect();
  }
}

// Run the function
deleteAllTestCases()
  .then((count) => {
    console.log(`Operation complete. Total records deleted: ${count}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
