// MonthShortInput.jsx — v0.3.37 Fase 4 (DEC-0038)
// Extraído de App.jsx: input compacto de mês/ano (MM/AA), usado nos
// filtros de período da aba Projeções.
import { useEffect, useState } from "react";

function formatMonthShort(monthKey) {
  if (!/^\d{4}-\d{2}$/.test(String(monthKey || ""))) return "";
  const [year, month] = monthKey.split("-");
  return `${month}/${year.slice(2)}`;
}

function parseMonthShort(text) {
  const digits = String(text || "").replace(/\D/g, "").slice(0, 4);
  if (digits.length !== 4) return null;

  const month = parseInt(digits.slice(0, 2), 10);
  const yearSuffix = parseInt(digits.slice(2, 4), 10);

  if (!Number.isFinite(month) || month < 1 || month > 12 || !Number.isFinite(yearSuffix)) {
    return null;
  }

  const year = 2000 + yearSuffix;
  return `${year}-${String(month).padStart(2, "0")}`;
}

function maskMonthShort(text) {
  const digits = String(text || "").replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function MonthShortInput({ value, onChange, style, ...props }) {
  const [text, setText] = useState(formatMonthShort(value));

  useEffect(() => {
    setText(formatMonthShort(value));
  }, [value]);

  const commit = (nextText = text) => {
    const parsed = parseMonthShort(nextText);
    if (parsed) {
      onChange(parsed);
      setText(formatMonthShort(parsed));
      return;
    }
    setText(formatMonthShort(value));
  };

  return (
    <input
      {...props}
      type="text"
      inputMode="numeric"
      maxLength={5}
      placeholder="MM/AA"
      value={text}
      style={{ ...style, width: 78, minWidth: 78, textAlign: "center" }}
      onChange={e => {
        const masked = maskMonthShort(e.target.value);
        setText(masked);
        const parsed = parseMonthShort(masked);
        if (parsed) onChange(parsed);
      }}
      onBlur={() => commit()}
      onKeyDown={e => {
        if (e.key === "Enter") {
          e.currentTarget.blur();
        }
      }}
    />
  );
}

export default MonthShortInput;
