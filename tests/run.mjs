// Single entry point for every gate. Run with `make check` (or `node tests/run.mjs`)
// from the repository root. Add a new gate by dropping a *.test.mjs file in tests/.
import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";

const gates = readdirSync("tests").filter((file) => file.endsWith(".test.mjs")).sort();
const failed = [];

for (const gate of gates) {
  const result = spawnSync(process.execPath, [`tests/${gate}`], { stdio: "inherit" });
  if (result.status !== 0) failed.push(gate);
}

if (failed.length) {
  console.error(`\n${failed.length} of ${gates.length} gates failed: ${failed.join(", ")}`);
  process.exit(1);
}

console.log(`\nall ${gates.length} gates passed`);
