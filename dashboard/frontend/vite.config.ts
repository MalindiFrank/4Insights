import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { qrcode } from 'vite-plugin-qrcode'

export default defineConfig({
	plugins: [sveltekit(), qrcode()],
	build: {
		// Ensure assets are properly processed and hashed
		assetsDir: 'assets',
		rollupOptions: {
			output: {
				// Ensure large images are properly chunked
				assetFileNames: 'assets/[name]-[hash][extname]',
				chunkFileNames: 'chunks/[name]-[hash].js',
			}
		}
	},
	// Properly handle image imports
	assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg'],
	// Optimize images during build
	optimizeDeps: {
		include: ['@sveltejs/kit']
	},
	// Allow preview server to accept requests from any host
	preview: {
		allowedHosts: true
	}
});
