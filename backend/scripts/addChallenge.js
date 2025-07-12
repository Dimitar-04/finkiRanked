// const supabase = require("../supabaseClient");
// const prisma = require("../lib/prisma");
// const fs = require("fs").promises;
// const path = require("path");
// const Challenge = require("../models/Challenge");

// async function addChallenge() {
//   const jsonPath = path.join(__dirname, "../challenges/initialChallenges.json");
//   const data = await fs.readFile(jsonPath, "utf8");
//   const challengesData = JSON.parse(data);

//   const challenge = challengesData[challengesData.length - 3];

//   let currentDate = new Date();
//   currentDate.setDate(currentDate.getDate());
//   const newChallenge = new Challenge({
//     title: challenge.title,
//     content: challenge.description,
//     solving_date: currentDate,
//     attempted_by: 0,
//     solved_by: 0,
//     expired: false,
//     examples: challenge.examples,
//     test_cases: challenge.testcases.map((testCase) => ({
//       input: testCase.input,
//       output: testCase.output,
//     })),
//     output_type: challenge.output_type,
//     difficulty: challenge.difficulty,
//   });
//   const createdChallenge = await prisma.challenges.create({
//     data: {
//       title: newChallenge.title,
//       content: newChallenge.content,
//       solving_date: newChallenge.solving_date,
//       attempted_by: newChallenge.attempted_by,
//       solved_by: newChallenge.solved_by,
//       expired: newChallenge.expired,
//       examples: newChallenge.examples,
//       output_type: newChallenge.output_type,
//       difficulty: newChallenge.difficulty,

//       test_cases: {
//         create: newChallenge.test_cases,
//       },
//     },
//   });
// }

// addChallenge();
