<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authService } from '$lib/auth.js';

  let isAuthenticated = false;

  /**
   * Handle logout
   */
  async function handleLogout() {
    try {
      await authService.logout();
      goto('/login');
    } catch (e) {
      console.error('Logout error:', e);
      goto('/login');
    }
  }

  onMount(() => {
    isAuthenticated = authService.isAuthenticated();
  });
</script>

<header style="display:flex; align-items:center; justify-content:space-between; padding: 12px 16px;">
  <h1 style="margin:0; font-size:1.125rem;">4Insights Dashboard</h1>
  <nav>
    <a href="/" style="margin-right:12px;">Home</a>
    <a href="/about" style="margin-right:12px;">About</a>
    {#if isAuthenticated}
      <button class="logout-btn" on:click={handleLogout}>Logout</button>
    {/if}
  </nav>
</header>

<style>
  header a {
    text-decoration: none;
    font-weight: 600;
  }
  
  .logout-btn {
    background: #dc2626;
    color: #fff;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.2s;
  }
  
  .logout-btn:hover {
    background: #b91c1c;
  }
  
  @media (prefers-color-scheme: dark) {
    header { color: #e5e7eb; }
  }
</style>


