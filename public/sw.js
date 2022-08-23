const pendingRequests = new Map();
let lru = [];
const videoCache = "video";
let extProxy = false;
let callbackId = 1;
const callbackMap = new Map();

const extProxyFetch = (request) => {
  // console.log(callbackMap);
  return new Promise((resolve, reject) => {
    self.clients.matchAll().then((all) => {
      const first = all[0];
      if (!first) reject();
      else {
        const cid = callbackId;
        callbackMap.set(callbackId, (res) => {
          const r = new Response(new Uint8Array(res.body).buffer, res.init);
          resolve(r);
        });
        first.postMessage({
          callbackId: callbackId++,
          url: request.url,
          options: {
            method: request.method,
            headers: [...request.headers],
            // body:
          },
        });
        setTimeout(() => {
          if (callbackMap.get(cid)) {
            callbackMap.delete(cid);
            reject();
          }
        }, 60000);
      }
    });
  });
};

self.addEventListener("fetch", (event) => {
  const url = event.request.url;
  const { host, pathname } = new URL(url);
  const request = event.request;
  // console.log(url, pathname, pendingRequests);
  event.respondWith(
    !pathname.startsWith("/proxy/")
      ? caches.match(event.request).then((res) => {
          const tmp = fetch(event.request).then((res) => {
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
              (pathname.startsWith("/proxy")
                ? extProxyFetch(
                    new Request(url.replace(/^.+\/proxy\//, ""), request)
                  )
                : fetch(event.request)
              )
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
          res
            .finally(() => {
              caches.open(videoCache).then((cache) => {
                cache
                  .keys()
                  .then((rs) =>
                    Promise.all(
                      rs
                        .map((r) => r.url)
                        .map((u) => !lru.includes(u) && cache.delete(u))
                    )
                  );
              });
            })
            .then(() => {
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
          console.log("set pending");
          self.clients.matchAll().then((all) =>
            all.map((client) => {
              // console.log(client);
              client.postMessage({
                pendingRequests: Array.from(pendingRequests.keys()),
              });
            })
          );
          //   console.log(res);
          return res;
        })
  );
});

self.addEventListener("message", (event) => {
  // console.log(event, "message");
  const id = event.data.callbackId;
  if (callbackMap.has(id)) {
    callbackMap.get(id)(event.data);
    callbackMap.delete(id);
  }
});
