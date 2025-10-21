#!/usr/bin/env -S deno run --allow-run --allow-read --allow-env
// deno script to run format/checks and the e2e helper using Deno.Command (Deno 2+ when available)
// The script will try to avoid the global `--unstable` flag on Deno v2+ to prevent warnings.

// Compute repository root by walking up from this file's URL.
const repoRootPath = new URL("../../..", import.meta.url).pathname;

async function run(cmd: string[], capture = false) {
  const program = cmd[0];
  const args = cmd.slice(1);
  console.log(`> ${[program, ...args].join(" ")}`);

  const command = new Deno.Command(program, {
    args,
    stdout: capture ? "piped" : "inherit",
    stderr: capture ? "piped" : "inherit",
  });

  const child = command.spawn();
  const status = await child.status;
  if (!status.success) {
    throw new Error(`Command failed: ${[program, ...args].join(" ")}`);
  }
  if (capture && child.output) {
    const { stdout } = await child.output();
    return new TextDecoder().decode(stdout);
  }
  return undefined;
}

async function getDenoMajorVersion(): Promise<number | null> {
  try {
    const out = await run(["deno", "--version"], true);
    // expected first line: "deno 1.34.2" or "deno 2.0.0"
    if (!out) return null;
    const first = out.split("\n")[0] || "";
    const m = first.match(/deno\s+(\d+)\.\d+\.\d+/i);
    if (m) return Number(m[1]);
    return null;
  } catch {
    return null;
  }
}

async function main() {
  console.log("Running deno fmt...");
  await run(["deno", "fmt", repoRootPath]);

  // Determine whether to include the global --unstable flag.
  const denoMajor = await getDenoMajorVersion();
  const useGlobalUnstable = denoMajor === null ? true : denoMajor < 2;

  console.log("Running deno check on services...");
  // Check auth, collector, backend
  if (useGlobalUnstable) {
    await run([
      "deno",
      "check",
      "--unstable",
      repoRootPath + "auth/demo/server",
    ]);
    await run(["deno", "check", "--unstable", repoRootPath + "collector"]);
    await run([
      "deno",
      "check",
      "--unstable",
      repoRootPath + "dashboard/backend",
    ]);
  } else {
    // Deno v2+ prefers granular unstable flags; omit the global flag to avoid warnings.
    await run(["deno", "check", repoRootPath + "auth/demo/server"]);
    await run(["deno", "check", repoRootPath + "collector"]);
    await run(["deno", "check", repoRootPath + "dashboard/backend"]);
  }

  console.log("Running HTTP-based e2e helper script (shell)...");
  // execute the shell e2e script we created earlier
  await run(["/bin/sh", repoRootPath + "scripts/e2e_test.sh"]);

  // NOTE: we intentionally do not run npm or Node-based tools from this Deno script.
  // If you want to run Playwright/browser E2E tests, run them separately with Node
  // in the `dashboard/frontend` folder. This keeps Deno and Node responsibilities separated.
  const runBrowser = Deno.env.get("RUN_BROWSER_E2E") || "false";
  if (runBrowser === "true") {
    console.log(
      "RUN_BROWSER_E2E is set, but this Deno script will not invoke npm.\nPlease run Playwright manually in the dashboard/frontend folder:\n  cd dashboard/frontend && npm run test:e2e",
    );
  }

  console.log("All checks and e2e helper completed.");
}

if (import.meta.main) {
  main().catch((err) => {
    console.error(err);
    Deno.exit(1);
  });
}
