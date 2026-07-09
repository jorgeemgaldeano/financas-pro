// accountingService.js — v0.3.33
//
// Ponto ÚNICO de agregação contábil de receitas e despesas.
//
// Motivação (v0.3.33 — Transferências entre contas): uma transferência entre
// contas cadastradas é movimento nulo (sai de uma, entra na outra) e NÃO pode
// contar como receita nem como despesa nas agregações de Dashboard, Projeções e
// relatórios. Ela é modelada como duas transações ligadas por `transferId`,
// ambas com `natureza:"transferencia"`.
//
// Em vez de espalhar `natureza !== "transferencia"` pelos ~40 pontos de filtro
// `tipo === "receita"/"despesa"` do App.jsx, a exclusão vive AQUI. Todo somatório
// de receita/despesa deve passar por estas funções (ou pelos predicados
// `isReceitaContabil`/`isDespesaContabil`).
//
// IMPORTANTE: o SALDO POR CONTA continua incluindo as duas pernas da
// transferência (elas movimentam de fato as contas). Este serviço trata apenas
// da dimensão RECEITA vs. DESPESA — não do saldo por conta.
//
// Enquanto não existirem transações com `natureza:"transferencia"` no dado, estas
// funções são um no-op em relação ao comportamento anterior (caracterização).

/**
 * Um lançamento conta como movimento contábil de receita/despesa?
 * Hoje a única exclusão é a transferência entre contas.
 * @param {object} t transação
 * @returns {boolean}
 */
export function isMovimentoContabil(t) {
  if (!t) return false;
  return t.natureza !== "transferencia";
}

/** É receita que conta nas agregações (exclui transferência). */
export function isReceitaContabil(t) {
  return !!t && t.tipo === "receita" && isMovimentoContabil(t);
}

/** É despesa que conta nas agregações (exclui transferência). */
export function isDespesaContabil(t) {
  return !!t && t.tipo === "despesa" && isMovimentoContabil(t);
}

const valorPadrao = (t) => Number(t?.valor) || 0;

/**
 * Soma as receitas contábeis de uma lista.
 * @param {Array} lista transações
 * @param {(t:object)=>number} [getValor] extrator do valor (default: t.valor).
 *   Passe `valorRealizado` quando quiser somar apenas o realizado.
 * @returns {number}
 */
export function somaReceitas(lista, getValor = valorPadrao) {
  return (lista || [])
    .filter(isReceitaContabil)
    .reduce((s, t) => s + (Number(getValor(t)) || 0), 0);
}

/**
 * Soma as despesas contábeis de uma lista.
 * @param {Array} lista transações
 * @param {(t:object)=>number} [getValor] extrator do valor (default: t.valor).
 * @returns {number}
 */
export function somaDespesas(lista, getValor = valorPadrao) {
  return (lista || [])
    .filter(isDespesaContabil)
    .reduce((s, t) => s + (Number(getValor(t)) || 0), 0);
}
