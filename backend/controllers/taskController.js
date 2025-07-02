const { get } = require("http");
const prisma = require("../lib/prisma");
const verifyModeratorStatus = require("../services/checkModeratorStatus");
const Challenge = require("../models/challenge");
const { at } = require("../filters/macedonianProfanity");
const getAllTasks = async (req, res) => {
  const userId = req.user.sub;

  try {
    const isModerator = await verifyModeratorStatus(userId);
    if (!isModerator) {
      return res.status(403).json({ message: "Access denied" });
    }
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const [challenges, total] = await Promise.all([
      prisma.challenges.findMany({
        include: { test_cases: true },
        orderBy: { solving_date: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.challenges.count(),
    ]);

    const safeSerialize = (data) => {
      return JSON.parse(
        JSON.stringify(data, (key, value) => {
          if (value instanceof Date) {
            return value.toISOString();
          }
          if (typeof value === "bigint") {
            return value.toString();
          }
          return value;
        })
      );
    };

    const processedChallenges = challenges.map((challenge) => {
      const safeChallenge = safeSerialize(challenge);
      if (safeChallenge.test_cases) {
        safeChallenge.test_cases = safeChallenge.test_cases.map((testCase) => ({
          id: testCase.id,
          input: testCase.input,
          output: testCase.output,
          challenge_id: testCase.challenge_id,
        }));
      }
      return safeChallenge;
    });

    res.status(200).json({
      challenges: processedChallenges,
      total,
      totalPages: Math.ceil(total / pageSize),
      currentPage: page,
      pageSize,
    });
  } catch (error) {
    console.error("Error fetching all challenges:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

const getTaskByDate = async (req, res) => {
  try {
    const now = new Date();

    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const day = now.getUTCDate();

    let effectiveDay = day;
    if (now.getUTCHours() < 7) {
      effectiveDay = day - 1;
    }

    const startOfEffectiveDay = new Date(
      Date.UTC(year, month, effectiveDay, 0, 0, 0, 0)
    );

    const startOfNextDay = new Date(startOfEffectiveDay);
    startOfNextDay.setUTCDate(startOfEffectiveDay.getUTCDate() + 1);

    // console.log(
    //   "Querying between (UTC dates):",
    //   startOfEffectiveDay.toISOString(),
    //   "and",
    //   startOfNextDay.toISOString()
    // );

    let tasks = await prisma.challenges.findMany({
      where: {
        solving_date: {
          gte: startOfEffectiveDay,
          lt: startOfNextDay,
        },
        expired: false,
      },
      include: {
        test_cases: true,
      },
    });
    if (tasks.length === 0) {
      return res.status(404).json({ message: "No tasks found for this date" });
    }

    const safeSerialize = (data) => {
      return JSON.parse(
        JSON.stringify(data, (key, value) => {
          if (value instanceof Date) {
            return value.toISOString();
          }
          if (typeof value === "bigint") {
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
          input: testCase.input || "",
          output: testCase.output || "",
          challenge_id: testCase.challenge_id,
        }));
      }

      return safeTask;
    });

    res.setHeader("Content-Type", "application/json");
    res.status(200).json(processedTasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);

    res.status(500).json({
      message: "Internal server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
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
      return res.status(404).json({ message: "No test cases found for today" });
    }

    const randomTestCase =
      testCases[Math.floor(Math.random() * testCases.length)];

    res.setHeader("Content-Type", "application/json");
    res.status(200).json(randomTestCase);
  } catch (error) {
    console.error("Error fetching test cases:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const getSpecificTestCaseById = async (req, res) => {
  const { testCaseId } = req.params;

  try {
    const testCase = await prisma.test_cases.findUnique({
      where: { id: testCaseId },
      select: {
        id: true,
        input: true,

        challenge_id: true,
      },
    });
    if (!testCase) {
      return res.status(404).json({ message: "Test case not found" });
    }
    res.status(200).json(testCase);
  } catch (error) {
    console.error("Error fetching specific test case by ID:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const getAllTestCasesForTask = async (req, res) => {
  const { taskId } = req.params;
  try {
    const testCases = await prisma.test_cases.findMany({
      where: { challenge_id: taskId },
      select: {
        id: true,
        input: true,
        output: true,
        challenge_id: true,
      },
    });

    if (testCases.length === 0) {
      return res
        .status(404)
        .json({ message: "No test cases found for this task" });
    }

    res.status(200).json(testCases);
  } catch (error) {
    console.error("Error fetching all test cases for task:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const updateUserDailyChallengeId = async (req, res) => {
  const { userId } = req.params;
  const { testCaseId } = req.body;
  console.log("Updating user daily challenge ID:", userId, testCaseId);

  if (!testCaseId) {
    return res.status(400).json({ message: "testCaseId is required" });
  }

  try {
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: { daily_test_case_id: testCaseId },
      select: { id: true, daily_test_case_id: true },
    });
    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating user daily test case ID:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ message: "User not found" });
    }
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const RANK_DATA = {
  Novice: { id: 1, title: "Novice", requiredPoints: 0 },
  Learner: { id: 2, title: "Learner", requiredPoints: 300 },
  Coder: { id: 3, title: "Coder", requiredPoints: 800 },
  "Problem Solver": { id: 4, title: "Problem Solver", requiredPoints: 1500 },
  Algorithmist: { id: 5, title: "Algorithmist", requiredPoints: 2500 },
  "Hacker Mage": { id: 6, title: "Hacker Mage", requiredPoints: 4000 },
  Challenger: { id: 7, title: "Challenger", requiredPoints: 6000 },
  "Code Master": { id: 8, title: "Code Master", requiredPoints: 8500 },
  "FINKI Royalty": { id: 9, title: "FINKI Royalty", requiredPoints: 11000 },
  "FINKI Legend": { id: 10, title: "FINKI Legend", requiredPoints: 16000 },
};

function getRankByPoints(points) {
  const ranks = Object.values(RANK_DATA).sort(
    (a, b) => b.requiredPoints - a.requiredPoints
  );
  for (const rank of ranks) {
    if (points >= rank.requiredPoints) {
      return rank;
    }
  }
  return RANK_DATA["Novice"];
}

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
  return Math.max(0, 60 - Math.floor(minutes * 0.0833));
}

function getAttemptScore(attempts) {
  const maxScore = 40;
  const decayPerAttempt = 5;
  const minScore = 5;

  const score = maxScore - (attempts - 1) * decayPerAttempt;
  return Math.max(minScore, score);
}

function isOutputCorrect(userOutput, expectedOutput, outputType) {
  const normalizeString = (str) =>
    str
      .toString()
      .replace(/[^\w.-]/g, "")
      .trim()
      .toLowerCase();

  const normalizeArray = (str) => {
    const cleaned = str.replace(/[\[\]]/g, "");
    return cleaned
      .split(/[\s,]+/)
      .filter((val) => val !== "")
      .map((val) => val.trim());
  };

  if (outputType === "integer") {
    const cleanedUserOutput = normalizeString(userOutput);
    const cleanedExpectedOutput = normalizeString(expectedOutput);
    return parseInt(cleanedUserOutput) === parseInt(cleanedExpectedOutput);
  }

  if (outputType === "float") {
    const cleanedUserOutput = normalizeString(userOutput);
    const cleanedExpectedOutput = normalizeString(expectedOutput);
    return (
      Math.abs(
        parseFloat(cleanedUserOutput) - parseFloat(cleanedExpectedOutput)
      ) < 1e-6
    );
  }

  if (outputType === "array") {
    const userArr = normalizeArray(userOutput);
    const expectedArr = normalizeArray(expectedOutput);
    if (userArr.length !== expectedArr.length) return false;
    for (let i = 0; i < userArr.length; i++) {
      if (userArr[i] !== expectedArr[i]) return false;
    }
    return true;
  }
  const a = normalizeString(userOutput);
  const b = normalizeString(expectedOutput);
  return a === b;
}

const evaluateTask = async (req, res) => {
  const { id: taskId } = req.params;
  const { userOutput, testCaseId, userId } = req.body;

  try {
    if (!testCaseId || !userOutput || !userId) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const testCase = await prisma.test_cases.findUnique({
      where: {
        id: testCaseId,
      },
    });

    if (testCase.challenge_id !== taskId) {
      return res
        .status(400)
        .json({ message: "Test case does not belong to the task" });
    }
    let user = await prisma.users.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.solvedDailyChallenge) {
      return res.status(404).json({ message: "User daily challenge solved" });
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

    const task = await prisma.challenges.findUnique({
      where: {
        id: taskId,
      },
    });

    if (isOutputCorrect(userOutput, testCase.output, task.output_type)) {
      const timeBonus = getTimeBonus();
      const attemptScore = getAttemptScore(attempts + 1);
      const difficultyScore =
        task.difficulty === "Easy"
          ? 10
          : task.difficulty === "Medium"
          ? 20
          : 30;
      const totalScore = timeBonus + attemptScore + difficultyScore;
      const userRank = getRankByPoints(BigInt(totalScore) + user.points);
      const updatedUser = await prisma.users.update({
        where: {
          id: userId,
        },
        data: {
          points: { increment: totalScore },
          attempts: { increment: 1 },
          solvedDailyChallenge: true,
          solved_problems: { increment: 1 },
          rank: userRank.title,
          daily_points: totalScore,
        },
      });
      const responseUser = { ...updatedUser };

      if (typeof responseUser.points === "bigint") {
        responseUser.points = responseUser.points.toString();
      }

      await prisma.challenges.update({
        where: { id: taskId },
        data: { solved_by: { increment: 1 } },
      });

      return res.status(200).json({
        success: true,
        message: "Challenge solved successfully!",
        scoreAwarded: totalScore,
        newTotalPoints: responseUser.points,
        rank: userRank.title,
        rankInfo: userRank,
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
        message: "Incorrect solution. Try again!",
        attemptsMade:
          typeof newAttempts === "bigint"
            ? newAttempts.toString()
            : newAttempts,
      });
    }
  } catch (error) {
    console.error("Error evaluating task:", error);
    return res.status(500).json({
      message: "Internal server error during evaluation.",
      error: error.message,
    });
  }
};

const createNewTask = async (req, res) => {
  try {
    const userId = req.user.sub;
    const isModeratorOrAdmin = await verifyModeratorStatus(userId);

    if (!isModeratorOrAdmin) {
      return res.status(403).json({
        message: "You do not have permission to create challenges",
      });
    }

    const {
      title,
      description,
      examples,
      testcases,
      difficulty,
      output_type,
      solving_date,
    } = req.body;

    let challengeDate = solving_date ? new Date(solving_date) : new Date();
    if (!solving_date) {
      challengeDate.setDate(challengeDate.getDate() + 1);
    }

    const challenge = new Challenge({
      title: title,
      content: description,
      solving_date: challengeDate,
      attempted_by: 0,
      solved_by: 0,
      expired: false,
      examples: examples,
      output_type: output_type || "string",
      difficulty: difficulty || "Easy",
    });
    const validation = challenge.validate();
    if (!validation.isValid) {
      return res.status(400).json({
        message: "Challenge validation failed",
        errors: validation.errors,
      });
    }
    const challengeData = challenge.toObject
      ? challenge.toObject()
      : { ...challenge };

    const createdChallenge = await prisma.challenges.create({
      data: {
        ...challengeData,

        test_cases: {
          create: testcases.map((testCase) => ({
            input: testCase.input,
            output: testCase.output,
          })),
        },
      },
      include: {
        test_cases: true,
      },
    });

    res.status(201).json({
      message: "Challenge created successfully",
      challenge: {
        id: createdChallenge.id,
        title: createdChallenge.title,
        solving_date: createdChallenge.solving_date,
        testCaseCount: createdChallenge.test_cases.length,
      },
    });
  } catch (error) {
    console.error("Error creating challenge:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

const deleteTask = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.sub;

  try {
    const isModeratorOrAdmin = await verifyModeratorStatus(userId);

    if (isModeratorOrAdmin) {
      await prisma.test_cases.deleteMany({
        where: { challenge_id: id },
      });

      await prisma.challenges.delete({
        where: { id },
      });

      res.status(200).json({
        message: "Challenge and associated test cases deleted successfully",
      });
    } else {
      res.status(403).json({
        message: "You do not have permission to delete this challenge",
      });
    }
  } catch (error) {
    console.error("Error deleting challenge:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

module.exports = {
  getTaskByDate,
  getSpecificTestCaseById,
  updateUserDailyChallengeId,
  fetchTestCaseForToday,
  evaluateTask,
  getAllTasks,
  getAllTestCasesForTask,
  deleteTask,
  createNewTask,
};
