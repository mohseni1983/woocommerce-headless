module.exports = {
  apps: [
    {
      name: "30tel",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: process.cwd(),
      instances: 2, // تعداد instance ها (برای load balancing)
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      // Restart app if it uses more than 1GB memory
      min_uptime: "10s",
      max_restarts: 10,
    },
  ],
};
