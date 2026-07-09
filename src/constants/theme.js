// theme.js — paleta de cores única do app (tema escuro).
// Fonte de verdade dos tokens de cor — App.jsx e os componentes que hoje
// duplicavam esses valores como fallback devem importar daqui, nunca
// hardcodar hex de novo (evita drift quando a paleta mudar).
export const THEME = {
  navy: "#16283F",
  surface: "#22385A",
  border: "#35507A",
  emerald: "#12B886",
  coral: "#EF5D55",
  gold: "#F5B700",
  muted: "#5A7699",
  text: "#F0F4FA",
  soft: "#A6C0DA",
};
