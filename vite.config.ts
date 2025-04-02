import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
        watch: {
            ignored: ['**/local.db', '**/local.db-wal', '**/local.db-shm'], // Ignore SQLite files
        },
    },
});
