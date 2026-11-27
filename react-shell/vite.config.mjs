import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
export default defineConfig({ server: { host: '127.0.0.1', fs: { strict: true, allow: [fileURLToPath(new URL('.', import.meta.url)), fileURLToPath(new URL('../src/', import.meta.url)), fileURLToPath(new URL('../public/', import.meta.url))] } } });
