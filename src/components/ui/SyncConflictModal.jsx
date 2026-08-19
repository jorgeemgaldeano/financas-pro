// SyncConflictModal.jsx — v0.3.38 Fase 4 (DEC-0044, decisão 2)
//
// Tela de conflito do merge de três vias: resumo por chave primeiro
// ("3 divergências em lançamentos"), detalhe item a item só ao expandir —
// decisão de desenho fixada antes do código, não escolha de UI solta.
// Nunca oferece "usar o mais recente": cada conflito exige local OU remoto,
// nunca os dois por omissão (DEC-0044 decisão 1 / DEC-0045 item 3).

import { useState } from "react";
import { C as DEFAULT_COLORS } from "../../theme/tokens.js";

const RÓTULO_CHAVE = {
  trans: "Lançamentos",
  contas: "Contas",
  cards: "Cartões",
  cats: "Categorias",
  pessoas: "Pessoas",
  dividas: "Dívidas",
  despPess: "Despesas compartilhadas",
  faturas: "Faturas",
  simulacoes: "Simulações",
  cofrinhos: "Cofrinhos",
  metas: "Metas",
  saldosIniciais: "Saldos iniciais",
  params: "Parâmetros",
};

function rotularChave(chave) {
  return RÓTULO_CHAVE[chave] || chave;
}

function formatarValor(v) {
  if (v === undefined) return "(removido)";
  if (v === null) return "(vazio)";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function agruparPorChave(conflitos) {
  const grupos = new Map();
  conflitos.forEach((c, indice) => {
    if (!grupos.has(c.chave)) grupos.set(c.chave, []);
    grupos.get(c.chave).push({ ...c, indice });
  });
  return [...grupos.entries()];
}

export function SyncConflictModal({ conflitos, onConfirmar, onCancelar, erro, colors = DEFAULT_COLORS }) {
  const [escolhas, setEscolhas] = useState(() => new Array(conflitos.length).fill(undefined));
  const [chaveExpandida, setChaveExpandida] = useState(null);

  if (!conflitos || conflitos.length === 0) return null;

  const grupos = agruparPorChave(conflitos);
  const totalResolvidos = escolhas.filter(Boolean).length;
  const tudoResolvido = totalResolvidos === conflitos.length;

  const escolher = (indice, valor) => {
    setEscolhas(prev => prev.map((e, i) => (i === indice ? valor : e)));
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,.72)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500,
      }}
    >
      <div
        style={{
          background: colors.surface, border: `1px solid ${colors.gold}66`, borderRadius: 14,
          padding: 24, width: 560, maxWidth: "94vw", maxHeight: "88vh", overflowY: "auto",
          boxShadow: "0 18px 60px rgba(0,0,0,.35)",
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 8 }}>⚠️</div>
        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4, color: colors.text }}>
          Sincronização com divergências
        </div>
        <div style={{ color: colors.soft, fontSize: 13, lineHeight: 1.5, marginBottom: 16 }}>
          Os dois dispositivos alteraram os mesmos dados. O que só um lado mudou já foi aplicado
          automaticamente — falta decidir {conflitos.length} {conflitos.length === 1 ? "item" : "itens"}
          {" "}onde os dois mudaram de forma diferente. Nada é gravado até você resolver todos.
        </div>

        {erro && (
          <div style={{
            background: `${colors.coral}22`, border: `1px solid ${colors.coral}66`, borderRadius: 8,
            padding: "10px 12px", fontSize: 13, color: colors.text, marginBottom: 14,
          }}>
            {erro}
          </div>
        )}

        {grupos.map(([chave, itens]) => {
          const resolvidosNaChave = itens.filter(it => escolhas[it.indice]).length;
          const expandida = chaveExpandida === chave;
          return (
            <div key={chave} style={{ border: `1px solid ${colors.border}`, borderRadius: 10, marginBottom: 10, overflow: "hidden" }}>
              <button
                onClick={() => setChaveExpandida(expandida ? null : chave)}
                style={{
                  width: "100%", background: colors.navy, border: "none", color: colors.text,
                  padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center",
                  cursor: "pointer", fontWeight: 700, fontSize: 14,
                }}
              >
                <span>{rotularChave(chave)} — {itens.length} {itens.length === 1 ? "divergência" : "divergências"}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, color: resolvidosNaChave === itens.length ? colors.emerald : colors.soft }}>
                    {resolvidosNaChave}/{itens.length} resolvidas
                  </span>
                  <span>{expandida ? "▲" : "▼"}</span>
                </span>
              </button>

              {expandida && (
                <div style={{ padding: "8px 14px 14px" }}>
                  {itens.map(item => (
                    <div key={item.indice} style={{ padding: "10px 0", borderTop: `1px solid ${colors.border}` }}>
                      <div style={{ fontSize: 12, color: colors.soft, marginBottom: 6 }}>{item.rotulo}</div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => escolher(item.indice, "local")}
                          style={{
                            flex: 1, textAlign: "left", padding: "8px 10px", borderRadius: 8, cursor: "pointer",
                            border: `2px solid ${escolhas[item.indice] === "local" ? colors.emerald : colors.border}`,
                            background: escolhas[item.indice] === "local" ? `${colors.emerald}22` : "transparent",
                            color: colors.text, fontSize: 13,
                          }}
                        >
                          <div style={{ fontSize: 11, color: colors.soft, marginBottom: 2 }}>Este dispositivo</div>
                          {formatarValor(item.local)}
                        </button>
                        <button
                          onClick={() => escolher(item.indice, "remoto")}
                          style={{
                            flex: 1, textAlign: "left", padding: "8px 10px", borderRadius: 8, cursor: "pointer",
                            border: `2px solid ${escolhas[item.indice] === "remoto" ? colors.emerald : colors.border}`,
                            background: escolhas[item.indice] === "remoto" ? `${colors.emerald}22` : "transparent",
                            color: colors.text, fontSize: 13,
                          }}
                        >
                          <div style={{ fontSize: 11, color: colors.soft, marginBottom: 2 }}>Outro dispositivo</div>
                          {formatarValor(item.remoto)}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button
            onClick={onCancelar}
            style={{
              flex: 1, background: "transparent", border: `1px solid ${colors.border}`, borderRadius: 8,
              color: colors.soft, padding: "10px 18px", fontWeight: 700, cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            disabled={!tudoResolvido}
            onClick={() => onConfirmar(escolhas)}
            style={{
              flex: 2, background: tudoResolvido ? colors.emerald : colors.muted, border: "none", borderRadius: 8,
              color: "#fff", padding: "10px 18px", fontWeight: 800,
              cursor: tudoResolvido ? "pointer" : "not-allowed",
            }}
          >
            {tudoResolvido ? "Aplicar e sincronizar" : `Resolva todas as divergências (${totalResolvidos}/${conflitos.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
