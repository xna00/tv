import { defineConfig, splitVendorChunkPlugin } from "vite";
import preact from "@preact/preset-vite";
import Unocss from "unocss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    preact(),
    splitVendorChunkPlugin(),
    Unocss({
      /* options */
    }),
  ],
  server: {
    host: true,
  },
});
