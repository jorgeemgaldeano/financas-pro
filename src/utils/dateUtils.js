export const fmtDate = value => new Date(value + "T12:00").toLocaleDateString("pt-BR");

export const mKey = value => (value || "").slice(0, 7);

export const addMonthsToMonthKey = (monthKey, amount) => {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 1 + amount, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

export const addMonthsToDate = (dateKey, amount) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  const maxDay = new Date(year, month + amount, 0).getDate();
  return new Date(year, month - 1 + amount, Math.min(day, maxDay)).toISOString().slice(0, 10);
};

export const monthOffset = (monthKey, amount) => addMonthsToMonthKey(monthKey, amount);

export const monthCompare = (a, b) => a.localeCompare(b);

export const dateForMonthDay = (monthKey, day) => {
  const [year, month] = monthKey.split("-").map(Number);
  const maxDay = new Date(year, month, 0).getDate();
  const safeDay = Math.min(Math.max(parseInt(day) || 1, 1), maxDay);
  return new Date(year, month - 1, safeDay).toISOString().slice(0, 10);
};

export const formatMonthBR = monthKey => {
  if (!monthKey || !/^\d{4}-\d{2}$/.test(monthKey)) return monthKey || "Sem mês";
  return `${monthKey.slice(5, 7)}/${monthKey.slice(0, 4)}`;
};

export const isoToBrazilianDate = value => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return "";
  const [year, month, day] = String(value).split("-");
  return `${day}/${month}/${year}`;
};

export const brazilianDateToIso = value => {
  const raw = String(value || "").trim();
  const match = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return "";

  const [, dayText, monthText, yearText] = match;
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);

  if (year < 1900 || year > 2999 || month < 1 || month > 12 || day < 1) return "";

  const maxDay = new Date(year, month, 0).getDate();
  if (day > maxDay) return "";

  return `${yearText}-${monthText}-${dayText}`;
};

export const maskBrazilianDate = value => {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};
