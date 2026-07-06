export const fmtBRL = value => (Number(value) || 0).toLocaleString("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export const moneyToNumber = value => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (value === null || value === undefined) return 0;

  const raw = String(value).trim();
  if (!raw) return 0;

  const normalized = raw.replace(/\s/g, "").replace(/R\$/g, "");
  if (/^-?\d+(\.\d+)?$/.test(normalized)) return parseFloat(normalized) || 0;

  const parsed = parseFloat(normalized.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
};

export const maskMoneyInput = value => {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return "";

  return (parseInt(digits, 10) / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
