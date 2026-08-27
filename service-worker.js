// Service Worker بسيط: بس عشان الصفحة تتثبت كتطبيق وتفتح بسرعة حتى لو النت ضعيف.
// مش بيعمل كاش لطلبات تسجيل الحضور (fetch لـApps Script) - لازم إنترنت عشان التسجيل يشتغل.

const CACHE_NAME = "attendance-scanner-v1";
const APP_SHELL = [
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // أي طلب بيروح لـApps Script (تسجيل الحضور) لازم يعدي للإنترنت مباشرة، مفيش كاش
  if (url.hostname.includes("script.google.com")) {
    return; // سيبه يمشي عادي من غير اعتراض
  }

  // لباقي الملفات (شكل التطبيق): جرب الكاش الأول، ولو مش موجود روح للنت
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});
