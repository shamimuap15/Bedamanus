// pm2 process definition: `pm2 start ecosystem.config.cjs`
module.exports = {
  apps: [
    {
      name: "bedamanush",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      env: { NODE_ENV: "production" },
      max_memory_restart: "600M",
    },
  ],
};
