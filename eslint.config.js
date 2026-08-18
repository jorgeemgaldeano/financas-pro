import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

// Fase 0 da v0.3.38 (DEC-0039). Divida aberta na Fase 5 da v0.3.37, quando a
// extracao de ParamsTab quebrou em runtime com "catColor is not defined" sem
// que npm test ou npm run build acusassem nada. A regra que pega isso e
// no-undef, que vem de js.configs.recommended.
export default [
  {
    ignores: [
      "dist/**",
      "coverage/**",
      "node_modules/**",
      "diffs/**",
      // App.jsx orfao na raiz (3.984 linhas), fora do build desde a
      // modularizacao. Nao e codigo vivo; linta-lo so geraria ruido.
      "App.jsx",
    ],
  },
  js.configs.recommended,
  {
    files: ["src/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: "detect" } },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat["jsx-runtime"].rules,
      // O idioma do app e portugues e aspas duplas aparecem em texto de tela.
      // Escapa-las nao previne nenhum defeito. Os dois caracteres que sinalizam
      // erro real de JSX sao > e }, e esses seguem proibidos.
      "react/no-unescaped-entities": ["error", { forbid: [">", "}"] }],
      // Idioma de omissao de propriedades: const { a, b, ...resto } = obj.
      // Os nomes descartados nao sao codigo morto, sao a propria intencao.
      "no-unused-vars": ["error", { ignoreRestSiblings: true }],
      // O projeto nao usa PropTypes e nao ha decisao de adotar.
      "react/prop-types": "off",
      // Somente as duas regras classicas de hooks. O preset recommended do
      // eslint-plugin-react-hooks v7 traz o conjunto do React Compiler
      // (immutability, purity, use-memo etc.), que e outro trabalho, de outro
      // tamanho, e nao cabe na Fase 0.
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },
  {
    files: ["tests/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.node, ...globals.browser },
    },
  },
  {
    files: ["*.config.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: globals.node,
    },
  },
];
