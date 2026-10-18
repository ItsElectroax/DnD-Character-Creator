import { createRequire } from "node:module";
import { readdir, mkdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
const require = createRequire(import.meta.url);
const { build } = require(
  require.resolve("esbuild", { paths: [require.resolve("vite")] }),
);
await mkdir("tmp/tests", { recursive: true });
const files = (await readdir("tests")).filter((file) =>
  file.endsWith(".test.ts"),
);
if (!files.length) throw new Error("No regression tests found.");
for (const file of files)
  await build({
    entryPoints: [path.join("tests", file)],
    outfile: path.join("tmp/tests", file.replace(/\.ts$/, ".cjs")),
    bundle: true,
    platform: "node",
    format: "cjs",
    target: "node22",
    logLevel: "warning",
    logOverride: { "empty-import-meta": "silent" },
  });
const result = spawnSync(
  process.execPath,
  [
    "--test",
    ...files.map((file) =>
      path.join("tmp/tests", file.replace(/\.ts$/, ".cjs")),
    ),
  ],
  { stdio: "inherit" },
);
process.exitCode = result.status ?? 1;
