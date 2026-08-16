// CategorySelect.jsx — v0.3.37 Fase 4 (DEC-0038)
// Extraído de App.jsx: autocomplete de categoria (busca por caminho/nome,
// navegação por teclado, botão de limpar). Usado por 9 pontos diferentes
// do app — extraído para molecule antes do rollout de organisms para não
// duplicar em cada aba nova.
import { useEffect, useMemo, useState } from "react";
import { C } from "../../theme/tokens.js";
import { highlightIfRequired } from "../ui/RequiredFieldModal.jsx";
import { normText } from "../../services/categoryService.js";
import { catIcon, flattenCats } from "../../utils/categoryTreeUtils.js";

export function CategorySelect({ cats, value, onChange, style, validationInfo, fieldKey = "catId" }) {
  const flat = useMemo(() => flattenCats(cats), [cats]);
  const selectableCats = useMemo(() => flat.filter(f => !f.hasSubs), [flat]);
  const selected = useMemo(() => selectableCats.find(f => f.id === value) || null, [selectableCats, value]);
  const [query, setQuery] = useState(selected?.path || "");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setQuery(selected?.path || "");
    setOpen(false);
    setActiveIndex(0);
  }, [selected?.path]);

  const normalizeSearch = (text) => normText(String(text || ""));
  const searchText = normalizeSearch(query);
  const selectedText = normalizeSearch(selected?.path || "");
  const shouldSearch = searchText.length > 0 && searchText !== selectedText;

  const suggestions = useMemo(() => {
    if (!shouldSearch) return [];
    return selectableCats
      .filter(cat => normalizeSearch(cat.path).includes(searchText) || normalizeSearch(cat.nome).includes(searchText))
      .slice(0, 12);
  }, [selectableCats, searchText, shouldSearch]);

  const selectCategory = (cat) => {
    if (!cat) return;
    onChange(cat.id);
    setQuery(cat.path);
    setOpen(false);
    setActiveIndex(0);
  };

  const clearCategory = () => {
    onChange("");
    setQuery("");
    setOpen(false);
    setActiveIndex(0);
  };

  const baseStyle = highlightIfRequired({
    background: C.navy,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    color: C.text,
    padding: "8px 34px 8px 12px",
    fontSize: 14,
    width: "100%",
    outline: "none",
    ...style
  }, validationInfo, fieldKey);

  const wrapperStyle = {
    position: "relative",
    width: style?.width || "100%",
    minWidth: style?.width === "auto" ? 220 : undefined,
  };

  const finishEditing = () => {
    const text = query.trim();
    if (!text) {
      clearCategory();
      return;
    }
    const exact = selectableCats.find(cat => normalizeSearch(cat.path) === normalizeSearch(text) || normalizeSearch(cat.nome) === normalizeSearch(text));
    if (exact) {
      selectCategory(exact);
      return;
    }
    setQuery(selected?.path || "");
    setOpen(false);
    setActiveIndex(0);
  };

  return (
    <div style={wrapperStyle}>
      <input
        type="text"
        value={query}
        placeholder="Digite para buscar categoria"
        style={baseStyle}
        autoComplete="off"
        role="combobox"
        aria-expanded={open && suggestions.length > 0}
        aria-autocomplete="list"
        onFocus={e => {
          setOpen(false);
          if (selected?.path) e.currentTarget.select();
        }}
        onChange={e => {
          const next = e.target.value;
          setQuery(next);
          setActiveIndex(0);
          if (!next.trim()) {
            onChange("");
            setOpen(false);
            return;
          }
          setOpen(true);
        }}
        onKeyDown={e => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setActiveIndex(i => Math.min(i + 1, Math.max(0, suggestions.length - 1)));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex(i => Math.max(i - 1, 0));
          } else if (e.key === "Enter") {
            if (open && suggestions[activeIndex]) {
              e.preventDefault();
              selectCategory(suggestions[activeIndex]);
            }
          } else if (e.key === "Escape") {
            setOpen(false);
            setQuery(selected?.path || "");
          }
        }}
        onBlur={() => {
          window.setTimeout(() => {
            finishEditing();
          }, 140);
        }}
      />
      {query && (
        <button
          type="button"
          title="Limpar categoria"
          onMouseDown={e => e.preventDefault()}
          onClick={clearCategory}
          style={{
            position: "absolute",
            right: 7,
            top: "50%",
            transform: "translateY(-50%)",
            width: 22,
            height: 22,
            borderRadius: 999,
            border: `1px solid ${C.border}`,
            background: C.surface,
            color: C.soft,
            cursor: "pointer",
            fontSize: 13,
            lineHeight: "18px",
          }}
        >×</button>
      )}
      {open && shouldSearch && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 4px)",
          left: 0,
          right: 0,
          zIndex: 500,
          maxHeight: 240,
          overflowY: "auto",
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          boxShadow: "0 12px 28px rgba(0,0,0,0.35)",
        }}>
          {suggestions.length > 0 ? suggestions.map((cat, idx) => (
            <button
              key={cat.id}
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={() => selectCategory(cat)}
              style={{
                width: "100%",
                textAlign: "left",
                background: idx === activeIndex ? C.border : "transparent",
                border: "none",
                color: C.text,
                padding: "8px 10px",
                cursor: "pointer",
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>{cat.icon || catIcon(cats, cat.id)}</span>
              <span style={{ flex: 1 }}>{cat.path}</span>
            </button>
          )) : (
            <div style={{ color: C.soft, fontSize: 12, padding: "9px 10px" }}>Nenhuma categoria encontrada.</div>
          )}
        </div>
      )}
    </div>
  );
}

export default CategorySelect;
