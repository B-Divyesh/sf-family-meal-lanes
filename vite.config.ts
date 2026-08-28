import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { defineConfig, type Plugin } from 'vite';

async function filesBelow(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async entry => {
    const fullPath = resolve(directory, entry.name);
    return entry.isDirectory() ? filesBelow(fullPath) : [fullPath];
  }));
  return files.flat();
}

function offlineShell(): Plugin {
  let outputDirectory = '';

  return {
    name: 'family-meal-lanes-offline-shell',
    apply: 'build',
    configResolved(config) {
      outputDirectory = resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      const allFiles = await filesBelow(outputDirectory);
      const appFiles = allFiles
        .map(file => `/${relative(outputDirectory, file).replaceAll('\\', '/')}`)
        .filter(file => file !== '/sw.js' && !file.endsWith('staticwebapp.config.json'))
        .sort();
      const version = createHash('sha256')
        .update((await Promise.all(appFiles.map(async file => `${file}:${await readFile(resolve(outputDirectory, `.${file}`))}`))).join('\n'))
        .digest('hex')
        .slice(0, 12);

      const manifestPath = resolve(outputDirectory, 'manifest.webmanifest');
      const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as Record<string, unknown>;
      manifest.start_url = `/?v=${version}`;
      await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

      // These are real routes, not a catch-all SPA fallback. This lets the host
      // return a genuine HTTP 404 for a mistyped address.
      const index = await readFile(resolve(outputDirectory, 'index.html'), 'utf8');
      for (const route of ['demo', 'privacy', 'terms']) {
        const routeDirectory = resolve(outputDirectory, route);
        await mkdir(routeDirectory, { recursive: true });
        await writeFile(resolve(routeDirectory, 'index.html'), index);
      }

      const shell = ['/', '/index.html', ...appFiles.filter(file => !file.endsWith('/index.html'))];
      const worker = `const CACHE = 'family-meal-lanes-${version}';
const SHELL = ${JSON.stringify(shell)};
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL))));
self.addEventListener('activate', event => event.waitUntil((async () => {
  await Promise.all((await caches.keys()).filter(key => key.startsWith('family-meal-lanes-') && key !== CACHE).map(key => caches.delete(key)));
  await self.clients.claim();
})()));
self.addEventListener('message', event => { if (event.data === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  if (new URL(event.request.url).pathname === '/sw.js') return;
  if (event.request.mode === 'navigate') {
    event.respondWith(caches.open(CACHE).then(cache => cache.match('/index.html')).then(hit => hit || fetch(event.request)));
    return;
  }
  event.respondWith(caches.open(CACHE).then(cache => cache.match(event.request.url)).then(hit => hit || fetch(event.request)));
});
`;
      await writeFile(resolve(outputDirectory, 'sw.js'), worker);
    }
  };
}

export default defineConfig({
  build: {
    target: 'es2022', sourcemap: false,
    rollupOptions: { output: { entryFileNames: 'assets/[name]-[hash].js', chunkFileNames: 'assets/[name]-[hash].js', assetFileNames: 'assets/[name]-[hash][extname]' } }
  },
  server: { host: '127.0.0.1' },
  plugins: [offlineShell()]
});
