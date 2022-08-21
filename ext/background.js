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
          console.log(res);
          let binary = "";
          let bytes = new Uint8Array(res);
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          new Response();
          sendResponse({
            body: btoa(binary),
            init,
          });
        });
    } else {
      sendResponse({ msg: "unknow" });
    }
  }
);
