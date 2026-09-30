
const BUILD_ID = "c939184f8018fc6e";
const CACHE_NAME = "psl-game-build-" + BUILD_ID;
const CACHE_PREFIX = "psl-game-build-";
self.addEventListener("install", event => {
 self.skipWaiting();
});
self.addEventListener("activate", event => {
 event.waitUntil((async () => {
  const all = await caches.keys();
  await Promise.all(all.filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME).map(name => caches.delete(name)));
  await self.clients.claim();
 })());
});
self.addEventListener("fetch", event => {
 const request=event.request;
 const url=new URL(request.url);
 if (request.method !== "GET" || url.origin !== self.location.origin) return;
 if (url.pathname.endsWith("/version.json") || url.pathname.endsWith("/psl-update-sw.js") || url.pathname.endsWith("/__build")) return;
 event.respondWith((async()=>{
  const store=await caches.open(CACHE_NAME);
  try {
   const response=await fetch(request, {cache:"no-store"});
   if (response.ok && response.type !== "opaque") {
    try { await store.put(request,response.clone()); } catch (e) { /* Safari quota: online play still works. */ }
   }
   return response;
  } catch(e) {
   const cached=await store.match(request);
   if(cached) return cached;
   if(request.mode==="navigate") {
    const shell=await store.match("./index.html");
    if(shell) return shell;
   }
   return new Response("The game needs an internet connection for this resource.",{status:503,headers:{"Content-Type":"text/plain"}});
  }
 })());
});
