const DEFAULT_COLORS = {
  navy: "#0F1E36",
  surface: "#162640",
  border: "#1E3050",
  emerald: "#00A878",
  coral: "#E8504A",
  gold: "#F5B700",
  muted: "#4A6380",
  text: "#E8EDF4",
  soft: "#8FA8C0",
};

export function requiredFieldInfo(nomeCampo, fieldKey) {
  return {
    nomeCampo,
    fieldKey,
    message: `Para prosseguir, preencha o campo ${nomeCampo}.`,
  };
}

export function highlightIfRequired(baseStyle, validationInfo, fieldKey, colors = DEFAULT_COLORS) {
  const active = validationInfo?.fieldKey === fieldKey;
  return {
    ...baseStyle,
    border: active ? `2px solid ${colors.coral}` : baseStyle.border,
    boxShadow: active ? `0 0 0 3px ${colors.coral}33` : baseStyle.boxShadow,
  };
}

export function RequiredFieldModal({ info, onClose, colors = DEFAULT_COLORS }) {
  if (!info) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 400,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: colors.surface,
          border: `1px solid ${colors.coral}66`,
          borderRadius: 14,
          padding: 24,
          width: 420,
          maxWidth: "92vw",
          boxShadow: "0 18px 60px rgba(0,0,0,.35)",
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 8 }}>⚠️</div>
        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8 }}>Campo obrigatório</div>
        <div style={{ color: colors.soft, fontSize: 14, lineHeight: 1.45, marginBottom: 18 }}>{info.message}</div>
        <button
          autoFocus
          onClick={onClose}
          style={{
            background: colors.coral,
            border: "none",
            borderRadius: 8,
            color: "#fff",
            padding: "9px 18px",
            fontWeight: 800,
            cursor: "pointer",
            width: "100%",
          }}
        >
          Entendi
        </button>
      </div>
    </div>
  );
}
