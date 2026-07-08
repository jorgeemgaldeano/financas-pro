// Finanças PRO v0.3.26.6
// Serviço de importação de cartão de crédito.
// Centraliza a regra de compra à vista, master lógico de parcelamento e validação de parcelas futuras.
// Usa apenas JavaScript nativo e services internos do projeto.

import { buildImportKey, buildLegacyImportKey } from "./importService.js";
import {
  buildCardInstallmentGroupId,
  buildCardInstallmentMasterCandidateKey,
  buildExistingCardInstallmentIndexes,
  classifyImportedCardInstallmentRow,
  getCardInstallmentAmount,
  getCardInstallmentBaseDescription,
  getCardInstallmentInfo,
  getCardInstallmentPurchaseDate,
  isCardInstallmentAmountEquivalent,
  normalizeCardInstallmentText,
  stripCardInstallmentMarkers,
} from "./cardInstallmentService.js";

function safeText(value) {
  return String(value ?? "").trim();
}

function monthKeyFromDate(value) {
  const text = safeText(value);
  return text.length >= 7 ? text.slice(0, 7) : "";
}

function transactionMonthKey(transaction = {}) {
  return transaction.competencia || transaction.competenceMonth || monthKeyFromDate(transaction.data);
}

function uniqueNonEmpty(values) {
  return [...new Set((values || []).map(value => safeText(value)).filter(Boolean))];
}

function normalizeDuplicateDescription(value) {
  return normalizeCardInstallmentText(value);
}

function duplicateAmount(record = {}) {
  return getCardInstallmentAmount(record).toFixed(2);
}

function getDuplicateDateCandidates(record = {}) {
  return uniqueNonEmpty([
    record.dataCompra,
    record.data,
    record.date,
    record.dt,
  ].map(value => safeText(value).slice(0, 10)));
}

function getDuplicateDescriptionCandidates(record = {}) {
  const base = safeText(record.descricao || record.description || record.memo || record.historico);
  return uniqueNonEmpty([
    normalizeDuplicateDescription(base),
    normalizeDuplicateDescription(stripCardInstallmentMarkers(base)),
    getCardInstallmentBaseDescription(record),
  ]);
}

function buildStrictCardDuplicateKeyCandidates(record = {}, { cartaoId } = {}) {
  const cardId = safeText(cartaoId || record.cartaoId || record.cardId);
  const scope = `cartao:${cardId}`;
  const dates = getDuplicateDateCandidates(record);
  const descriptions = getDuplicateDescriptionCandidates(record);
  const value = duplicateAmount(record);
  const tipo = record.tipo || "despesa";
  const keys = [];

  dates.forEach(date => {
    descriptions.forEach(description => {
      keys.push(`${scope}|${date}|${description}|${value}|${tipo}`);
    });
  });

  return uniqueNonEmpty(keys);
}

function buildCardInstallmentDuplicateKeyCandidates(record = {}, { cartaoId } = {}) {
  const cardId = safeText(cartaoId || record.cartaoId || record.cardId);
  const info = getCardInstallmentInfo(record);
  const masterCandidateKey = buildCardInstallmentMasterCandidateKey(record, { cartaoId: cardId });
  if (!cardId || !info.isInstallment || !masterCandidateKey) return [];

  const value = duplicateAmount(record);
  return [`${masterCandidateKey}|valor:${value}|parcela:${info.parcela}/${info.totalParcelas}`];
}

function buildCardDuplicateKeyCandidates(record = {}, { cartaoId } = {}) {
  const info = getCardInstallmentInfo(record);

  // v0.3.26.4
  // Para compras parceladas, a chave de duplicidade não pode usar apenas
  // cartão + data + descrição base + valor, pois todas as parcelas futuras
  // geradas a partir do mesmo master possuem a mesma data da compra,
  // a mesma descrição base e o mesmo valor.
  // Se a chave estrita for usada nesses casos, as parcelas 2/N, 3/N, ...
  // são marcadas como duplicadas ainda na prévia e não são salvas.
  //
  // Portanto:
  // - compra parcelada: usa chave específica com parcela/total;
  // - compra à vista: mantém regra estrita anterior.
  if (info.isInstallment) {
    return uniqueNonEmpty(buildCardInstallmentDuplicateKeyCandidates(record, { cartaoId }));
  }

  return uniqueNonEmpty(buildStrictCardDuplicateKeyCandidates(record, { cartaoId }));
}

function buildExistingCardImportDuplicateKeys(transactions = [], { cartaoId } = {}) {
  const keys = [];
  const cardId = safeText(cartaoId);

  (transactions || [])
    .filter(item => item && safeText(item.cartaoId) === cardId)
    .forEach(item => {
      keys.push(...buildCardDuplicateKeyCandidates({ ...item, importTipo: "cartao" }, { cartaoId: cardId }));
    });

  return new Set(keys);
}

function buildPreviewInstallmentSignature(row = {}, { cartaoId } = {}) {
  const info = getCardInstallmentInfo(row);
  const masterCandidateKey = buildCardInstallmentMasterCandidateKey(row, { cartaoId });
  if (!info.isInstallment || !masterCandidateKey) return null;
  return {
    id: row._id,
    masterCandidateKey,
    amount: getCardInstallmentAmount(row),
    parcela: info.parcela,
    totalParcelas: info.totalParcelas,
  };
}

function hasEquivalentPreviewInstallment(row = {}, signatures = [], { cartaoId } = {}) {
  const current = buildPreviewInstallmentSignature(row, { cartaoId });
  if (!current) return false;
  return signatures.some(prev => (
    prev.masterCandidateKey === current.masterCandidateKey
    && Number(prev.parcela) === Number(current.parcela)
    && Number(prev.totalParcelas) === Number(current.totalParcelas)
    && isCardInstallmentAmountEquivalent(prev.amount, current.amount)
  ));
}

// v0.3.30.0
// Créditos de OFX de cartão (TRNTYPE=CREDIT, tipo:"receita") podem representar
// coisas bem diferentes: pagamento da fatura anterior, crédito de reparcelamento
// de compra à vista, ou estorno. Cada caso afeta uma fatura/competência diferente,
// então exigimos classificação manual antes de liberar a linha para importação.
export const CARD_CREDIT_TYPES = {
  PAGAMENTO_FATURA_ANTERIOR: "pagamento_fatura_anterior",
  PARCELAMENTO_AVISTA: "parcelamento_avista",
  ESTORNO: "estorno",
};

const CARD_CREDIT_TYPES_WITH_TARGET_COMPETENCE = [
  CARD_CREDIT_TYPES.PARCELAMENTO_AVISTA,
  CARD_CREDIT_TYPES.ESTORNO,
];

// v0.3.32.1 — Sugere o tipo do crédito pelo texto do lançamento (memos do BB
// são reconhecíveis). É apenas uma PRÉ-sugestão: o usuário revê e pode trocar
// na prévia. A ordem importa — "DEVOLUCAO JUROS PAGAMENTO TITULO" contém
// "PAGAMENTO", então o teste de devolução/estorno vem antes do de pagamento.
export function suggestCardCreditType(descricao = "") {
  const s = String(descricao || "").toLowerCase();
  if (/devolu|estorn/.test(s)) return CARD_CREDIT_TYPES.ESTORNO;
  if (/#pcv|parc\.?\s*comp\.?\s*vist|reparcel/.test(s)) return CARD_CREDIT_TYPES.PARCELAMENTO_AVISTA;
  if (/\bpgto\b|\bpagto\b|pagamento\s+de?\s*fatura|pgto\.?\s*cash/.test(s)) return CARD_CREDIT_TYPES.PAGAMENTO_FATURA_ANTERIOR;
  return null;
}

export function isCardCreditRow(row = {}) {
  return row.tipo === "receita";
}

export function isCardCreditRowBlocked(row = {}) {
  if (!isCardCreditRow(row)) return false;
  if (!row.creditoTipo) return true;
  if (CARD_CREDIT_TYPES_WITH_TARGET_COMPETENCE.includes(row.creditoTipo) && !row.creditoCompetencia) return true;
  return false;
}

// Créditos classificados como "pagamento da fatura anterior" NÃO viram
// lançamento: o pagamento já é registrado na conta corrente, e importá-lo no
// cartão abateria a fatura em dobro. `confirmImport` os descarta. Este helper
// centraliza a regra para que a prévia (Total selecionado / contador) e a
// importação efetiva concordem, sem drift.
export function isCardCreditDiscardedOnImport(row = {}) {
  return isCardCreditRow(row) && row.creditoTipo === CARD_CREDIT_TYPES.PAGAMENTO_FATURA_ANTERIOR;
}

export function resolveCardCreditCompetencia(row = {}, impCompetencia = null) {
  if (!isCardCreditRow(row)) return row.competencia || impCompetencia;
  if (CARD_CREDIT_TYPES_WITH_TARGET_COMPETENCE.includes(row.creditoTipo)) return row.creditoCompetencia || null;
  return row.competencia || impCompetencia;
}

export function classifyImportedCardCreditRows(rows = [], { defaultCompetencia = null } = {}) {
  return (rows || []).map(row => {
    if (!isCardCreditRow(row)) return row;
    // Pré-sugere o tipo pelo memo (editável na prévia) e, para os tipos que
    // dependem de competência de destino, adota a competência da importação
    // por padrão — o crédito aparece nessa fatura, então abate-a por padrão.
    const creditoTipo = row.creditoTipo || suggestCardCreditType(row.descricao);
    const needsTarget = CARD_CREDIT_TYPES_WITH_TARGET_COMPETENCE.includes(creditoTipo);
    const creditoCompetencia = row.creditoCompetencia || (needsTarget ? defaultCompetencia : null);
    const next = {
      ...row,
      creditoTipo: creditoTipo || null,
      creditoCompetencia: creditoCompetencia || null,
      _cardCreditSuggested: !row.creditoTipo && Boolean(creditoTipo),
    };
    next._cardCreditNeedsReview = isCardCreditRowBlocked(next);
    return next;
  });
}

export function prepareCardImportRows(rows = [], { transactions = [], cartaoId, defaultCompetencia = null } = {}) {
  const installmentIndexes = buildExistingCardInstallmentIndexes(transactions, { cartaoId });

  const prepared = (rows || []).map(row => {
    const dataCompra = getCardInstallmentPurchaseDate(row);
    const classification = classifyImportedCardInstallmentRow(row, { cartaoId, existingIndexes: installmentIndexes });
    const isInstallment = classification.isInstallment || Boolean(row.parcelado);

    return {
      ...row,
      dataCompra: row.dataCompra || dataCompra || row.data || null,
      parcelado: isInstallment,
      parcela: row.parcela || classification.parcela || null,
      totalParcelas: row.totalParcelas || classification.totalParcelas || null,
      parcelaGrupo: row.parcelaGrupo || classification.parcelaGrupo || (isInstallment ? buildCardInstallmentGroupId(row, { cartaoId }) : null),
      descricaoBaseParcelamento: row.descricaoBaseParcelamento || classification.descricaoBase || null,
      _cardInstallmentStatus: classification.status,
      _cardInstallmentShouldSkip: Boolean(classification.shouldSkip),
      _cardInstallmentReason: classification.reason || "",
      _cardInstallmentCanCorrectSequence: Boolean(classification.canCorrectSequence),
      _cardInstallmentCorrection: classification.correction || null,
      _cardInstallmentMatchedGroupId: classification.matchedParcelaGrupo || null,
      _cardInstallmentMatchedCompetence: classification.matchedCompetencia || null,
    };
  });

  return classifyImportedCardCreditRows(prepared, { defaultCompetencia });
}

export function splitCardRowsForExpansion(rows = []) {
  const expandable = [];
  const blocked = [];

  (rows || []).forEach(row => {
    if (row?._cardInstallmentShouldSkip) blocked.push(row);
    else expandable.push(row);
  });

  return { expandable, blocked };
}

export function buildCardImportDuplicateSet(rows = [], { transactions = [], cartaoId } = {}) {
  const cardId = safeText(cartaoId);
  const exactKeys = new Set(
    (transactions || [])
      .filter(item => item && safeText(item.cartaoId) === cardId)
      .map(item => buildImportKey({ ...item, importTipo: "cartao" }, item.cartaoId, transactionMonthKey(item), "cartao"))
  );
  const legacyKeys = new Set(
    (transactions || [])
      .filter(item => item && safeText(item.cartaoId) === cardId)
      .map(item => buildLegacyImportKey({ ...item, importTipo: "cartao" }, item.cartaoId, "cartao"))
  );
  const strictKeys = buildExistingCardImportDuplicateKeys(transactions, { cartaoId: cardId });
  const seenExact = new Set();
  const seenStrict = new Set();
  const seenInstallments = [];
  const duplicateIds = new Set();

  (rows || []).forEach(row => {
    const exact = buildImportKey(row);
    const legacy = buildLegacyImportKey(row);
    const strictCandidates = buildCardDuplicateKeyCandidates(row, { cartaoId: cardId });
    const hasStrictDuplicate = strictCandidates.some(key => strictKeys.has(key) || seenStrict.has(key));
    const hasPreviewInstallmentDuplicate = hasEquivalentPreviewInstallment(row, seenInstallments, { cartaoId: cardId });

    if (row._cardInstallmentShouldSkip || exactKeys.has(exact) || legacyKeys.has(legacy) || hasStrictDuplicate || seenExact.has(exact) || hasPreviewInstallmentDuplicate) {
      duplicateIds.add(row._id);
    }

    seenExact.add(exact);
    strictCandidates.forEach(key => seenStrict.add(key));
    const signature = buildPreviewInstallmentSignature(row, { cartaoId: cardId });
    if (signature) seenInstallments.push(signature);
  });

  return duplicateIds;
}

export function revalidateSelectedCardImportRows(selectedRows = [], { transactions = [], cartaoId, initialDuplicateIds } = {}) {
  const duplicateIds = new Set(initialDuplicateIds || []);
  const existingKeys = buildExistingCardImportDuplicateKeys(transactions, { cartaoId });
  const installmentIndexes = buildExistingCardInstallmentIndexes(transactions, { cartaoId });
  const seenStrict = new Set();
  const seenInstallments = [];

  (selectedRows || []).forEach(row => {
    const classification = classifyImportedCardInstallmentRow(row, { cartaoId, existingIndexes: installmentIndexes });
    const strictCandidates = buildCardDuplicateKeyCandidates(row, { cartaoId });
    const hasDuplicate = strictCandidates.some(key => existingKeys.has(key) || seenStrict.has(key));
    const hasPreviewInstallmentDuplicate = hasEquivalentPreviewInstallment(row, seenInstallments, { cartaoId });

    if (classification.shouldSkip || hasDuplicate || hasPreviewInstallmentDuplicate) duplicateIds.add(row._id);
    strictCandidates.forEach(key => seenStrict.add(key));
    const signature = buildPreviewInstallmentSignature(row, { cartaoId });
    if (signature) seenInstallments.push(signature);
  });

  return duplicateIds;
}
