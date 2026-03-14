module.exports = {
  apps: [
    {
      name: "slack-listener-gambling",
      script: "scripts/slack-listener.js",
      cwd: __dirname,
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
      env: {
        NODE_ENV: "production",
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "logs/slack-listener-error.log",
      out_file: "logs/slack-listener-out.log",
      merge_logs: true,
    },
  ],
};
