import { createApp } from "vinxi";
import { fileURLToPath } from "url";
import path from "path";

const __dirname =
path.dirname(fileURLToPath(import.meta.url));
export default createApp({
  router: [
    {
      name: "public",
      type: "static",
      dir: "./public",
      base: "/",
    },
    {
      name: "client",
      type: "spa",
      handler: "./src/entry-client.tsx",
      target: "browser",
      plugins: () => []
      vite: {
        resolve: {
          alias: {
            "@": path.resolve(__dirname, "./src"),
          },
        },
      },
    },
  ],
});
