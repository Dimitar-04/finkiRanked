const dotenv = require('dotenv');
const path = require('path');

const backendEnv =
  dotenv.config({
    path: path.resolve(__dirname, 'backend', '.env'),
  }).parsed || {};

module.exports = {
  apps: [
    {
      name: 'daily-resets-job',
      script: './backend/scripts/dailyResets.js',
      autorestart: true,
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      env: backendEnv,
    },
    {
      name: 'post-counter-reset',
      script: './backend/scripts/resetPostCounters.js',
      autorestart: true,
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      env: backendEnv,
    },
    {
      name: 'mail-moderator',
      script: './backend/scripts/sendEmailToModerator.js',
      autorestart: true,
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      env: backendEnv,
    },
    {
      name: 'hourly-review-check',
      script: './backend/scripts/hourlyCheckForDailyChallengePosts.js',
      autorestart: true,
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      env: backendEnv,
    },
  ],
};
