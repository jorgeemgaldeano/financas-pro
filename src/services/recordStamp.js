// recordStamp.js — v0.3.38 Fase 1 (DEC-0039, DEC-0041)
//
// Carimba `updatedAt` e `updatedBy` nos registros que realmente mudaram, na
// fronteira de persistência (`useLS`), e não em cada chamada de setter.
//
// Por que na fronteira: o `App.jsx` tem dezenas de pontos que escrevem estado.
// Carimbar em cada um deles seria esquecer um, e o esquecido só apareceria na
// Fase 4, como conflito que o merge não sabe resolver. Aqui existe o par
// (anterior, próximo) que o React entrega ao setter funcional, que é
// exatamente o que se precisa para saber o que mudou.
//
// Regra única: **objeto com `id` dentro de um array é registro** e recebe
// carimbo quando é novo ou quando algum campo seu mudou. Vale em qualquer
// profundidade, então `cats[].subs[]`, `dividas[].amortizacoes[]`,
// `cofrinhos[].aportes[]` e `params.autoCategoryRules[]` entram pela mesma
// regra, sem lista de exceções para manter.
//
// O que NÃO recebe carimbo, e é limitação consciente desta fase:
// `metas` (mapa catId → limite), `saldosIniciais` (mapa mês → conta → valor) e
// os campos escalares de `params`. Não são registros, não têm identidade
// própria e não haveria onde pendurar o carimbo sem inventar estrutura. O
// merge de três vias da Fase 4 trata esses casos comparando valor, não data.

// Exportado para o merge de três vias da Fase 4 (mergeService.js) ignorar os
// mesmos campos ao decidir se um registro mudou de verdade — evitar duplicar
// esta lista em dois arquivos.
export const CAMPOS_DE_CARIMBO = ["updatedAt", "updatedBy"];

// Identificação do dispositivo/pessoa que está escrevendo. Vive em módulo
// porque a fronteira de persistência não tem acesso ao estado do React. O
// `App.jsx` mantém isto sincronizado com a chave `usuario` do LocalStorage.
let usuarioAtual = "";

export function setStampUser(usuario) {
  usuarioAtual = typeof usuario === "string" ? usuario.trim() : "";
  return usuarioAtual;
}

export function getStampUser() {
  return usuarioAtual;
}

function ehObjeto(valor) {
  return valor !== null && typeof valor === "object" && !Array.isArray(valor);
}

function ehRegistro(valor) {
  if (!ehObjeto(valor)) return false;
  const { id } = valor;
  return (typeof id === "string" && id !== "") || typeof id === "number";
}

function semCarimbo(chave) {
  return !CAMPOS_DE_CARIMBO.includes(chave);
}

// Compara ignorando os próprios campos de carimbo — senão um registro
// carimbado seria sempre "diferente" do anterior e o carimbo se auto-alimentaria.
// A comparação é profunda porque os aninhados são recriados a cada escrita
// imutável: comparar por referência marcaria tudo como alterado.
export function equalIgnoringStamp(a, b) {
  if (a === b) return true;

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    return a.every((item, i) => equalIgnoringStamp(item, b[i]));
  }

  if (ehObjeto(a) && ehObjeto(b)) {
    const chavesA = Object.keys(a).filter(semCarimbo);
    const chavesB = Object.keys(b).filter(semCarimbo);
    if (chavesA.length !== chavesB.length) return false;
    return chavesA.every(chave => (
      Object.prototype.hasOwnProperty.call(b, chave) && equalIgnoringStamp(a[chave], b[chave])
    ));
  }

  return Object.is(a, b);
}

function percorrer(proximo, anterior, ctx) {
  if (Array.isArray(proximo)) {
    const anterioresPorId = new Map();
    if (Array.isArray(anterior)) {
      anterior.forEach(item => { if (ehRegistro(item)) anterioresPorId.set(item.id, item); });
    }

    let mudou = false;
    const saida = proximo.map((item, indice) => {
      if (!ehObjeto(item)) return item;

      const par = ehRegistro(item)
        ? anterioresPorId.get(item.id)
        : (Array.isArray(anterior) ? anterior[indice] : undefined);

      const filho = percorrer(item, par, ctx);
      if (filho !== item) mudou = true;

      // Registro sem identidade não é carimbável: só propaga o que veio dos
      // aninhados dele.
      if (!ehRegistro(item)) return filho;

      // Registro pré-existente e igual ao que estava: nada a carimbar.
      if (par && equalIgnoringStamp(filho, par)) return filho;

      mudou = true;
      return { ...filho, updatedAt: ctx.agora, updatedBy: ctx.usuario };
    });

    return mudou ? saida : proximo;
  }

  if (ehObjeto(proximo)) {
    let mudou = false;
    const saida = {};
    for (const [chave, valor] of Object.entries(proximo)) {
      const filho = percorrer(valor, ehObjeto(anterior) ? anterior[chave] : undefined, ctx);
      if (filho !== valor) mudou = true;
      saida[chave] = filho;
    }
    return mudou ? saida : proximo;
  }

  return proximo;
}

// Devolve `proximo` com os registros novos/alterados carimbados. Quando nada
// mudou, devolve **a mesma referência** de `proximo` — o React e os `useMemo`
// do App dependem disso para não recalcular à toa.
export function stampChangedRecords(proximo, anterior, opcoes = {}) {
  const ctx = {
    agora: opcoes.now || new Date().toISOString(),
    usuario: opcoes.usuario !== undefined ? opcoes.usuario : usuarioAtual,
  };
  return percorrer(proximo, anterior, ctx);
}
