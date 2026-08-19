// PinGate.jsx — v0.3.39 (proposta T7/DEC-0047)
//
// Gate de PIN local, isolado de App.jsx por desenho: não lê nem escreve
// nenhum estado financeiro, só decide se renderiza `children`. Isso mantém a
// garantia de que o PIN nunca entra no payload de sync nem no backup (ver
// pinService.js). Sessão destrava "até fechar a aba" (decisão de Jorge,
// 2026-08-19): usa sessionStorage, que sobrevive a F5 mas não a fechar a aba.

import { useEffect, useState } from "react";
import { C } from "../../theme/tokens.js";
import { isPinConfigured, setPin, verifyPin, isSessionUnlocked, markSessionUnlocked } from "../../services/pinService.js";

const wrap = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: C.navy,
  padding: 20,
};

const card = {
  width: "100%",
  maxWidth: 320,
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: 12,
  padding: 24,
  display: "flex",
  flexDirection: "column",
  gap: 14,
};

const input = {
  background: C.navy,
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  padding: "10px 12px",
  color: C.text,
  fontSize: 20,
  letterSpacing: 4,
  textAlign: "center",
};

const button = {
  background: C.emerald,
  border: "none",
  borderRadius: 8,
  padding: "10px 12px",
  color: C.navy,
  fontWeight: 700,
  cursor: "pointer",
};

export function PinGate({ children }) {
  const [ready, setReady] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPinInput] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    setConfigured(isPinConfigured());
    setUnlocked(isSessionUnlocked());
    setReady(true);
  }, []);

  if (!ready) return null;
  if (unlocked) return children;

  if (!configured) {
    const handleSetup = async (e) => {
      e.preventDefault();
      setErro("");
      if (pin.length < 4) { setErro("O PIN precisa ter pelo menos 4 dígitos."); return; }
      if (pin !== confirmPin) { setErro("Os dois PINs não coincidem."); return; }
      await setPin(pin);
      markSessionUnlocked();
      setUnlocked(true);
    };
    return (
      <div style={wrap}>
        <form style={card} onSubmit={handleSetup}>
          <div style={{ fontWeight: 700, fontSize: 16, color: C.text }}>Defina um PIN de acesso</div>
          <div style={{ fontSize: 12, color: C.soft }}>
            Protege este dispositivo contra quem abrir a página sem querer. É local — não
            é enviado a nenhum servidor e não entra no backup.
          </div>
          <input style={input} type="password" inputMode="numeric" placeholder="Novo PIN" value={pin}
            onChange={e => setPinInput(e.target.value.replace(/\D/g, ""))} autoFocus />
          <input style={input} type="password" inputMode="numeric" placeholder="Confirme o PIN" value={confirmPin}
            onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ""))} />
          {erro && <div style={{ fontSize: 12, color: C.coral }}>{erro}</div>}
          <button type="submit" style={button}>Definir PIN</button>
        </form>
      </div>
    );
  }

  const handleUnlock = async (e) => {
    e.preventDefault();
    setErro("");
    const ok = await verifyPin(pin);
    if (!ok) { setErro("PIN incorreto."); setPinInput(""); return; }
    markSessionUnlocked();
    setUnlocked(true);
  };

  return (
    <div style={wrap}>
      <form style={card} onSubmit={handleUnlock}>
        <div style={{ fontWeight: 700, fontSize: 16, color: C.text }}>₪ Finanças PRO</div>
        <input style={input} type="password" inputMode="numeric" placeholder="PIN" value={pin}
          onChange={e => setPinInput(e.target.value.replace(/\D/g, ""))} autoFocus />
        {erro && <div style={{ fontSize: 12, color: C.coral }}>{erro}</div>}
        <button type="submit" style={button}>Entrar</button>
      </form>
    </div>
  );
}
