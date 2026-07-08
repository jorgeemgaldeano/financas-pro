// Toast.jsx — v0.3.32
//
// Toast leve com ação de "Desfazer", para dar feedback visível a ações
// destrutivas (mover lançamentos, excluir, desfazer lote) que antes eram
// silenciosas. O undo restaura um snapshot capturado ANTES da ação.

import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_COLORS = {
  surface: "#162640",
  border: "#1E3050",
  emerald: "#00A878",
  coral: "#E8504A",
  gold: "#F5B700",
  text: "#E8EDF4",
  soft: "#8FA8C0",
};

let toastSeq = 0;

export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  // pushToast({ message, tone, onUndo, undoLabel, durationMs }) → id
  const pushToast = useCallback((opts) => {
    const id = `toast_${++toastSeq}`;
    const duration = opts.durationMs ?? (opts.onUndo ? 7000 : 4000);
    setToasts((prev) => [...prev, { id, tone: "emerald", undoLabel: "Desfazer", ...opts }]);
    timers.current[id] = setTimeout(() => dismissToast(id), duration);
    return id;
  }, [dismissToast]);

  useEffect(() => () => {
    Object.values(timers.current).forEach(clearTimeout);
    timers.current = {};
  }, []);

  return { toasts, pushToast, dismissToast };
}

export function ToastHost({ toasts, onDismiss, onUndo, colors = DEFAULT_COLORS }) {
  const C = { ...DEFAULT_COLORS, ...colors };
  if (!toasts?.length) return null;
  return (
    <div
      style={{
        position: "fixed", left: 0, right: 0, bottom: 20, zIndex: 600,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8, pointerEvents: "none",
      }}
    >
      {toasts.map((t) => {
        const tone = C[t.tone] || C.emerald;
        return (
          <div
            key={t.id}
            style={{
              pointerEvents: "auto", background: C.surface, border: `1px solid ${tone}66`,
              borderLeft: `4px solid ${tone}`, borderRadius: 10, padding: "11px 14px",
              minWidth: 300, maxWidth: "92vw", boxShadow: "0 10px 34px rgba(0,0,0,.4)",
              display: "flex", alignItems: "center", gap: 14,
            }}
          >
            <div style={{ flex: 1, fontSize: 13, color: C.text, fontWeight: 600 }}>{t.message}</div>
            {t.onUndo && (
              <button
                onClick={() => { onUndo && onUndo(t); onDismiss(t.id); }}
                style={{
                  background: "transparent", border: `1px solid ${tone}`, borderRadius: 7,
                  color: tone, padding: "5px 12px", cursor: "pointer", fontWeight: 800, fontSize: 12,
                }}
              >
                {t.undoLabel}
              </button>
            )}
            <button
              onClick={() => onDismiss(t.id)}
              aria-label="Fechar"
              style={{ background: "transparent", border: "none", color: C.soft, cursor: "pointer", fontSize: 16, lineHeight: 1 }}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default ToastHost;
