/* MSRT VazheYar: immutable app shell, cache first for guaranteed offline launch. */
const CACHE_NAME='msrt-vazheyar-offline-v3.0';
const ESSENTIALS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(ESSENTIALS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith('msrt-vazheyar-')&&k!==CACHE_NAME).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const u=new URL(event.request.url);
 if(u.origin!==self.location.origin)return;
 if(event.request.mode==='navigate'){
   event.respondWith((async()=>{
     const cached=await caches.match('./index.html');
     if(cached)return cached;
     try{const r=await fetch(event.request);return r;}catch(_){return new Response('Offline data not yet cached',{status:503});}
   })());
   return;
 }
 event.respondWith((async()=>{
   const cached=await caches.match(event.request);
   if(cached)return cached;
   return fetch(event.request);
 })());
});
