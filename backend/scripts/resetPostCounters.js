const prisma = require('../lib/prisma');
const schedule = require('node-schedule');

async function resetPostCounters() {
  try {
    const result = await prisma.users.updateMany({
      data: {
        postCounter: 3,
      },
    });
  } catch (error) {
    console.error('Error resetting post counters:', error);
  } finally {
    await prisma.$disconnect();
  }
}
const job = schedule.scheduleJob('0 0 * * *', function () {
  console.log(
    `Running scheduled post counter reset at ${new Date().toISOString()}`
  );
  resetPostCounters();
});
process.on('SIGINT', function () {
  job.cancel();
  console.log('Post counter reset scheduler stopped');
  process.exit(0);
});
