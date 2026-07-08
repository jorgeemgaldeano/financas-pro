import { normText } from "./categoryService.js";
import { moneyToNumber } from "../utils/moneyUtils.js";
import { addMonthsToMonthKey, mKey } from "../utils/dateUtils.js";

export const isIOFDescription = (desc) => /^\s*IOF\b/i.test(String(desc || ""));

export const ignoredBankImportReason = (desc) => {
  const d = normText(desc);
  if (!d) return "";
  if (d.includes("bb rende facil") || d.includes("rende facil")) return "BB Rende Fácil";
  return "";
};

export const isBalanceOrTotalRow = (desc) =>
  /^(saldo|s\s*a\s*l\s*d\s*o|total)\b|saldo\s+(anterior|atual|final|dispon[ií]vel)|totalizador/i.test(String(desc || ""));

export const pDate = (value) => {
  if (!value) return null;
  const s = String(value).trim();
  if (/^\d{8}/.test(s)) return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;

  const compact = s.match(/^(\d{2})(\d{2})(\d{4})$/);
  if (compact) return `${compact[3]}-${compact[2]}-${compact[1]}`;

  const slash = s.match(/^(\d{2})\/(\d{2})\/(\d{2,4})$/);
  if (slash) {
    const year = slash[3].length === 2 ? `20${slash[3]}` : slash[3];
    return `${year}-${slash[2]}-${slash[1]}`;
  }

  const dash = s.match(/^(\d{2})-(\d{2})-(\d{2,4})$/);
  if (dash) {
    const year = dash[3].length === 2 ? `20${dash[3]}` : dash[3];
    return `${year}-${dash[2]}-${dash[1]}`;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return null;
};

export const pVal = (value) => {
  if (!value) return null;
  const parsed = moneyToNumber(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const pSignedVal = (value, dc = "") => {
  if (value === null || value === undefined) return null;
  const raw = String(value).trim();
  if (!raw) return null;

  const dcText = normText(`${dc} ${raw}`);
  const debit = /\b(d|debito|saida|saque)\b/.test(dcText)
    || /^\(.*\)$/.test(raw)
    || /^\s*-/.test(raw)
    || /-\s*$/.test(raw);
  const credit = /\b(c|credito|entrada|deposito)\b/.test(dcText);

  const cleaned = raw
    .replace(/^\((.*)\)$/, "$1")
    .replace(/[^\d,.\-]/g, "")
    .replace(/-$/, "-");

  let parsed = moneyToNumber(cleaned);
  if (!Number.isFinite(parsed)) return null;

  parsed = Math.abs(parsed);
  if (debit && !credit) return -parsed;
  if (credit && !debit) return parsed;
  if (/^\s*-/.test(raw) || /-\s*$/.test(raw)) return -parsed;
  return parsed;
};

export const parseDelimitedLine = (line, sep) => {
  const out = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === sep && !inQuotes) {
      out.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  out.push(current.trim());
  return out.map(cell => cell.replace(/^"|"$/g, "").trim());
};

export const detectSep = (line) => {
  const candidates = [";", ",", "\t", "|"];
  return candidates
    .map(sep => ({ sep, count: parseDelimitedLine(line, sep).length }))
    .sort((a, b) => b.count - a.count)[0]?.sep || ";";
};

const MONTHS_PT = {
  janeiro: 1,
  fevereiro: 2,
  marco: 3,
  março: 3,
  abril: 4,
  maio: 5,
  junho: 6,
  julho: 7,
  agosto: 8,
  setembro: 9,
  outubro: 10,
  novembro: 11,
  dezembro: 12,
};

export const parsePtDateNoYear = (line, year) => {
  const normalized = normText(line);
  const match = normalized.match(/(?:segunda|terca|terça|quarta|quinta|sexta|sabado|sábado|domingo)-?feira?,?\s*(\d{1,2})\s+([a-zç]+)/i)
    || normalized.match(/^(\d{1,2})\s+([a-zç]+)$/i);

  if (!match) return null;

  const day = String(parseInt(match[1], 10)).padStart(2, "0");
  const month = MONTHS_PT[match[2]];
  if (!month) return null;

  const safeYear = parseInt(year, 10) || new Date().getFullYear();
  return `${safeYear}-${String(month).padStart(2, "0")}-${day}`;
};

export const parseInstallmentInfo = (desc) => {
  if (isIOFDescription(desc)) return null;

  const text = String(desc || "");
  const patterns = [
    { rx: /(\b|\D)(\d{1,2})\s*\/\s*(\d{1,2})(\b|\D)/, currentIndex: 2, totalIndex: 3 },
    { rx: /parc(?:ela)?\s*(\d{1,2})\s*(?:de|\/)\s*(\d{1,2})/i, currentIndex: 1, totalIndex: 2 },
    { rx: /(\d{1,2})\s*de\s*(\d{1,2})/i, currentIndex: 1, totalIndex: 2 },
  ];

  for (const { rx, currentIndex, totalIndex } of patterns) {
    const match = text.match(rx);
    if (!match) continue;

    const current = parseInt(match[currentIndex], 10);
    const total = parseInt(match[totalIndex], 10);
    if (current > 0 && total > 1 && current <= total && total <= 60) {
      return { current, total };
    }
  }

  return null;
};

export const formatInstallmentText = (desc, current, total) => {
  const text = String(desc || "").trim();
  const currentTxt = String(current).padStart(2, "0");
  const totalTxt = String(total).padStart(2, "0");

  if (/(\b|\D)\d{1,2}\s*\/\s*\d{1,2}(\b|\D)/.test(text)) {
    return text.replace(/(\b|\D)(\d{1,2})\s*\/\s*(\d{1,2})(\b|\D)/, `$1${currentTxt}/${totalTxt}$4`);
  }

  if (/parc(?:ela)?\s*\d{1,2}\s*(?:de|\/)\s*\d{1,2}/i.test(text)) {
    return text.replace(/parc(?:ela)?\s*\d{1,2}\s*(?:de|\/)\s*\d{1,2}/i, `Parcela ${currentTxt}/${totalTxt}`);
  }

  if (/\d{1,2}\s*de\s*\d{1,2}/i.test(text)) {
    return text.replace(/\d{1,2}\s*de\s*\d{1,2}/i, `${currentTxt} de ${totalTxt}`);
  }

  return `${text} ${currentTxt}/${totalTxt}`.trim();
};

export const moneyKey = (value) => Math.round(moneyToNumber(value) * 100);

const getImportTargetId = (row = {}, mode = row.importTipo) => {
  if (mode === "bancario" || mode === "vale") return row.contaId || "";
  return row.cartaoId || "";
};

export const buildImportKey = (row, targetId = null, competencia = null, mode = null) => {
  const selectedMode = mode || row.importTipo || "cartao";
  const target = targetId || getImportTargetId(row, selectedMode);
  const month = competencia
    || row.competencia
    || row.competenceMonth
    || (selectedMode === "cartao" ? mKey(row.data) : mKey(row.data));

  return [
    selectedMode,
    target || "",
    month,
    row.tipo || "",
    row.data,
    moneyKey(row.valor),
    normText(row.descricao),
  ].join("|");
};

export const buildLegacyImportKey = (row, targetId = null, mode = null) => {
  const selectedMode = mode || row.importTipo || "cartao";
  const target = targetId || getImportTargetId(row, selectedMode);
  return [
    selectedMode,
    target || "",
    row.data,
    moneyKey(row.valor),
    normText(row.descricao),
  ].join("|");
};

export const expandImportedRows = (rows, { impCompetencia, createId = () => Math.random().toString(36).slice(2, 9) } = {}) => rows.flatMap(row => {
  if (row.importTipo === "bancario" || row.importTipo === "vale") {
    return [{ ...row, parcela: null, totalParcelas: null, parcelaGrupo: null }];
  }

  if (isIOFDescription(row.descricao)) {
    return [{ ...row, competencia: impCompetencia, parcela: null, totalParcelas: null, parcelaGrupo: null }];
  }

  const info = row.parcelaInfo || parseInstallmentInfo(row.descricao);
  if (!info) {
    return [{ ...row, competencia: impCompetencia, parcela: null, totalParcelas: null, parcelaGrupo: null }];
  }

  const groupId = `imp_${createId()}`;
  const remaining = info.total - info.current + 1;

  return Array.from({ length: remaining }, (_, index) => {
    const parcela = info.current + index;
    const competencia = addMonthsToMonthKey(impCompetencia, index);

    return {
      ...row,
      _id: `${row._id}_${parcela}_${info.total}_${index}`,
      descricao: formatInstallmentText(row.descricao, parcela, info.total),
      data: row.data,
      dataCompra: row.data,
      competencia,
      parcela,
      totalParcelas: info.total,
      parcelaGrupo: groupId,
      importadoFuturo: index > 0,
    };
  });
});

export const parseValePluxeeText = (text, {
  valeYear,
  contaId,
  categorize,
  createId = () => Math.random().toString(36).slice(2, 9),
} = {}) => {
  const rows = [];
  const lines = String(text || "")
    .split(/\r?\n/)
    .map(line => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  let currentDate = null;
  let current = null;
  let pendingTime = null;

  const flush = () => {
    if (!current || !currentDate) return;

    const block = [current.operacao, ...current.parts].join(" ").replace(/\s+/g, " ").trim();
    const moneyMatches = [...block.matchAll(/R\$\s*([\d.]+,\d{2})/g)];
    if (!moneyMatches.length) return;

    const amount = moneyToNumber(moneyMatches[moneyMatches.length - 1][1]);
    if (!amount) return;

    const blockNorm = normText(block);
    const tipo = blockNorm.includes("disponibilizacao de valor") ? "receita" : "despesa";
    const carteira = blockNorm.includes("alimentacao")
      ? "alimentacao"
      : blockNorm.includes("refeicao")
        ? "refeicao"
        : "multibeneficios";

    let descricao = block
      .replace(/R\$\s*[\d.]+,\d{2}/g, "")
      .replace(/^Compra no\s+(Refeição|Refeicao|Alimentação|Alimentacao)\s*/i, "")
      .replace(/^Saldo liberado\s*/i, "")
      .replace(/^Agendamento de Benefício\s*/i, "")
      .replace(/^Agendamento de Beneficio\s*/i, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!descricao) descricao = tipo === "receita" ? "Disponibilização de valor" : "Débito no vale";

    rows.push({
      _id: `imp_${createId()}`,
      importTipo: "vale",
      fornecedorVale: "pluxee",
      carteiraVale: carteira,
      hora: current.hora,
      data: currentDate,
      descricao,
      tipo,
      valor: Math.abs(amount),
      catId: categorize?.(descricao, tipo),
      contaId,
    });
  };

  lines.forEach(line => {
    const parsedDate = parsePtDateNoYear(line, valeYear);
    if (parsedDate) {
      flush();
      currentDate = parsedDate;
      current = null;
      pendingTime = null;
      return;
    }

    const timeOnly = line.match(/^(\d{2}:\d{2})$/);
    if (timeOnly) {
      flush();
      pendingTime = timeOnly[1];
      current = null;
      return;
    }

    const transaction = line.match(/^(\d{2}:\d{2})\s+(.+)$/);
    if (transaction) {
      flush();
      current = { hora: transaction[1], operacao: transaction[2], parts: [] };
      pendingTime = null;
      return;
    }

    if (pendingTime) {
      current = { hora: pendingTime, operacao: line, parts: [] };
      pendingTime = null;
      return;
    }

    if (current) current.parts.push(line);
  });

  flush();
  return rows.filter(row => !isBalanceOrTotalRow(row.descricao));
};

export const parseOFX = (text, {
  mode = "cartao",
  bancoImportacao = "auto",
  categorize,
  createId = () => Math.random().toString(36).slice(2, 9),
} = {}) => {
  const rows = [];
  const rx = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
  let match;

  while ((match = rx.exec(text)) !== null) {
    const block = match[1];
    const getTag = (tag) => {
      const tagMatch = block.match(new RegExp(`<${tag}>([^<\\n\\r]+)`, "i"));
      return tagMatch ? tagMatch[1].trim() : "";
    };

    const date = pDate(getTag("DTPOSTED") || getTag("DTUSER"));
    const amount = pSignedVal(getTag("TRNAMT"));
    const memo = [getTag("MEMO"), getTag("NAME"), getTag("CHECKNUM")].filter(Boolean).join(" · ") || "Lançamento importado";
    const trnType = getTag("TRNTYPE").toUpperCase();

    if (!date || amount === null || Math.abs(amount) === 0 || isBalanceOrTotalRow(memo)) continue;
    if (mode === "bancario" && ignoredBankImportReason(memo)) continue;

    // No OFX de fatura de cartão do Banco do Brasil, o campo TRNTYPE identifica
    // corretamente a natureza do lançamento mesmo quando o sinal de TRNAMT é
    // inconsistente: CREDIT é pagamento da fatura ou estorno (reduz o total) e
    // PAYMENT é lançamento que compõe a fatura (aumenta o total).
    let tipo;
    if (mode === "cartao" && trnType === "CREDIT") {
      tipo = "receita";
    } else if (mode === "cartao" && trnType === "PAYMENT") {
      tipo = "despesa";
    } else {
      if (mode === "cartao" && amount >= 0) continue;
      tipo = amount >= 0 ? "receita" : "despesa";
    }
    rows.push({
      _id: getTag("FITID") || `imp_${createId()}`,
      importTipo: mode,
      data: date,
      dataCompra: date,
      descricao: memo,
      tipo,
      valor: Math.abs(amount),
      catId: categorize?.(memo, tipo),
      parcelaInfo: mode === "cartao" ? parseInstallmentInfo(memo) : null,
      bancoImportacao,
    });
  }

  return rows;
};

export const parseCardCSV = (text, {
  categorize,
  createId = () => Math.random().toString(36).slice(2, 9),
} = {}) => {
  const rows = [];
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const sep = detectSep(lines[0] || "");
  const header = parseDelimitedLine(lines[0] || "", sep).map(h => normText(h));
  const dateIndex = header.findIndex(h => /data|date/.test(h));
  const descIndex = header.findIndex(h => /descri|hist|memo|estabelecimento|lancamento/.test(h));
  const valueIndex = header.findIndex(h => /valor|value|amount|debito/.test(h));
  const start = dateIndex >= 0 || descIndex >= 0 ? 1 : 0;

  for (let index = start; index < lines.length; index += 1) {
    const cols = parseDelimitedLine(lines[index], sep);
    const rawDate = cols[dateIndex >= 0 ? dateIndex : 0];
    let date = pDate(rawDate);
    if (!date) {
      const parts = rawDate?.split("/");
      if (parts?.length === 3) date = pDate(`${parts[1]}/${parts[0]}/${parts[2]}`);
    }
    if (!date) continue;

    const desc = descIndex >= 0 ? cols[descIndex] : cols[1] || "";
    if (/total|saldo|pagamento/i.test(desc)) continue;

    let value = null;
    if (valueIndex >= 0) {
      value = pVal(cols[valueIndex]);
    } else {
      for (let colIndex = cols.length - 1; colIndex >= 2; colIndex -= 1) {
        const parsed = pVal(cols[colIndex]);
        if (parsed !== null) {
          value = parsed;
          break;
        }
      }
    }

    if (value === null || Math.abs(value) === 0) continue;

    rows.push({
      _id: `imp_${createId()}`,
      importTipo: "cartao",
      data: date,
      dataCompra: date,
      descricao: desc,
      tipo: "despesa",
      valor: Math.abs(value),
      catId: categorize?.(desc, "despesa"),
      parcelaInfo: parseInstallmentInfo(desc),
    });
  }

  return rows;
};

export const parseBankCSV = (text, {
  bancoImportacao = "auto",
  contaId,
  categorize,
  createId = () => Math.random().toString(36).slice(2, 9),
} = {}) => {
  const rows = [];
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (!lines.length) return rows;

  const sep = detectSep(lines.find(line => /[;,\t|]/.test(line)) || lines[0]);
  const headerLineIndex = lines.findIndex(line => {
    const cells = parseDelimitedLine(line, sep).map(h => normText(h));
    return cells.some(h => /data|date/.test(h)) && cells.some(h => /valor|debito|credito|amount|saldo|vlr/.test(h));
  });

  const first = parseDelimitedLine(lines[headerLineIndex >= 0 ? headerLineIndex : 0], sep).map(h => normText(h));
  const hasHeader = headerLineIndex >= 0 || first.some(h => /data|hist|descri|lancamento|valor|debito|credito|saldo/.test(h));
  const header = hasHeader ? first : [];
  const dateIndex = header.findIndex(h => /data|date/.test(h));
  const descCandidates = header
    .map((h, i) => ({ h, i }))
    .filter(item => /descri|historico|hist|memo|lancamento|detalhe|documento/.test(item.h))
    .map(item => item.i);
  const valueIndex = header.findIndex(h => /^valor$|amount|valor\s*lan|valor\s*mov|vlr/.test(h));
  const debitIndex = header.findIndex(h => /debito|saida|retirada/.test(h));
  const creditIndex = header.findIndex(h => /credito|entrada|deposito/.test(h));
  const dcIndex = header.findIndex(h => /^d\/?c$|debito\/?credito|tipo|natureza|sinal/.test(h));
  const start = hasHeader ? (headerLineIndex >= 0 ? headerLineIndex + 1 : 1) : 0;

  for (let index = start; index < lines.length; index += 1) {
    const cols = parseDelimitedLine(lines[index], sep);
    const dtIndex = dateIndex >= 0 ? dateIndex : cols.findIndex(cell => pDate(cell));
    const date = pDate(cols[dtIndex]);
    if (!date) continue;

    let desc = "";
    if (descCandidates.length) {
      desc = descCandidates.map(idx => cols[idx]).filter(Boolean).join(" · ");
    } else {
      desc = cols.filter((_, idx) => idx !== dtIndex).slice(0, Math.max(1, cols.length - 2)).join(" ");
    }

    desc = String(desc || "Lançamento bancário").replace(/\s+/g, " ").trim();
    if (isBalanceOrTotalRow(desc) || ignoredBankImportReason(desc)) continue;

    let signed = null;
    if (debitIndex >= 0 || creditIndex >= 0) {
      const debit = debitIndex >= 0 ? pSignedVal(cols[debitIndex], "D") : null;
      const credit = creditIndex >= 0 ? pSignedVal(cols[creditIndex], "C") : null;
      if (debit !== null && Math.abs(debit) > 0) signed = -Math.abs(debit);
      else if (credit !== null && Math.abs(credit) > 0) signed = Math.abs(credit);
    }

    if (signed === null && valueIndex >= 0) signed = pSignedVal(cols[valueIndex], dcIndex >= 0 ? cols[dcIndex] : "");

    if (signed === null) {
      for (let colIndex = cols.length - 1; colIndex >= 0; colIndex -= 1) {
        if (colIndex === dtIndex) continue;
        const value = pSignedVal(cols[colIndex], dcIndex >= 0 ? cols[dcIndex] : "");
        if (value !== null && Math.abs(value) > 0) {
          signed = value;
          break;
        }
      }
    }

    if (signed === null || Math.abs(signed) === 0) continue;
    const tipo = signed >= 0 ? "receita" : "despesa";

    rows.push({
      _id: `imp_${createId()}`,
      importTipo: "bancario",
      bancoImportacao,
      data: date,
      descricao: desc,
      tipo,
      valor: Math.abs(signed),
      catId: categorize?.(desc, tipo),
      contaId,
    });
  }

  return rows;
};

export const parseBankTXT = (text, {
  bancoImportacao = "auto",
  contaId,
  categorize,
  createId = () => Math.random().toString(36).slice(2, 9),
} = {}) => {
  const rows = [];
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);

  lines.forEach(line => {
    const dateMatch = line.match(/(\d{2}\/\d{2}\/\d{2,4}|\d{2}-\d{2}-\d{2,4}|\d{8})/);
    if (!dateMatch) return;

    const date = pDate(dateMatch[1]);
    if (!date) return;

    const moneyMatches = [...line.matchAll(/(?:^|\s)(-?\(?\d{1,3}(?:\.\d{3})*,\d{2}\)?\s*[CDcd]?|-?\d+,\d{2}\s*[CDcd]?)(?=\s|$)/g)];
    if (!moneyMatches.length) return;

    const moneyRaw = moneyMatches[moneyMatches.length - 1][1];
    const signed = pSignedVal(moneyRaw, line);
    if (signed === null || Math.abs(signed) === 0) return;

    let desc = line.replace(dateMatch[1], "").replace(moneyRaw, "").replace(/\s+/g, " ").trim();
    desc = desc.replace(/\b[CDcd]\b\s*$/, " ").trim() || "Lançamento bancário";

    if (isBalanceOrTotalRow(desc) || ignoredBankImportReason(desc)) return;

    const tipo = signed >= 0 ? "receita" : "despesa";
    rows.push({
      _id: `imp_${createId()}`,
      importTipo: "bancario",
      bancoImportacao,
      data: date,
      descricao: desc,
      tipo,
      valor: Math.abs(signed),
      catId: categorize?.(desc, tipo),
      contaId,
    });
  });

  return rows;
};

export const parseBankFile = (text, ext, options = {}) => {
  if (ext === "ofx" || ext === "qfx" || text.includes("<STMTTRN>")) {
    return parseOFX(text, { ...options, mode: "bancario" });
  }

  const csvRows = parseBankCSV(text, options);
  if (csvRows.length) return csvRows;

  return parseBankTXT(text, options);
};

export const extractIgnoredBankRows = (text, {
  mode = "bancario",
  createId = () => Math.random().toString(36).slice(2, 9),
} = {}) => {
  if (mode !== "bancario") return [];

  return String(text || "")
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map((line, index) => ({
      id: `ign_${index}_${createId()}`,
      linha: index + 1,
      descricao: line.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      motivo: ignoredBankImportReason(line),
    }))
    .filter(item => item.motivo);
};
