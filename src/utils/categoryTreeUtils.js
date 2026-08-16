// categoryTreeUtils.js — v0.3.37 Fase 4 (DEC-0038)
// Extraído de App.jsx: funções puras de navegação na árvore de categorias
// (cats/subs aninhados). Usadas por múltiplas abas — extraídas antes das
// abas em si para não duplicar em cada organism novo.

export function flattenCats(cats, depth = 0, parentId = null, parentPath = "") {
  const rows = [];
  for (const cat of cats) {
    const path = parentPath ? `${parentPath} › ${cat.nome}` : cat.nome;
    rows.push({ id: cat.id, nome: cat.nome, cor: cat.cor || null, icon: cat.icon || null, depth, parentId, path, hasSubs: !!(cat.subs?.length) });
    if (cat.subs?.length) rows.push(...flattenCats(cat.subs, depth + 1, cat.id, path));
  }
  return rows;
}

export function findCat(cats, id) {
  for (const c of cats) {
    if (c.id === id) return c;
    if (c.subs?.length) {
      const r = findCat(c.subs, id);
      if (r) return r;
    }
  }
  return null;
}

export function findRootCat(cats, id) {
  for (const c of cats) {
    if (c.id === id) return c;
    if (c.subs?.length && findCat(c.subs, id)) return c;
  }
  return null;
}

export function catColor(cats, id) { return findRootCat(cats, id)?.cor || "#B0BEC5"; }
export function catIcon(cats, id) { return findRootCat(cats, id)?.icon || "📦"; }
export function catLabel(cats, id) { return flattenCats(cats).find(f => f.id === id)?.path || id; }

export function collectCatAndDescendantIds(cats, id) {
  const ids = new Set();
  const collect = (list) => {
    for (const c of list) {
      if (c.id === id) {
        const addAll = (node) => { ids.add(node.id); (node.subs || []).forEach(addAll); };
        addAll(c);
      } else if (c.subs?.length) {
        collect(c.subs);
      }
    }
  };
  collect(cats);
  return ids;
}
