<svelte:head>
	<title>About • 4Insights</title>
	<meta name="description" content="Learn about 4Insights: simple, privacy-friendly analytics." />
</svelte:head>

<div class="wrap">
	<h1>What is 4Insights?</h1>
	<p class="lead">
		4Insights is a simple, privacy‑friendly way to understand how people use your site.
		No intrusive tracking. Just clear numbers that help you make better decisions.
	</p>

	<div class="grid">
		<div class="card">
			<h2>Why you'll like it</h2>
			<ul>
				<li>Clean, modern dashboard</li>
				<li>Fast setup, lightweight script</li>
				<li>Privacy first — no creepy tracking</li>
			</ul>
		</div>
		<div class="card">
			<h2>What you get</h2>
			<ul>
				<li>Total visits and pageviews</li>
				<li>Top pages on your site</li>
				<li>Simple, reliable insights</li>
			</ul>
		</div>
	</div>

	<div class="actions">
		<a class="btn primary" href="/login">Log in</a>
		<a class="btn" href="/login?request=1">Request access</a>
	</div>
</div>

<style>
	.wrap { max-width: 960px; margin: 2rem auto; padding: 0 1rem; }
	.lead { color: #6b7280; margin: 0.5rem 0 1.25rem; }
	.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; }
	.card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 1rem; background: #fff; }
	.actions { display:flex; gap: 0.75rem; margin-top: 1.25rem; }
	.btn { display:inline-block; padding: 0.6rem 0.9rem; border: 1px solid #e5e7eb; border-radius: 10px; text-decoration:none; font-weight:600; }
	.btn.primary { background: #0ea5e9; color: #fff; border-color: #0ea5e9; }
	@media (prefers-color-scheme: dark) {
		.card { background: #0f1720; border-color: #1f2937; }
		.lead { color: #9ca3af; }
		.btn { border-color:#1f2937; }
		.btn.primary { background:#0284c7; border-color:#0284c7; }
	}
</style>
