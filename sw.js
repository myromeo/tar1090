// mlat.uk service worker - deliberately minimal: it caches nothing.
//
// Its only job is the home-screen web app's offline case. When the app is
// opened with no connection, iOS/Android would otherwise show a bare error
// screen; this shows a short "You're offline" page instead. A cached copy of
// the map would open to an empty map with no data or tiles, which looks
// broken, so no copy is kept.
//
// Every request - the page, scripts, styles, live data, map tiles, photos -
// goes straight to the network exactly as it would without a service worker,
// so deploys are picked up immediately and nothing can ever go stale.
//
// Kill switch: to remove it from every device, replace this file's contents
// with:   self.addEventListener('install', () => self.skipWaiting());
//         self.addEventListener('activate', e => e.waitUntil(self.registration.unregister()));

const OFFLINE_PAGE =
  '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">' +
  '<meta name="theme-color" content="#F5F7FA"><title>mlat.uk - offline</title></head>' +
  '<body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;' +
  'text-align:center;background:#F5F7FA;color:#14181D;font-family:-apple-system,system-ui,sans-serif">' +
  '<div style="padding:24px"><h2 style="color:#0A74C4;margin:0 0 8px">You\'re offline</h2>' +
  '<p style="color:#5B6772;margin:0 0 20px">mlat.uk needs a connection for live tracking.</p>' +
  '<button onclick="location.reload()" style="font:inherit;font-weight:600;padding:10px 22px;border:0;' +
  'border-radius:6px;background:#0A74C4;color:#fff">Try again</button></div></body></html>';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // tidy up any cache an earlier version of this worker may have made
    for (const key of await caches.keys()) await caches.delete(key);
    // Navigation preload: the browser starts the page request in parallel with
    // waking this worker, so its start-up time no longer delays the page.
    if (self.registration.navigationPreload) {
      await self.registration.navigationPreload.enable();
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  // Only page loads are handled at all; everything else is untouched.
  if (event.request.mode !== 'navigate') return;
  event.respondWith((async () => {
    try {
      const preloaded = await event.preloadResponse;   // already in flight
      if (preloaded) return preloaded;
      return await fetch(event.request);
    } catch (err) {
      return new Response(OFFLINE_PAGE, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }
  })());
});
