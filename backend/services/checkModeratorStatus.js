const prisma = require('../lib/prisma');

async function verifyModeratorStatus(userId) {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { isModerator: true },
  });

  return user?.isModerator === true;
}

module.exports = verifyModeratorStatus;
