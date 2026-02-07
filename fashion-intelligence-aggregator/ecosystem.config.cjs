/** PM2 config: run from repo root with: pm2 start ecosystem.config.cjs */
module.exports = {
  apps: [
    {
      name: "backend",
      cwd: "./server",
      script: "node",
      args: "dist/index.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: { NODE_ENV: "production" },
    },
    {
      name: "frontend",
      cwd: "./frontend",
      script: "npm",
      args: "run start",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: { NODE_ENV: "production", PORT: 3000 },
    },
  ],
};
