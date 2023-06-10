import { createRoot } from "react-dom/client";
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
        // console.log(event);
        if (event.data.callbackId) {
          
        }
      });

      window.addEventListener("message", (e) => {
        console.log(e);
      });
    });
}

createRoot(document.getElementById("app")!).render(<App />);
