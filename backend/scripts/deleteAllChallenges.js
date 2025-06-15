const prisma = require('../lib/prisma');

async function deleteAllChallenges() {
  try {
    const result = await prisma.challenges.deleteMany({});
    console.log(`✅ Successfully deleted ${result.count} challenges`);
  } catch (error) {
    console.error('❌ Error deleting challenges:', error);
    throw error;
  } finally {
    console.log('Disconnecting from database...');
    await prisma.$disconnect();
  }
}

deleteAllChallenges();
