const pendingRequests = new Map();
console.log(self);
let lru = [];
const videoCache = "video";
self.addEventListener("fetch", (event) => {
  const url = event.request.url;
  const host = new URL(url).host;
  const request = event.request;
  //   console.log(url, pendingRequests);
  event.respondWith(
    host === location.host
      ? caches.match(event.request).then((res) => {
          const tmp = fetch(request).then((res) => {
            const c = res.clone();
            caches.open("main").then((cache) => cache.put(request, c));
            return res;
          });
          return res ?? tmp;
        })
      : Promise.resolve(pendingRequests.get(url)).then(() => {
          const res = caches.match(event.request).then(
            (response) =>
              response ??
              fetch(event.request)
                .then((response) => {
                  if (response.headers.get("content-type")?.includes("video")) {
                    const tmp = response.clone();
                    // console.log(Object.fromEntries(tmp.headers.entries()));
                    lru = lru.filter((u) => u !== url).slice(0, 29);
                    lru.unshift(url);
                    // console.log(lru);
                    return Promise.all([
                      response,
                      caches
                        .open(videoCache)
                        .then((cache) => cache.put(event.request, tmp)),
                    ]);
                  }
                  return [response];
                })
                .then(
                  ([r]) => r,
                  (e) => {
                    console.log("sw error", e);
                    return Promise.reject(e);
                  }
                )
          );
          res.finally(() => {
            caches.open(videoCache).then((cache) => {
              cache
                .keys()
                .then((rs) =>
                  rs
                    .map((r) => r.url)
                    .forEach((u) => !lru.includes(u) && cache.delete(u))
                );
            });
            pendingRequests.delete(url);
            self.clients.matchAll().then((all) => {
              all.map((client) =>
                client.postMessage({
                  pendingRequests: Array.from(pendingRequests.keys()),
                })
              );
            });
          });
          pendingRequests.set(url, res);
          self.clients.matchAll().then((all) =>
            all.map((client) =>
              client.postMessage({
                pendingRequests: Array.from(pendingRequests.keys()),
              })
            )
          );
          //   console.log(res);
          return res;
        })
  );
});
