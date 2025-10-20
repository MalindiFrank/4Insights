#!/usr/bin/env node
// Simple Node runner for CI: starts Deno services and frontend, waits for readiness, runs Playwright tests, then cleans up.
const { spawn } = require('child_process');
const { setTimeout: wait } = require('timers/promises');
const fetch = globalThis.fetch || require('node-fetch');

const PROCS = [];
function start(cmd, args, opts = {}) {
  console.log('> ' + [cmd, ...args].join(' '), 'cwd=' + (opts.cwd || process.cwd()));
  const p = spawn(cmd, args, { stdio: 'inherit', shell: true, ...opts });
  PROCS.push(p);
  return p;
}

async function waitForUrl(url, timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) return true;
    } catch (e) {
      // ignore
    }
    await wait(500);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function main() {
  try {
    // Start Deno services
    start('deno', ['run', '--allow-net', '--allow-env', 'main.ts'], { cwd: 'auth/demo/server' });
    start('deno', ['run', '--allow-net', '--allow-read', '--allow-write', 'main.ts'], { cwd: 'collector' });
    start('deno', ['run', '--allow-net', '--allow-env', 'main.ts'], { cwd: 'dashboard/backend' });

    // Start frontend (npm dev)
    start('npm', ['run', 'dev'], { cwd: 'dashboard/frontend' });

    // Wait for services to be ready
    console.log('Waiting for frontend at http://localhost:5173 ...');
    await waitForUrl('http://localhost:5173');
    console.log('Frontend ready. Waiting for collector metrics at http://localhost:8000/4insights/metrics ...');
    await waitForUrl('http://localhost:8000/4insights/metrics');

    // Run Playwright (assumes @playwright/test is installed in dashboard/frontend)
    console.log('Running Playwright tests...');
    const play = spawn('npx', ['playwright', 'test', '--project=chromium'], { cwd: 'dashboard/frontend', stdio: 'inherit', shell: true });
    const code = await new Promise((res) => play.on('close', res));
    if (code !== 0) throw new Error('Playwright tests failed with code ' + code);
    console.log('Playwright tests passed');
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    // cleanup
    for (const p of PROCS) {
      try { p.kill('SIGTERM'); } catch (e) { }
    }
  }
}

process.on('SIGINT', () => process.exit(1));
process.on('SIGTERM', () => process.exit(1));

main();
