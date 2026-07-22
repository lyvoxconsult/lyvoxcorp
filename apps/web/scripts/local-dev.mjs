import { createServer } from "vite";

const server = await createServer({ server: { host: "127.0.0.1", port: 5173, strictPort: false } });
await server.listen();
const address = server.httpServer?.address();
const port = typeof address === "object" && address ? address.port : 5173;
console.log(`LYVOX_DEV_READY workspace=web pid=${process.pid} mode=vite port=${port}`);

let closing = false;
async function shutdown(signal) {
  if (closing) return;
  closing = true;
  await server.close();
  console.log(`LYVOX_DEV_STOP workspace=web signal=${signal}`);
  process.exit(0);
}
process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));
