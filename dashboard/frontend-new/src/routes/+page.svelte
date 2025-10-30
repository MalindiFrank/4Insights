<script lang="ts">
  /**
   * Dashboard main page with authentication and metrics display
   */
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authService } from '$lib/auth.js';
  import { loadConfig } from '$lib/config.js';
  import type { MetricsOverview, DashboardConfig } from '$lib/types.js';

  let loading = true;
  let error: string | null = null;
  let metrics: MetricsOverview | null = null;
  let isAuthenticated = false;
  let config: DashboardConfig | null = null;

  /**
   * Load metrics from dashboard backend
   */
  async function loadMetrics() {
    loading = true;
    error = null;

    try {
      // Load runtime configuration if not already loaded
      if (!config) {
        config = await loadConfig();
      }

      const token = authService.getStoredToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(`${config.dashboardBackendUrl}/dashboard/metrics`, {
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          authService.logout();
          goto('/login');
          return;
        }
        throw new Error(`Failed to load metrics: ${response.status}`);
      }

      metrics = await response.json();
    } catch (e) {
      error = String(e);
    } finally {
      loading = false;
    }
  }

  /**
   * Handle logout
   */
  async function handleLogout() {
    try {
      await authService.logout();
      goto('/login');
    } catch (e) {
      console.error('Logout error:', e);
      // Force redirect even if logout fails
      goto('/login');
    }
  }

  /**
   * Refresh metrics
   */
  function refreshMetrics() {
    loadMetrics();
  }

  onMount(async () => {
    // Load runtime configuration first
    config = await loadConfig();

    // Check authentication status
    isAuthenticated = authService.isAuthenticated();

    if (!isAuthenticated) {
      goto('/login');
      return;
    }

    // Load metrics if authenticated
    loadMetrics();
  });
</script>

<div class="container">
  <div class="header">
    <h1 class="title">4Insights — Overview</h1>
    {#if isAuthenticated}
      <button class="btn logout" on:click={handleLogout}>Logout</button>
    {/if}
  </div>

  {#if loading}
    <p class="muted">Loading metrics…</p>
  {:else if error}
    <div class="error">
      <p>{error}</p>
      <button class="btn" on:click={refreshMetrics}>Retry</button>
    </div>
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
      <button class="refresh" on:click={refreshMetrics}>Refresh</button>
    </div>
  {/if}
</div>


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
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .btn {
    padding: 0.5rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: #fff;
    color: #374151;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
  }
  
  .btn:hover {
    background: #f9fafb;
  }
  
  .btn.logout {
    background: #dc2626;
    color: #fff;
    border-color: #dc2626;
  }
  
  .btn.logout:hover {
    background: #b91c1c;
  }
  
  .error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
    padding: 1rem;
    border-radius: 6px;
    margin-bottom: 1rem;
  }
  
  .error p {
    margin: 0 0 0.5rem;
  }
  
  @media (prefers-color-scheme: dark) {
    .card { background: #0f1720; border-color: #1f2937; }
    .muted { color: #9ca3af; }
    .table th, .table td { border-color: #1f2937; }
    .btn { background: #1f2937; border-color: #374151; color: #e5e7eb; }
    .btn:hover { background: #374151; }
    .error { background: #1f2937; border-color: #dc2626; }
  }
</style>
