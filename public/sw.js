const CACHE_PREFIX = 'crun-shell-'
const CACHE = `${CACHE_PREFIX}v2`
const APP_ROOT = self.registration.scope
const scopedUrl = (path) => new URL(path, APP_ROOT).href
const SHELL = [
  APP_ROOT,
  scopedUrl('manifest.webmanifest'),
  scopedUrl('icons/icon.svg'),
  scopedUrl('icons/icon-512.png'),
  scopedUrl('icons/apple-touch-icon.png'),
]

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE)
        .map((key) => caches.delete(key)),
    )),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone()
        caches.open(CACHE).then((cache) => cache.put(event.request, copy))
        return response
      })
      .catch(async () => {
        const cached = await caches.match(event.request)
        if (cached) return cached
        if (event.request.mode === 'navigate') return caches.match(APP_ROOT)
        return Response.error()
      }),
  )
})
