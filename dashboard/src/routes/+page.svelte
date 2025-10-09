<script>
	import { onMount } from 'svelte';
	
	let data = null;
	let loading = true;
	let error = null;

	onMount(async () => {
		try {
			// Simulate API call
			await new Promise(resolve => setTimeout(resolve, 1000));
			data = { message: 'Dashboard loaded successfully!' };
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>4Insights Dashboard</title>
	<meta name="description" content="Analytics dashboard for 4Insights" />
</svelte:head>

<div class="dashboard">
	<h1>4Insights Dashboard</h1>
	
	{#if loading}
		<p>Loading dashboard...</p>
	{:else if error}
		<p class="error">Error: {error}</p>
	{:else if data}
		<p class="success">{data.message}</p>
	{/if}
</div>

<style>
	.dashboard {
		text-align: center;
		padding: 2rem;
	}
	
	h1 {
		color: #333;
		margin-bottom: 2rem;
	}
	
	.success {
		color: #28a745;
		font-weight: bold;
	}
	
	.error {
		color: #dc3545;
		font-weight: bold;
	}
</style>
