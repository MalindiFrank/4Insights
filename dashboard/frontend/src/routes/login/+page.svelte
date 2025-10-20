<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authService } from '$lib/auth.js';
  import type { AuthCredentials } from '$lib/types.js';

  let loading = false;
  let error: string | null = null;
  let credentials: AuthCredentials | null = null;
  let loginForm = {
    apiKey: '',
    passphrase: ''
  };

  // Check if already authenticated
  onMount(() => {
    if (authService.isAuthenticated()) {
      goto('/');
    }
  });

  /**
   * Generate new credentials
   */
  async function generateCredentials() {
    loading = true;
    error = null;
    try {
      credentials = await authService.generateCredentials();
      loginForm.apiKey = credentials.apiKey;
      loginForm.passphrase = credentials.passphrase;
    } catch (e) {
      error = `Failed to generate credentials: ${e}`;
    } finally {
      loading = false;
    }
  }

  /**
   * Login with credentials
   */
  async function handleLogin() {
    if (!loginForm.apiKey || !loginForm.passphrase) {
      error = 'Please provide both API key and passphrase';
      return;
    }

    loading = true;
    error = null;
    try {
      await authService.login(loginForm);
      goto('/');
    } catch (e) {
      error = `Login failed: ${e}`;
    } finally {
      loading = false;
    }
  }

  /**
   * Clear form and error
   */
  function clearForm() {
    loginForm = { apiKey: '', passphrase: '' };
    credentials = null;
    error = null;
  }
</script>

<svelte:head>
  <title>Login • 4Insights</title>
</svelte:head>

<div class="container">
  <div class="card">
    <h1>4Insights Login</h1>
    <p class="subtitle">Access your analytics dashboard</p>

    {#if error}
      <div class="error">{error}</div>
    {/if}

    {#if !credentials}
      <div class="section">
        <h2>Get Started</h2>
        <p>Generate temporary credentials to access your dashboard.</p>
        <button 
          class="btn primary" 
          on:click={generateCredentials}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Credentials'}
        </button>
      </div>
    {:else}
      <div class="section">
        <h2>Your Credentials</h2>
        <div class="credentials">
          <div class="field">
            <div class="label">API Key:</div>
            <code>{credentials.apiKey}</code>
          </div>
          <div class="field">
            <div class="label">Passphrase:</div>
            <code>{credentials.passphrase}</code>
          </div>
        </div>
        <p class="note">Save these credentials securely. They will expire in 24 hours.</p>
        <button class="btn" on:click={clearForm}>Generate New</button>
      </div>

      <div class="section">
        <h2>Login</h2>
        <form on:submit|preventDefault={handleLogin}>
          <div class="field">
            <label for="apiKey">API Key:</label>
            <input 
              id="apiKey"
              type="text" 
              bind:value={loginForm.apiKey}
              placeholder="Enter your API key"
              required
              aria-describedby="apiKey-help"
            />
          </div>
          <div class="field">
            <label for="passphrase">Passphrase:</label>
            <input 
              id="passphrase"
              type="password" 
              bind:value={loginForm.passphrase}
              placeholder="Enter your passphrase"
              required
              aria-describedby="passphrase-help"
            />
          </div>
          <button 
            type="submit" 
            class="btn primary"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    {/if}

    <div class="footer">
      <a href="/about">← Back to About</a>
    </div>
  </div>
</div>

<style>
  .container {
    max-width: 500px;
    margin: 2rem auto;
    padding: 0 1rem;
  }

  .card {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  h1 {
    margin: 0 0 0.5rem;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .subtitle {
    color: #6b7280;
    margin: 0 0 2rem;
  }

  .section {
    margin-bottom: 2rem;
  }

  .section h2 {
    margin: 0 0 1rem;
    font-size: 1.125rem;
    font-weight: 600;
  }

  .field {
    margin-bottom: 1rem;
  }

  .field label,
  .field .label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .field input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 1rem;
    box-sizing: border-box;
  }

  .field input:focus {
    outline: none;
    border-color: #0ea5e9;
    box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
  }

  .credentials {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .credentials code {
    display: block;
    background: #fff;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    padding: 0.5rem;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.875rem;
    word-break: break-all;
  }

  .note {
    color: #6b7280;
    font-size: 0.875rem;
    margin: 0.5rem 0;
  }

  .btn {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: #fff;
    color: #374151;
    text-decoration: none;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn:hover {
    background: #f9fafb;
  }

  .btn.primary {
    background: #0ea5e9;
    color: #fff;
    border-color: #0ea5e9;
  }

  .btn.primary:hover {
    background: #0284c7;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
    padding: 0.75rem;
    border-radius: 6px;
    margin-bottom: 1rem;
  }

  .footer {
    text-align: center;
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
  }

  .footer a {
    color: #6b7280;
    text-decoration: none;
  }

  .footer a:hover {
    color: #374151;
  }

  @media (prefers-color-scheme: dark) {
    .card {
      background: #0f1720;
      border-color: #1f2937;
    }

    .field input {
      background: #1f2937;
      border-color: #374151;
      color: #e5e7eb;
    }

    .credentials {
      background: #1f2937;
      border-color: #374151;
    }

    .credentials code {
      background: #0f1720;
      border-color: #374151;
      color: #e5e7eb;
    }

    .btn {
      background: #1f2937;
      border-color: #374151;
      color: #e5e7eb;
    }

    .btn:hover {
      background: #374151;
    }

    .error {
      background: #1f2937;
      border-color: #dc2626;
    }
  }
</style>
