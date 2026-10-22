import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const publicPort = process.env.PORT || "10000";
const apiPort = "5000";

function run(name, args, cwd, env) {
  const child = spawn(process.execPath, args, {
    cwd,
    stdio: "inherit",
    env: { ...process.env, ...env },
  });
  child.on("error", (error) => {
    console.error(`[start] ${name} failed to spawn:`, error);
    stop(1);
  });
  child.on("exit", (code, signal) => {
    console.error(`[start] ${name} exited (code=${code}, signal=${signal})`);
    stop(code || (signal ? 1 : 0));
  });
  return child;
}

console.log(`[start] node ${process.version}, public port ${publicPort}, api port ${apiPort}`);

const children = [
  run("api", ["server.js"], `${root}backend`, { PORT: apiPort }),
  run(
    "web",
    [
      `${root}frontend/node_modules/next/dist/bin/next`,
      "start",
      "-H",
      "0.0.0.0",
      "-p",
      publicPort,
    ],
    `${root}frontend`,
    {},
  ),
];

let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill("SIGTERM");
  process.exitCode = code;
}
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());