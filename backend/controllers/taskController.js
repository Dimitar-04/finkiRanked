const prisma = require('../lib/prisma');

const getTaskByDate = async (req, res) => {
  const { date } = req.params;
  console.log(date);

  try {
    const now = new Date();

    let effectiveDate;

    const localDate = now.toLocaleDateString('en-CA');

    if (date === localDate) {
      if (now.getHours() < 7) {
        effectiveDate = new Date(now);
        effectiveDate.setDate(now.getDate() - 1);
      } else {
        effectiveDate = now;
      }
    } else {
      return res
        .status(404)
        .json({ message: 'Cannot fetch task for different date!' });
    }

    const taskDate = new Date(
      Date.UTC(
        effectiveDate.getUTCFullYear(),
        effectiveDate.getUTCMonth(),
        effectiveDate.getUTCDate()
      )
    );

    console.log(
      'Effective Date for Task (UTC midnight):',
      taskDate.toISOString()
    );

    let tasks = await prisma.challenges.findMany({
      where: {
        solving_date: taskDate,
        expired: false,
      },
      include: {
        test_cases: true,
      },
    });

    console.log('Tasks found:', tasks);

    if (tasks.length === 0) {
      return res.status(404).json({ message: 'No tasks found for this date' });
    }

    const safeSerialize = (data) => {
      return JSON.parse(
        JSON.stringify(data, (key, value) => {
          if (value instanceof Date) {
            return value.toISOString();
          }
          if (typeof value === 'bigint') {
            return value.toString();
          }
          return value;
        })
      );
    };

    const processedTasks = tasks.map((task) => {
      const safeTask = safeSerialize(task);

      if (safeTask.test_cases) {
        safeTask.test_cases = safeTask.test_cases.map((testCase) => ({
          id: testCase.id,
          input: testCase.input || '',
          output: testCase.output || '',
          challenge_id: testCase.challenge_id,
        }));
      }

      return safeTask;
    });

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(processedTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);

    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

const updateAttemptsTask = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if id is a UUID (string) or numeric
    const where = {};
    if (
      id.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      )
    ) {
      where.id = id;
    } else {
      try {
        where.id = parseInt(id);
      } catch (e) {
        where.id = id; // If parsing fails, use as is
      }
    }

    const updatedTask = await prisma.challenges.update({
      where: where,
      data: {
        attempted_by: { increment: 1 },
      },
    });

    // Convert BigInt to string for JSON response
    const result = { ...updatedTask };
    if (typeof result.attempted_by === 'bigint') {
      result.attempted_by = result.attempted_by.toString();
    }
    if (typeof result.solved_by === 'bigint') {
      result.solved_by = result.solved_by.toString();
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error updating task attempts:', error);
    res
      .status(500)
      .json({ message: 'Internal server error', error: error.message });
  }
};

const updateSolvedTask = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if id is a UUID (string) or numeric
    const where = {};
    if (
      id.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      )
    ) {
      where.id = id;
    } else {
      try {
        where.id = parseInt(id);
      } catch (e) {
        where.id = id; // If parsing fails, use as is
      }
    }

    const updatedTask = await prisma.challenges.update({
      where: where,
      data: {
        solved_by: { increment: 1 },
      },
    });

    // Convert BigInt to string for JSON response
    const result = { ...updatedTask };
    if (typeof result.attempted_by === 'bigint') {
      result.attempted_by = result.attempted_by.toString();
    }
    if (typeof result.solved_by === 'bigint') {
      result.solved_by = result.solved_by.toString();
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error updating task solved count:', error);
    res
      .status(500)
      .json({ message: 'Internal server error', error: error.message });
  }
};

const fetchTestCaseForToday = async (req, res) => {
  const { id } = req.params;

  try {
    const testCases = await prisma.test_cases.findMany({
      where: {
        challenge_id: id,
      },
      select: {
        id: true,
        input: true,

        challenge_id: true,
      },
    });

    if (testCases.length === 0) {
      return res.status(404).json({ message: 'No test cases found for today' });
    }

    const randomTestCase =
      testCases[Math.floor(Math.random() * testCases.length)];

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(randomTestCase);
  } catch (error) {
    console.error('Error fetching test cases:', error);
    res
      .status(500)
      .json({ message: 'Internal server error', error: error.message });
  }
};

function getMinutesSinceSevenAM() {
  const now = new Date();
  const sevenAM = new Date();
  sevenAM.setHours(7, 0, 0, 0);
  if (now < sevenAM) {
    sevenAM.setDate(sevenAM.getDate() - 1);
  }
  const diffMs = now.getTime() - sevenAM.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60)));
}

function getTimeBonus() {
  const minutes = getMinutesSinceSevenAM();
  console.log('Minutes since 7 AM:', minutes);
  return Math.max(0, 60 - Math.floor(minutes * 0.0833));
}

function getAttemptScore(attempts) {
  switch (attempts) {
    case 1:
      return 40;
    case 2:
      return 30;
    case 3:
      return 20;
    case 4:
      return 10;
    default:
      return 0;
  }
}

const evaluateTask = async (req, res) => {
  const { id: taskId } = req.params;
  const { userOutput, testCaseId, userId } = req.body;
  console.log(userOutput, testCaseId, userId);
  try {
    if (!testCaseId || !userOutput || !userId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const testCase = await prisma.test_cases.findUnique({
      where: {
        id: testCaseId,
      },
    });
    console.log('Test Case:', testCase.challenge_id);
    console.log('Task ID:', taskId);
    if (testCase.challenge_id !== taskId) {
      return res
        .status(400)
        .json({ message: 'Test case does not belong to the task' });
    }
    let user = await prisma.users.findUnique({ where: { id: userId } });
    console.log('User:', user);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    let attempts = user.attempts || 0;
    await prisma.challenges.update({
      where: {
        id: taskId,
      },
      data: {
        attempted_by: { increment: 1 },
      },
    });
    if (userOutput == testCase.output) {
      const timeBonus = getTimeBonus();
      const attemptScore = getAttemptScore(attempts + 1);
      const totalScore = timeBonus + attemptScore;

      const updatedUser = await prisma.users.update({
        where: {
          id: userId,
        },
        data: {
          points: { increment: totalScore },
          attempts: { increment: 1 },
          solvedDailyChallenge: true,
        },
      });
      const responseUser = { ...updatedUser };
      if (typeof responseUser.points === 'bigint') {
        responseUser.points = responseUser.points.toString();
      }
      await prisma.challenges.update({
        where: { id: taskId },
        data: { solved_by: { increment: 1 } },
      });

      return res.status(200).json({
        success: true,
        message: 'Task solved successfully!',
        scoreAwarded: totalScore,
        newTotalPoints: responseUser.points,
      });
    } else {
      const newAttempts = attempts + 1;
      await prisma.users.update({
        where: { id: userId },
        data: {
          attempts: newAttempts,
        },
      });
      return res.status(200).json({
        success: false,
        message: 'Incorrect solution. Try again!',
        attemptsMade:
          typeof newAttempts === 'bigint'
            ? newAttempts.toString()
            : newAttempts,
      });
    }
  } catch (error) {
    console.error('Error evaluating task:', error);
    return res.status(500).json({
      message: 'Internal server error during evaluation.',
      error: error.message,
    });
  }
};
module.exports = {
  getTaskByDate,
  updateAttemptsTask,
  updateSolvedTask,
  fetchTestCaseForToday,
  evaluateTask,
};
