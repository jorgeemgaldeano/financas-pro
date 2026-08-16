// ParamsTab.jsx — v0.3.37 Fase 5 (DEC-0038)
// Extraído de App.jsx (aba "Parâmetros"). Movimentação pura: contrato de
// props preservado exatamente como estava.
import { useState } from "react";
import { C } from "../../theme/tokens.js";
import { fmtBRL, moneyToNumber } from "../../utils/moneyUtils.js";
import { ConfirmDialog } from "../ui/ConfirmDialog.jsx";
import { MoneyInput } from "../atoms/MoneyInput.jsx";
import { CategorySelect } from "../molecules/CategorySelect.jsx";
import { catColor, catIcon } from "../../utils/categoryTreeUtils.js";
import { getCardPaymentAccountId } from "../../services/cardInvoiceService.js";
import { INIT_PARAMS } from "../../constants/seedData.js";
export function ParamsTab({ cats, params, setParams, flatCats, addRootCat, addSubCat, delCat, renameCat, recolorCat, cards, setCards, contas, setContas, cardDependents, contaDependents, reassignAndDeleteCard, reassignAndDeleteAccount, recategorizeWholeCat, reassignReasonMsg, onExport, onImport, onReset }) {
  const [section, setSection] = useState("cats");
  const [paramsBuf, setParamsBuf] = useState({...params});
  const [newCat, setNewCat] = useState({ nome:"", cor:"#B0BEC5", icon:"📦" });
  const [newSubForm, setNewSubForm] = useState({});
  const [renameForm, setRenameForm] = useState({});
  const [expanded, setExpanded] = useState({});
  const [editCardId, setEditCardId] = useState(null);
  const [importMsg, setImportMsg] = useState("");
  const [autoRuleForm, setAutoRuleForm] = useState({ tipo:"despesa", catId:"", keywords:"" });
  // v0.3.32 — diálogos de reatribuição/recategorização e confirmação simples.
  // { kind:"card"|"account", id, count, target, error } | null
  const [reassignDlg, setReassignDlg] = useState(null);
  // { fromId, target } | null  (recategorizar categoria por completo)
  const [recatDlg, setRecatDlg] = useState(null);
  // { title, message, tone, onConfirm } | null  (confirmações simples)
  const [confirmDlg, setConfirmDlg] = useState(null);

  const ICONS=["🍽️","🚗","🏠","❤️","🎮","📚","👕","💻","💰","📦","✈️","🐾","🎓","🛒","💊","🎨","🏋️","🎯","🔧","🎁","🏦","🎪","🌍"];
  const COLORS=["#00A878","#F5B700","#E8504A","#4FC3F7","#CE93D8","#80DEEA","#FFAB40","#F48FB1","#A5D6A7","#B0BEC5","#7C3AED","#0891B2","#DB2777","#6366F1","#F97316","#84CC16","#34D399","#FB923C"];

  const inp2={ background:C.navy, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, padding:"8px 12px", fontSize:13, width:"100%", outline:"none" };
  const btn2=(bg,x={})=>({ background:bg, border:"none", borderRadius:8, color:"#fff", padding:"8px 16px", fontWeight:700, cursor:"pointer", fontSize:13, ...x });
  const ghost2=(x={})=>({ background:"transparent", border:`1px solid ${C.border}`, borderRadius:8, color:C.soft, padding:"5px 10px", cursor:"pointer", fontSize:12, ...x });
  const lbl2={ fontSize:11, color:C.soft, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 };
  const card2=(x={})=>({ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:"18px 22px", ...x });

  const toggle=(id)=>setExpanded(p=>({...p,[id]:!p[id]}));

  const renderNode=(list, depth=0)=>list.map(cat=>{
    const open=expanded[cat.id], hasSubs=cat.subs?.length>0, isRen=renameForm[cat.id]!==undefined;
    return (
      <div key={cat.id}>
        <div style={{ display:"flex", alignItems:"center", gap:7, padding:"7px 10px", borderRadius:8, background:C.navy, marginBottom:3, marginLeft:depth*18 }}>
          <button onClick={()=>toggle(cat.id)} style={{ background:"transparent", border:"none", color:hasSubs?C.soft:"transparent", cursor:"pointer", fontSize:11, padding:"0 2px", width:16, flexShrink:0 }}>{open?"▾":"▸"}</button>
          {depth===0&&<div style={{ width:9, height:9, borderRadius:2, background:cat.cor, flexShrink:0 }}/>}
          {depth===0&&<span style={{ fontSize:12 }}>{cat.icon||"📦"}</span>}
          {depth>0&&<div style={{ width:9 }}/>}
          {isRen
            ? <input autoFocus style={{ ...inp2, padding:"3px 7px", fontSize:12, flex:1 }} value={renameForm[cat.id]} onChange={e=>setRenameForm(p=>({...p,[cat.id]:e.target.value}))} onKeyDown={e=>{ if(e.key==="Enter"){ renameCat(cat.id,renameForm[cat.id]); setRenameForm(p=>{const n={...p}; delete n[cat.id]; return n;}); } if(e.key==="Escape") setRenameForm(p=>{const n={...p}; delete n[cat.id]; return n;}); }}/>
            : <span style={{ fontSize:13, fontWeight:depth===0?700:500, flex:1 }}>{cat.nome}</span>
          }
          {hasSubs&&<span style={{ fontSize:10, color:C.soft, background:C.border, padding:"1px 5px", borderRadius:10 }}>{cat.subs.length}</span>}
          <div style={{ display:"flex", gap:3, flexShrink:0 }}>
            <button onClick={()=>setRenameForm(p=>({...p,[cat.id]:cat.nome}))} style={ghost2()}>✏️</button>
            {depth<2&&<button onClick={()=>{ setNewSubForm(p=>({...p,[cat.id]:""})); setExpanded(p=>({...p,[cat.id]:true})); }} style={ghost2({ color:C.emerald })}>+ Sub</button>}
            <button title="Recategorizar tudo para outra categoria" onClick={()=>setRecatDlg({ fromId:cat.id, fromNome:cat.nome, target:"" })} style={ghost2({ color:C.gold })}>↦</button>
            <button onClick={()=>setConfirmDlg({ title:"Excluir categoria", message:`Excluir "${cat.nome}"? Se houver lançamentos vinculados, recategorize-os antes (botão ↦).`, tone:"coral", onConfirm:()=>{ delCat(cat.id); setConfirmDlg(null); } })} style={ghost2({ color:C.coral })}>×</button>
          </div>
        </div>
        {depth===0&&open&&(
          <div style={{ marginLeft:18, marginBottom:5, padding:"8px 10px", background:C.surface, borderRadius:8, display:"flex", gap:5, flexWrap:"wrap", alignItems:"center" }}>
            <span style={{ fontSize:11, color:C.soft }}>Cor:</span>
            {COLORS.map(cor=><div key={cor} onClick={()=>recolorCat(cat.id,cor)} style={{ width:18, height:18, borderRadius:4, background:cor, cursor:"pointer", border:cat.cor===cor?"2px solid #fff":"2px solid transparent" }}/>)}
          </div>
        )}
        {newSubForm[cat.id]!==undefined&&(
          <div style={{ marginLeft:(depth+1)*18, display:"flex", gap:6, marginBottom:5 }}>
            <input autoFocus style={{ ...inp2, padding:"5px 9px", fontSize:12, flex:1 }} placeholder={`Subcategoria em "${cat.nome}"`} value={newSubForm[cat.id]} onChange={e=>setNewSubForm(p=>({...p,[cat.id]:e.target.value}))} onKeyDown={e=>{ if(e.key==="Enter"&&newSubForm[cat.id]?.trim()){ addSubCat(cat.id,newSubForm[cat.id].trim()); setNewSubForm(p=>{const n={...p}; delete n[cat.id]; return n;}); } if(e.key==="Escape") setNewSubForm(p=>{const n={...p}; delete n[cat.id]; return n;}); }}/>
            <button onClick={()=>{ if(newSubForm[cat.id]?.trim()){ addSubCat(cat.id,newSubForm[cat.id].trim()); setNewSubForm(p=>{const n={...p}; delete n[cat.id]; return n;}); }}} style={btn2(C.emerald,{ padding:"5px 12px", fontSize:12 })}>+</button>
            <button onClick={()=>setNewSubForm(p=>{const n={...p}; delete n[cat.id]; return n;})} style={ghost2({ padding:"5px 9px" })}>×</button>
          </div>
        )}
        {open&&hasSubs&&renderNode(cat.subs, depth+1)}
      </div>
    );
  });

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* v0.3.32 — Diálogo mover-e-excluir cartão */}
      <ConfirmDialog
        open={reassignDlg?.kind==="card"} title="Mover lançamentos e excluir cartão" icon="💳" tone="coral"
        message={`Este cartão tem ${reassignDlg?.count||0} lançamento(s) vinculado(s). Escolha o cartão de destino: os lançamentos serão movidos (a competência de cada um é recalculada pelo ciclo de fechamento do destino) e o cartão será excluído.`}
        confirmLabel="Mover e excluir" confirmDisabled={!reassignDlg?.target} colors={C}
        onCancel={()=>setReassignDlg(null)}
        onConfirm={()=>{ const res=reassignAndDeleteCard(reassignDlg.id, reassignDlg.target); if(!res.ok){ setReassignDlg(d=>({...d, error: reassignReasonMsg[res.reason]||"Não foi possível mover os lançamentos."})); return; } setReassignDlg(null); setEditCardId(null); }}
      >
        <div style={lbl2}>Cartão de destino</div>
        <select style={inp2} value={reassignDlg?.target||""} onChange={e=>setReassignDlg(d=>({...d, target:e.target.value, error:""}))}>
          <option value="">Selecione</option>
          {cards.filter(c=>c.id!==reassignDlg?.id).map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
        {reassignDlg?.error&&<div style={{ color:C.coral, fontSize:12, marginTop:8 }}>⚠️ {reassignDlg.error}</div>}
      </ConfirmDialog>

      {/* v0.3.32 — Diálogo mover-e-excluir conta */}
      <ConfirmDialog
        open={reassignDlg?.kind==="account"} title="Mover lançamentos e excluir conta" icon="🏦" tone="coral"
        message={`Esta conta tem ${reassignDlg?.count||0} lançamento(s) vinculado(s). Escolha a conta de destino: os lançamentos (e cartões/faturas que pagavam por esta conta) serão repontados para ela e a conta será excluída.`}
        confirmLabel="Mover e excluir" confirmDisabled={!reassignDlg?.target} colors={C}
        onCancel={()=>setReassignDlg(null)}
        onConfirm={()=>{ const res=reassignAndDeleteAccount(reassignDlg.id, reassignDlg.target); if(!res.ok){ setReassignDlg(d=>({...d, error: reassignReasonMsg[res.reason]||"Não foi possível mover os lançamentos."})); return; } setReassignDlg(null); }}
      >
        <div style={lbl2}>Conta de destino</div>
        <select style={inp2} value={reassignDlg?.target||""} onChange={e=>setReassignDlg(d=>({...d, target:e.target.value, error:""}))}>
          <option value="">Selecione</option>
          {contas.filter(c=>c.id!==reassignDlg?.id).map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
        {reassignDlg?.error&&<div style={{ color:C.coral, fontSize:12, marginTop:8 }}>⚠️ {reassignDlg.error}</div>}
      </ConfirmDialog>

      {/* v0.3.32 — Diálogo recategorizar categoria por completo */}
      <ConfirmDialog
        open={!!recatDlg} title="Recategorizar categoria por completo" icon="↦" tone="gold"
        message={`Mover todos os lançamentos e despesas compartilhadas de "${recatDlg?.fromNome}" (e subcategorias) para outra categoria. A categoria de origem não é excluída.`}
        confirmLabel="Recategorizar" confirmDisabled={!recatDlg?.target} colors={C}
        onCancel={()=>setRecatDlg(null)}
        onConfirm={()=>{ const res=recategorizeWholeCat(recatDlg.fromId, recatDlg.target); if(!res.ok){ setRecatDlg(d=>({...d, error:"Escolha uma categoria de destino diferente (não pode ser a própria origem ou uma subcategoria dela)."})); return; } setRecatDlg(null); }}
      >
        <div style={lbl2}>Categoria de destino</div>
        <select style={inp2} value={recatDlg?.target||""} onChange={e=>setRecatDlg(d=>({...d, target:e.target.value, error:""}))}>
          <option value="">Selecione</option>
          {flatCats.filter(f=>!f.hasSubs&&f.id!==recatDlg?.fromId).map(f=><option key={f.id} value={f.id}>{f.path||f.nome}</option>)}
        </select>
        {recatDlg?.error&&<div style={{ color:C.coral, fontSize:12, marginTop:8 }}>⚠️ {recatDlg.error}</div>}
      </ConfirmDialog>

      {/* v0.3.32 — Confirmação simples reutilizável */}
      <ConfirmDialog
        open={!!confirmDlg} title={confirmDlg?.title} message={confirmDlg?.message}
        tone={confirmDlg?.tone||"coral"} confirmLabel={confirmDlg?.confirmLabel||"Excluir"}
        cancelLabel={confirmDlg?.cancelLabel} colors={C}
        onCancel={()=>setConfirmDlg(null)} onConfirm={()=>confirmDlg?.onConfirm?.()}
      />

      <div style={{ display:"flex", gap:4 }}>
        {[{id:"cats",l:"🏷️ Categorias"},{id:"auto",l:"🤖 Autocategorização"},{id:"cards",l:"💳 Cartões"},{id:"contas",l:"🏦 Contas"},{id:"geral",l:"⚙️ Geral"},{id:"dados",l:"💿 Dados"}].map(s=>(
          <button key={s.id} onClick={()=>setSection(s.id)} style={{ background:section===s.id?C.border:"transparent", border:"none", color:section===s.id?C.text:C.soft, padding:"8px 16px", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:13 }}>{s.l}</button>
        ))}
      </div>

      {section==="cats"&&(
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={card2()}>
            <div style={{ fontWeight:700, fontSize:15, marginBottom:3 }}>Categorias e Subcategorias</div>
            <div style={{ fontSize:13, color:C.soft, marginBottom:16 }}>Até 3 níveis de hierarquia. Clique em ▸ para expandir, alterar cor ou adicionar subcategorias.</div>
            <div style={{ background:C.navy, borderRadius:10, padding:"14px 16px", marginBottom:14 }}>
              <div style={{ fontWeight:600, fontSize:13, marginBottom:10 }}>Nova categoria raiz</div>
              <div style={{ display:"flex", gap:8, marginBottom:8, flexWrap:"wrap" }}>
                <input style={{ ...inp2, flex:1, minWidth:120 }} placeholder="Nome" value={newCat.nome} onChange={e=>setNewCat(f=>({...f,nome:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&newCat.nome.trim()&&(addRootCat(newCat.nome.trim(),newCat.cor,newCat.icon),setNewCat({ nome:"", cor:"#B0BEC5", icon:"📦" }))}/>
                <select style={{ ...inp2, width:"auto" }} value={newCat.icon} onChange={e=>setNewCat(f=>({...f,icon:e.target.value}))}>{ICONS.map(ic=><option key={ic} value={ic}>{ic}</option>)}</select>
              </div>
              <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:10 }}>{COLORS.map(cor=><div key={cor} onClick={()=>setNewCat(f=>({...f,cor}))} style={{ width:20, height:20, borderRadius:4, background:cor, cursor:"pointer", border:newCat.cor===cor?"2px solid #fff":"2px solid transparent" }}/>)}</div>
              <button onClick={()=>newCat.nome.trim()&&(addRootCat(newCat.nome.trim(),newCat.cor,newCat.icon),setNewCat({ nome:"", cor:"#B0BEC5", icon:"📦" }))} style={btn2(C.emerald,{ padding:"7px 14px", fontSize:13 })}>+ Criar categoria</button>
            </div>
            <div>{renderNode(cats)}</div>
          </div>
          <div style={card2()}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:10 }}>Categorias disponíveis para lançamento ({flatCats.filter(f=>!f.hasSubs).length})</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {flatCats.filter(f=>!f.hasSubs).map(f=>(
                <span key={f.id} style={{ fontSize:11, background:catColor(cats,f.id)+"22", color:catColor(cats,f.id), padding:"3px 9px", borderRadius:20, fontWeight:600 }}>
                  {catIcon(cats,f.id)} {f.path}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {section==="auto"&&(
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={card2()}>
            <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>Regras de Autocategorização</div>
            <div style={{ fontSize:13, color:C.soft, marginBottom:14 }}>Cadastre palavras-chave para melhorar a categoria sugerida na importação. As regras abaixo têm prioridade sobre o histórico e sobre as regras automáticas padrão.</div>
            <div style={{ display:"grid", gridTemplateColumns:"120px 1fr 1.5fr auto", gap:8, alignItems:"end", marginBottom:14 }}>
              <div>
                <div style={lbl2}>Tipo</div>
                <select style={inp2} value={autoRuleForm.tipo} onChange={e=>setAutoRuleForm(f=>({...f,tipo:e.target.value}))}>
                  <option value="despesa">Despesa</option>
                  <option value="receita">Receita</option>
                </select>
              </div>
              <div>
                <div style={lbl2}>Categoria sugerida</div>
                <CategorySelect cats={cats} value={autoRuleForm.catId} onChange={v=>setAutoRuleForm(f=>({...f,catId:v}))} style={{ fontSize:13, padding:"8px 12px" }}/>
              </div>
              <div>
                <div style={lbl2}>Palavras-chave</div>
                <input style={inp2} placeholder="Ex: uber, 99app, corrida" value={autoRuleForm.keywords} onChange={e=>setAutoRuleForm(f=>({...f,keywords:e.target.value}))} onKeyDown={e=>{ if(e.key==="Enter"){ const keywords=(autoRuleForm.keywords||"").trim(); if(autoRuleForm.catId&&keywords){ setParams(p=>({...p, autoCategoryRules:[...(Array.isArray(p.autoCategoryRules)?p.autoCategoryRules:[]), { id:"acr_"+Math.random().toString(36).slice(2,9), tipo:autoRuleForm.tipo, catId:autoRuleForm.catId, keywords }] })); setAutoRuleForm({ tipo:"despesa", catId:"", keywords:"" }); } } }}/>
              </div>
              <button onClick={()=>{
                const keywords=(autoRuleForm.keywords||"").trim();
                if(!autoRuleForm.catId){ alert("Selecione uma categoria para a regra."); return; }
                if(!keywords){ alert("Informe ao menos uma palavra-chave."); return; }
                setParams(p=>({...p, autoCategoryRules:[...(Array.isArray(p.autoCategoryRules)?p.autoCategoryRules:[]), { id:"acr_"+Math.random().toString(36).slice(2,9), tipo:autoRuleForm.tipo, catId:autoRuleForm.catId, keywords }] }));
                setAutoRuleForm({ tipo:"despesa", catId:"", keywords:"" });
              }} style={btn2(C.emerald,{ whiteSpace:"nowrap" })}>+ Adicionar</button>
            </div>
            <div style={{ fontSize:12, color:params.categAutoImport?C.emerald:C.gold, marginBottom:10 }}>
              {params.categAutoImport?"✓ Categorização automática está ativa nos parâmetros gerais.":"⚠ Categorização automática está desativada nos parâmetros gerais."}
            </div>
            {Array.isArray(params.autoCategoryRules)&&params.autoCategoryRules.length>0 ? (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {params.autoCategoryRules.map(rule=>(
                  <div key={rule.id} style={{ background:C.navy, borderRadius:9, padding:"10px 12px", display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:10, color:rule.tipo==="receita"?C.emerald:C.coral, background:(rule.tipo==="receita"?C.emerald:C.coral)+"22", padding:"2px 7px", borderRadius:20, fontWeight:700 }}>{rule.tipo}</span>
                    <span style={{ fontSize:10, background:catColor(cats,rule.catId)+"22", color:catColor(cats,rule.catId), padding:"2px 7px", borderRadius:20, fontWeight:700 }}>{catIcon(cats,rule.catId)} {flatCats.find(f=>f.id===rule.catId)?.path||rule.catId}</span>
                    <span style={{ flex:1, fontSize:12, color:C.soft }}>{rule.keywords}</span>
                    <button onClick={()=>setParams(p=>({...p, autoCategoryRules:(Array.isArray(p.autoCategoryRules)?p.autoCategoryRules:[]).filter(r=>r.id!==rule.id)}))} style={ghost2({ color:C.coral })}>Remover</button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign:"center", color:C.soft, padding:"22px 0", background:C.navy, borderRadius:9, fontSize:13 }}>Nenhuma regra personalizada cadastrada.</div>
            )}
          </div>
        </div>
      )}

      {section==="cards"&&(
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {cards.map(c=>(
            <div key={c.id} style={card2()}>
              {editCardId===c.id?(
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  <div style={{ fontWeight:700, marginBottom:4 }}>Editar: {c.nome}</div>
                  {[{f:"nome",l:"Nome"},{f:"limite",l:"Limite (R$)",t:"number"},{f:"fechamento",l:"Dia de Fechamento",t:"number"},{f:"vencimento",l:"Dia de Vencimento",t:"number"}].map(field=>(
                    <div key={field.f}><div style={lbl2}>{field.l}</div>
                      {field.f==="limite" ? <MoneyInput style={inp2} value={(c[field.f]||0).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})} onChange={value=>setCards(p=>p.map(x=>x.id===c.id?{...x,[field.f]:moneyToNumber(value)}:x))}/> : <input style={inp2} type={field.t||"text"} value={c[field.f]} onChange={e=>setCards(p=>p.map(x=>x.id===c.id?{...x,[field.f]:field.t==="number"?parseInt(e.target.value)||0:e.target.value}:x))}/>}</div>
                  ))}
                  <div><div style={lbl2}>Conta para pagamento da fatura</div><select style={inp2} value={getCardPaymentAccountId(c)||""} onChange={e=>setCards(p=>p.map(x=>x.id===c.id?{...x,contaPagamentoId:e.target.value,accountId:e.target.value}:x))}><option value="">Selecione</option>{contas.filter(ct=>ct.tipo==="corrente").map(ct=><option key={ct.id} value={ct.id}>{ct.nome}</option>)}</select></div>
                  <div><div style={lbl2}>Cor</div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:4 }}>
                      {["#7C3AED","#E8504A","#00A878","#F5B700","#0891B2","#DB2777","#6366F1","#F97316","#84CC16","#B0BEC5"].map(cor=>(
                        <div key={cor} onClick={()=>setCards(p=>p.map(x=>x.id===c.id?{...x,cor}:x))} style={{ width:24, height:24, borderRadius:5, background:cor, cursor:"pointer", border:c.cor===cor?"2px solid #fff":"2px solid transparent" }}/>
                      ))}
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={()=>setEditCardId(null)} style={btn2(C.emerald,{ flex:1 })}>✓ Salvar</button>
                    <button onClick={()=>{
                      const dep = cardDependents(c.id);
                      const vinculados = dep.lanc + dep.comp + dep.sim;
                      if (vinculados > 0) {
                        // Há registros vinculados: abre o fluxo de mover-e-excluir.
                        setReassignDlg({ kind:"card", id:c.id, count:dep.lanc, target:"", error:"" });
                        return;
                      }
                      setConfirmDlg({ title:"Excluir cartão", message:`Excluir o cartão "${c.nome}"?`, tone:"coral", onConfirm:()=>{ setCards(p=>p.filter(x=>x.id!==c.id)); setEditCardId(null); setConfirmDlg(null); } });
                    }} style={btn2(C.coral,{ flex:1 })}>Excluir</button>
                  </div>
                </div>
              ):(
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:38, height:24, borderRadius:6, background:c.cor, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700 }}>{c.nome.slice(0,2).toUpperCase()}</div>
                    <div>
                      <div style={{ fontWeight:700 }}>{c.nome}</div>
                      <div style={{ fontSize:12, color:C.soft }}>Limite: {fmtBRL(c.limite)} · Fecha dia {c.fechamento} · Vence dia {c.vencimento} · Conta: {contas.find(ct=>ct.id===getCardPaymentAccountId(c))?.nome||"não definida"}</div>
                    </div>
                  </div>
                  <button onClick={()=>setEditCardId(c.id)} style={ghost2()}>Editar</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {section==="geral"&&(
        <div style={card2()}>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:16 }}>Parâmetros Gerais</div>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {[
                { key:"alertaLimite", l:"Alerta de limite do cartão (%)", t:"number", min:50, max:100, hint:"Exibe aviso quando o uso atingir esse percentual" },
                { key:"mesesProjecao", l:"Meses de projeção", t:"number", min:1, max:12, hint:"Quantos meses mostrar na aba Projeções" },
                { key:"duplaEntradaDias", l:"Janela de duplicatas (dias)", t:"number", min:1, max:10, hint:"Intervalo para detecção de duplicatas na importação" },
              ].map(f=>(
                <div key={f.key}>
                  <div style={lbl2}>{f.l}</div>
                  <input style={inp2} type={f.t} min={f.min} max={f.max} value={paramsBuf[f.key]} onChange={e=>setParamsBuf(p=>({...p,[f.key]:parseInt(e.target.value)||p[f.key]}))}/>
                  <div style={{ fontSize:11, color:C.soft, marginTop:3 }}>{f.hint}</div>
                </div>
              ))}
              <div>
                <div style={lbl2}>Moeda</div>
                <select style={inp2} value={paramsBuf.moeda} onChange={e=>setParamsBuf(p=>({...p,moeda:e.target.value}))}>
                  <option value="BRL">BRL — Real Brasileiro</option>
                  <option value="USD">USD — Dólar</option>
                  <option value="EUR">EUR — Euro</option>
                </select>
              </div>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {[{key:"alertaSaldo",l:"Alertar quando saldo mensal for negativo"},{key:"categAutoImport",l:"Categorização automática na importação de extratos"}].map(opt=>(
                <label key={opt.key} style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", background:C.navy, borderRadius:8, padding:"11px 13px" }}>
                  <div onClick={()=>setParamsBuf(p=>({...p,[opt.key]:!p[opt.key]}))} style={{ width:38, height:22, borderRadius:11, background:paramsBuf[opt.key]?C.emerald:C.border, position:"relative", cursor:"pointer", transition:"background .2s", flexShrink:0 }}>
                    <div style={{ position:"absolute", top:3, left:paramsBuf[opt.key]?18:3, width:16, height:16, borderRadius:8, background:"#fff", transition:"left .2s" }}/>
                  </div>
                  <span style={{ fontSize:13 }}>{opt.l}</span>
                </label>
              ))}
              <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", background:C.navy, borderRadius:8, padding:"11px 13px" }}>
                <div onClick={()=>setParamsBuf(p=>({...p,aiCategorization:{...p.aiCategorization,enabled:!p.aiCategorization?.enabled}}))} style={{ width:38, height:22, borderRadius:11, background:paramsBuf.aiCategorization?.enabled?C.emerald:C.border, position:"relative", cursor:"pointer", transition:"background .2s", flexShrink:0 }}>
                  <div style={{ position:"absolute", top:3, left:paramsBuf.aiCategorization?.enabled?18:3, width:16, height:16, borderRadius:8, background:"#fff", transition:"left .2s" }}/>
                </div>
                <span style={{ fontSize:13 }}>Sugestão de categoria por IA (beta) — estrutura em preparação, ainda sem chamada real de provedor</span>
              </label>
            </div>

            <div style={{ background:C.navy, borderRadius:10, padding:"13px 15px" }}>
              <div style={{ fontWeight:600, fontSize:13, marginBottom:10 }}>Cores do sistema</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:10 }}>
                {[{key:"corOK",l:"✅ OK"},{key:"corAtencao",l:"⚠️ Atenção"},{key:"corAlerta",l:"🔴 Alerta"}].map(cc=>(
                  <div key={cc.key}>
                    <div style={lbl2}>{cc.l}</div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <input type="color" value={paramsBuf[cc.key]} onChange={e=>setParamsBuf(p=>({...p,[cc.key]:e.target.value}))} style={{ width:34, height:26, border:"none", borderRadius:5, cursor:"pointer" }}/>
                      <span style={{ fontSize:12, color:C.soft }}>{paramsBuf[cc.key]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <button onClick={()=>setParams(paramsBuf)} style={btn2(C.emerald)}>✓ Salvar parâmetros</button>
              <button onClick={()=>setParamsBuf({...INIT_PARAMS})} style={ghost2({ padding:"8px 14px" })}>Restaurar padrões</button>
            </div>
            {JSON.stringify(paramsBuf)!==JSON.stringify(params)&&(
              <div style={{ fontSize:12, color:C.gold, background:C.gold+"11", padding:"8px 12px", borderRadius:8 }}>⚠️ Alterações não salvas — clique em "Salvar parâmetros" para aplicar.</div>
            )}
          </div>
        </div>
      )}

      {section==="contas"&&(
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={card2()}>
            <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>Contas e Vales</div>
            <div style={{ fontSize:13, color:C.soft, marginBottom:14 }}>Gerencie suas contas correntes e benefícios (vale alimentação, vale refeição).</div>
            {contas.map(ct=>(
              <div key={ct.id} style={{ background:C.navy, borderRadius:10, padding:"13px 15px", marginBottom:10, borderLeft:`3px solid ${ct.cor}` }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, marginBottom:10 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:22 }}>{ct.icon}</span>
                    <div>
                      <div style={{ fontWeight:700 }}>{ct.nome}</div>
                      <div style={{ fontSize:11, color:C.soft }}>{ct.tipo==="corrente"?"Conta Corrente":ct.tipo==="vale_alimentacao"?"Vale Alimentação":"Vale Refeição"}</div>
                    </div>
                  </div>
                  <button onClick={()=>{
                    if(contas.length<=1){ setConfirmDlg({ title:"Não é possível excluir", message:"É necessário manter ao menos uma conta cadastrada.", tone:"gold", confirmLabel:"Entendi", cancelLabel:"", onConfirm:()=>setConfirmDlg(null) }); return; }
                    const dep = contaDependents(ct.id);
                    if (dep.lanc + dep.cartoesVinc + dep.fat > 0) {
                      setReassignDlg({ kind:"account", id:ct.id, count:dep.lanc, target:"", error:"" });
                      return;
                    }
                    setConfirmDlg({ title:"Excluir conta", message:`Excluir a conta "${ct.nome}"?`, tone:"coral", onConfirm:()=>{ setContas(p=>p.filter(c=>c.id!==ct.id)); setConfirmDlg(null); } });
                  }} style={{ background:C.coral+"22", border:"none", borderRadius:5, color:C.coral, padding:"4px 9px", cursor:"pointer", fontSize:12 }}>Remover</button>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:12, color:C.soft, flexShrink:0 }}>Saldo inicial do mês (R$):</span>
                  <MoneyInput value={(ct.saldoInicial||0).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})}
                    onChange={value=>setContas(p=>p.map(c=>c.id===ct.id?{...c,saldoInicial:moneyToNumber(value)}:c))}
                    style={{ ...inp2, maxWidth:140, padding:"5px 9px", fontSize:13 }}/>
                  <span style={{ fontSize:11, color:C.soft }}>← Saldo na virada do mês</span>
                </div>
              </div>
            ))}
            <div style={{ marginTop:8, padding:"13px 15px", background:C.navy, borderRadius:10, border:`1px dashed ${C.border}` }}>
              <div style={{ fontWeight:600, fontSize:13, marginBottom:10, color:C.soft }}>+ Adicionar conta / vale</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
                <div>
                  <div style={{ fontSize:11, color:C.soft, marginBottom:4 }}>Nome</div>
                  <input id="nc_nome" style={inp2} placeholder="Ex: Banco Inter"/>
                </div>
                <div>
                  <div style={{ fontSize:11, color:C.soft, marginBottom:4 }}>Tipo</div>
                  <select id="nc_tipo" style={inp2}>
                    <option value="corrente">Conta Corrente</option>
                    <option value="vale_alimentacao">Vale Alimentação</option>
                    <option value="vale_refeicao">Vale Refeição</option>
                  </select>
                </div>
              </div>
              <button onClick={()=>{
                const nome=document.getElementById("nc_nome").value.trim();
                const tipo=document.getElementById("nc_tipo").value;
                if(!nome) return;
                const icons={corrente:"🏦",vale_alimentacao:"🛒",vale_refeicao:"🍽️"};
                const cors={corrente:"#0891B2",vale_alimentacao:"#84CC16",vale_refeicao:"#F97316"};
                setContas(p=>[...p,{ id:"ct"+Math.random().toString(36).slice(2,7), nome, tipo, cor:cors[tipo], icon:icons[tipo] }]);
                document.getElementById("nc_nome").value="";
              }} style={btn2(C.emerald,{ padding:"7px 14px", fontSize:13 })}>+ Adicionar</button>
            </div>
          </div>
        </div>
      )}

      {section==="dados"&&(
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={card2()}>
            <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>Dados locais</div>
            <div style={{ fontSize:13, color:C.soft, marginBottom:16 }}>Seus dados ficam salvos neste navegador automaticamente. Use as opções abaixo para fazer backup ou transferir para outro dispositivo.</div>

            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div style={{ background:C.navy, borderRadius:10, padding:"13px 15px" }}>
                <div style={{ fontWeight:600, fontSize:13, marginBottom:4 }}>💾 Exportar backup</div>
                <div style={{ fontSize:12, color:C.soft, marginBottom:10 }}>Gera um arquivo <code style={{ background:C.border, padding:"1px 5px", borderRadius:4, fontSize:11 }}>.json</code> com todos os seus lançamentos, cartões e categorias. Guarde em local seguro.</div>
                <button onClick={onExport} style={btn2(C.emerald, { padding:"7px 14px", fontSize:13 })}>⬇ Exportar backup</button>
              </div>

              <div style={{ background:C.navy, borderRadius:10, padding:"13px 15px" }}>
                <div style={{ fontWeight:600, fontSize:13, marginBottom:4 }}>📂 Importar backup</div>
                <div style={{ fontSize:12, color:C.soft, marginBottom:10 }}>Carrega um arquivo de backup gerado pelo FinançasPRO. <strong style={{ color:C.coral }}>Atenção: substitui todos os dados atuais.</strong></div>
                <label style={{ display:"inline-flex", alignItems:"center", gap:8, background:C.emerald, border:"none", borderRadius:8, color:"#fff", padding:"7px 14px", fontWeight:700, cursor:"pointer", fontSize:13 }}>
                  ⬆ Importar backup
                  <input type="file" accept=".json" style={{ display:"none" }} onChange={onImport}/>
                </label>
                {importMsg&&<div style={{ fontSize:12, marginTop:8, color:importMsg.startsWith("✅")?C.emerald:C.coral }}>{importMsg}</div>}
              </div>

              <div style={{ background:C.coral+"11", border:`1px solid ${C.coral}44`, borderRadius:10, padding:"13px 15px" }}>
                <div style={{ fontWeight:600, fontSize:13, marginBottom:4, color:C.coral }}>⚠️ Apagar dados financeiros</div>
                <div style={{ fontSize:12, color:C.soft, marginBottom:10 }}>Remove lançamentos, contas, cartões, faturas, saldos iniciais e simulações. Preserva categorias, subcategorias, limites/metas, parâmetros e toda a aba Pessoas. Essa ação não pode ser desfeita.</div>
                <button onClick={()=>{ if(window.confirm("Apagar lançamentos, contas, cartões, faturas e saldos? Categorias, limites/metas e Pessoas serão preservados.")) onReset(); }} style={btn2(C.coral, { padding:"7px 14px", fontSize:13 })}>Apagar dados financeiros</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
