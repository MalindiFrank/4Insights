import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { qrcode } from 'vite-plugin-qrcode'

export default defineConfig({
	plugins: [sveltekit(), qrcode()]
});
