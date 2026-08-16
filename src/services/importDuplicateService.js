// importDuplicateService.js — v0.3.37 Fase 5 (DEC-0038)
// Chaves de deduplicação da importação de extratos/faturas, extraídas de
// App.jsx. Funções puras, sem estado e sem React.
//
// O App.jsx consome só `buildImportDuplicateKeyCandidates` e
// `buildExistingImportDuplicateKeys`; as demais são degraus internos,
// exportados para poderem ser cobertos por teste isoladamente.
//
// Comportamento preservado byte a byte na extração — os testes em
// importDuplicateService.test.js são de caracterização (travam o que o
// código já fazia), não de especificação nova.
import { normText } from "./categoryService.js";
import { roundMoney } from "./cardInvoiceService.js";

export const normalizeImportDescriptionForDuplicate = (value) => normText(String(value || "").replace(/\s+/g, " ").trim());

export const normalizeImportAmountForDuplicate = (record) => roundMoney(Number(record?.valor ?? record?.amount ?? 0));

export const normalizeImportTypeForDuplicate = (record, mode) => record?.tipo || (mode === "cartao" ? "despesa" : "");

export function uniqueNonEmpty(values) {
  return Array.from(new Set(values.map(value => String(value || "").trim()).filter(Boolean)));
}

export function getImportDuplicateDateCandidates(record) {
  return uniqueNonEmpty([
    record?.dataCompra,
    record?.data,
    record?.date,
    record?.dt,
  ].map(value => String(value || "").slice(0, 10)));
}

export function stripInstallmentMarkersFromDescription(value) {
  return String(value || "")
    .replace(/\bparc(?:ela)?\s*\d+\s*(?:de|\/)\s*\d+\b/gi, " ")
    .replace(/\bparc\.\s*\d+\s*(?:de|\/)\s*\d+\b/gi, " ")
    .replace(/\b\d{1,2}\s*\/\s*\d{1,2}\b/g, " ")
    .replace(/\b\d{1,2}\s+de\s+\d{1,2}\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getInstallmentInfoFromDescription(value) {
  const text = String(value || "").toLowerCase();
  const patterns = [
    /\bparc(?:ela)?\s*(\d{1,2})\s*(?:de|\/)\s*(\d{1,2})\b/i,
    /\bparc\.\s*(\d{1,2})\s*(?:de|\/)\s*(\d{1,2})\b/i,
    /\b(\d{1,2})\s*\/\s*(\d{1,2})\b/,
    /\b(\d{1,2})\s+de\s+(\d{1,2})\b/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;
    const parcela = parseInt(match[1], 10);
    const totalParcelas = parseInt(match[2], 10);
    if (Number.isFinite(parcela) && Number.isFinite(totalParcelas) && parcela >= 1 && totalParcelas >= parcela && totalParcelas > 1) {
      return { parcela, totalParcelas };
    }
  }
  return { parcela:null, totalParcelas:null };
}

export function getImportInstallmentInfo(record) {
  const parsed = getInstallmentInfoFromDescription(record?.descricao || record?.description || "");
  const parcela = parseInt(record?.parcela ?? parsed.parcela, 10);
  const totalParcelas = parseInt(record?.totalParcelas ?? record?.parcelas ?? parsed.totalParcelas, 10);
  if (Number.isFinite(parcela) && Number.isFinite(totalParcelas) && parcela >= 1 && totalParcelas >= parcela && totalParcelas > 1) {
    return { parcela, totalParcelas };
  }
  return { parcela:null, totalParcelas:null };
}

export function getImportDuplicateDescriptionCandidates(record) {
  const base = String(record?.descricao || record?.description || "");
  const normalized = normalizeImportDescriptionForDuplicate(base);
  const semParcela = normalizeImportDescriptionForDuplicate(stripInstallmentMarkersFromDescription(base));
  return uniqueNonEmpty([normalized, semParcela]);
}

export function buildStrictImportDuplicateKeyCandidates(record, { mode, destinationId }) {
  const scope = mode === "cartao" ? `cartao:${destinationId || ""}` : `conta:${destinationId || ""}:${mode || ""}`;
  const dates = getImportDuplicateDateCandidates(record);
  const descriptions = getImportDuplicateDescriptionCandidates(record);
  const valor = normalizeImportAmountForDuplicate(record).toFixed(2);
  const tipo = normalizeImportTypeForDuplicate(record, mode);
  const keys = [];
  dates.forEach(data => {
    descriptions.forEach(descricao => {
      keys.push(`${scope}|${data}|${descricao}|${valor}|${tipo}`);
    });
  });
  return uniqueNonEmpty(keys);
}

export function buildCardInstallmentDuplicateKeyCandidates(record, { cartaoId }) {
  const { parcela, totalParcelas } = getImportInstallmentInfo(record);
  if (!cartaoId || !parcela || !totalParcelas) return [];
  const valor = normalizeImportAmountForDuplicate(record).toFixed(2);
  const descriptions = getImportDuplicateDescriptionCandidates(record);
  return uniqueNonEmpty(descriptions.map(descricao => `cartao:${cartaoId}|parcelamento|${descricao}|${valor}|${parcela}/${totalParcelas}`));
}

export function buildImportDuplicateKeyCandidates(record, { mode, destinationId }) {
  const keys = buildStrictImportDuplicateKeyCandidates(record, { mode, destinationId });
  if (mode === "cartao") keys.push(...buildCardInstallmentDuplicateKeyCandidates(record, { cartaoId:destinationId }));
  return uniqueNonEmpty(keys);
}

export function buildStrictImportDuplicateKey(record, { mode, destinationId }) {
  return buildStrictImportDuplicateKeyCandidates(record, { mode, destinationId })[0] || "";
}

export function buildExistingImportDuplicateKeys(transactions, { mode, contaId, cartaoId }) {
  const destinationId = mode === "cartao" ? cartaoId : contaId;
  const keys = [];
  (transactions || [])
    .filter(item => mode === "cartao"
      ? item?.cartaoId === cartaoId
      : item?.contaId === contaId && item?.origem !== "cartao")
    .forEach(item => {
      keys.push(...buildImportDuplicateKeyCandidates(item, { mode, destinationId }));
    });
  return new Set(keys);
}
