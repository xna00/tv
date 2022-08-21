chrome.runtime.onMessageExternal.addListener(
  (request, sender, sendResponse) => {
    console.log(request, sender, sendResponse);
    if (request.exist) {
      sendResponse({ exist: true });
    } else if (request.url) {
      fetch(request.url, request.options)
        .then((res) =>
          Promise.all([
            res.arrayBuffer(),
            {
              headers: [...res.headers],
              status: res.status,
              statusText: res.statusText,
            },
          ])
        )
        .then(([res, init]) => {
          sendResponse({
            body: [...new Uint8Array(res)],
            init,
          });
        });
    } else {
      sendResponse({ msg: "unknow" });
    }
  }
);
