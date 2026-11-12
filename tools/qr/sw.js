/* Cache the complete static release. Let open clients finish before activation. */
const CACHE_NAME = 'ap-qr-static-v2';
const scope = self.registration.scope;
const shell = new URL('./index.html', scope).href;
const assets = [
    './v2/app.js', './v2/splitter.js', './v2/editor.js', './v2/zip.js',
    './v2/theme.js', './v2/styles.css', './v2/manifest.webmanifest',
    './v2/icon-192.png', './v2/icon-512.png', './v2/apple-touch-icon.png',
    './vendor/qrcode.light.min.js',
    '/assets/brand/ap-on-dark.svg', '/assets/brand/ap-on-light.svg', '/assets/brand/ap.ico',
    '/assets/fonts/InterVariable.woff2', '/assets/icons.svg'
].map(path => new URL(path, scope).href);
const assetSet = new Set(assets);

async function cacheRelease() {
    const response = await fetch(shell, { cache: 'reload', redirect: 'error' });
    if (!response.ok || !(await response.clone().text()).includes('<meta name="ap-qr-release" content="2">')) {
        throw new Error('AP. QR release assets are still publishing.');
    }
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(assets.map(url => new Request(url, { cache: 'reload', redirect: 'error' })));
    await cache.put(shell, response);
}

self.addEventListener('install', event => event.waitUntil(cacheRelease()));

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.filter(key => key.startsWith('ap-qr-static-') && key !== CACHE_NAME).map(key => caches.delete(key)));
        await self.clients.claim();
    })());
});

async function cached(url) {
    if (!(await caches.has(CACHE_NAME))) return undefined;
    return (await caches.open(CACHE_NAME)).match(url);
}

self.addEventListener('fetch', event => {
    const { request } = event;
    if (request.method !== 'GET') return;
    const url = new URL(request.url);
    if (request.mode === 'navigate' && (url.href === scope || url.href === shell)) {
        event.respondWith(cached(shell).then(response => response || fetch(request)));
    } else if (assetSet.has(url.href)) {
        event.respondWith(cached(url.href).then(response => response || fetch(request)));
    }
});

let repair;

async function offlineReady() {
    const checks = await Promise.all([shell, ...assets].map(cached));
    if (checks.every(Boolean)) return true;
    // Reopening online can recover partial eviction while this release is live.
    // A failed repair leaves any still-cached files available.
    repair ??= cacheRelease().then(() => true, () => false).finally(() => { repair = undefined; });
    return repair;
}

self.addEventListener('message', event => {
    if (event.data !== 'qr-2-status' || !event.ports[0]) return;
    event.waitUntil((async () => {
        event.ports[0].postMessage(await offlineReady() ? 'qr-2-ready' : 'qr-2-incomplete');
    })());
});
