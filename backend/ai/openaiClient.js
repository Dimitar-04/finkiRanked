const { OpenAI } = require('openai');
require('dotenv').config({ path: '../.env' }); // Load environment variables from .env file
const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY, // Use dotenv for safety
});

module.exports = openai;
