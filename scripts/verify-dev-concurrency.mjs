import { spawn, spawnSync } from "node:child_process";

const packageManagerEntrypoint = process.env.npm_execpath;

if (!packageManagerEntrypoint) {
  console.error("Run this verification through pnpm: pnpm dev:verify");
  process.exit(1);
}

const expectedWorkspaces = new Set(["api", "web", "worker"]);
const readyWorkspaces = new Set();
let combinedOutput = "";
let settled = false;
let processTreeStopped = false;

const child = spawn(process.execPath, [packageManagerEntrypoint, "run", "dev"], {
  cwd: process.cwd(),
  detached: process.platform !== "win32",
  env: { ...process.env, FORCE_COLOR: "0" },
  stdio: ["ignore", "pipe", "pipe"],
});

function collect(chunk) {
  combinedOutput += chunk.toString();

  for (const match of combinedOutput.matchAll(
    /LYVOX_DEV_READY workspace=(api|web|worker)/g,
  )) {
    readyWorkspaces.add(match[1]);
  }

  if (readyWorkspaces.size === expectedWorkspaces.size) {
    finish(true);
  }
}

child.stdout.on("data", collect);
child.stderr.on("data", collect);

function stopProcessTree() {
  if (processTreeStopped) return;
  processTreeStopped = true;

  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
      stdio: "ignore",
    });
    return;
  }

  try {
    process.kill(-child.pid, "SIGTERM");
  } catch (error) {
    if (error.code !== "ESRCH") throw error;
  }
}

function handleParentSignal(signal) {
  if (settled) return;
  settled = true;
  clearTimeout(timeout);
  stopProcessTree();
  console.error(`Development concurrency verification interrupted by ${signal}`);
  process.exit(signal === "SIGINT" ? 130 : 143);
}

process.once("SIGINT", () => handleParentSignal("SIGINT"));
process.once("SIGTERM", () => handleParentSignal("SIGTERM"));
process.once("exit", stopProcessTree);

function finish(success, reason) {
  if (settled) return;
  settled = true;
  clearTimeout(timeout);
  stopProcessTree();

  if (!success) {
    console.error(reason);
    console.error(combinedOutput.trim());
    process.exitCode = 1;
    return;
  }

  console.log(
    `LYVOX_DEV_CONCURRENCY_OK workspaces=${[...readyWorkspaces].sort().join(",")}`,
  );
}

child.once("error", (error) => {
  finish(false, `Failed to start pnpm dev: ${error.message}`);
});

child.once("exit", (code, signal) => {
  if (!settled) {
    finish(
      false,
      `pnpm dev exited before all workspaces were ready (code=${code}, signal=${signal})`,
    );
  }
});

const timeout = setTimeout(() => {
  const missing = [...expectedWorkspaces].filter(
    (workspace) => !readyWorkspaces.has(workspace),
  );
  finish(false, `Timed out waiting for workspaces: ${missing.join(",")}`);
}, 15_000);
