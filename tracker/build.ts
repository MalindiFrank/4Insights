#!/usr/bin/env -S deno run --allow-read --allow-write
// Deno-only tracker bundler for Deno 2+ (uses Deno.emit)
// Usage: deno run --allow-read --allow-write tracker/build.ts --outDir=tracker/build

import { parse } from "@std/flags";
import { dirname, fromFileUrl, join } from "@std/path";

const args = parse(Deno.args, { string: ["outDir"], alias: { o: "outDir" } });
const outDir = String(args.outDir ?? "tracker/build");
const repoRoot = dirname(fromFileUrl(import.meta.url));
const entry = join(repoRoot, "index.ts");

async function ensureDir(path: string) {
  try {
    await Deno.mkdir(path, { recursive: true });
  } catch {
    // ignore
  }
}

async function bundle() {
  console.log(`Bundling tracker entry: ${entry}`);
  const targetPath = outDir.endsWith(".js") ? outDir : join(outDir, "tracker.js");
  await ensureDir(dirname(targetPath));

  const trackerDir = repoRoot;
  const cmd = ["bundle", "index.ts"];

  console.log(`> deno ${cmd.join(" ")} (cwd: ${trackerDir})`);
  const c = new Deno.Command("deno", {
    args: cmd,
    stdout: "piped",
    stderr: "inherit",
    cwd: trackerDir,
  });
  const p = c.spawn();
  const { code } = await p.status;
  if (code !== 0) {
    throw new Error("deno bundle failed");
  }
  const { stdout } = await p.output();
  const bundleText = new TextDecoder().decode(stdout);
  await ensureDir(dirname(targetPath));
  await Deno.writeTextFile(targetPath, bundleText);
  console.log(`Wrote bundle to ${targetPath}`);
}

if (import.meta.main) {
  bundle().catch((err) => {
    console.error(err);
    Deno.exit(1);
  });
}
