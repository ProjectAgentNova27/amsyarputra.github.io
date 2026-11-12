/* AP. QR — static resources only. Never cache operational text. */
const CACHE_NAME = 'ap-qr-static-v1';
const FILES = ['./','./index.html','./styles.css','./splitter.js','./app.js','./manifest.webmanifest','./vendor/qrcode.light.min.js','/favicon.png'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('ap-qr-static-') && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => {
 if(event.request.method !== 'GET') return;
 const url = new URL(event.request.url);
 if(url.origin !== self.location.origin) return;
 if(!url.pathname.startsWith('/tools/qr/') && url.pathname !== '/favicon.png') return;
 event.respondWith(caches.match(event.request,{ignoreSearch:true}).then(cached => cached || fetch(event.request)));
});