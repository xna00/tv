import { render } from "preact";
import { App } from "./app";
import "./index.css";
import "uno.css";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js", {
      scope: "/",
    })
    .then(() => {
      navigator.serviceWorker?.addEventListener("message", (event) => {
        console.log(event);
        if (event.data.callbackId) {
          (window as any).chrome.runtime.sendMessage(
            "pfjfdpobjbkelgmnpgfncoigidcpdnik",
            event.data,
            (res: any) => {
              navigator.serviceWorker?.controller?.postMessage({
                ...res,
                ...event.data,
              });
            }
          );
        }
      });

      window.addEventListener("message", (e) => {
        console.log(e);
      });
    });
}

if ((window as any).chrome?.runtime?.sendMessage) {
  (window as any).chrome.runtime.sendMessage(
    "pfjfdpobjbkelgmnpgfncoigidcpdnik",
    {},
    (arg: any) => {
      if ((window as any).chrome.runtime.lastError) {
        console.log("no ext detected!");
      }
      console.log(arg);
    }
  );
}

render(<App />, document.getElementById("app")!);
