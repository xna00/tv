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
      console.log("registered");
    });
}

if (window.chrome?.runtime?.sendMessage) {
  window.chrome.runtime.sendMessage(
    "pfjfdpobjbkelgmnpgfncoigidcpdnik",
    {},
    (arg) => {
      if (chrome.runtime.lastError) {
        console.log("no ext detected!");
      }
      console.log(arg);
    }
  );
}

render(<App />, document.getElementById("app")!);
