// const prisma = require('../lib/prisma');
// const fs = require('fs').promises;
// const path = require('path');
// const Challenge = require('../models/Challenge');

// async function populateChallenges() {
//   try {
//     const jsonPath = path.join(
//       __dirname,
//       '../challenges/initialChallenges.json'
//     );
//     const data = await fs.readFile(jsonPath, 'utf8');
//     const challengesData = JSON.parse(data);

//     console.log(`Found ${challengesData.length} challenges to import`);

//     let currentDate = new Date();

//     for (const challengeData of challengesData) {
//       const challenge = new Challenge({
//         title: challengeData.title,
//         content: challengeData.description,
//         solving_date: currentDate,
//         attempted_by: 0,
//         solved_by: 0,
//         expired: false,
//         examples: challengeData.examples,
//         test_cases: challengeData.testcases.map((testCase) => ({
//           input: testCase.input,
//           output: testCase.output,
//         })),
//         output_type: challengeData.output_type,
//         difficulty: challengeData.difficulty,
//       });

//       console.log(
//         `Processing challenge: ${challenge.title} with date ${
//           challenge.solving_date.toISOString().split('T')[0]
//         }`
//       );

//       const createdChallenge = await prisma.challenges.create({
//         data: {
//           solving_date: challenge.solving_date,
//           title: challenge.title,
//           content: challenge.content,
//           attempted_by: challenge.attempted_by,
//           solved_by: challenge.solved_by,
//           expired: challenge.expired,
//           examples: challenge.examples,
//           output_type: challenge.output_type,

//           test_cases: {
//             create: challenge.test_cases.map((example) => ({
//               input: example.input,
//               output: example.output,
//             })),
//           },
//           output_type: challengeData.output_type,
//           difficulty: challengeData.difficulty,
//         },
//       });

//       console.log(`Created challenge with ID: ${createdChallenge.id}`);

//       currentDate = new Date(currentDate);
//       currentDate.setDate(currentDate.getDate() + 1);
//     }

//     console.log('Challenge import completed successfully!');
//   } catch (error) {
//     console.error('Error importing challenges:', error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// populateChallenges()
//   .then(() => console.log('Done'))
//   .catch((e) => {
//     console.error('Script failed:', e);
//     process.exit(1);
//   });
