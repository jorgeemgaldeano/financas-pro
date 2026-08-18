import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));

// Fase 0 da v0.3.38 (DEC-0039). O plugin estava declarado em package.json
// desde o inicio do projeto e nunca foi aplicado: sem vite.config.js, o Vite
// transpilava o JSX pelo esbuild e o React Fast Refresh nunca rodou.
// Consequencia observada em varias sessoes: editar um componente recarregava a
// pagina inteira e abas antigas quebravam com ReferenceError fantasma.
//
// __APP_VERSION__ vem do package.json (DEC-0040): fonte unica de versao. O
// mesmo define existe no vitest.config.js, que nao carrega este arquivo.
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
});
