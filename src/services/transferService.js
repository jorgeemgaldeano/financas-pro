// transferService.js — v0.3.33
//
// Transferência entre contas como operação PURA e ATÔMICA.
//
// Uma transferência = DUAS transações ligadas por um `transferId` comum, ambas
// com `natureza:"transferencia"`:
//   - SAÍDA  (tipo "despesa") na conta de origem;
//   - ENTRADA (tipo "receita") na conta de destino.
//
// Semântica contábil (v0.3.33): movimento NULO para o household — não conta como
// receita nem despesa nas agregações de Dashboard/Projeções/relatórios (ver
// `accountingService.isMovimentoContabil`, que exclui `natureza:"transferencia"`).
// Já para o SALDO POR CONTA as duas pernas são reais: entram em
// `movimentoContaMes` (que filtra só `origem !== "cartao"`), movimentando de fato
// cada conta.
//
// Padrão snapshot completo (igual a `cardInvoiceOperations.js`): cada função
// recebe o estado atual ({ trans, contas }) e devolve o estado COMPLETO
// resultante ({ ok, reason?, trans }), para o wrapper React aplicar o setState
// de uma vez só — sem commit parcial. As decisões de UI (confirmar, alertar)
// não vivem aqui: sinalizamos via `reason` e o wrapper decide.
//
// Aditivo ao modelo: os campos novos (`transferId`, `natureza:"transferencia"`,
// `transferContraContaId`) só aparecem em transações de transferência. Dados
// antigos não os têm e continuam sendo tratados como movimento contábil normal
// (default seguro por ausência — RN002). NÃO há nova chave de LocalStorage nem
// bump de `LS_VERSION`.

import { normalizeTransaction } from "./transactionNormalizer.js";

const nowIso = () => new Date().toISOString();
const mKeyOf = (data) => String(data || "").slice(0, 7);

// Gerador de id de fallback caso o wrapper não injete um (testes).
let _seq = 0;
function fallbackId(prefix) {
  _seq += 1;
  return `${prefix}_${Date.now().toString(36)}_${_seq}`;
}

/**
 * Cria uma transferência (par atômico) e devolve o snapshot completo de `trans`.
 * @param {{trans:Array, contas:Array}} state estado atual
 * @param {{contaOrigemId:string, contaDestinoId:string, valor:number, data:string, descricao?:string}} input
 * @param {{genId?:(prefix:string)=>string}} [options]
 * @returns {{ok:boolean, reason?:string, transferId?:string, trans:Array}}
 */
export function createTransfer(state, input, options = {}) {
  const trans = Array.isArray(state?.trans) ? state.trans : [];
  const contas = Array.isArray(state?.contas) ? state.contas : [];
  const genId = typeof options.genId === "function" ? options.genId : fallbackId;

  const contaOrigemId = input?.contaOrigemId;
  const contaDestinoId = input?.contaDestinoId;
  const valor = Number(input?.valor);
  const data = input?.data;
  const descricao = String(input?.descricao || "").trim();

  if (!contaOrigemId || !contaDestinoId) {
    return { ok: false, reason: "contas_obrigatorias", trans };
  }
  if (contaOrigemId === contaDestinoId) {
    return { ok: false, reason: "contas_iguais", trans };
  }
  if (!Number.isFinite(valor) || valor <= 0) {
    return { ok: false, reason: "valor_invalido", trans };
  }
  if (!data) {
    return { ok: false, reason: "data_obrigatoria", trans };
  }
  const contaOrigem = contas.find((c) => c.id === contaOrigemId);
  const contaDestino = contas.find((c) => c.id === contaDestinoId);
  if (!contaOrigem || !contaDestino) {
    return { ok: false, reason: "conta_inexistente", trans };
  }

  const transferId = genId("tf");
  const base = {
    natureza: "transferencia",
    transferOrigin: "manual",
    transferId,
    cartaoId: null,
    catId: null,
    valor,
    data,
    competencia: mKeyOf(data),
    fixo: false,
    status: "pago",
    valorPago: valor,
    createdAt: nowIso(),
  };

  const saida = normalizeTransaction({
    ...base,
    id: genId("t"),
    tipo: "despesa",
    origem: contaOrigem.tipo || "corrente",
    contaId: contaOrigemId,
    transferContraContaId: contaDestinoId,
    descricao: descricao || `Transferência para ${contaDestino.nome || "conta"}`,
  });

  const entrada = normalizeTransaction({
    ...base,
    id: genId("t"),
    tipo: "receita",
    origem: contaDestino.tipo || "corrente",
    contaId: contaDestinoId,
    transferContraContaId: contaOrigemId,
    descricao: descricao || `Transferência de ${contaOrigem.nome || "conta"}`,
  });

  return { ok: true, transferId, trans: [...trans, saida, entrada] };
}

// ── Vínculo de lançamentos JÁ EXISTENTES como transferência ─────────────────
//
// Diferente de createTransfer (que cria duas transações novas), aqui o usuário
// seleciona dois lançamentos já gravados — uma despesa numa conta e uma receita
// noutra — e os associa. As transações originais são PRESERVADAS (data,
// descrição, valor); só ganham os campos de transferência. O undo correto é
// DESVINCULAR (unlinkTransfer), não apagar — por isso a origem é marcada como
// "vinculo" (createTransfer marca "manual").

/**
 * Um lançamento pode ser perna de uma transferência (por vínculo)?
 * Exclui cartão, pagamento/ajuste de fatura, parcelas e o que já é transferência.
 */
export function isTransferEligible(t) {
  if (!t) return false;
  if (t.transferId || t.natureza === "transferencia") return false;
  if (t.natureza === "fatura_cartao" || t.natureza === "ajuste_fatura_cartao") return false;
  if (t.origem === "cartao") return false;
  if (t.totalParcelas > 1) return false;
  return t.tipo === "receita" || t.tipo === "despesa";
}

/**
 * Candidatos elegíveis para associar a `legId` como contraparte:
 * tipo oposto, conta diferente e MESMO valor (decisão: movimento nulo).
 */
export function findTransferCandidates(trans, legId) {
  const list = Array.isArray(trans) ? trans : [];
  const leg = list.find((t) => t.id === legId);
  if (!leg || !isTransferEligible(leg)) return [];
  const alvoTipo = leg.tipo === "despesa" ? "receita" : "despesa";
  const valor = Number(leg.valor);
  return list.filter(
    (t) =>
      t.id !== legId &&
      t.tipo === alvoTipo &&
      isTransferEligible(t) &&
      t.contaId !== leg.contaId &&
      Number(t.valor) === valor
  );
}

/**
 * Associa dois lançamentos existentes (uma despesa + uma receita) como
 * transferência. Exige valor igual (> 0) e contas diferentes.
 * @returns {{ok:boolean, reason?:string, transferId?:string, trans:Array}}
 */
export function linkAsTransfer(state, input, options = {}) {
  const trans = Array.isArray(state?.trans) ? state.trans : [];
  const genId = typeof options.genId === "function" ? options.genId : fallbackId;
  const despesaId = input?.despesaId;
  const receitaId = input?.receitaId;

  if (!despesaId || !receitaId) return { ok: false, reason: "lancamentos_obrigatorios", trans };
  if (despesaId === receitaId) return { ok: false, reason: "mesmo_lancamento", trans };

  const despesa = trans.find((t) => t.id === despesaId);
  const receita = trans.find((t) => t.id === receitaId);
  if (!despesa || !receita) return { ok: false, reason: "lancamento_inexistente", trans };
  if (despesa.tipo !== "despesa" || receita.tipo !== "receita") {
    return { ok: false, reason: "tipos_invalidos", trans };
  }
  if (!isTransferEligible(despesa) || !isTransferEligible(receita)) {
    return { ok: false, reason: "lancamento_nao_elegivel", trans };
  }
  if (despesa.contaId === receita.contaId) return { ok: false, reason: "mesma_conta", trans };

  const vD = Number(despesa.valor);
  const vR = Number(receita.valor);
  if (!Number.isFinite(vD) || vD <= 0 || vD !== vR) {
    return { ok: false, reason: "valores_diferentes", trans };
  }

  const transferId = genId("tf");
  const patched = trans.map((t) => {
    if (t.id === despesaId) {
      return normalizeTransaction({ ...t, natureza: "transferencia", transferOrigin: "vinculo", transferId, transferContraContaId: receita.contaId });
    }
    if (t.id === receitaId) {
      return normalizeTransaction({ ...t, natureza: "transferencia", transferOrigin: "vinculo", transferId, transferContraContaId: despesa.contaId });
    }
    return t;
  });
  return { ok: true, transferId, trans: patched };
}

const diffDias = (a, b) => {
  const da = new Date(a).getTime();
  const db = new Date(b).getTime();
  if (!Number.isFinite(da) || !Number.isFinite(db)) return Infinity;
  return Math.abs(da - db) / 86400000;
};

/**
 * Detecta pares candidatos a transferência entre lançamentos recém-importados e
 * lançamentos JÁ existentes: débito numa conta que casa com crédito em outra
 * (tipo oposto, conta diferente, MESMO valor, dentro da janela de dias).
 *
 * Reusa a mesma regra do vínculo manual. NÃO vincula nada — só devolve os pares
 * para a UI confirmar (RN: não vincular automaticamente).
 *
 * @param {Array} trans estado completo já incluindo os importados
 * @param {Array<string>} novosIds ids dos lançamentos recém-importados
 * @param {{janelaDias?:number}} [options] janela de proximidade (default 3)
 * @returns {Array<{importadaId:string, existenteId:string, despesaId:string, receitaId:string, valor:number, dias:number}>}
 */
export function detectTransferCandidates(trans, novosIds, options = {}) {
  const list = Array.isArray(trans) ? trans : [];
  const novoSet = new Set(novosIds || []);
  const janela = Number(options.janelaDias);
  const maxDias = Number.isFinite(janela) && janela >= 0 ? janela : 3;

  const novos = list.filter((t) => novoSet.has(t.id) && isTransferEligible(t));
  const existentes = list.filter((t) => !novoSet.has(t.id) && isTransferEligible(t));
  const usados = new Set();
  const pares = [];

  for (const novo of novos) {
    const alvoTipo = novo.tipo === "despesa" ? "receita" : "despesa";
    const valor = Number(novo.valor);
    const match = existentes
      .filter(
        (e) =>
          !usados.has(e.id) &&
          e.tipo === alvoTipo &&
          e.contaId !== novo.contaId &&
          Number(e.valor) === valor &&
          diffDias(e.data, novo.data) <= maxDias
      )
      .sort((a, b) => diffDias(a.data, novo.data) - diffDias(b.data, novo.data))[0];
    if (match) {
      usados.add(match.id);
      pares.push({
        importadaId: novo.id,
        existenteId: match.id,
        despesaId: novo.tipo === "despesa" ? novo.id : match.id,
        receitaId: novo.tipo === "receita" ? novo.id : match.id,
        valor,
        dias: diffDias(match.data, novo.data),
      });
    }
  }
  return pares;
}

/**
 * Desvincula uma transferência formada por VÍNCULO: remove os campos de
 * transferência das duas pernas, devolvendo-as a lançamentos normais (não apaga).
 * @returns {{ok:boolean, reason?:string, desassociadas?:number, trans:Array}}
 */
export function unlinkTransfer(state, transferId) {
  const trans = Array.isArray(state?.trans) ? state.trans : [];
  if (!transferId) return { ok: false, reason: "transferId_obrigatorio", trans };
  let desassociadas = 0;
  const patched = trans.map((t) => {
    if (t.transferId !== transferId) return t;
    desassociadas += 1;
    const { natureza, transferId: _tid, transferContraContaId, transferOrigin, ...rest } = t;
    return rest;
  });
  if (desassociadas === 0) return { ok: false, reason: "transferencia_inexistente", trans };
  return { ok: true, desassociadas, trans: patched };
}

/**
 * Remove uma transferência tratando as DUAS pernas como uma unidade.
 * @param {{trans:Array}} state
 * @param {string} transferId
 * @returns {{ok:boolean, reason?:string, removidas?:number, trans:Array}}
 */
export function removeTransfer(state, transferId) {
  const trans = Array.isArray(state?.trans) ? state.trans : [];
  if (!transferId) return { ok: false, reason: "transferId_obrigatorio", trans };
  const restantes = trans.filter((t) => t.transferId !== transferId);
  const removidas = trans.length - restantes.length;
  if (removidas === 0) {
    return { ok: false, reason: "transferencia_inexistente", trans };
  }
  return { ok: true, removidas, trans: restantes };
}

/** Retorna as pernas de uma transferência. */
export function getTransferLegs(trans, transferId) {
  return (Array.isArray(trans) ? trans : []).filter((t) => t.transferId === transferId);
}
