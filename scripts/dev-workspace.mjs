const workspace = process.argv[2];
const allowedWorkspaces = new Set(["api", "web", "worker"]);

if (!allowedWorkspaces.has(workspace)) {
  console.error(`Unknown development workspace: ${workspace ?? "<missing>"}`);
  process.exit(1);
}

console.log(
  `LYVOX_DEV_READY workspace=${workspace} pid=${process.pid} mode=scaffold`,
);

const keepAlive = setInterval(() => {}, 60_000);

function shutdown(signal) {
  clearInterval(keepAlive);
  console.log(`LYVOX_DEV_STOP workspace=${workspace} signal=${signal}`);
  process.exit(0);
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
