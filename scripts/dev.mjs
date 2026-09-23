import { spawn } from "node:child_process";
import { existsSync, copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
for (const folder of ["backend", "frontend"]) {
  const env = `${root}${folder}/.env`;
  if (!existsSync(env)) copyFileSync(`${env}.example`, env);
}
const children = ["backend", "frontend"].map((folder) =>
  spawn(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "dev"], {
    cwd: `${root}${folder}`,
    stdio: "inherit",
  }),
);
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill("SIGTERM");
  process.exitCode = code;
}
for (const child of children) {
  child.on("error", (error) => {
    console.error(error);
    stop(1);
  });
  child.on("exit", (code) => stop(code || 0));
}
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
