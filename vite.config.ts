import { defineConfig, splitVendorChunkPlugin } from "vite";
import Unocss from "unocss/vite";
import presetUno from "@unocss/preset-uno";
import presetIcons from "@unocss/preset-icons";
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin(),
    Unocss({
      presets: [
        presetUno(),
        presetIcons({
          // prefix: 'i',
        }),
      ],
    }),
  ],
  server: {
    host: true,
  },
});
