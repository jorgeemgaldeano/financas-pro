// PessoasTab.jsx — v0.3.37 Fase 5 (DEC-0038)
// Extraído de App.jsx (aba "Pessoas"), última função de organism que
// ainda vivia dentro do App.jsx no padrão antigo. Movimentação pura: o
// contrato de props (incluindo C/uid/fmtBRL/fmtDate recebidos por
// parâmetro) foi preservado exatamente como estava.
import { useState, useMemo, useEffect } from "react";
import { RequiredFieldModal, requiredFieldInfo, highlightIfRequired } from "../ui/RequiredFieldModal.jsx";
import { DateInput } from "../ui/DateInput.jsx";
import { moneyToNumber } from "../../utils/moneyUtils.js";
import { addMonthsToMonthKey, dateForMonthDay, formatMonthBR, mKey, todayIso } from "../../utils/dateUtils.js";
import { getOrphanDividas } from "../../utils/dividaUtils.js";
import { MoneyInput } from "../atoms/MoneyInput.jsx";
import { CategorySelect } from "../molecules/CategorySelect.jsx";
export function PessoasTab({ pessoas, setPessoas, dividas, setDividas, despPess, setDespPess,
                      cards, cats, getCatColor, getCatIcon, getCatLabel,
                      fmtBRL, fmtDate, lbl, big, card, btn, inp, ghost, C, uid, selMonth }) {
  const [view,        setView]       = useState("lista");      // lista | pessoa
  const [selPId,      setSelPId]     = useState(null);
  const [showNovaPes, setShowNovaPes]= useState(false);
  const [novaPes,     setNovaPes]    = useState({ nome:"", cor:"#7C3AED", icon:"👤" });

  // Modal amortização
  const [modalAmort,  setModalAmort] = useState(null); // dividaId
  const [amortForm,   setAmortForm]  = useState({ valor:"", data:"", modo:"Pix", obs:"" });

  // Modal nova dívida
  const [modalDiv,    setModalDiv]   = useState(false);
  const [divForm,     setDivForm]    = useState({ descricao:"", total:"", dataInicio:"" });

  // Modal nova despesa/receita compartilhada
  const novoDespForm = () => ({
    tipo:"receita", descricao:"", valor:"", data:todayIso(),
    cartaoId:"", catId:"", status:"pendente",
    parcelado:false, modoParc:"total", parcelas:"",
    fixo:false, fixoDia:"", fixoMeses:12
  });
  const [modalDesp,   setModalDesp]  = useState(false);
  const [despForm,    setDespForm]   = useState(novoDespForm);
  const [expandedSharedMonth, setExpandedSharedMonth] = useState(selMonth);
  const [requiredModal, setRequiredModal] = useState(null);
  const [modalHistorico, setModalHistorico] = useState(false);

  const MODOS_AMORT = ["Pix","Transferência","Dinheiro","TED/DOC","Outro"];
  const CORES_PES   = ["#7C3AED","#DB2777","#0891B2","#00A878","#F97316","#E8504A","#F5B700","#6366F1","#84CC16","#EC4899"];
  const ICONS_PES   = ["👤","👨","👩","👦","👧","🧑","👴","👵","🧔","💼","🤝","👫","👨‍💼","👩‍💼"];

  const selMon = selMonth; // "YYYY-MM"

  useEffect(() => {
    setExpandedSharedMonth(selMon);
  }, [selMon, selPId]);

  // Helpers
  const pagoPorDivida = d => (d.amortizacoes||[]).reduce((s,a)=>s+a.valor,0);
  const pendPorDivida = d => Math.max(0, d.total - pagoPorDivida(d));
  const pessoaById   = id => pessoas.find(p=>p.id===id);
  const despMonthKey = d => d.competencia || mKey(d.data);
  const despTipo = d => d.tipo || "receita";
  const despQuitado = d => d.status === "recebido" || d.status === "pago";
  const statusQuitadoPorTipo = tipo => tipo === "despesa" ? "pago" : "recebido";
  const resetDespForm = () => setDespForm(novoDespForm());
  const requireDespField = (condition, nomeCampo, fieldKey) => {
    if (!condition) {
      setRequiredModal(requiredFieldInfo(nomeCampo, fieldKey));
      return false;
    }
    return true;
  };

  const despParcPreview = useMemo(()=>{
    if(!despForm.parcelado||!despForm.data) return [];
    const n = Math.max(2, parseInt(despForm.parcelas)||2);
    const [py,pm2,pd] = despForm.data.split("-").map(Number);
    const vp = despForm.modoParc === "total" ? moneyToNumber(despForm.valor)/n : moneyToNumber(despForm.valor);
    return Array.from({length:n},(_,i)=>{
      const dt = new Date(py, pm2-1+i, pd);
      return { data:dt.toISOString().slice(0,10), valor:parseFloat((vp||0).toFixed(2)) };
    });
  },[despForm.parcelado,despForm.data,despForm.parcelas,despForm.valor,despForm.modoParc]);

  const despRecPreview = useMemo(()=>{
    if(!despForm.fixo||!despForm.fixoDia) return [];
    const meses = Math.max(2, parseInt(despForm.fixoMeses)||12);
    const dia = Math.min(Math.max(parseInt(despForm.fixoDia)||1,1),31);
    return Array.from({length:Math.min(4,meses)},(_,i)=>{
      const mes = addMonthsToMonthKey(selMon, i);
      return { mes, data:dateForMonthDay(mes, dia), valor:moneyToNumber(despForm.valor) };
    });
  },[despForm.fixo,despForm.fixoDia,despForm.fixoMeses,despForm.valor,selMon]);

  // Totais globais
  const totalEmAberto   = dividas.filter(d=>d.status==="aberta").reduce((s,d)=>s+pendPorDivida(d),0);
  const totalDividas    = dividas.reduce((s,d)=>s+d.total,0);
  const totalPago       = dividas.reduce((s,d)=>s+pagoPorDivida(d),0);
  const despMes         = despPess.filter(d=>!d.historico && despMonthKey(d)===selMon);
  const totalDespMesPend= despMes.filter(d=>d.status==="pendente").reduce((s,d)=>s+(Number(d.valor)||0),0);
  const totalDespMesRec = despMes.filter(d=>despQuitado(d)).reduce((s,d)=>s+(Number(d.valor)||0),0);

  const dividasOrfas = getOrphanDividas(dividas, pessoas);

  // Per-person summary for lista view
  const pessoasSummary = pessoas.map(p=>{
    const pdivs   = dividas.filter(d=>d.pessoaId===p.id);
    const pdesps  = despMes.filter(d=>d.pessoaId===p.id);
    const emAberto= pdivs.filter(d=>d.status==="aberta").reduce((s,d)=>s+pendPorDivida(d),0);
    const despPend= pdesps.filter(d=>d.status==="pendente").reduce((s,d)=>s+d.valor,0);
    return { ...p, emAberto, despPend, ndivs:pdivs.length, ndesps:pdesps.length };
  });

  // ── CRUD helpers ─────────────────────────────────────────────────────────────
  const addPessoa = () => {
    if(!novaPes.nome.trim()) return;
    setPessoas(p=>[...p,{ id:"p"+uid(), ...novaPes, nome:novaPes.nome.trim() }]);
    setNovaPes({ nome:"", cor:"#7C3AED", icon:"👤" });
    setShowNovaPes(false);
  };
  const delPessoa = id => {
    if(!window.confirm("Remover esta pessoa e todos os seus registros?")) return;
    setPessoas(p=>p.filter(x=>x.id!==id));
    setDividas(p=>p.filter(x=>x.pessoaId!==id));
    setDespPess(p=>p.filter(x=>x.pessoaId!==id));
    if(selPId===id){ setSelPId(null); setView("lista"); }
  };

  const addDivida = () => {
    if(!divForm.descricao||!divForm.total||!divForm.dataInicio) return;
    setDividas(p=>[...p,{ id:"d"+uid(), pessoaId:selPId, descricao:divForm.descricao,
      total:moneyToNumber(divForm.total), dataInicio:divForm.dataInicio, status:"aberta", amortizacoes:[] }]);
    setDivForm({ descricao:"", total:"", dataInicio:"" }); setModalDiv(false);
  };
  const toggleStatusDiv = (divId) => {
    setDividas(p=>p.map(d=>d.id===divId?{...d,status:d.status==="aberta"?"quitada":"aberta"}:d));
  };
  const delDivida = id => {
    if(!window.confirm("Remover esta dívida?")) return;
    setDividas(p=>p.filter(d=>d.id!==id));
  };

  const addAmort = () => {
    if(!amortForm.valor||!amortForm.data) return;
    setDividas(p=>p.map(d=>{
      if(d.id!==modalAmort) return d;
      const amorts = [...(d.amortizacoes||[]), { id:"a"+uid(), data:amortForm.data, valor:moneyToNumber(amortForm.valor), modo:amortForm.modo, obs:amortForm.obs }];
      const totalPago2 = amorts.reduce((s,a)=>s+a.valor,0);
      return { ...d, amortizacoes:amorts, status: totalPago2>=d.total?"quitada":d.status };
    }));
    setAmortForm({ valor:"", data:"", modo:"Pix", obs:"" }); setModalAmort(null);
  };
  const delAmort = (divId, amortId) => {
    setDividas(p=>p.map(d=>d.id!==divId?d:{...d, amortizacoes:d.amortizacoes.filter(a=>a.id!==amortId)}));
  };

  const addDesp = () => {
    if(!requireDespField(Boolean(despForm.descricao?.trim()), "Descrição", "despDescricao")) return;
    if(!requireDespField(moneyToNumber(despForm.valor)>0, "Valor", "despValor")) return;
    if(!requireDespField(Boolean(despForm.catId), "Categoria", "despCatId")) return;
    if(despForm.parcelado && !requireDespField(Boolean(despForm.parcelas) && parseInt(despForm.parcelas, 10) >= 2, "Número de parcelas", "despParcelas")) return;
    if(!despForm.fixo && !requireDespField(Boolean(despForm.data), "Data", "despData")) return;
    if(despForm.fixo && !requireDespField(Boolean(despForm.fixoDia) && parseInt(despForm.fixoDia)>=1 && parseInt(despForm.fixoDia)<=31, "Dia do mês", "despFixoDia")) return;

    const tipo = despForm.tipo || "receita";
    const valorInformado = moneyToNumber(despForm.valor);
    const base = {
      pessoaId:selPId,
      tipo,
      descricao:despForm.descricao.trim(),
      catId:despForm.catId,
      cartaoId:despForm.cartaoId || "",
      status:despForm.status || "pendente",
      valorPago:despForm.status === "pendente" ? 0 : valorInformado
    };

    if(despForm.parcelado){
      const n = Math.max(2, parseInt(despForm.parcelas)||2);
      const [py,pm2,pd] = despForm.data.split("-").map(Number);
      const vp = despForm.modoParc === "total" ? valorInformado/n : valorInformado;
      const grp = uid();
      setDespPess(p=>[...p,...Array.from({length:n},(_,i)=>{
        const dt = new Date(py, pm2-1+i, pd);
        const data = dt.toISOString().slice(0,10);
        const valor = parseFloat(vp.toFixed(2));
        return { ...base, id:"dp"+uid(), valor, valorPago:base.status==="pendente"?0:valor, data, competencia:mKey(data),
          parcelado:true, fixo:false, modoParc:despForm.modoParc, parcela:i+1, totalParcelas:n, parcelaGrupo:grp };
      })]);
    } else if(despForm.fixo){
      const dia = Math.min(Math.max(parseInt(despForm.fixoDia)||1,1),31);
      const meses = Math.max(2, parseInt(despForm.fixoMeses)||12);
      const valor = parseFloat(valorInformado.toFixed(2));
      const grp = uid();
      setDespPess(p=>[...p,...Array.from({length:meses},(_,i)=>{
        const mes = addMonthsToMonthKey(selMon, i);
        const data = dateForMonthDay(mes, dia);
        return { ...base, id:"dp"+uid(), valor, valorPago:base.status==="pendente"?0:valor, data, competencia:mes,
          parcelado:false, fixo:true, fixoDia:dia, parcela:i+1, totalParcelas:meses, parcelaGrupo:grp };
      })]);
    } else {
      const valor = parseFloat(valorInformado.toFixed(2));
      setDespPess(p=>[...p,{ ...base, id:"dp"+uid(), valor, valorPago:base.status==="pendente"?0:valor, data:despForm.data, competencia:mKey(despForm.data), parcelado:false, fixo:false }]);
    }

    resetDespForm();
    setModalDesp(false);
  };
  const toggleStatusDesp = id => setDespPess(prev=>{
    const alvo = prev.find(d=>d.id===id);
    if(!alvo) return prev;
    const mesAlvo = despMonthKey(alvo);
    const pessoaAlvo = alvo.pessoaId;
    const atualizado = prev.map(d=>{
      if(d.id!==id) return d;
      const quitado = despQuitado(d);
      const novoStatus = quitado ? "pendente" : statusQuitadoPorTipo(despTipo(d));
      return { ...d, historico:false, status:novoStatus, valorPago:quitado?0:(Number(d.valor)||0) };
    });
    const grupoMes = atualizado.filter(d=>d.pessoaId===pessoaAlvo && despMonthKey(d)===mesAlvo);
    const todasPendenciasBaixadas = grupoMes.length>0 && grupoMes.every(d=>despQuitado(d));
    if(!todasPendenciasBaixadas) return atualizado;
    const historicoEm = new Date().toISOString();
    return atualizado.map(d=>d.pessoaId===pessoaAlvo && despMonthKey(d)===mesAlvo ? { ...d, historico:true, historicoEm } : d);
  });
  const delDesp = id => { if(window.confirm("Remover este lançamento compartilhado?")) setDespPess(p=>p.filter(d=>d.id!==id)); };

  // Shared styles
  const s = {
    card2: (x={})=>({ background:"#162640", border:"1px solid #1E3050", borderRadius:12, padding:"16px 18px", ...x }),
    badge: (col)=>({ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20, background:col+"22", color:col }),
    row: { display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 },
    tag: (col)=>({ fontSize:11, fontWeight:700, background:col+"22", color:col, padding:"3px 9px", borderRadius:20 }),
  };

  // ── LISTA view ────────────────────────────────────────────────────────────────
  if(view==="lista") return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

      {/* KPIs globais */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:12 }}>
        {[
          { l:"Total de Dívidas",   v:fmtBRL(totalDividas),    col:C.text },
          { l:"Total Pago",         v:fmtBRL(totalPago),       col:C.emerald },
          { l:"Em Aberto",          v:fmtBRL(totalEmAberto),   col:C.coral },
          { l:"Despesas do Mês",    v:fmtBRL(totalDespMesPend+totalDespMesRec), col:"#CE93D8" },
          { l:"Pendente Mês",       v:fmtBRL(totalDespMesPend),col:C.gold },
        ].map(k=>(
          <div key={k.l} style={s.card2()}>
            <div style={lbl}>{k.l}</div>
            <div style={{ fontSize:18, fontWeight:800, color:k.col, lineHeight:1.2 }}>{k.v}</div>
          </div>
        ))}
      </div>

      {/* Dívidas sem pessoa vinculada (dados órfãos) */}
      {dividasOrfas.length>0 && (
        <div style={{ ...s.card2(), border:`1px solid ${C.coral}` }}>
          <div style={{ fontWeight:700, fontSize:14, color:C.coral, marginBottom:10 }}>⚠️ Dívidas sem pessoa vinculada</div>
          <div style={{ fontSize:12, color:C.soft, marginBottom:12 }}>Estas dívidas estão incluídas no "Total de Dívidas" acima, mas não pertencem a nenhuma pessoa cadastrada atualmente. Revise e exclua se não forem mais necessárias.</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {dividasOrfas.map(d=>(
              <div key={d.id} style={{ ...s.row, background:C.navy, borderRadius:8, padding:"9px 12px" }}>
                <div>
                  <div style={{ fontWeight:600, fontSize:13 }}>{d.descricao||"Dívida sem descrição"}</div>
                  <div style={{ fontSize:11, color:C.soft }}>Pendente: {fmtBRL(pendPorDivida(d))} · Total: {fmtBRL(d.total)}</div>
                </div>
                <button onClick={()=>delDivida(d.id)} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:15 }}>×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de pessoas */}
      <div style={s.card2()}>
        <div style={{ ...s.row, marginBottom:14 }}>
          <div style={{ fontWeight:700, fontSize:15 }}>Pessoas</div>
          <button onClick={()=>setShowNovaPes(v=>!v)} style={btn(C.emerald,{ fontSize:12, padding:"6px 13px" })}>+ Adicionar</button>
        </div>

        {/* Formulário nova pessoa */}
        {showNovaPes&&(
          <div style={{ background:C.navy, borderRadius:10, padding:"13px 15px", marginBottom:14 }}>
            <div style={{ fontWeight:600, fontSize:13, marginBottom:10 }}>Nova pessoa</div>
            <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
              <input style={inp} placeholder="Nome" value={novaPes.nome} onChange={e=>setNovaPes(f=>({...f,nome:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addPessoa()}/>
              <div>
                <div style={lbl}>Ícone</div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {ICONS_PES.map(ic=><button key={ic} onClick={()=>setNovaPes(f=>({...f,icon:ic}))} style={{ fontSize:18, background:novaPes.icon===ic?C.border:"transparent", border:`1px solid ${novaPes.icon===ic?C.soft:C.border}`, borderRadius:6, padding:"3px 6px", cursor:"pointer" }}>{ic}</button>)}
                </div>
              </div>
              <div>
                <div style={lbl}>Cor</div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {CORES_PES.map(cor=><div key={cor} onClick={()=>setNovaPes(f=>({...f,cor}))} style={{ width:22, height:22, borderRadius:5, background:cor, cursor:"pointer", border:novaPes.cor===cor?"2px solid #fff":"2px solid transparent" }}/>)}
                </div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={addPessoa} style={btn(C.emerald,{ flex:1, fontSize:13, padding:"7px 0" })}>Salvar</button>
                <button onClick={()=>setShowNovaPes(false)} style={btn(C.border,{ flex:1, fontSize:13, padding:"7px 0" })}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {/* Cards por pessoa */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:10 }}>
          {pessoasSummary.map(p=>(
            <div key={p.id} style={{ background:C.navy, borderRadius:10, padding:"13px 15px", borderLeft:`3px solid ${p.cor}`, cursor:"pointer" }}
              onClick={()=>{ setSelPId(p.id); setView("pessoa"); }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:p.cor+"22", border:`2px solid ${p.cor}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{p.icon}</div>
                  <div style={{ fontWeight:700 }}>{p.nome}</div>
                </div>
                <button onClick={e=>{e.stopPropagation();delPessoa(p.id);}} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:16 }}>×</button>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                <div style={{ background:C.surface, borderRadius:7, padding:"7px 9px" }}>
                  <div style={{ fontSize:9, color:C.soft, marginBottom:2, textTransform:"uppercase" }}>Dívidas abertas</div>
                  <div style={{ fontSize:14, fontWeight:800, color:p.emAberto>0?C.coral:C.soft }}>{fmtBRL(p.emAberto)}</div>
                </div>
                <div style={{ background:C.surface, borderRadius:7, padding:"7px 9px" }}>
                  <div style={{ fontSize:9, color:C.soft, marginBottom:2, textTransform:"uppercase" }}>Pendente mês</div>
                  <div style={{ fontSize:14, fontWeight:800, color:p.despPend>0?C.gold:C.soft }}>{fmtBRL(p.despPend)}</div>
                </div>
              </div>
              <div style={{ fontSize:11, color:C.soft, marginTop:8 }}>{p.ndivs} dívida(s) · {p.ndesps} despesa(s) no mês</div>
            </div>
          ))}
          {pessoas.length===0&&<div style={{ color:C.soft, fontSize:13, padding:20 }}>Nenhuma pessoa cadastrada.</div>}
        </div>
      </div>
    </div>
  );

  // ── PESSOA view ───────────────────────────────────────────────────────────────
  const pessoa = pessoaById(selPId);
  if(!pessoa) return null;
  const pdivs  = dividas.filter(d=>d.pessoaId===selPId);
  const pdespsHistorico = despPess.filter(d=>d.pessoaId===selPId && d.historico);
  const pdesps = despPess.filter(d=>d.pessoaId===selPId && !d.historico);
  const despMesP = pdesps.filter(d=>despMonthKey(d)===selMon);
  const resumoCompartilhadoMesesMap = pdesps.reduce((map, d) => {
    const mes = despMonthKey(d) || "Sem mês";
    if (!map[mes]) {
      map[mes] = {
        mes,
        itens: [],
        aReceber: 0,
        aPagar: 0,
        recebidoOuPago: 0,
        pendenteReceber: 0,
        pendentePagar: 0,
        totalPendente: 0,
      };
    }
    const valor = Number(d.valor) || 0;
    const pago = Number(d.valorPago) || (despQuitado(d) ? valor : 0);
    const pendente = Math.max(0, valor - pago);
    const tipo = despTipo(d);
    map[mes].itens.push(d);
    map[mes].recebidoOuPago += Math.min(valor, pago);
    map[mes].totalPendente += pendente;
    if (tipo === "despesa") {
      map[mes].aPagar += valor;
      map[mes].pendentePagar += pendente;
    } else {
      map[mes].aReceber += valor;
      map[mes].pendenteReceber += pendente;
    }
    return map;
  }, {});
  const resumoCompartilhadoMeses = Object.values(resumoCompartilhadoMesesMap)
    .map(m => ({
      ...m,
      saldoLiquido: m.aReceber - m.aPagar,
      saldoPendenteLiquido: m.pendenteReceber - m.pendentePagar,
    }))
    .sort((a,b)=>(a.mes||"").localeCompare(b.mes||""));
  const resumoCompartilhadoGeral = resumoCompartilhadoMeses.reduce((acc, m) => ({
    aReceber: acc.aReceber + m.aReceber,
    aPagar: acc.aPagar + m.aPagar,
    pendenteReceber: acc.pendenteReceber + m.pendenteReceber,
    pendentePagar: acc.pendentePagar + m.pendentePagar,
    saldoLiquido: acc.saldoLiquido + m.saldoLiquido,
    saldoPendenteLiquido: acc.saldoPendenteLiquido + m.saldoPendenteLiquido,
  }), { aReceber:0, aPagar:0, pendenteReceber:0, pendentePagar:0, saldoLiquido:0, saldoPendenteLiquido:0 });
  // Pre-computed for amort modal (eliminates IIFE in JSX)
  const _amortDiv = modalAmort ? dividas.find(d=>d.id===modalAmort) : null;
  const _amortPago = _amortDiv ? pagoPorDivida(_amortDiv) : 0;
  const _amortPend = _amortDiv ? pendPorDivida(_amortDiv) : 0;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

      {/* Botão voltar + cabeçalho */}
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <button onClick={()=>setView("lista")} style={ghost({ padding:"6px 13px", fontSize:13 })}>← Voltar</button>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:40, height:40, borderRadius:11, background:pessoa.cor+"22", border:`2px solid ${pessoa.cor}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{pessoa.icon}</div>
          <div>
            <div style={{ fontWeight:800, fontSize:18 }}>{pessoa.nome}</div>
            <div style={{ fontSize:12, color:C.soft }}>Detalhes financeiros</div>
          </div>
        </div>
      </div>

      {/* ── DÍVIDAS ── */}
      <div style={s.card2()}>
        <div style={{ ...s.row, marginBottom:14 }}>
          <div>
            <div style={{ fontWeight:700, fontSize:15 }}>Dívidas</div>
            <div style={{ fontSize:12, color:C.soft }}>Valores que {pessoa.nome} deve a você</div>
          </div>
          <button onClick={()=>setModalDiv(true)} style={btn(C.coral,{ fontSize:12, padding:"6px 13px" })}>+ Nova dívida</button>
        </div>

        {/* KPIs dívidas */}
        {pdivs.length>0&&(
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:9, marginBottom:14 }}>
            {[
              { l:"Total",   v:fmtBRL(pdivs.reduce((s,d)=>s+d.total,0)),            col:C.text },
              { l:"Pago",    v:fmtBRL(pdivs.reduce((s,d)=>s+pagoPorDivida(d),0)),   col:C.emerald },
              { l:"Pendente",v:fmtBRL(pdivs.reduce((s,d)=>s+pendPorDivida(d),0)),   col:C.coral },
            ].map(k=>(
              <div key={k.l} style={{ background:C.navy, borderRadius:8, padding:"10px 13px" }}>
                <div style={lbl}>{k.l}</div>
                <div style={{ fontSize:16, fontWeight:800, color:k.col }}>{k.v}</div>
              </div>
            ))}
          </div>
        )}

        {/* Lista de dívidas */}
        {pdivs.map(d=>{
          const pago   = pagoPorDivida(d);
          const pend   = pendPorDivida(d);
          const pct    = d.total>0?Math.min(pago/d.total,1):0;
          return (
            <div key={d.id} style={{ background:C.navy, borderRadius:10, padding:"14px 16px", marginBottom:10, borderLeft:`3px solid ${d.status==="quitada"?C.emerald:C.coral}` }}>
              {/* Header dívida */}
              <div style={{ ...s.row, marginBottom:10 }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:14 }}>{d.descricao}</div>
                  <div style={{ fontSize:11, color:C.soft }}>Desde {fmtDate(d.dataInicio)}</div>
                </div>
                <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                  <span style={s.tag(d.status==="quitada"?C.emerald:C.coral)}>{d.status==="quitada"?"✅ Quitada":"⏳ Aberta"}</span>
                  <button onClick={()=>toggleStatusDiv(d.id)} style={{ background:"transparent", border:`1px solid ${C.border}`, borderRadius:6, color:C.soft, padding:"3px 8px", cursor:"pointer", fontSize:11 }}>
                    {d.status==="quitada"?"Reabrir":"Quitar"}
                  </button>
                  <button onClick={()=>delDivida(d.id)} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:15 }}>×</button>
                </div>
              </div>

              {/* Barra de progresso */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:7, marginBottom:10 }}>
                <div style={{ background:C.surface, borderRadius:7, padding:"7px 9px" }}>
                  <div style={{ fontSize:9, color:C.soft, marginBottom:2, textTransform:"uppercase" }}>Total</div>
                  <div style={{ fontSize:14, fontWeight:700 }}>{fmtBRL(d.total)}</div>
                </div>
                <div style={{ background:C.surface, borderRadius:7, padding:"7px 9px" }}>
                  <div style={{ fontSize:9, color:C.soft, marginBottom:2, textTransform:"uppercase" }}>Pago</div>
                  <div style={{ fontSize:14, fontWeight:700, color:C.emerald }}>{fmtBRL(pago)}</div>
                </div>
                <div style={{ background:C.surface, borderRadius:7, padding:"7px 9px" }}>
                  <div style={{ fontSize:9, color:C.soft, marginBottom:2, textTransform:"uppercase" }}>Pendente</div>
                  <div style={{ fontSize:14, fontWeight:700, color:pend>0?C.coral:C.soft }}>{fmtBRL(pend)}</div>
                </div>
              </div>
              <div style={{ background:C.surface, borderRadius:4, height:7, marginBottom:8 }}>
                <div style={{ height:7, borderRadius:4, width:`${pct*100}%`, background:pct>=1?C.emerald:pessoa.cor, transition:"width .3s" }}/>
              </div>
              <div style={{ fontSize:11, color:C.soft, marginBottom:10 }}>{(pct*100).toFixed(0)}% pago</div>

              {/* Amortizações */}
              {(d.amortizacoes||[]).length>0&&(
                <div style={{ marginBottom:10 }}>
                  <div style={{ ...lbl, marginBottom:6 }}>Histórico de amortizações</div>
                  <table style={{ width:"100%", fontSize:12, borderCollapse:"collapse" }}>
                    <thead><tr>{["Data","Valor","Modo","Obs",""].map((h,i)=><th key={i} style={{ textAlign:i===1?"right":"left", padding:"4px 7px", color:C.soft, fontSize:10, borderBottom:`1px solid ${C.border}` }}>{h}</th>)}</tr></thead>
                    <tbody>
                      {(d.amortizacoes||[]).sort((a,b)=>b.data.localeCompare(a.data)).map(a=>(
                        <tr key={a.id} style={{ borderTop:`1px solid ${C.border}` }}>
                          <td style={{ padding:"5px 7px", color:C.soft }}>{fmtDate(a.data)}</td>
                          <td style={{ padding:"5px 7px", textAlign:"right", fontWeight:700, color:C.emerald }}>{fmtBRL(a.valor)}</td>
                          <td style={{ padding:"5px 7px" }}><span style={s.badge("#CE93D8")}>{a.modo}</span></td>
                          <td style={{ padding:"5px 7px", color:C.soft, fontSize:11 }}>{a.obs||"—"}</td>
                          <td style={{ padding:"5px 7px" }}><button onClick={()=>delAmort(d.id,a.id)} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:13 }}>×</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Botão amortizar */}
              {d.status==="aberta"&&(
                <button onClick={()=>{ setModalAmort(d.id); setAmortForm({ valor:"", data:todayIso(), modo:"Pix", obs:"" }); }}
                  style={btn(C.emerald,{ fontSize:12, padding:"6px 14px" })}>
                  + Registrar pagamento
                </button>
              )}
            </div>
          );
        })}
        {pdivs.length===0&&<div style={{ color:C.soft, fontSize:13 }}>Nenhuma dívida registrada.</div>}
      </div>

      {/* ── DESPESAS COMPARTILHADAS ── */}
      <div style={s.card2()}>
        <div style={{ ...s.row, marginBottom:14 }}>
          <div>
            <div style={{ fontWeight:700, fontSize:15 }}>Despesas Compartilhadas</div>
            <div style={{ fontSize:12, color:C.soft }}>Empréstimo de cartão, rachas, divisões mensais</div>
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <button onClick={()=>setModalHistorico(true)} style={ghost({ fontSize:12, padding:"6px 13px", color:C.gold })}>Ver Histórico</button>
            <button onClick={()=>{ resetDespForm(); setModalDesp(true); }} style={btn("#CE93D8",{ fontSize:12, padding:"6px 13px" })}>+ Novo compartilhamento</button>
          </div>
        </div>

        {pdesps.length>0&&(
          <div style={{ background:C.navy, borderRadius:10, padding:"12px 14px", marginBottom:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", gap:10, alignItems:"flex-start", flexWrap:"wrap", marginBottom:10 }}>
              <div>
                <div style={{ fontWeight:700, fontSize:13 }}>Detalhamento acumulado por mês</div>
                <div style={{ fontSize:11, color:C.soft }}>Acompanhe quanto há a receber, a pagar e pendente com {pessoa.nome} em cada competência.</div>
              </div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                <span style={s.badge(C.emerald)}>A receber: {fmtBRL(resumoCompartilhadoGeral.aReceber)}</span>
                <span style={s.badge(C.coral)}>A pagar: {fmtBRL(resumoCompartilhadoGeral.aPagar)}</span>
                <span style={s.badge(resumoCompartilhadoGeral.saldoPendenteLiquido>=0?C.gold:C.coral)}>Pendente líquido: {fmtBRL(resumoCompartilhadoGeral.saldoPendenteLiquido)}</span>
              </div>
            </div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                <thead>
                  <tr style={{ color:C.soft, fontSize:10, textTransform:"uppercase" }}>
                    {["Mês","A receber","A pagar","Pendente líquido","Saldo total","Itens",""] .map((h,i)=>(
                      <th key={h} style={{ textAlign:i===0?"left":i===6?"center":"right", padding:"6px 7px", borderBottom:`1px solid ${C.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resumoCompartilhadoMeses.map(m=>{
                    const aberto = expandedSharedMonth === m.mes;
                    return (
                      <tr key={m.mes} style={{ borderTop:`1px solid ${C.border}` }}>
                        <td style={{ padding:"8px 7px", fontWeight:800, whiteSpace:"nowrap" }}>{formatMonthBR(m.mes)}</td>
                        <td style={{ padding:"8px 7px", textAlign:"right", color:C.emerald, fontWeight:700 }}>{fmtBRL(m.aReceber)}</td>
                        <td style={{ padding:"8px 7px", textAlign:"right", color:C.coral, fontWeight:700 }}>{fmtBRL(m.aPagar)}</td>
                        <td style={{ padding:"8px 7px", textAlign:"right", color:m.saldoPendenteLiquido>=0?C.gold:C.coral, fontWeight:800 }}>{fmtBRL(m.saldoPendenteLiquido)}</td>
                        <td style={{ padding:"8px 7px", textAlign:"right", color:m.saldoLiquido>=0?C.emerald:C.coral, fontWeight:800 }}>{fmtBRL(m.saldoLiquido)}</td>
                        <td style={{ padding:"8px 7px", textAlign:"right", color:C.soft }}>{m.itens.length}</td>
                        <td style={{ padding:"8px 7px", textAlign:"center" }}>
                          <button onClick={()=>setExpandedSharedMonth(aberto?"":m.mes)} style={{ ...ghost({ padding:"4px 8px", fontSize:11 }), whiteSpace:"nowrap" }}>{aberto?"Ocultar":"Gerir"}</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {expandedSharedMonth&&resumoCompartilhadoMesesMap[expandedSharedMonth]&&(
              <div style={{ marginTop:10, background:C.surface, borderRadius:9, padding:"9px 11px" }}>
                <div style={{ ...lbl, marginBottom:6 }}>Lançamentos de {formatMonthBR(expandedSharedMonth)}</div>
                {[...resumoCompartilhadoMesesMap[expandedSharedMonth].itens].sort((a,b)=>(a.data||"").localeCompare(b.data||"")).map(d=>{
                  const tipo = despTipo(d);
                  const quitado = despQuitado(d);
                  const valorColor = tipo === "receita" ? C.emerald : C.coral;
                  return (
                    <div key={d.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 0", borderTop:`1px solid ${C.border}` }}>
                      <div style={{ flex:1, minWidth:180 }}>
                        <div style={{ fontWeight:700, fontSize:12 }}>{d.descricao}</div>
                        <div style={{ fontSize:10, color:C.soft }}>{fmtDate(d.data)}{d.parcela&&d.totalParcelas?` · ${d.fixo?"recorrente":"parcela"} ${d.parcela}/${d.totalParcelas}`:""}</div>
                      </div>
                      <div style={{ minWidth:82, textAlign:"right", fontWeight:800, color:valorColor }}>{tipo==="receita"?"+":"-"}{fmtBRL(d.valor)}</div>
                      <button onClick={()=>toggleStatusDesp(d.id)} style={{ ...s.badge(quitado?C.emerald:C.gold), cursor:"pointer", border:"none", padding:"4px 9px", whiteSpace:"nowrap" }}>
                        {quitado?(tipo==="despesa"?"Pago":"Recebido"):"Pendente"}
                      </button>
                      <button onClick={()=>delDesp(d.id)} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:15 }}>×</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Filtro por mês (usa selMonth do App via prop) */}
        {despMesP.length>0&&(
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:12 }}>
            <div style={{ background:C.navy, borderRadius:8, padding:"9px 12px" }}>
              <div style={lbl}>Pendente no mês</div>
              <div style={{ fontSize:16, fontWeight:700, color:C.gold }}>{fmtBRL(despMesP.filter(d=>d.status==="pendente").reduce((s,d)=>s+d.valor,0))}</div>
            </div>
            <div style={{ background:C.navy, borderRadius:8, padding:"9px 12px" }}>
              <div style={lbl}>Recebido no mês</div>
              <div style={{ fontSize:16, fontWeight:700, color:C.emerald }}>{fmtBRL(despMesP.filter(d=>d.status==="recebido").reduce((s,d)=>s+d.valor,0))}</div>
            </div>
          </div>
        )}

        {/* Todas as despesas desta pessoa */}
        <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
          {[...pdesps].sort((a,b)=>(a.data||"").localeCompare(b.data||"")).map(d=>{
            const c = cards.find(x=>x.id===d.cartaoId);
            const tipo = despTipo(d);
            const quitado = despQuitado(d);
            const isMes = despMonthKey(d)===selMon;
            const valorColor = tipo === "receita" ? C.emerald : C.coral;
            return (
              <div key={d.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 4px", borderTop:`1px solid ${C.border}`, opacity:isMes?1:0.6 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:13 }}>{d.descricao}</div>
                  <div style={{ fontSize:11, color:C.soft, marginTop:2 }}>
                    {fmtDate(d.data)}
                    <span style={{ marginLeft:6, background:valorColor+"22", color:valorColor, padding:"1px 6px", borderRadius:20, fontSize:10, fontWeight:700 }}>{tipo==="receita"?"↗ Receita":"↘ Despesa"}</span>
                    {d.parcela&&d.totalParcelas&&<span style={{ marginLeft:5, background:C.border, color:C.soft, padding:"1px 6px", borderRadius:20, fontSize:10 }}>{d.fixo?"🔁":"🧾"} {d.parcela}/{d.totalParcelas}</span>}
                    {c&&<span style={{ marginLeft:6, background:c.cor+"22", color:c.cor, padding:"1px 6px", borderRadius:20, fontSize:10, fontWeight:700 }}>💳 {c.nome}</span>}
                    {d.catId&&<span style={{ marginLeft:5, fontSize:10, background:getCatColor(d.catId)+"22", color:getCatColor(d.catId), padding:"1px 6px", borderRadius:20 }}>{getCatIcon(d.catId)} {getCatLabel(d.catId)}</span>}
                  </div>
                </div>
                <div style={{ fontWeight:800, fontSize:14, color:valorColor, minWidth:80, textAlign:"right" }}>{fmtBRL(d.valor)}</div>
                <button onClick={()=>toggleStatusDesp(d.id)}
                  style={{ ...s.badge(quitado?C.emerald:C.gold), cursor:"pointer", border:"none", padding:"4px 10px", borderRadius:20, whiteSpace:"nowrap" }}>
                  {quitado?(tipo==="despesa"?"✅ Pago":"✅ Recebido"):"⏳ Pendente"}
                </button>
                <button onClick={()=>delDesp(d.id)} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:15 }}>×</button>
              </div>
            );
          })}
          {pdesps.length===0&&<div style={{ color:C.soft, fontSize:13 }}>Nenhuma despesa registrada.</div>}
        </div>
      </div>

      <RequiredFieldModal info={requiredModal} onClose={()=>setRequiredModal(null)} />

      {modalHistorico&&(
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:210 }} onClick={e=>e.target===e.currentTarget&&setModalHistorico(false)}>
          <div style={{ background:"#162640", border:"1px solid #1E3050", borderRadius:14, padding:24, width:760, maxWidth:"94vw", maxHeight:"86vh", overflowY:"auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, marginBottom:14 }}>
              <div>
                <h3 style={{ margin:"0 0 4px", fontWeight:800 }}>Histórico de despesas compartilhadas</h3>
                <div style={{ fontSize:12, color:C.soft }}>Meses movidos automaticamente após baixa de todas as pendências.</div>
              </div>
              <button onClick={()=>setModalHistorico(false)} style={ghost()}>Fechar</button>
            </div>
            {pdespsHistorico.length===0&&<div style={{ color:C.soft, fontSize:13, padding:"18px 0" }}>Nenhum mês fechado no histórico desta pessoa.</div>}
            {Object.values(pdespsHistorico.reduce((map,d)=>{
              const mes=despMonthKey(d);
              if(!map[mes]) map[mes]={ mes, itens:[], total:0 };
              map[mes].itens.push(d);
              map[mes].total += Number(d.valor)||0;
              return map;
            },{})).sort((a,b)=>(a.mes||"").localeCompare(b.mes||"")).map(grupo=>(
              <div key={grupo.mes} style={{ background:C.navy, borderRadius:10, padding:"12px 14px", marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", gap:10, marginBottom:8 }}>
                  <div style={{ fontWeight:800 }}>{formatMonthBR(grupo.mes)}</div>
                  <div style={{ fontWeight:800, color:C.gold }}>{fmtBRL(grupo.total)}</div>
                </div>
                {grupo.itens.sort((a,b)=>(a.data||"").localeCompare(b.data||"")).map(d=>(
                  <div key={d.id} style={{ display:"grid", gridTemplateColumns:"90px 1fr 110px 110px", gap:8, borderTop:`1px solid ${C.border}`, padding:"7px 0", fontSize:12 }}>
                    <span style={{ color:C.soft }}>{fmtDate(d.data)}</span>
                    <span>{d.descricao}</span>
                    <span style={{ color:despTipo(d)==="receita"?C.emerald:C.coral, fontWeight:700 }}>{despTipo(d)==="receita"?"A receber":"A pagar"}</span>
                    <span style={{ textAlign:"right", fontWeight:800 }}>{fmtBRL(d.valor)}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MODAL: amortização ── */}
      {modalAmort&&(
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }} onClick={e=>e.target===e.currentTarget&&setModalAmort(null)}>
          <div style={{ background:"#162640", border:"1px solid #1E3050", borderRadius:14, padding:26, width:400, maxWidth:"92vw" }}>
            <h3 style={{ margin:"0 0 16px", fontWeight:800 }}>Registrar Pagamento</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
              <div style={{ background:C.navy, borderRadius:8, padding:"10px 13px", fontSize:13 }}>
                <div style={{ fontWeight:700, marginBottom:4 }}>{_amortDiv?.descricao}</div>
                <div style={{ display:"flex", gap:16, fontSize:12 }}>
                  <span style={{ color:C.soft }}>Total: <strong style={{ color:C.text }}>{fmtBRL(_amortDiv?.total||0)}</strong></span>
                  <span style={{ color:C.soft }}>Pago: <strong style={{ color:C.emerald }}>{fmtBRL(_amortPago)}</strong></span>
                  <span style={{ color:C.soft }}>Restante: <strong style={{ color:C.coral }}>{fmtBRL(_amortPend)}</strong></span>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
                <div><div style={lbl}>Valor (R$)</div><MoneyInput style={inp} value={amortForm.valor} onChange={value=>setAmortForm(f=>({...f,valor:value}))}/></div>
                <div><div style={lbl}>Data</div><DateInput style={inp} value={amortForm.data} onChange={value=>setAmortForm(f=>({...f,data:value}))}/></div>
              </div>
              <div><div style={lbl}>Modo de pagamento</div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {MODOS_AMORT.map(m=>(
                    <button key={m} onClick={()=>setAmortForm(f=>({...f,modo:m}))}
                      style={{ border:`2px solid ${amortForm.modo===m?C.emerald:C.border}`, borderRadius:7,
                               background:amortForm.modo===m?C.emerald+"22":"transparent",
                               color:amortForm.modo===m?C.emerald:C.soft, padding:"5px 11px", fontSize:12, fontWeight:700, cursor:"pointer" }}>{m}</button>
                  ))}
                </div>
              </div>
              <div><div style={lbl}>Observação (opcional)</div><input style={inp} placeholder="Ex: ref. semana 1" value={amortForm.obs} onChange={e=>setAmortForm(f=>({...f,obs:e.target.value}))}/></div>
              {amortForm.valor&&<div style={{ fontSize:12, color:C.soft, background:C.navy, borderRadius:7, padding:"8px 12px" }}>
                Após este pagamento: <strong style={{ color:C.emerald }}>{fmtBRL(_amortPago+moneyToNumber(amortForm.valor))}</strong> pagos de <strong>{fmtBRL(_amortDiv?.total||0)}</strong>
                {_amortPago+moneyToNumber(amortForm.valor)>=_amortDiv?.total&&<span style={{ color:C.emerald, marginLeft:6 }}>✅ Dívida quitada!</span>}
              </div>}
              <div style={{ display:"flex", gap:9, marginTop:4 }}>
                <button onClick={()=>setModalAmort(null)} style={btn(C.border,{ flex:1 })}>Cancelar</button>
                <button onClick={addAmort} style={btn(C.emerald,{ flex:1 })}>Salvar pagamento</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: nova dívida ── */}
      {modalDiv&&(
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }} onClick={e=>e.target===e.currentTarget&&setModalDiv(false)}>
          <div style={{ background:"#162640", border:"1px solid #1E3050", borderRadius:14, padding:26, width:400, maxWidth:"92vw" }}>
            <h3 style={{ margin:"0 0 16px", fontWeight:800 }}>Nova Dívida — {pessoa.nome}</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div><div style={lbl}>Descrição</div><input style={inp} placeholder="Ex: Empréstimo viagem" value={divForm.descricao} onChange={e=>setDivForm(f=>({...f,descricao:e.target.value}))}/></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
                <div><div style={lbl}>Valor total (R$)</div><MoneyInput style={inp} value={divForm.total} onChange={value=>setDivForm(f=>({...f,total:value}))}/></div>
                <div><div style={lbl}>Data de início</div><DateInput style={inp} value={divForm.dataInicio} onChange={value=>setDivForm(f=>({...f,dataInicio:value}))}/></div>
              </div>
              <div style={{ display:"flex", gap:9, marginTop:6 }}>
                <button onClick={()=>setModalDiv(false)} style={btn(C.border,{ flex:1 })}>Cancelar</button>
                <button onClick={addDivida} style={btn(C.coral,{ flex:1 })}>Registrar dívida</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: novo lançamento compartilhado ── */}
      {modalDesp&&(
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }} onClick={e=>e.target===e.currentTarget&&setModalDesp(false)}>
          <div style={{ background:"#162640", border:"1px solid #1E3050", borderRadius:14, padding:26, width:560, maxWidth:"94vw", maxHeight:"92vh", overflowY:"auto" }}>
            <h3 style={{ margin:"0 0 8px", fontWeight:800 }}>Novo Compartilhamento — {pessoa.nome}</h3>
            <div style={{ fontSize:12, color:C.soft, marginBottom:14 }}>Cadastre receita ou despesa compartilhada, incluindo parcelas e recorrência usando a mesma lógica dos lançamentos de cartão.</div>
            <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
              <div>
                <div style={lbl}>Tipo</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  {[{v:"receita",l:"↗ Receita / a receber",col:C.emerald},{v:"despesa",l:"↘ Despesa / a pagar",col:C.coral}].map(o=>(
                    <button key={o.v} onClick={()=>setDespForm(f=>({...f,tipo:o.v,status:"pendente"}))}
                      style={{ border:`2px solid ${despForm.tipo===o.v?o.col:C.border}`, borderRadius:8,
                               background:despForm.tipo===o.v?o.col+"22":"transparent", color:despForm.tipo===o.v?o.col:C.soft,
                               padding:"8px 7px", fontSize:12, fontWeight:800, cursor:"pointer" }}>{o.l}</button>
                  ))}
                </div>
              </div>

              <div><div style={lbl}>Descrição</div><input style={highlightIfRequired(inp, requiredModal, "despDescricao")} placeholder="Ex: Netflix compartilhado, mercado, viagem" value={despForm.descricao} onChange={e=>setDespForm(f=>({...f,descricao:e.target.value}))}/></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
                <div><div style={lbl}>Valor (R$)</div><MoneyInput style={highlightIfRequired(inp, requiredModal, "despValor")} value={despForm.valor} onChange={value=>setDespForm(f=>({...f,valor:value}))}/></div>
                <div><div style={lbl}>Categoria</div><CategorySelect cats={cats} value={despForm.catId} onChange={v=>setDespForm(f=>({...f,catId:v}))} style={inp} validationInfo={requiredModal} fieldKey="despCatId"/></div>
              </div>

              <div><div style={lbl}>Cartão usado (opcional)</div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  <button onClick={()=>setDespForm(f=>({...f,cartaoId:""}))} style={{ border:`2px solid ${!despForm.cartaoId?C.emerald:C.border}`, borderRadius:7, background:!despForm.cartaoId?C.emerald+"22":"transparent", color:!despForm.cartaoId?C.emerald:C.soft, padding:"5px 10px", fontSize:12, fontWeight:700, cursor:"pointer" }}>Nenhum</button>
                  {cards.map(c=><button key={c.id} onClick={()=>setDespForm(f=>({...f,cartaoId:c.id}))} style={{ border:`2px solid ${despForm.cartaoId===c.id?c.cor:C.border}`, borderRadius:7, background:despForm.cartaoId===c.id?c.cor+"22":"transparent", color:despForm.cartaoId===c.id?c.cor:C.soft, padding:"5px 10px", fontSize:12, fontWeight:700, cursor:"pointer" }}>💳 {c.nome}</button>)}
                </div>
              </div>

              <div style={{ background:C.navy, borderRadius:9, padding:"11px 13px" }}>
                <label style={{ display:"flex", alignItems:"center", gap:7, fontSize:13, cursor:"pointer", marginBottom:despForm.parcelado?11:0 }}>
                  <input type="checkbox" checked={!!despForm.parcelado} onChange={e=>setDespForm(f=>({...f,parcelado:e.target.checked,fixo:e.target.checked?false:f.fixo}))}/>
                  <span style={{ fontWeight:600 }}>Compra parcelada</span>
                </label>
                {despForm.parcelado&&(
                  <>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7, marginBottom:9 }}>
                      {[{v:"total",l:"Valor total"},{v:"parcela",l:"Vlr parcela"}].map(o=>(
                        <button key={o.v} onClick={()=>setDespForm(f=>({...f,modoParc:o.v}))}
                          style={{ border:`2px solid ${despForm.modoParc===o.v?C.emerald:C.border}`, borderRadius:7,
                                   background:despForm.modoParc===o.v?C.emerald+"22":"transparent", color:despForm.modoParc===o.v?C.emerald:C.soft,
                                   padding:"6px 5px", fontSize:12, fontWeight:700, cursor:"pointer" }}>{o.l}</button>
                      ))}
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
                      <div><div style={lbl}>Parcelas</div><input style={inp} type="number" min={2} max={48} value={despForm.parcelas ?? ""} onChange={e=>setDespForm(f=>({...f,parcelas:e.target.value}))}/></div>
                      <div><div style={lbl}>Data 1ª parcela</div><DateInput style={highlightIfRequired(inp, requiredModal, "despData")} value={despForm.data||""} onChange={value=>setDespForm(f=>({...f,data:value}))}/></div>
                    </div>
                    {despForm.valor&&despForm.parcelas&&(
                      <div style={{ marginTop:7, fontSize:12, color:C.soft }}>
                        {despForm.modoParc==="total"
                          ?`${despForm.parcelas}× de ${fmtBRL(moneyToNumber(despForm.valor)/parseInt(despForm.parcelas))}`
                          :`${despForm.parcelas}× de ${fmtBRL(moneyToNumber(despForm.valor))} = ${fmtBRL(moneyToNumber(despForm.valor)*parseInt(despForm.parcelas))}`}
                      </div>
                    )}
                    {despParcPreview.length>0&&(
                      <div style={{ background:C.surface, borderRadius:8, padding:"9px 11px", marginTop:7 }}>
                        <div style={{ ...lbl, marginBottom:6 }}>Prévia</div>
                        <div style={{ display:"flex", flexDirection:"column", gap:2, maxHeight:110, overflowY:"auto" }}>
                          {despParcPreview.map((p,i)=><div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:11 }}><span style={{ color:C.soft }}>{i+1}ª · {fmtDate(p.data)}</span><span style={{ fontWeight:700, color:C.gold }}>{fmtBRL(p.valor)}</span></div>)}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {!despForm.parcelado&&(
                <div style={{ background:C.navy, borderRadius:9, padding:"11px 13px" }}>
                  <label style={{ display:"flex", alignItems:"center", gap:7, fontSize:13, cursor:"pointer", marginBottom:despForm.fixo?12:0 }}>
                    <input type="checkbox" checked={!!despForm.fixo} onChange={e=>setDespForm(f=>({...f,fixo:e.target.checked,parcelado:e.target.checked?false:f.parcelado,data:e.target.checked?"":(f.data||todayIso())}))}/>
                    <span style={{ fontWeight:600 }}>Despesa/receita fixa recorrente</span>
                  </label>
                  {despForm.fixo?(
                    <>
                      <div style={{ fontSize:12, color:C.soft, marginBottom:10 }}>
                        Será registrado todo mês no dia informado, a partir de <strong style={{ color:C.text }}>{selMon}</strong>.
                      </div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
                        <div><div style={lbl}>Dia do mês</div><input style={highlightIfRequired(inp, requiredModal, "despFixoDia")} type="number" min={1} max={31} placeholder="Ex: 5" value={despForm.fixoDia||""} onChange={e=>setDespForm(f=>({...f,fixoDia:e.target.value}))}/></div>
                        <div><div style={lbl}>Nº de meses</div><input style={inp} type="number" min={2} max={60} placeholder="Ex: 12" value={despForm.fixoMeses||""} onChange={e=>setDespForm(f=>({...f,fixoMeses:e.target.value}))}/></div>
                      </div>
                      {despRecPreview.length>0&&(
                        <div style={{ marginTop:10, background:C.surface, borderRadius:8, padding:"9px 11px" }}>
                          <div style={{ ...lbl, marginBottom:6 }}>Prévia</div>
                          {despRecPreview.map((p,i)=>(
                            <div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:11, marginBottom:2 }}>
                              <span style={{ color:C.soft }}>{i+1}º · {p.mes} · {fmtDate(p.data)}</span>
                              <span style={{ fontWeight:700, color:C.gold }}>{fmtBRL(p.valor)}</span>
                            </div>
                          ))}
                          {parseInt(despForm.fixoMeses)>4&&<div style={{ fontSize:10, color:C.muted, marginTop:3 }}>... e mais {parseInt(despForm.fixoMeses)-4} meses</div>}
                        </div>
                      )}
                    </>
                  ):(
                    <div><div style={lbl}>Data</div><DateInput style={highlightIfRequired(inp, requiredModal, "despData")} value={despForm.data||""} onChange={value=>setDespForm(f=>({...f,data:value}))}/></div>
                  )}
                </div>
              )}

              <div><div style={lbl}>Situação inicial</div>
                <div style={{ display:"flex", gap:7 }}>
                  {[{v:"pendente",l:"⏳ Pendente",col:C.gold},{v:statusQuitadoPorTipo(despForm.tipo),l:despForm.tipo==="despesa"?"✅ Já pago":"✅ Já recebido",col:C.emerald}].map(o=>(
                    <button key={o.v} onClick={()=>setDespForm(f=>({...f,status:o.v}))}
                      style={{ flex:1, border:`2px solid ${despForm.status===o.v?o.col:C.border}`, borderRadius:7,
                               background:despForm.status===o.v?o.col+"22":"transparent", color:despForm.status===o.v?o.col:C.soft,
                               padding:"7px 5px", fontSize:12, fontWeight:700, cursor:"pointer" }}>{o.l}</button>
                  ))}
                </div>
              </div>

              <div style={{ display:"flex", gap:9, marginTop:6 }}>
                <button onClick={()=>setModalDesp(false)} style={btn(C.border,{ flex:1 })}>Cancelar</button>
                <button onClick={addDesp} style={btn("#CE93D8",{ flex:1 })}>Salvar lançamento</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
