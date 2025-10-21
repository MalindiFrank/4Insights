#!/usr/bin/env -S deno run --allow-read --allow-run --allow-write --allow-env
// verify_all.ts - Deno-only pre-build verification
// Runs: deno fmt, deno check on Deno services, bundles tracker using tracker/build.ts
// Optionally runs frontend build via npm (invoked through Deno.Command) when --with-frontend is passed.

import { parse } from "https://deno.land/std@0.203.0/flags/mod.ts";
import {
  dirname,
  fromFileUrl,
  join,
} from "https://deno.land/std@0.203.0/path/mod.ts";

const args = parse(Deno.args, {
  boolean: ["with-frontend"],
  alias: { f: "with-frontend" },
});
const withFrontend = Boolean(args["with-frontend"]);

// repository root (two levels up from scripts/deno -> scripts -> repo root)
const repoRoot = dirname(dirname(dirname(fromFileUrl(import.meta.url))));

async function run(cmd: string[], cwd?: string) {
  console.log(`> ${cmd.join(" ")}`);
  const [prog, ...rest] = cmd;
  const c = new Deno.Command(prog, {
    args: rest,
    cwd,
    stdout: "inherit",
    stderr: "inherit",
  });
  const p = c.spawn();
  const status = await p.status;
  if (!status.success) throw new Error(`Command failed: ${cmd.join(" ")}`);
}

async function main() {
  console.log("Formatting repository...");
  await run(["deno", "fmt", repoRoot]);

  console.log("Checking Deno services...");
  // use deno check on service folders
  await run(["deno", "check", join(repoRoot, "auth/demo/server")]);
  await run(["deno", "check", join(repoRoot, "collector")]);
  await run(["deno", "check", join(repoRoot, "dashboard/backend")]);

  console.log("Bundling tracker with Deno...");
  await run([
    "deno",
    "run",
    "--allow-read",
    "--allow-write",
    join(repoRoot, "tracker/build.ts"),
    "--outDir",
    join(repoRoot, "tracker/build"),
  ]);

  if (withFrontend) {
    console.log("Building frontend via npm (invoked through Deno)");
    // use Deno to run npm so scripts remain invoked from Deno process
    // note: this still invokes node/npm on the host, but is orchestrated by Deno
    await run(["npm", "ci"], join(repoRoot, "dashboard/frontend"));
    await run(["npm", "run", "build"], join(repoRoot, "dashboard/frontend"));
  }

  console.log("All verification steps completed successfully.");
}

if (import.meta.main) {
  main().catch((err) => {
    console.error(err);
    Deno.exit(1);
  });
}
