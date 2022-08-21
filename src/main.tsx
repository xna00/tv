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



render(<App />, document.getElementById("app")!);
