import { readFileSync } from "node:fs";
import { defineConfig } from "vitest/config";

const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));

export default defineConfig({
  // O vitest nao carrega o vite.config.js, entao o define de __APP_VERSION__
  // precisa ser repetido aqui (DEC-0040). Sem isto, qualquer teste que importe
  // o App.jsx quebraria com "__APP_VERSION__ is not defined".
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
  },
});
