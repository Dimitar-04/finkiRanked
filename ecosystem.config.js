module.exports = {
  apps: [
    {
      name: 'daily-resets-job',
      script: './backend/scripts/dailyResets.js',
      autorestart: true,
      watch: false,
      instances: 1,
      exec_mode: 'fork',
    },
    {
      name: 'post-counter-reset',
      script: './backend/scripts/resetPostCounters.js',
      autorestart: true,
      watch: false,
      instances: 1,
      exec_mode: 'fork',
    },
  ],
};
