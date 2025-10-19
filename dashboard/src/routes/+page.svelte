<script lang="ts">
  /**
  * Minimal metrics overview pulling from the dashboard backend (BFF).
  * Adjust BACKEND_URL to your deployment if different origin.
   */
  import { onMount } from 'svelte';

  type TopPath = { path: string; count: number };
  type MetricsOverview = { totalEvents: number; totalPageviews: number; topPaths: TopPath[] };

  const BACKEND_URL = 'http://localhost:8010/dashboard/metrics';

  let loading = true;
  let error: string | null = null;
  let metrics: MetricsOverview | null = null;

  async function loadMetrics() {
    loading = true;
    error = null;
    try {
      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(BACKEND_URL, { headers });
      if (!res.ok) throw new Error(`Failed to load metrics: ${res.status}`);
      metrics = await res.json();
    } catch (e) {
      error = String(e);
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadMetrics();
  });
</script>

<style>
  /* Minimal, modern, no libraries */
  .container { max-width: 960px; margin: 2rem auto; padding: 0 1rem; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
  .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 1rem; background: #fff; }
  .muted { color: #6b7280; }
  .title { font-size: 1.5rem; margin: 0 0 1rem; }
  .table { width: 100%; border-collapse: collapse; }
  .table th, .table td { text-align: left; padding: 0.5rem; border-bottom: 1px solid #f3f4f6; }
  .refresh { margin-top: 1rem; }
  @media (prefers-color-scheme: dark) {
    .card { background: #0f1720; border-color: #1f2937; }
    .muted { color: #9ca3af; }
    .table th, .table td { border-color: #1f2937; }
  }
</style>

<div class="container">
  <h1 class="title">4Insights — Overview</h1>
  {#if loading}
    <p class="muted">Loading metrics…</p>
  {:else if error}
    <p class="muted">{error}</p>
  {:else if metrics}
    <div class="grid">
      <div class="card">
        <div class="muted">Total Events</div>
        <div style="font-size:1.75rem; font-weight:600;">{metrics.totalEvents}</div>
      </div>
      <div class="card">
        <div class="muted">Total Pageviews</div>
        <div style="font-size:1.75rem; font-weight:600;">{metrics.totalPageviews}</div>
      </div>
    </div>

    <div class="card" style="margin-top:1rem;">
      <div class="muted" style="margin-bottom:0.5rem;">Top Paths</div>
      {#if metrics.topPaths.length === 0}
        <p class="muted">No data yet.</p>
      {:else}
        <table class="table">
          <thead>
            <tr>
              <th>Path</th>
              <th>Views</th>
            </tr>
          </thead>
          <tbody>
            {#each metrics.topPaths as row}
              <tr>
                <td>{row.path}</td>
                <td>{row.count}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
      <button class="refresh" on:click={loadMetrics}>Refresh</button>
    </div>
  {/if}
</div>
