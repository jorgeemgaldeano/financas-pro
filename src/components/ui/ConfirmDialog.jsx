// ConfirmDialog.jsx — v0.3.32
//
// Modal de confirmação reutilizável, substituindo os window.confirm/alert
// nativos espalhados pelo App.jsx. Aceita `children` para casos que precisam
// de um controle extra (ex.: escolher o cartão/conta de destino ao mover
// lançamentos antes de excluir). Segue o padrão visual de RequiredFieldModal.

const DEFAULT_COLORS = {
  surface: "#162640",
  border: "#1E3050",
  navy: "#0F1E36",
  emerald: "#00A878",
  coral: "#E8504A",
  gold: "#F5B700",
  text: "#E8EDF4",
  soft: "#8FA8C0",
};

// props:
//  open, title, message, icon, children,
//  confirmLabel, cancelLabel, tone ("coral" | "emerald" | "gold"),
//  confirmDisabled, onConfirm, onCancel, colors
export function ConfirmDialog({
  open,
  title,
  message,
  icon = "⚠️",
  children,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "coral",
  confirmDisabled = false,
  onConfirm,
  onCancel,
  colors = DEFAULT_COLORS,
}) {
  if (!open) return null;
  const C = { ...DEFAULT_COLORS, ...colors };
  const toneColor = C[tone] || C.coral;

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,.72)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500,
      }}
      onClick={(e) => e.target === e.currentTarget && onCancel && onCancel()}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          background: C.surface, border: `1px solid ${toneColor}66`, borderRadius: 14,
          padding: 24, width: 460, maxWidth: "92vw", boxShadow: "0 18px 60px rgba(0,0,0,.35)",
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
        {title && <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8 }}>{title}</div>}
        {message && (
          <div style={{ color: C.soft, fontSize: 14, lineHeight: 1.45, marginBottom: children ? 14 : 18 }}>
            {message}
          </div>
        )}
        {children && <div style={{ marginBottom: 18 }}>{children}</div>}
        <div style={{ display: "flex", gap: 10 }}>
          {cancelLabel !== "" && (
            <button
              onClick={onCancel}
              style={{
                flex: 1, background: "transparent", border: `1px solid ${C.border}`,
                borderRadius: 9, color: C.text, padding: "10px 14px", cursor: "pointer", fontWeight: 700,
              }}
            >
              {cancelLabel}
            </button>
          )}
          <button
            onClick={confirmDisabled ? undefined : onConfirm}
            disabled={confirmDisabled}
            style={{
              flex: 1, background: confirmDisabled ? C.border : toneColor, border: "none",
              borderRadius: 9, color: "#fff", padding: "10px 14px",
              cursor: confirmDisabled ? "not-allowed" : "pointer", fontWeight: 800,
              opacity: confirmDisabled ? 0.6 : 1,
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
