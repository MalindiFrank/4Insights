import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// Use the static adapter so `npm run build` produces a self-contained `build/` directory
		// which can be served directly by nginx in the production Docker image.
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			strict: true,
			// Add cache headers for images and other assets
			precompress: true,
			headers: {
				'/assets': {
					'Cache-Control': 'public, max-age=31536000, immutable'
				},
				'/images': {
					'Cache-Control': 'public, max-age=31536000, immutable'
				},
				'/.*(jpg|jpeg|png|gif|svg|woff2?)$': {
					'Cache-Control': 'public, max-age=31536000, immutable'
				}
			}
		})
	}
};

export default config;
