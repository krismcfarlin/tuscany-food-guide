import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default { preprocess: vitePreprocess(), kit: { paths: { base: process.env.GITHUB_PAGES === 'true' ? '/tuscany-food-guide' : '' }, adapter: adapter({ pages: 'build', assets: 'build', fallback: '404.html' }) } };
