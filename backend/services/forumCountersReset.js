const prisma = require("../lib/prisma");

async function resetPostCheckCounter(userId) {
  try {
    await prisma.users.update({
      where: { id: userId },
      data: {
        postCheckCounter: 0,
      },
    });
  } catch (error) {
    console.error(
      `Failed to decrement post counter for user ${userId}:`,
      error
    );
  }
}

module.exports = { resetPostCheckCounter };
