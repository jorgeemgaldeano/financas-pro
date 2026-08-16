// transferMatchService.js — v0.3.33 (Fase 2 — DEC-0034 / RN031)
//
// Auto-detecção (sugerida, nunca automática) de transferência entre contas
// na importação de extrato bancário. RN031 e o modelo criado na Fase 1
// (transferService.js) continuam valendo: uma transferência é sempre duas
// transações ligadas por `transferId`, natureza:"transferencia". Este módulo
// só CALCULA candidatos — a decisão de vincular é sempre do usuário,
// aplicada explicitamente no App (nunca aqui, nunca sozinha).
//
// Heurística (bloco "v0.3.33" do roadmap): uma linha de DÉBITO importada na
// conta de destino do import é candidata a transferência quando existe, em
// OUTRA conta corrente já cadastrada, uma transação de CRÉDITO com o MESMO
// VALOR dentro da janela de `params.duplaEntradaDias` dias — e que ainda não
// é perna de nenhuma transferência (evita re-oferecer o que já foi vinculado
// e evita sugerir a mesma transação para duas linhas).
//
// Padrão do projeto (ver CLAUDE.md): funções PURAS que recebem o estado
// relevante e devolvem dados novos, sem mutar entrada.

import { mKey } from "../utils/dateUtils.js";

const fallbackUid = () =>
  "id_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 11);

const toUTCms = (iso) => {
  const parts = String(iso || "").split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return null;
  const [y, m, d] = parts;
  return Date.UTC(y, m - 1, d);
};

// Exportado para reuso/teste — diferença em dias corridos entre duas datas
// ISO ("YYYY-MM-DD"), sem deslocamento de fuso (compara sempre em UTC meia-noite).
export const daysBetweenDates = (isoA, isoB) => {
  const a = toUTCms(isoA);
  const b = toUTCms(isoB);
  if (a === null || b === null) return Infinity;
  return Math.abs(a - b) / 86400000;
};

const moneyKeyOf = (value) => Math.round((Number(value) || 0) * 100);

// ── Encontrar candidatos de transferência para linhas de DÉBITO importadas ──
// params: { rows, trans, contas, sourceContaId, duplaEntradaDias }
//   rows: linhas da prévia de importação (impRows) — só as com tipo:"despesa"
//         são avaliadas (a perna candidata a virar transferência é sempre a
//         saída; a entrada já deve existir, lançada a partir da outra conta).
//   trans: transações já existentes no vault (App.jsx `trans`).
//   contas: cadastro de contas (App.jsx `contas`).
//   sourceContaId: conta de destino da importação em curso (impContaId) —
//         nunca é candidata a si mesma.
//   duplaEntradaDias: janela em dias (params.duplaEntradaDias).
// retorno: { [row._id]: [ { transactionId, contaId, contaNome, data, valor,
//            descricao, diffDias } ] } — ordenado por menor diferença de dias
//            (e mais recente em empate). Linha sem candidato não entra no mapa.
export function findTransferMatchCandidates({
  rows = [],
  trans = [],
  contas = [],
  sourceContaId,
  duplaEntradaDias = 3,
} = {}) {
  const windowDays = Number(duplaEntradaDias);
  const window = Number.isFinite(windowDays) && windowDays >= 0 ? windowDays : 0;

  const otherCorrenteIds = new Set(
    contas.filter((c) => c.tipo === "corrente" && c.id !== sourceContaId).map((c) => c.id)
  );
  if (!otherCorrenteIds.size) return {};

  // Só transações de crédito, em outra conta corrente, que ainda não são
  // perna de nenhuma transferência — uma vez vinculada, sai do pool.
  const creditPool = trans.filter(
    (t) => t.tipo === "receita" && otherCorrenteIds.has(t.contaId) && t.natureza !== "transferencia"
  );
  if (!creditPool.length) return {};

  const contaNome = (id) => contas.find((c) => c.id === id)?.nome || "";

  const out = {};
  rows.forEach((row) => {
    if (row.tipo !== "despesa" || !row.data) return;
    const rowKey = moneyKeyOf(row.valor);
    if (!rowKey) return;

    const matches = creditPool
      .filter((t) => moneyKeyOf(t.valor) === rowKey)
      .map((t) => ({ t, diffDias: daysBetweenDates(row.data, t.data) }))
      .filter((m) => Number.isFinite(m.diffDias) && m.diffDias <= window)
      .sort((a, b) => a.diffDias - b.diffDias || (b.t.data || "").localeCompare(a.t.data || ""));

    if (matches.length) {
      out[row._id] = matches.map((m) => ({
        transactionId: m.t.id,
        contaId: m.t.contaId,
        contaNome: contaNome(m.t.contaId),
        data: m.t.data,
        valor: m.t.valor,
        descricao: m.t.descricao,
        diffDias: m.diffDias,
      }));
    }
  });

  return out;
}

// ── Vincular uma linha importada de débito a um crédito já existente ────────
// Decisão de design: a transação de CRÉDITO já existente na conta destino é
// CONVERTIDA em perna de transferência (ganha transferId +
// natureza:"transferencia" + transferLinkedFromBatch, para permitir reverter
// no undo do lote) em vez de ser duplicada. Duplicar geraria dois créditos na
// conta destino, o que estaria errado (RN031). Só a perna de SAÍDA é criada
// como registro novo, na conta de origem (a que está sendo importada).
//
// Nunca chamada automaticamente — só a partir de uma confirmação explícita
// do usuário sobre aquela linha específica (ver App.jsx confirmImport).
//
// state: { trans }
// opts:  { existingTransactionId, sourceContaId, valor, data, descricao,
//          importBatchId, importTipo, bancoImportacao, uid }
// retorno: { ok:true, transferId, trans } | { ok:false, reason }
// reasons: existing_not_found | already_linked | same_account
export function linkImportedRowAsTransfer(state, opts) {
  const { trans = [] } = state || {};
  const {
    existingTransactionId,
    sourceContaId,
    valor,
    data,
    descricao,
    importBatchId = null,
    importTipo = "bancario",
    bancoImportacao = null,
  } = opts || {};
  const uid = opts?.uid || fallbackUid;

  const existing = trans.find((t) => t.id === existingTransactionId);
  if (!existing) return { ok: false, reason: "existing_not_found" };
  if (existing.natureza === "transferencia") return { ok: false, reason: "already_linked" };
  if (existing.contaId === sourceContaId) return { ok: false, reason: "same_account" };

  const transferId = uid();
  const valorNum = Number(valor) || 0;
  const competencia = mKey(data);

  const nextTrans = trans.map((t) =>
    t.id === existingTransactionId
      ? { ...t, transferId, natureza: "transferencia", transferLinkedFromBatch: importBatchId }
      : t
  );

  const saida = {
    id: uid(),
    transferId,
    natureza: "transferencia",
    origem: "corrente",
    tipo: "despesa",
    contaId: sourceContaId,
    catId: null,
    descricao: String(descricao || "").trim() || "Transferência entre contas",
    valor: valorNum,
    data,
    competencia,
    fixo: false,
    importado: true,
    importTipo,
    bancoImportacao,
    importBatchId,
    status: "pago",
    valorPago: valorNum,
  };

  return { ok: true, transferId, trans: [...nextTrans, saida] };
}

// ── Reverter conversões de crédito em transferência ligadas a um lote ───────
// Usado por undoImportBatch (App.jsx): a perna de SAÍDA nova já é removida
// pelo filtro normal de `importBatchId` do lote. Mas a perna de CRÉDITO
// convertida pertence (quase sempre) a OUTRO lote, ou é manual — ela não deve
// ser apagada, só voltar a ser um lançamento comum, sem `transferId`,
// `natureza` nem o marcador `transferLinkedFromBatch`.
// entrada: trans, importBatchId  →  retorno: snapshot de trans já revertido
export function revertTransferLinksFromBatch(trans = [], importBatchId) {
  if (!importBatchId) return trans;
  return trans.map((t) => {
    if (t.transferLinkedFromBatch !== importBatchId) return t;
    const { transferId, natureza, transferLinkedFromBatch, ...rest } = t;
    return rest;
  });
}
