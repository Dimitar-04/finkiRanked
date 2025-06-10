module.exports = {
  apps: [
    {
      name: 'daily-resets-job',
      script: './backend/scripts/dailyResets.js',
      cron_restart: '0 7 * * *', // 5 AM UTC = 7 AM Macedonian Time
      autorestart: false,
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      one_based_action: true,
    },
    {
      name: 'post-counter-reset',
      script: './backend/scripts/resetPostCounters.js', // Adjust path if different
      cron_restart: '0 0 * * *',
      autorestart: false,
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      one_based_action: true,
    },
  ],
};
