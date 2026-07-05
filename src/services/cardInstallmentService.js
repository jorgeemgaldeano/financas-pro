// Finanças PRO v0.3.26.6
// Serviço isolado para identificação lógica 1:N de compras parceladas em cartão.
// Regra principal: cartão + descrição base + data da compra + valor da parcela com tolerância de R$ 0,05.
// Regra complementar v0.3.26.4: quando o emissor muda a data/descrição entre faturas,
// validar também parcela futura já criada por competência + parcela/total + valor aproximado + descrição compatível, e apontar divergência corrigível quando a administradora do cartão pular/repetir parcelas.
// Não altera LocalStorage; apenas normaliza dados em runtime para impedir duplicidades.

export const CARD_INSTALLMENT_AMOUNT_TOLERANCE = 0.05;

function safeText(value) {
  return String(value ?? "").trim();
}

function roundMoney(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.round(number * 100) / 100;
}

function absoluteMoney(value) {
  return Math.abs(roundMoney(value));
}

function normalizeDate(value) {
  const text = safeText(value);
  return text.length >= 10 ? text.slice(0, 10) : text;
}

function monthKeyFromDate(value) {
  const text = normalizeDate(value);
  return text.length >= 7 ? text.slice(0, 7) : "";
}

function getCompetenceMonth(record = {}) {
  return safeText(record.competencia || record.competenceMonth || record.faturaCompetencia || record.invoiceCompetence || monthKeyFromDate(record.data));
}

function amountDiff(a, b) {
  return Math.abs(roundMoney(absoluteMoney(a) - absoluteMoney(b)));
}

export function isCardInstallmentAmountEquivalent(a, b, tolerance = CARD_INSTALLMENT_AMOUNT_TOLERANCE) {
  return amountDiff(a, b) <= roundMoney(tolerance);
}

export function normalizeCardInstallmentText(value) {
  return safeText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function stripCardInstallmentMarkers(value) {
  return safeText(value)
    .replace(/\bparc(?:ela)?\s*\d{1,2}\s*(?:de|\/)\s*\d{1,2}\b/gi, " ")
    .replace(/\bparc\.\s*\d{1,2}\s*(?:de|\/)\s*\d{1,2}\b/gi, " ")
    .replace(/\b\d{1,2}\s*\/\s*\d{1,2}\b/g, " ")
    .replace(/\b\d{1,2}\s+de\s+\d{1,2}\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const DESCRIPTION_NOISE_TOKENS = new Set([
  "pcv", "parc", "parcela", "parcelado", "compra", "credito", "cartao", "card",
  "sao", "paulo", "paubr", "br", "bra", "brasil", "h", "m", "ltda", "sa", "s", "a",
]);

function getComparableDescriptionTokens(value) {
  return normalizeCardInstallmentText(stripCardInstallmentMarkers(value))
    .split(" ")
    .map(token => token.trim())
    .filter(token => token && token.length >= 3 && !DESCRIPTION_NOISE_TOKENS.has(token));
}

function hasCompatibleDescription(a, b) {
  const aText = normalizeCardInstallmentText(a);
  const bText = normalizeCardInstallmentText(b);
  if (!aText || !bText) return false;
  if (aText === bText || aText.includes(bText) || bText.includes(aText)) return true;

  const aTokens = getComparableDescriptionTokens(aText);
  const bTokens = getComparableDescriptionTokens(bText);
  if (!aTokens.length || !bTokens.length) return false;

  const bSet = new Set(bTokens);
  const common = aTokens.filter(token => bSet.has(token));
  if (common.some(token => token.length >= 5)) return true;

  const union = new Set([...aTokens, ...bTokens]);
  return common.length > 0 && common.length / union.size >= 0.5;
}

export function getCardInstallmentInfo(record = {}) {
  const description = safeText(record.descricao || record.description || record.memo || record.historico);
  const patterns = [
    /\bparc(?:ela)?\s*(\d{1,2})\s*(?:de|\/)\s*(\d{1,2})\b/i,
    /\bparc\.\s*(\d{1,2})\s*(?:de|\/)\s*(\d{1,2})\b/i,
    /\b(\d{1,2})\s*\/\s*(\d{1,2})\b/,
    /\b(\d{1,2})\s+de\s+(\d{1,2})\b/i,
  ];

  let parsedParcela = null;
  let parsedTotal = null;
  for (const pattern of patterns) {
    const match = description.match(pattern);
    if (match) {
      parsedParcela = Number.parseInt(match[1], 10);
      parsedTotal = Number.parseInt(match[2], 10);
      break;
    }
  }

  const parcela = Number.parseInt(record.parcela ?? record.installment ?? parsedParcela, 10);
  const totalParcelas = Number.parseInt(record.totalParcelas ?? record.parcelas ?? record.totalInstallments ?? parsedTotal, 10);

  if (!Number.isInteger(parcela) || !Number.isInteger(totalParcelas) || parcela <= 0 || totalParcelas <= 1 || parcela > totalParcelas) {
    return { parcela: null, totalParcelas: null, isInstallment: false };
  }

  return { parcela, totalParcelas, isInstallment: true };
}

export function getCardInstallmentBaseDescription(record = {}) {
  const description = safeText(record.descricao || record.description || record.memo || record.historico);
  return normalizeCardInstallmentText(stripCardInstallmentMarkers(description));
}

export function getCardInstallmentPurchaseDate(record = {}) {
  return normalizeDate(record.dataCompra || record.purchaseDate || record.data || record.date || record.dt);
}

export function getCardInstallmentAmount(record = {}) {
  return absoluteMoney(record.valor ?? record.amount ?? record.value ?? 0);
}

export function buildCardInstallmentMasterCandidateKey(record = {}, { cartaoId } = {}) {
  const cardId = safeText(cartaoId || record.cartaoId || record.cardId);
  const baseDescription = getCardInstallmentBaseDescription(record);
  const purchaseDate = getCardInstallmentPurchaseDate(record);
  if (!cardId || !baseDescription || !purchaseDate) return null;
  return `card-installment-master:${cardId}:${baseDescription}:${purchaseDate}`;
}

export function buildCardInstallmentGroupId(record = {}, { cartaoId } = {}) {
  const cardId = safeText(cartaoId || record.cartaoId || record.cardId);
  const baseDescription = getCardInstallmentBaseDescription(record);
  const purchaseDate = getCardInstallmentPurchaseDate(record);
  const amount = getCardInstallmentAmount(record).toFixed(2);
  if (!cardId || !baseDescription || !purchaseDate || amount === "0.00") return null;
  return `card-installment:${cardId}:${baseDescription}:${purchaseDate}:${amount}`;
}

function buildGroupTotalKey(groupId, totalParcelas) {
  return `${groupId || ""}|total:${totalParcelas || ""}`;
}

function normalizeExistingInstallment(item = {}, { cartaoId } = {}) {
  const cardId = safeText(cartaoId || item.cartaoId || item.cardId);
  const info = getCardInstallmentInfo(item);
  const baseDescription = item.descricaoBaseParcelamento || getCardInstallmentBaseDescription(item);
  const purchaseDate = getCardInstallmentPurchaseDate(item);
  const amount = getCardInstallmentAmount(item);
  const inferredGroupId = buildCardInstallmentGroupId(item, { cartaoId: cardId });
  const groupId = item.parcelaGrupo || inferredGroupId;
  const masterCandidateKey = buildCardInstallmentMasterCandidateKey(item, { cartaoId: cardId });

  return {
    ...item,
    cartaoId: cardId,
    parcelaGrupo: groupId,
    descricaoBaseParcelamento: baseDescription,
    dataCompra: purchaseDate || item.dataCompra || item.data || null,
    competencia: getCompetenceMonth(item),
    valorParcelaReferencia: amount,
    parcela: info.parcela || item.parcela || null,
    totalParcelas: info.totalParcelas || item.totalParcelas || null,
    _masterCandidateKey: masterCandidateKey,
    _isInstallment: info.isInstallment,
  };
}

export function buildExistingCardInstallmentIndexes(transactions = [], { cartaoId } = {}) {
  const byGroup = new Map();
  const byGroupTotal = new Map();
  const byInstallment = new Set();
  const byMasterCandidate = new Map();
  const byExplicitGroup = new Map();
  const allInstallments = [];
  const cardId = safeText(cartaoId);

  (transactions || [])
    .filter(item => item && item.origem === "cartao" && safeText(item.cartaoId) === cardId)
    .forEach(item => {
      const normalizedItem = normalizeExistingInstallment(item, { cartaoId: cardId });
      if (!normalizedItem.parcelaGrupo || !normalizedItem._isInstallment) return;

      allInstallments.push(normalizedItem);

      if (!byGroup.has(normalizedItem.parcelaGrupo)) byGroup.set(normalizedItem.parcelaGrupo, []);
      byGroup.get(normalizedItem.parcelaGrupo).push(normalizedItem);
      byExplicitGroup.set(normalizedItem.parcelaGrupo, normalizedItem);

      if (normalizedItem._masterCandidateKey) {
        if (!byMasterCandidate.has(normalizedItem._masterCandidateKey)) byMasterCandidate.set(normalizedItem._masterCandidateKey, []);
        byMasterCandidate.get(normalizedItem._masterCandidateKey).push(normalizedItem);
      }

      const groupTotalKey = buildGroupTotalKey(normalizedItem.parcelaGrupo, normalizedItem.totalParcelas);
      if (!byGroupTotal.has(groupTotalKey)) byGroupTotal.set(groupTotalKey, []);
      byGroupTotal.get(groupTotalKey).push(normalizedItem);
      byInstallment.add(`${groupTotalKey}|parcela:${normalizedItem.parcela}`);
    });

  return { byGroup, byGroupTotal, byInstallment, byExplicitGroup, byMasterCandidate, allInstallments };
}

function groupCandidateItemsByGroup(items = []) {
  const grouped = new Map();
  (items || []).forEach(item => {
    if (!item?.parcelaGrupo) return;
    if (!grouped.has(item.parcelaGrupo)) grouped.set(item.parcelaGrupo, []);
    grouped.get(item.parcelaGrupo).push(item);
  });
  return grouped;
}

function formatMoneyBR(value) {
  return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function findExistingFutureInstallmentFallback(row = {}, info, { existingIndexes, cartaoId } = {}) {
  const competencia = getCompetenceMonth(row);
  const descricaoBase = row.descricaoBaseParcelamento || getCardInstallmentBaseDescription(row);
  const valorParcela = getCardInstallmentAmount(row);
  const candidates = existingIndexes?.allInstallments || [];

  if (!competencia || !info?.isInstallment || !candidates.length) return null;

  const exact = candidates.find(item => (
    Number(item.parcela) === Number(info.parcela)
    && Number(item.totalParcelas) === Number(info.totalParcelas)
    && safeText(item.competencia) === safeText(competencia)
    && isCardInstallmentAmountEquivalent(item.valorParcelaReferencia, valorParcela)
    && hasCompatibleDescription(item.descricaoBaseParcelamento, descricaoBase)
  ));

  if (exact) {
    return {
      type: "exact",
      item: exact,
    };
  }

  const sameMasterWithoutInstallment = candidates.filter(item => (
    Number(item.totalParcelas) === Number(info.totalParcelas)
    && safeText(item.competencia) === safeText(competencia)
    && isCardInstallmentAmountEquivalent(item.valorParcelaReferencia, valorParcela)
    && hasCompatibleDescription(item.descricaoBaseParcelamento, descricaoBase)
  ));

  if (sameMasterWithoutInstallment.length) {
    return {
      type: "divergentInstallment",
      items: sameMasterWithoutInstallment,
    };
  }

  return null;
}

function compareMonthKey(a, b) {
  const aa = safeText(a);
  const bb = safeText(b);
  if (!aa && !bb) return 0;
  if (!aa) return -1;
  if (!bb) return 1;
  return aa.localeCompare(bb);
}

function replaceInstallmentMarkerInDescription(description, parcela, totalParcelas) {
  const text = safeText(description);
  const formatted = `${String(parcela).padStart(2, "0")}/${String(totalParcelas).padStart(2, "0")}`;
  const replacements = [
    /\bparc(?:ela)?\s*\d{1,2}\s*(?:de|\/)\s*\d{1,2}\b/i,
    /\bparc\.\s*\d{1,2}\s*(?:de|\/)\s*\d{1,2}\b/i,
    /\b\d{1,2}\s*\/\s*\d{1,2}\b/,
    /\b\d{1,2}\s+de\s+\d{1,2}\b/i,
  ];
  for (const pattern of replacements) {
    if (pattern.test(text)) {
      return text.replace(pattern, match => /parc/i.test(match) ? match.replace(/\d{1,2}\s*(?:de|\/)\s*\d{1,2}/i, formatted) : formatted);
    }
  }
  return `${text} ${formatted}`.trim();
}

export function getCardInstallmentCorrectionPreview(transactions = [], correction = {}) {
  const groupId = safeText(correction.parcelaGrupo || correction.groupId);
  const startCompetence = safeText(correction.competencia || correction.startCompetence);
  const importedParcela = Number.parseInt(correction.parcela ?? correction.importedParcela, 10);
  const totalParcelas = Number.parseInt(correction.totalParcelas ?? correction.importedTotalParcelas, 10);

  if (!groupId || !startCompetence || !Number.isInteger(importedParcela) || !Number.isInteger(totalParcelas)) {
    return [];
  }

  return (transactions || [])
    .filter(item => item?.origem === "cartao" && safeText(item.parcelaGrupo) === groupId)
    .map(item => ({ ...item, competencia: getCompetenceMonth(item) }))
    .filter(item => compareMonthKey(item.competencia, startCompetence) >= 0)
    .sort((a, b) => compareMonthKey(a.competencia, b.competencia) || safeText(a.data).localeCompare(safeText(b.data)) || Number(a.parcela || 0) - Number(b.parcela || 0))
    .map((item, index) => ({
      id: item.id,
      descricao: item.descricao,
      data: item.data,
      competencia: item.competencia,
      parcelaAtual: Number.parseInt(item.parcela, 10) || null,
      totalAtual: Number.parseInt(item.totalParcelas, 10) || null,
      parcelaNova: importedParcela + index,
      totalNovo: totalParcelas,
      valor: getCardInstallmentAmount(item),
      altera: importedParcela + index <= totalParcelas,
    }));
}

export function applyCardInstallmentSequenceCorrection(transactions = [], correction = {}, options = {}) {
  const groupId = safeText(correction.parcelaGrupo || correction.groupId);
  const startCompetence = safeText(correction.competencia || correction.startCompetence);
  const importedParcela = Number.parseInt(correction.parcela ?? correction.importedParcela, 10);
  const totalParcelas = Number.parseInt(correction.totalParcelas ?? correction.importedTotalParcelas, 10);
  const mode = safeText(options.mode || correction.mode || "current_and_future");

  if (!groupId || !startCompetence || !Number.isInteger(importedParcela) || !Number.isInteger(totalParcelas) || importedParcela < 1 || totalParcelas < importedParcela) {
    return {
      transactions,
      changedCount: 0,
      error: "Correção de parcelas inválida. Verifique grupo, competência, parcela e total.",
    };
  }

  const allGroupItems = (transactions || [])
    .filter(item => item?.origem === "cartao" && safeText(item.parcelaGrupo) === groupId)
    .map(item => ({ ...item, competencia: getCompetenceMonth(item) }))
    .sort((a, b) => compareMonthKey(a.competencia, b.competencia) || safeText(a.data).localeCompare(safeText(b.data)) || Number(a.parcela || 0) - Number(b.parcela || 0));

  const impactedItems = allGroupItems.filter(item => {
    if (mode === "current_only") return safeText(item.competencia) === startCompetence;
    return compareMonthKey(item.competencia, startCompetence) >= 0;
  });

  if (!impactedItems.length) {
    return {
      transactions,
      changedCount: 0,
      error: "Nenhuma parcela do grupo foi encontrada para corrigir.",
    };
  }

  const idsToNewParcel = new Map();
  impactedItems.forEach((item, index) => {
    const newParcela = mode === "current_only" ? importedParcela : importedParcela + index;
    if (newParcela <= totalParcelas) idsToNewParcel.set(item.id, newParcela);
  });

  if (!idsToNewParcel.size) {
    return {
      transactions,
      changedCount: 0,
      error: "A correção não encontrou parcelas dentro do total informado.",
    };
  }

  let changedCount = 0;
  const now = new Date().toISOString();
  const nextTransactions = (transactions || []).map(item => {
    const newParcela = idsToNewParcel.get(item.id);
    if (!newParcela) return item;
    changedCount += 1;
    return {
      ...item,
      parcela: newParcela,
      totalParcelas,
      descricao: replaceInstallmentMarkerInDescription(item.descricao, newParcela, totalParcelas),
      parcelado: true,
      updatedAt: now,
      ajusteParcelamentoManual: true,
      ajusteParcelamentoManualEm: now,
      ajusteParcelamentoManualModo: mode,
      ajusteParcelamentoManualMotivo: mode === "current_only"
        ? "Correção manual somente da parcela da competência atual a partir de divergência na importação de fatura de cartão."
        : "Correção manual da parcela atual e subsequentes a partir de divergência na importação de fatura de cartão.",
    };
  });

  return {
    transactions: nextTransactions,
    changedCount,
    error: "",
  };
}

export function classifyImportedCardInstallmentRow(row = {}, { cartaoId, existingIndexes } = {}) {
  const info = getCardInstallmentInfo(row);
  const descricaoBase = row.descricaoBaseParcelamento || getCardInstallmentBaseDescription(row);
  const dataCompra = getCardInstallmentPurchaseDate(row);
  const competencia = getCompetenceMonth(row);
  const valorParcela = getCardInstallmentAmount(row);
  const parcelaGrupo = row.parcelaGrupo || buildCardInstallmentGroupId(row, { cartaoId });
  const masterCandidateKey = buildCardInstallmentMasterCandidateKey(row, { cartaoId });

  if (!info.isInstallment || !parcelaGrupo || !masterCandidateKey) {
    return {
      isInstallment: false,
      shouldSkip: false,
      status: "nao_parcelado",
      reason: "Compra à vista ou parcelamento não identificado.",
      parcelaGrupo: null,
      descricaoBase,
      dataCompra,
      valorParcela,
      parcela: null,
      totalParcelas: null,
    };
  }

  const indexes = existingIndexes || buildExistingCardInstallmentIndexes([], { cartaoId });
  const masterCandidates = indexes.byMasterCandidate?.get(masterCandidateKey) || [];
  const equivalentCandidates = masterCandidates.filter(item => isCardInstallmentAmountEquivalent(item.valorParcelaReferencia, valorParcela));
  const divergentAmountCandidates = masterCandidates.filter(item => !isCardInstallmentAmountEquivalent(item.valorParcelaReferencia, valorParcela));
  const candidateGroups = groupCandidateItemsByGroup(equivalentCandidates);

  if (!candidateGroups.size) {
    const fallback = findExistingFutureInstallmentFallback(row, info, { existingIndexes: indexes, cartaoId });

    if (fallback?.type === "exact") {
      return {
        isInstallment: true,
        shouldSkip: true,
        status: "parcela_existente_competencia",
        reason: `Parcela ${info.parcela}/${info.totalParcelas} já existe na competência ${competencia}. Validação feita por competência, parcela, valor aproximado e descrição compatível, pois o arquivo alterou data/descrição entre faturas.`,
        parcelaGrupo: fallback.item.parcelaGrupo || parcelaGrupo,
        descricaoBase,
        dataCompra,
        valorParcela,
        parcela: info.parcela,
        totalParcelas: info.totalParcelas,
        matchedCompetencia: competencia,
        matchedParcelaGrupo: fallback.item.parcelaGrupo || parcelaGrupo,
        canCorrectSequence: false,
      };
    }

    if (fallback?.type === "divergentInstallment") {
      const parcelas = [...new Set(fallback.items.map(item => item.parcela).filter(Boolean))]
        .sort((a, b) => Number(a) - Number(b))
        .join(", ") || "não informado";
      const matchedGroupId = fallback.items[0]?.parcelaGrupo || parcelaGrupo;
      return {
        isInstallment: true,
        shouldSkip: true,
        status: "divergencia_parcela_competencia",
        reason: `Existe parcelamento compatível na competência ${competencia}, mas o arquivo trouxe ${info.parcela}/${info.totalParcelas} e o sistema possui ${parcelas}. Validar manualmente antes de alterar qualquer lançamento.`,
        parcelaGrupo: matchedGroupId,
        descricaoBase,
        dataCompra,
        valorParcela,
        parcela: info.parcela,
        totalParcelas: info.totalParcelas,
        matchedCompetencia: competencia,
        matchedParcelaGrupo: matchedGroupId,
        matchedParcelas: parcelas,
        canCorrectSequence: true,
        correction: {
          parcelaGrupo: matchedGroupId,
          competencia,
          parcela: info.parcela,
          totalParcelas: info.totalParcelas,
          parcelaArquivo: info.parcela,
          totalArquivo: info.totalParcelas,
          parcelasSistema: parcelas,
        },
      };
    }

    return {
      isInstallment: true,
      shouldSkip: false,
      status: "novo_parcelamento",
      reason: divergentAmountCandidates.length
        ? `Novo parcelamento identificado. Existe compra no mesmo cartão, descrição e data, mas com valor de parcela fora da tolerância de R$ 0,05.`
        : "Novo parcelamento identificado.",
      parcelaGrupo,
      descricaoBase,
      dataCompra,
      valorParcela,
      parcela: info.parcela,
      totalParcelas: info.totalParcelas,
    };
  }

  const matchingGroupEntries = [...candidateGroups.entries()];
  const matchingGroupWithSameTotal = matchingGroupEntries.filter(([, items]) => items.some(item => Number(item.totalParcelas) === Number(info.totalParcelas)));
  const matchingExactInstallment = matchingGroupEntries.find(([, items]) => items.some(item => Number(item.totalParcelas) === Number(info.totalParcelas) && Number(item.parcela) === Number(info.parcela)));

  if (matchingExactInstallment) {
    return {
      isInstallment: true,
      shouldSkip: true,
      status: "parcela_existente",
      reason: `Parcela ${info.parcela}/${info.totalParcelas} já existe no histórico deste cartão para a compra de ${dataCompra}, com valor dentro da tolerância de R$ 0,05.`,
      parcelaGrupo: matchingExactInstallment[0],
      descricaoBase,
      dataCompra,
      valorParcela,
      parcela: info.parcela,
      totalParcelas: info.totalParcelas,
    };
  }

  if (!matchingGroupWithSameTotal.length) {
    const totais = [...new Set(equivalentCandidates.map(item => item.totalParcelas).filter(Boolean))].join(", ") || "não informado";
    return {
      isInstallment: true,
      shouldSkip: true,
      status: "divergencia_total_parcelas",
      reason: `Compra parcelada já existe para mesma descrição, data e valor aproximado (${formatMoneyBR(valorParcela)}), mas com total de parcelas diferente (${totais}); importação trouxe ${info.totalParcelas}.`,
      parcelaGrupo: matchingGroupEntries[0]?.[0] || parcelaGrupo,
      descricaoBase,
      dataCompra,
      valorParcela,
      parcela: info.parcela,
      totalParcelas: info.totalParcelas,
      matchedParcelaGrupo: matchingGroupEntries[0]?.[0] || parcelaGrupo,
      canCorrectSequence: false,
    };
  }

  if (matchingGroupWithSameTotal.length > 1) {
    return {
      isInstallment: true,
      shouldSkip: true,
      status: "divergencia_multiplos_masters",
      reason: `Mais de um parcelamento compatível foi encontrado para mesma descrição, data e valor aproximado. Validar manualmente antes de importar.`,
      parcelaGrupo: matchingGroupWithSameTotal[0]?.[0] || parcelaGrupo,
      descricaoBase,
      dataCompra,
      valorParcela,
      parcela: info.parcela,
      totalParcelas: info.totalParcelas,
      matchedParcelaGrupo: matchingGroupWithSameTotal[0]?.[0] || parcelaGrupo,
      canCorrectSequence: false,
    };
  }

  const [matchedGroupId, sameTotalItems] = matchingGroupWithSameTotal[0];
  const parcelasExistentes = [...new Set(sameTotalItems.map(item => item.parcela).filter(Boolean))]
    .sort((a, b) => Number(a) - Number(b))
    .join(", ") || "não informado";

  return {
    isInstallment: true,
    shouldSkip: true,
    status: "divergencia_parcela_faltante",
    reason: `Compra parcelada já existe, mas a parcela ${info.parcela}/${info.totalParcelas} não foi localizada no histórico. Parcelas existentes: ${parcelasExistentes}. Validar antes de importar.`,
    parcelaGrupo: matchedGroupId,
    descricaoBase,
    dataCompra,
    valorParcela,
    parcela: info.parcela,
    totalParcelas: info.totalParcelas,
    matchedCompetencia: competencia,
    matchedParcelaGrupo: matchedGroupId,
    canCorrectSequence: true,
    correction: {
      parcelaGrupo: matchedGroupId,
      competencia,
      parcela: info.parcela,
      totalParcelas: info.totalParcelas,
      parcelaArquivo: info.parcela,
      totalArquivo: info.totalParcelas,
      parcelasSistema: parcelasExistentes,
    },
  };
}
