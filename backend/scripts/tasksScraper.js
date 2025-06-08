const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;

const ROOT_URL =
  'https://github.com/theoludwig/programming-challenges/tree/master/challenges';
const BASE_RAW =
  'https://raw.githubusercontent.com/theoludwig/programming-challenges/master/challenges/';
const OUTPUT_FILE = 'challenges-output.txt';

async function getChallengeFolders() {
  const res = await axios.get(
    'https://api.github.com/repos/theoludwig/programming-challenges/contents/challenges'
  );

  return res.data
    .filter((item) => item.type === 'dir')
    .map((item) => item.name);
}

async function fetchMarkdown(folder, outputStram) {
  const url = `${BASE_RAW}${folder}/README.md`;
  try {
    const res = await axios.get(url);
    const output = `\n=== ${folder} ===\n${res.data}\n`;

    console.log(output);

    return output;
  } catch (err) {
    console.error(`No README found for ${folder}: ${err.response?.status}`);
  }
}

(async () => {
  try {
    // Clear/create the output file
    await fs.writeFile(
      OUTPUT_FILE,
      'PROGRAMMING CHALLENGES\n' +
        '=====================\n\n' +
        `Generated on: ${new Date().toISOString()}\n\n`
    );

    const folders = await getChallengeFolders();
    console.log(`Found ${folders.length} challenge folders`);

    for (const folder of folders) {
      const output = await fetchMarkdown(folder);
      // Append each result to the file
      await fs.appendFile(OUTPUT_FILE, output);
    }

    console.log(`\nAll results saved to ${OUTPUT_FILE}`);
  } catch (error) {
    console.error('Error during execution:', error);
  }
})();
