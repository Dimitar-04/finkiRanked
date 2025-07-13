const prisma = require('../lib/prisma');
const schedule = require('node-schedule');

async function resetPostCounters() {
  try {
    console.log(
      `[${new Date().toISOString()}] Attempting to reset post counters...`
    );
    const result = await prisma.users.updateMany({
      data: {
        postCounter: 3,
      },
    });
    console.log(
      `[${new Date().toISOString()}] Successfully reset post counters for ${
        result.count
      } users.`
    );
    return result;
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Error resetting post counters:`,
      error
    );
  } finally {
    await prisma.$disconnect();
    console.log(`[${new Date().toISOString()}] Database connection closed.`);
  }
}

const job = schedule.scheduleJob('0 0 * * *', function () {
  console.log(
    `[${new Date().toISOString()}] Running scheduled post counter reset at midnight.`
  );
  resetPostCounters();
});

console.log(`[${new Date().toISOString()}] Post counter reset script started.`);
console.log(
  `[${new Date().toISOString()}] Next scheduled run: ${job.nextInvocation()}`
);

process.on('SIGINT', function () {
  job.cancel();
  console.log(
    `[${new Date().toISOString()}] Post counter reset scheduler stopped`
  );
  process.exit(0);
});

console.log(
  `[${new Date().toISOString()}] Running initial post counter reset...`
);
