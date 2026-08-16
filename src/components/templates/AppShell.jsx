// AppShell.jsx — v0.3.37 Fase 5 (DEC-0038)
// Template da aplicação: moldura fixa (aviso de persistência, sidebar com
// logo/navegação/atalho de lançamento, topbar com título e navegação de
// mês) em volta de um slot de conteúdo. Extraído do return de App().
//
// A configuração de navegação (TABS, TAB_ICONS, NAV_LABELS) mora aqui
// porque é puramente apresentacional: o App.jsx continua dono do estado
// `tab` e de qual organism renderizar para cada id.
//
// `children` = conteúdo da aba. `overlays` = nós que no return original
// eram irmãos da sidebar dentro do container raiz (RequiredFieldModal,
// ToastHost, ModalHost) — recebidos por prop para manter a estrutura de
// DOM idêntica à de antes da extração.
import { C } from "../../theme/tokens.js";
import { MONTHS } from "../../utils/dateUtils.js";

export const TABS = [
  { id:"dashboard",   label:"Dashboard" },
  { id:"lancamentos", label:"Lançamentos" },
  { id:"recorrencias",label:"🔁 Recorrências" },
  { id:"contas",      label:"🏦 Contas" },
  { id:"cartoes",     label:"💳 Cartões" },
  { id:"metas",       label:"🎯 Metas" },
  { id:"cofrinhos",   label:"🐷 Cofrinhos" },
  { id:"pessoas",     label:"👥 Pessoas" },
  { id:"projecoes",   label:"Projeções" },
  { id:"simulacoes",  label:"🔬 Simulações" },
  { id:"importacao",  label:"📥 Importar" },
  { id:"parametros",  label:"⚙️ Parâmetros" },
];

const TAB_ICONS = { dashboard:"◈", lancamentos:"≡", recorrencias:"🔁", contas:"🏦", cartoes:"💳", metas:"🎯", cofrinhos:"🐷", pessoas:"👥", projecoes:"↗", simulacoes:"🔬", importacao:"📥", parametros:"⚙️" };

const NAV_LABELS = { dashboard:"Dashboard", lancamentos:"Lançamentos", recorrencias:"Recorrências", contas:"Contas", cartoes:"Cartões", metas:"Metas", pessoas:"Pessoas", projecoes:"Projeções", simulacoes:"Simulações", importacao:"Importar", parametros:"Parâmetros" };

export function AppShell({
  appVersion, persistError, setPersistError,
  tab, setTab, selMon, selYear, prevMonth, nextMonth,
  openAddTrans, btn,
  children, overlays,
}) {
  return (
    <div style={{ minHeight:"100vh", background:C.navy, color:C.text, fontFamily:"'Inter',system-ui,sans-serif", display:"flex" }}>

      {/* ── v0.3.26.7 · L6: aviso de falha de persistência ── */}
      {persistError&&<div style={{ position:"fixed", top:0, left:0, right:0, zIndex:9999, background:C.coral, color:"#fff", padding:"10px 16px", display:"flex", alignItems:"center", justifyContent:"center", gap:12, fontSize:13, fontWeight:600, boxShadow:"0 2px 8px rgba(0,0,0,0.3)" }}><span>⚠️ Falha ao salvar no navegador (armazenamento cheio ou bloqueado). Suas últimas alterações podem não ter sido gravadas. Faça um backup em Parâmetros e libere espaço.</span><button onClick={()=>setPersistError(false)} style={{ background:"rgba(255,255,255,0.25)", border:"none", borderRadius:6, color:"#fff", padding:"4px 10px", cursor:"pointer", fontWeight:700 }}>Entendi</button></div>}

      {/* ── Sidebar ── */}
      <div style={{ width:200, flexShrink:0, background:C.surface, borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", minHeight:"100vh", position:"sticky", top:0, height:"100vh", overflowY:"auto" }}>

        {/* Logo */}
        <div style={{ padding:"18px 16px 14px", borderBottom:`1px solid ${C.border}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:9 }}>
            <div style={{ width:30, height:30, borderRadius:8, background:`linear-gradient(135deg,${C.emerald},#007a57)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, flexShrink:0 }}>₪</div>
            <div>
              <div style={{ fontWeight:800, fontSize:14, letterSpacing:"-0.02em", lineHeight:1.1 }}>FinançasPRO</div>
              <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:2, flexWrap:"wrap" }}>
                <span style={{ fontSize:9, color:C.emerald }}>● salvo</span>
                <span title="Versão do aplicativo" style={{ fontSize:9, color:C.gold, background:C.gold+"22", border:`1px solid ${C.gold}44`, borderRadius:999, padding:"1px 6px", fontWeight:800 }}>v{appVersion}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navegação */}
        <nav style={{ flex:1, padding:"10px 8px", display:"flex", flexDirection:"column", gap:2 }}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              display:"flex", alignItems:"center", gap:9,
              background: tab===t.id ? C.emerald+"18" : "transparent",
              border: "none",
              borderLeft: `3px solid ${tab===t.id ? C.emerald : "transparent"}`,
              borderRadius: "0 8px 8px 0",
              color: tab===t.id ? C.emerald : C.soft,
              padding:"9px 12px 9px 13px",
              cursor:"pointer", fontWeight: tab===t.id ? 700 : 500,
              fontSize:13, textAlign:"left", width:"100%",
              transition:"all .15s",
            }}>
              <span style={{ fontSize:14, width:18, textAlign:"center", flexShrink:0 }}>{TAB_ICONS[t.id]}</span>
              <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{NAV_LABELS[t.id]||t.label}</span>
            </button>
          ))}
        </nav>

        {/* Botão + Lançamento no rodapé da sidebar */}
        <div style={{ padding:"12px 10px", borderTop:`1px solid ${C.border}` }}>
          <button onClick={openAddTrans} style={{ ...btn(C.emerald), width:"100%", fontSize:13, padding:"9px 0", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
            <span style={{ fontSize:16 }}>+</span> Lançamento
          </button>
        </div>
      </div>

      {/* ── Conteúdo principal ── */}
      <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column" }}>

        {/* Topbar: mês + título */}
        <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:"0 24px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div style={{ fontWeight:700, fontSize:15, color:C.text }}>
            {TABS.find(t=>t.id===tab)?.label}
          </div>
          {tab!=="parametros"&&(
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <button onClick={prevMonth} style={btn(C.border,{ padding:"4px 10px", fontSize:14 })}>‹</button>
              <span style={{ fontWeight:700, fontSize:14, minWidth:120, textAlign:"center" }}>{MONTHS[selMon-1]} {selYear}</span>
              <button onClick={nextMonth} style={btn(C.border,{ padding:"4px 10px", fontSize:14 })}>›</button>
            </div>
          )}
        </div>

        {/* Área de conteúdo das abas */}
        <div style={{ flex:1, padding:"22px 24px", overflowY:"auto" }}>
          {children}
        </div>
      </div>

      {overlays}
    </div>
  );
}
