// Service Worker
const VERSION = 'v0';
const CACHE_NAME = `period-tracker-${VERSION}`;
const APP_STATIC_RESOURCES = [
"/",
"index.html",
"style.css",
"main.js",
"parser.js",
"page-splitter.js",

"lib/js-yaml/4.1.0/min.js",
"lib/util/type.js",
"lib/util/css.js",
"lib/util/dom/dom.tags.js",
"lib/util/promise/wait.js",
"lib/util/string/normalize-line-breaks.js",
"lib/util/string/trim.js",
"lib/util/string/case.js",
"lib/util/string/length.js",

"asset/image/icon/javel/512/any.svg",
];
// 所定のファイルをキャッシュする。インストール時。
self.addEventListener("install", (e)=>{
    e.waitUntil(
        (async()=>{
            const cache = await caches.open(CACHE_NAME);
            cache.addAll(APP_STATIC_RESOURCES);
        })(),
    );
});
// 古いキャッシュを削除する。新しいサービスワーカーが見つかった場合。
self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
            const names = await caches.keys();
            await Promise.all(
                names.map((name) => {
                    if (name !== CACHE_NAME) {return caches.delete(name);}
                    return undefined;
                }),
            );
            await clients.claim();
        })(),
    );
});
// fetchされたときキャッシュを返す
self.addEventListener("fetch", (event) => {
    // As a single page app, direct app to always go to cached home page.
    if (event.request.mode === "navigate") {event.respondWith(caches.match("/"));return;}
    // For all other requests, go to the cache first, and then the network.
    event.respondWith(
        (async()=>{
            const cache = await caches.open(CACHE_NAME);
            const cachedResponse = await cache.match(event.request.url);
            if (cachedResponse) {return cachedResponse;}// Return the cached response if it's available.
            return new Response(null, {status:404});// If resource isn't in the cache, return a 404.
        })(),
    );
});
