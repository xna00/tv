import { render } from "preact";
import { App } from "./app";
import "./index.css";
import "uno.css";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js", {
    scope: "/",
  });
}

render(<App />, document.getElementById("app")!);
