// tokens.js — v0.3.37 Fase 1 (DEC-0038)
//
// Fonte única da paleta de cores do app. Antes desta extração, `C` vivia
// só em `App.jsx`, e cada componente extraído (`Toast`, `ConfirmDialog`,
// `RequiredFieldModal`, `CashFlowChart`) tinha sua própria cópia hardcoded
// em `DEFAULT_COLORS`/fallbacks — risco real de drift se a paleta mudasse
// num lugar e não no outro. Qualquer novo componente deve importar `C`
// daqui, nunca redeclarar as cores.

export const C = {
  navy: "#0F1E36",
  surface: "#162640",
  border: "#1E3050",
  emerald: "#00A878",
  coral: "#E8504A",
  gold: "#F5B700",
  muted: "#4A6380",
  text: "#E8EDF4",
  soft: "#8FA8C0",
};

export default C;
