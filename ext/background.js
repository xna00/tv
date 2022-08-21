chrome.runtime.onMessageExternal.addListener(
  (request, sender, sendResponse) => {
    console.log(request, sender, sendResponse);
    sendResponse(chrome.runtime.getManifest());
  }
);
