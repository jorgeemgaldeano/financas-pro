import { useState, useMemo, useCallback, useEffect } from "react";
import { RequiredFieldModal, requiredFieldInfo, highlightIfRequired } from "./components/ui/RequiredFieldModal.jsx";
import { DateInput } from "./components/ui/DateInput.jsx";
import { EMPTY_TRANSACTION_FILTERS, TransactionFiltersPanel, filterTransactions } from "./components/finance/TransactionFiltersPanel.jsx";
import { guessCategoryForTransaction, normText } from "./services/categoryService.js";
import { buildImportKey, buildLegacyImportKey, expandImportedRows, extractIgnoredBankRows, parseBankFile, parseCardCSV, parseOFX, parseValePluxeeText } from "./services/importService.js";
import { LS_VERSION, LS_PREFIX, BACKUP_SCHEMA_VERSION, BACKUP_STORAGE_KEYS } from "./constants/storageKeys.js";
import { useLS, lsSave } from "./hooks/useLocalStorage.js";
import { fmtBRL, maskMoneyInput, moneyToNumber } from "./utils/moneyUtils.js";
import { addMonthsToDate, addMonthsToMonthKey, dateForMonthDay, fmtDate, formatMonthBR, mKey, monthCompare, monthOffset } from "./utils/dateUtils.js";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const APP_VERSION = "0.3.16.2";

// ── localStorage helpers ──────────────────────────────────────────────────────
function clearFinancasProStorage() {
  try {
    Object.keys(localStorage)
      .filter(key => key.startsWith("fpro_"))
      .forEach(key => localStorage.removeItem(key));
  } catch {}
}

function getFinancasProStorageSnapshot() {
  const snapshot = {};
  try {
    BACKUP_STORAGE_KEYS.forEach(key => {
      const storageKey = LS_PREFIX + key;
      const value = localStorage.getItem(storageKey);
      if (value !== null) snapshot[storageKey] = value;
    });
  } catch {}
  return snapshot;
}

function parseBackupRawValue(rawLocalStorage, key) {
  if (!rawLocalStorage || typeof rawLocalStorage !== "object") return undefined;
  const value = rawLocalStorage[LS_PREFIX + key] ?? rawLocalStorage[key];
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") return value;
  return JSON.parse(value);
}

function asArray(value, fallback = []) {
  return Array.isArray(value) ? value : fallback;
}

function asObject(value, fallback = {}) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : fallback;
}

function normalizeBackupPayload(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Arquivo de backup inválido.");
  }

  const source = payload.data && typeof payload.data === "object" ? payload.data : payload;
  const rawLocalStorage = payload.rawLocalStorage || source.rawLocalStorage || null;
  const hasKnownData = Boolean(
    source.trans || source.cards || source.cats ||
    source.transactions || source.categories ||
    rawLocalStorage
  );

  if (!hasKnownData) {
    throw new Error("Arquivo não possui dados reconhecidos do Finanças PRO.");
  }

  const read = (key, aliases = [], fallback) => {
    const names = [key, ...aliases];
    for (const name of names) {
      if (source[name] !== undefined) return source[name];
    }
    const rawValue = parseBackupRawValue(rawLocalStorage, key);
    return rawValue !== undefined ? rawValue : fallback;
  };

  const params = asObject(read("params", [], {}), {});
  const normalizedParams = {
    ...params,
    autoCategoryRules: asArray(params.autoCategoryRules, []),
  };

  return {
    trans: asArray(read("trans", ["transactions"], [])),
    contas: asArray(read("contas", ["accounts"], [])),
    metas: asObject(read("metas", ["goals"], {}), {}),
    pessoas: asArray(read("pessoas", ["people"], [])),
    dividas: asArray(read("dividas", ["debts"], [])),
    despPess: asArray(read("despPess", ["sharedExpenses"], [])),
    cards: asArray(read("cards", [], [])),
    cats: asArray(read("cats", ["categories"], [])),
    params: normalizedParams,
    saldosIniciais: asObject(read("saldosIniciais", ["initialBalances"], {}), {}),
    faturas: asArray(read("faturas", ["invoices"], [])),
    simulacoes: asArray(read("simulacoes", ["sims", "simulations"], [])),
    importReports: asArray(read("importReports", ["imports"], [])),
  };
}

const C = {
  navy:"#0F1E36", surface:"#162640", border:"#1E3050",
  emerald:"#00A878", coral:"#E8504A", gold:"#F5B700",
  muted:"#4A6380", text:"#E8EDF4", soft:"#8FA8C0",
};

const INIT_CATS = [
  { id:"cat1", nome:"Alimentação",  cor:"#00A878", icon:"🍽️", subs:[
    { id:"sub1a", nome:"Supermercado", subs:[] },
    { id:"sub1b", nome:"Restaurantes", subs:[
      { id:"sub1b1", nome:"Almoço", subs:[] },
      { id:"sub1b2", nome:"Jantar", subs:[] },
      { id:"sub1b3", nome:"Fast Food", subs:[] },
    ]},
    { id:"sub1c", nome:"Delivery", subs:[] },
    { id:"sub1d", nome:"Padaria / Café", subs:[] },
  ]},
  { id:"cat2", nome:"Transporte",   cor:"#F5B700", icon:"🚗", subs:[
    { id:"sub2a", nome:"Combustível", subs:[] },
    { id:"sub2b", nome:"Aplicativos (Uber/99)", subs:[] },
    { id:"sub2c", nome:"Transporte Público", subs:[] },
    { id:"sub2d", nome:"Estacionamento", subs:[] },
    { id:"sub2e", nome:"Manutenção Veículo", subs:[] },
  ]},
  { id:"cat3", nome:"Moradia",      cor:"#FFAB40", icon:"🏠", subs:[
    { id:"sub3a", nome:"Aluguel", subs:[] },
    { id:"sub3b", nome:"Condomínio", subs:[] },
    { id:"sub3c", nome:"Energia Elétrica", subs:[] },
    { id:"sub3d", nome:"Água / Gás", subs:[] },
    { id:"sub3e", nome:"Internet / TV", subs:[] },
    { id:"sub3f", nome:"Manutenção / Reforma", subs:[] },
  ]},
  { id:"cat4", nome:"Saúde",        cor:"#4FC3F7", icon:"❤️", subs:[
    { id:"sub4a", nome:"Plano de Saúde", subs:[] },
    { id:"sub4b", nome:"Farmácia", subs:[] },
    { id:"sub4c", nome:"Consultas / Exames", subs:[] },
    { id:"sub4d", nome:"Academia / Esporte", subs:[] },
  ]},
  { id:"cat5", nome:"Lazer",        cor:"#CE93D8", icon:"🎮", subs:[
    { id:"sub5a", nome:"Streaming", subs:[
      { id:"sub5a1", nome:"Netflix", subs:[] },
      { id:"sub5a2", nome:"Spotify / Música", subs:[] },
      { id:"sub5a3", nome:"Outros Streaming", subs:[] },
    ]},
    { id:"sub5b", nome:"Cinema / Teatro", subs:[] },
    { id:"sub5c", nome:"Jogos", subs:[] },
    { id:"sub5d", nome:"Viagens", subs:[] },
  ]},
  { id:"cat6", nome:"Educação",     cor:"#80DEEA", icon:"📚", subs:[
    { id:"sub6a", nome:"Cursos Online", subs:[] },
    { id:"sub6b", nome:"Livros", subs:[] },
    { id:"sub6c", nome:"Mensalidade Escolar", subs:[] },
  ]},
  { id:"cat7", nome:"Vestuário",    cor:"#F48FB1", icon:"👕", subs:[
    { id:"sub7a", nome:"Roupas", subs:[] },
    { id:"sub7b", nome:"Calçados", subs:[] },
  ]},
  { id:"cat8", nome:"Tecnologia",   cor:"#A5D6A7", icon:"💻", subs:[
    { id:"sub8a", nome:"Hardware / Dispositivos", subs:[] },
    { id:"sub8b", nome:"Serviços Cloud / SaaS", subs:[] },
    { id:"sub8c", nome:"Assinaturas Tech", subs:[] },
  ]},
  { id:"cat9", nome:"Receitas",     cor:"#34D399", icon:"💰", subs:[
    { id:"sub9a", nome:"Salário", subs:[] },
    { id:"sub9b", nome:"Freelance", subs:[] },
    { id:"sub9c", nome:"Investimentos", subs:[] },
  ]},
  { id:"cat10",nome:"Outros",       cor:"#B0BEC5", icon:"📦", subs:[] },
];

const INIT_PARAMS = {
  moeda:"BRL", alertaLimite:85, alertaSaldo:true,
  mesesProjecao:3, categAutoImport:true, duplaEntradaDias:3,
  corAlerta:"#E8504A", corOK:"#00A878", corAtencao:"#F5B700",
};

const TODAY = new Date();
const Y = TODAY.getFullYear(), M = TODAY.getMonth();
const dd = (day, mo=M) => new Date(Y, mo, day).toISOString().slice(0,10);

const INIT_CARDS = [
  { id:"c1", nome:"Nubank",    limite:5000, fechamento:10, vencimento:17, cor:"#7C3AED", contaPagamentoId:"cc1" },
  { id:"c2", nome:"Itaú Visa", limite:8000, fechamento:25, vencimento:5,  cor:"#E8504A", contaPagamentoId:"cc1" },
];

const INIT_CONTAS = [
  { id:"cc1", nome:"Conta Corrente",    tipo:"corrente",        cor:"#0891B2", icon:"🏦", saldoInicial:2500 },
  { id:"va1", nome:"Vale Alimentação",  tipo:"vale_alimentacao",cor:"#84CC16", icon:"🛒", saldoInicial:0 },
  { id:"vr1", nome:"Vale Refeição",     tipo:"vale_refeicao",   cor:"#F97316", icon:"🍽️", saldoInicial:0 },
];

// Metas de gastos mensais por categoria (catId -> limite em R$)
const INIT_METAS = {};

// ── Pessoas ──────────────────────────────────────────────────────────────────
// Cadastro de pessoas com quem há relacionamento financeiro
const INIT_PESSOAS = [
  { id:"p1", nome:"Carlos",  cor:"#7C3AED", icon:"👤" },
  { id:"p2", nome:"Mariana", cor:"#DB2777", icon:"👤" },
];

// ── Dívidas ───────────────────────────────────────────────────────────────────
// Dívidas de terceiros comigo (eles me devem)
// amortizacoes: [{ id, data, valor, modo, obs }]
const INIT_DIVIDAS = [
  { id:"d1", pessoaId:"p1", descricao:"Empréstimo pessoal",        total:1500, dataInicio:dd(10,-2), status:"aberta",
    amortizacoes:[
      { id:"a1", data:dd(5,-1), valor:300, modo:"Pix",           obs:"" },
      { id:"a2", data:dd(5,0),  valor:300, modo:"Transferência", obs:"" },
    ]
  },
  { id:"d2", pessoaId:"p2", descricao:"Divide da viagem",          total:800,  dataInicio:dd(15,-1), status:"aberta",
    amortizacoes:[
      { id:"a3", data:dd(20,-1), valor:200, modo:"Dinheiro", obs:"" },
    ]
  },
];

// ── Despesas compartilhadas ───────────────────────────────────────────────────
// Despesas mensais com pessoas (empréstimo de cartão, racha, etc.)
// status: "pendente" | "recebido"
const INIT_DESPESAS_PESSOAS = [
  { id:"dp1", pessoaId:"p1", tipo:"receita", descricao:"Assinatura Netflix compartilhada", valor:25,  data:dd(1),  competencia:dd(1).slice(0,7),  cartaoId:"c2", catId:"sub5a1", status:"pendente", valorPago:0, parcelado:false, fixo:true, parcela:1, totalParcelas:12, parcelaGrupo:"grp_dp_netflix" },
  { id:"dp2", pessoaId:"p2", tipo:"receita", descricao:"Jantar restaurante",               valor:134, data:dd(14), competencia:dd(14).slice(0,7), cartaoId:"c1", catId:"sub1b2", status:"recebido", valorPago:134, parcelado:false, fixo:false },
];

const INIT_TRANS = [
  { id:"t1",  tipo:"despesa", origem:"corrente",        catId:"sub3a",  descricao:"Aluguel",         valor:1800, data:dd(5),    cartaoId:null, contaId:"cc1", fixo:true  },
  { id:"t2",  tipo:"despesa", origem:"corrente",        catId:"sub1a",  descricao:"Supermercado",    valor:420,  data:dd(7),    cartaoId:null, contaId:"cc1", fixo:false },
  { id:"t3",  tipo:"despesa", origem:"cartao",          catId:"sub1c",  descricao:"iFood",           valor:89,   data:dd(3),    cartaoId:"c1", contaId:null,  fixo:false },
  { id:"t4",  tipo:"despesa", origem:"cartao",          catId:"sub2b",  descricao:"Uber",            valor:45,   data:dd(8),    cartaoId:"c1", contaId:null,  fixo:false },
  { id:"t5",  tipo:"despesa", origem:"cartao",          catId:"sub5a1", descricao:"Netflix",         valor:39.9, data:dd(1),    cartaoId:"c2", contaId:null,  fixo:true  },
  { id:"t6",  tipo:"despesa", origem:"cartao",          catId:"sub5a2", descricao:"Spotify",         valor:21.9, data:dd(1),    cartaoId:"c2", contaId:null,  fixo:true  },
  { id:"t7",  tipo:"despesa", origem:"corrente",        catId:"sub4b",  descricao:"Farmácia",        valor:156,  data:dd(12),   cartaoId:null, contaId:"cc1", fixo:false },
  { id:"t8",  tipo:"receita", origem:"corrente",        catId:"sub9a",  descricao:"Salário",         valor:6500, data:dd(5),    cartaoId:null, contaId:"cc1", fixo:true  },
  { id:"t9",  tipo:"despesa", origem:"cartao",          catId:"sub1b2", descricao:"Restaurante",     valor:134,  data:dd(14),   cartaoId:"c1", contaId:null,  fixo:false },
  { id:"t10", tipo:"despesa", origem:"corrente",        catId:"sub6a",  descricao:"Curso online",    valor:99,   data:dd(10),   cartaoId:null, contaId:"cc1", fixo:true  },
  { id:"t11", tipo:"despesa", origem:"corrente",        catId:"sub3a",  descricao:"Aluguel",         valor:1800, data:dd(5,-1), cartaoId:null, contaId:"cc1", fixo:true  },
  { id:"t12", tipo:"despesa", origem:"corrente",        catId:"sub1a",  descricao:"Supermercado",    valor:380,  data:dd(9,-1), cartaoId:null, contaId:"cc1", fixo:false },
  { id:"t13", tipo:"despesa", origem:"cartao",          catId:"sub5b",  descricao:"Cinema",          valor:60,   data:dd(15,-1),cartaoId:"c1", contaId:null,  fixo:false },
  { id:"t14", tipo:"receita", origem:"corrente",        catId:"sub9a",  descricao:"Salário",         valor:6500, data:dd(5,-1), cartaoId:null, contaId:"cc1", fixo:true  },
  { id:"t15", tipo:"despesa", origem:"cartao",          catId:"sub8b",  descricao:"AWS",             valor:47,   data:dd(20,-1),cartaoId:"c2", contaId:null,  fixo:false },
  // Vale Alimentação — crédito + uso
  { id:"t16", tipo:"receita", origem:"vale_alimentacao",catId:"sub9a",  descricao:"Crédito VA",      valor:800,  data:dd(5),    cartaoId:null, contaId:"va1", fixo:true  },
  { id:"t17", tipo:"despesa", origem:"vale_alimentacao",catId:"sub1a",  descricao:"Supermercado VA", valor:210,  data:dd(8),    cartaoId:null, contaId:"va1", fixo:false },
  { id:"t18", tipo:"despesa", origem:"vale_alimentacao",catId:"sub1a",  descricao:"Hortifruti",      valor:95,   data:dd(15),   cartaoId:null, contaId:"va1", fixo:false },
  // Vale Refeição — crédito + uso
  { id:"t19", tipo:"receita", origem:"vale_refeicao",   catId:"sub9a",  descricao:"Crédito VR",      valor:600,  data:dd(5),    cartaoId:null, contaId:"vr1", fixo:true  },
  { id:"t20", tipo:"despesa", origem:"vale_refeicao",   catId:"sub1b",  descricao:"Almoço",          valor:42,   data:dd(6),    cartaoId:null, contaId:"vr1", fixo:false },
  { id:"t21", tipo:"despesa", origem:"vale_refeicao",   catId:"sub1b",  descricao:"Almoço",          valor:38,   data:dd(9),    cartaoId:null, contaId:"vr1", fixo:false },
  { id:"t22", tipo:"despesa", origem:"vale_refeicao",   catId:"sub1b",  descricao:"Restaurante VR",  valor:55,   data:dd(13),   cartaoId:null, contaId:"vr1", fixo:false },
];

const MONTHS  = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const uid     = () => Math.random().toString(36).slice(2,9);

const transMonthKey = (t) => t.competencia || t.competenceMonth || mKey(t.data);

const valorRealizado = (t) => {
  if (t.status === "previsto") return 0;
  if (t.status === "parcial") return Math.min(Number(t.valorPago) || 0, Number(t.valor) || 0);
  return Number(t.valor) || 0;
};

const saldoPendente = (t) => Math.max(0, (Number(t.valor) || 0) - (Number(t.valorPago) || 0));

const invoiceIdFor = (cardId, monthKey) => `inv_${cardId}_${monthKey}`;
const getCardPaymentAccountId = (card, fallback = null) => card?.contaPagamentoId || card?.accountId || fallback || null;
const invoiceStatusByPayment = (paidAmount, totalAmount) => {
  const paid = Number(paidAmount) || 0;
  const total = Number(totalAmount) || 0;
  if (total > 0 && paid >= total) return "paga";
  if (paid > 0) return "parcialmente_paga";
  return "fechada";
};
const paymentStatusByPaidAmount = (paidAmount, totalAmount) => {
  const paid = Number(paidAmount) || 0;
  const total = Number(totalAmount) || 0;
  if (total > 0 && paid >= total) return "pago";
  if (paid > 0) return "parcial";
  return "previsto";
};
const roundMoney = (value) => Math.round((Number(value) || 0) * 100) / 100;
const invoicePaymentLabel = (paidAmount, totalAmount) => {
  const paid = roundMoney(paidAmount);
  const total = roundMoney(totalAmount);
  if (total <= 0) return "Sem valor";
  if (paid >= total) return "Paga";
  if (paid > 0) return "Paga parcialmente";
  return "Pendente de pagamento";
};
const invoiceClosureLabel = (closureStatus) => {
  if (closureStatus === "manual") return "Fechada manualmente";
  if (closureStatus === "automatic") return "Fechada automaticamente";
  return "Aberta";
};

const CLOSED_INVOICE_STATUSES = ["fechada", "parcialmente_paga", "paga"];

const getInvoiceRecordFor = (faturas, cardId, monthKey) => {
  return Array.isArray(faturas)
    ? faturas.find(f =>
        f.cardId === cardId &&
        (f.competenceMonth || f.competencia || f.faturaMes) === monthKey
      )
    : null;
};

const getInvoiceClosureStatusForMonth = (faturas, card, monthKey, todayKey = new Date().toISOString().slice(0, 10)) => {
  if (!card || !monthKey) return "open";
  const invoiceRecord = getInvoiceRecordFor(faturas, card.id, monthKey);
  if (invoiceRecord?.status === "aberta") return "open";
  if (invoiceRecord && CLOSED_INVOICE_STATUSES.includes(invoiceRecord.status)) {
    return invoiceRecord.closureType || invoiceRecord.fechamentoTipo || invoiceRecord.closedBy || "manual";
  }
  const fechamentoData = dateForMonthDay(monthKey, card.fechamento || card.closingDay || 31);
  return todayKey > fechamentoData ? "automatic" : "open";
};

const isInvoiceClosed = (faturas, cardId, monthKey) => {
  const invoiceRecord = getInvoiceRecordFor(faturas, cardId, monthKey);
  return Boolean(invoiceRecord && CLOSED_INVOICE_STATUSES.includes(invoiceRecord.status));
};

const isInvoiceClosedForNewEntries = (faturas, card, monthKey) => {
  return getInvoiceClosureStatusForMonth(faturas, card, monthKey) !== "open";
};

const getCardInvoiceCompetence = (dateKey, card, faturas = []) => {
  if (!dateKey) return mKey(new Date().toISOString());
  const baseMonth = mKey(dateKey);
  if (!card) return baseMonth;
  const day = parseInt(String(dateKey).slice(8, 10), 10) || 1;
  const closingDay = parseInt(card.fechamento || card.closingDay || 31, 10) || 31;
  return day <= closingDay ? baseMonth : monthOffset(baseMonth, 1);
};

const signedCardAmount = (t) => {
  const v = Number(t.valor) || 0;
  if (t.natureza === "ajuste_fatura_cartao" && t.ajusteFaturaTipo === "reducao") return -v;
  if (t.tipo === "receita") return -v;
  return v;
};
function MoneyInput({ value, onChange, style, placeholder="0,00", ...props }) {
  return (
    <input
      {...props}
      style={style}
      type="text"
      inputMode="numeric"
      placeholder={placeholder}
      value={value || ""}
      onChange={e=>onChange(maskMoneyInput(e.target.value))}
    />
  );
}

// ── Category tree helpers
function flattenCats(cats, depth=0, parentId=null, parentPath="") {
  const rows=[];
  for (const cat of cats) {
    const path = parentPath ? `${parentPath} › ${cat.nome}` : cat.nome;
    rows.push({ id:cat.id, nome:cat.nome, cor:cat.cor||null, icon:cat.icon||null, depth, parentId, path, hasSubs:!!(cat.subs?.length) });
    if (cat.subs?.length) rows.push(...flattenCats(cat.subs, depth+1, cat.id, path));
  }
  return rows;
}
function findCat(cats, id) {
  for (const c of cats) { if (c.id===id) return c; if (c.subs?.length) { const r=findCat(c.subs,id); if(r) return r; } }
  return null;
}
function findRootCat(cats, id) {
  for (const c of cats) { if (c.id===id) return c; if (c.subs?.length && findCat(c.subs,id)) return c; }
  return null;
}
function catColor(cats, id) { return findRootCat(cats,id)?.cor||"#B0BEC5"; }
function catIcon(cats, id)  { return findRootCat(cats,id)?.icon||"📦"; }
function catLabel(cats, id) { return flattenCats(cats).find(f=>f.id===id)?.path||id; }

// ── Charts
function BarChart({ data, color=C.emerald, height=80 }) {
  const max=Math.max(...data.map(d=>d.value),1);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:4, height }}>
      {data.map((d,i)=>(
        <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
          <div style={{ width:"100%", background:color, borderRadius:3, height:`${(d.value/max)*(height-18)}px`, minHeight:d.value>0?4:0, opacity:i===data.length-1?1:0.5 }}/>
          <span style={{ fontSize:9, color:C.soft }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}
function DonutChart({ segments, size=120 }) {
  const total=segments.reduce((s,x)=>s+x.value,0);
  let offset=0; const r=45,cx=60,cy=60,circ=2*Math.PI*r;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth={14}/>
      {segments.map((seg,i)=>{ const pct=seg.value/total,dash=pct*circ,gap=circ-dash; const el=<circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color} strokeWidth={14} strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-offset*circ} style={{ transform:"rotate(-90deg)", transformOrigin:"60px 60px" }}/>; offset+=pct; return el; })}
      <text x={cx} y={cy-4} textAnchor="middle" fill={C.text} fontSize={11} fontWeight="700">{fmtBRL(total).replace("R$","")}</text>
      <text x={cx} y={cy+12} textAnchor="middle" fill={C.soft} fontSize={8}>total</text>
    </svg>
  );
}

// ── Sim expander
function expandSim(sim, cards = [], faturas = []) {
  if (!sim?.data) return [];
  const n = parseInt(sim.parcelas) || 1;
  const card = cards.find(c => c.id === sim.cartaoId);
  const vp = sim.modoParc === "total" ? moneyToNumber(sim.valor) / n : moneyToNumber(sim.valor);
  const firstCompetence = sim.faturaCompetencia || getCardInvoiceCompetence(sim.data, card, faturas);

  return Array.from({ length:n }, (_, i) => {
    const dateKey = addMonthsToDate(sim.data, i);
    const competencia = monthOffset(firstCompetence, i);
    return {
      id: sim.id + "_" + i,
      simId: sim.id,
      tipo: "despesa",
      origem: "cartao",
      cartaoId: sim.cartaoId,
      catId: sim.catId,
      descricao: sim.descricao,
      valor: parseFloat(vp.toFixed(2)),
      data: dateKey,
      competencia,
      parcela: i + 1,
      totalParcelas: n,
      simul: true,
    };
  });
}

// ── CategorySelect
function CategorySelect({ cats, value, onChange, style, validationInfo, fieldKey = "catId" }) {
  const flat=useMemo(()=>flattenCats(cats),[cats]);
  const s=highlightIfRequired({ background:C.navy, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, padding:"8px 12px", fontSize:14, width:"100%", outline:"none", ...style }, validationInfo, fieldKey);
  return (
    <select style={s} value={value||""} onChange={e=>onChange(e.target.value)}>
      <option value="">Selecione a categoria</option>
      {flat.map(f=><option key={f.id} value={f.id} disabled={f.hasSubs}>{"  ".repeat(f.depth)}{f.depth>0?"└ ":""}{f.nome}{f.hasSubs?" ▸":""}</option>)}
    </select>
  );
}

// ── ParamsTab
// ── PessoasTab ────────────────────────────────────────────────────────────────
function PessoasTab({ pessoas, setPessoas, dividas, setDividas, despPess, setDespPess,
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
    tipo:"receita", descricao:"", valor:"", data:new Date().toISOString().slice(0,10),
    cartaoId:"", catId:"", status:"pendente",
    parcelado:false, modoParc:"total", parcelas:2,
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
                <button onClick={()=>{ setModalAmort(d.id); setAmortForm({ valor:"", data:new Date().toISOString().slice(0,10), modo:"Pix", obs:"" }); }}
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
                      <div><div style={lbl}>Parcelas</div><input style={inp} type="number" min={2} max={48} value={despForm.parcelas||2} onChange={e=>setDespForm(f=>({...f,parcelas:e.target.value}))}/></div>
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
                    <input type="checkbox" checked={!!despForm.fixo} onChange={e=>setDespForm(f=>({...f,fixo:e.target.checked,parcelado:e.target.checked?false:f.parcelado,data:e.target.checked?"":(f.data||new Date().toISOString().slice(0,10))}))}/>
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

// ── MetaInput: inline editable limit field ───────────────────────────────────
function MetaInput({ catId, metas, setMetas, compact=false }) {
  const [editing, setEditing] = useState(false);
  const [buf, setBuf] = useState("");
  const val = metas[catId]||0;
  if (editing) {
    return (
      <MoneyInput autoFocus value={buf}
        style={{ width:compact?80:100, background:"#0F1E36", border:"1px solid #00A878", borderRadius:6, color:"#E8EDF4", padding:"3px 7px", fontSize:13, outline:"none" }}
        onChange={setBuf}
        onBlur={()=>{ setMetas(p=>({...p,[catId]:moneyToNumber(buf)||0})); setEditing(false); }}
        onKeyDown={e=>{ if(e.key==="Enter"){ setMetas(p=>({...p,[catId]:moneyToNumber(buf)||0})); setEditing(false); } if(e.key==="Escape") setEditing(false); }}
      />
    );
  }
  return (
    <span onClick={()=>{ setBuf(val?val.toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2}):""); setEditing(true); }}
      style={{ minWidth:compact?70:90, display:"inline-block", textAlign:"right", cursor:"pointer", fontWeight:700, fontSize:compact?13:14,
               color:val>0?"#E8EDF4":"#4A6380", background:val>0?"#1E3050":"transparent",
               border:"1px solid #1E3050", borderRadius:6, padding:"3px 8px" }}>
      {val>0?val.toLocaleString("pt-BR",{style:"currency",currency:"BRL"}):"Definir"}
    </span>
  );
}

function ParamsTab({ cats, params, setParams, flatCats, addRootCat, addSubCat, delCat, renameCat, recolorCat, cards, setCards, contas, setContas, onExport, onImport, onReset }) {
  const [section, setSection] = useState("cats");
  const [paramsBuf, setParamsBuf] = useState({...params});
  const [newCat, setNewCat] = useState({ nome:"", cor:"#B0BEC5", icon:"📦" });
  const [newSubForm, setNewSubForm] = useState({});
  const [renameForm, setRenameForm] = useState({});
  const [expanded, setExpanded] = useState({});
  const [editCardId, setEditCardId] = useState(null);
  const [importMsg, setImportMsg] = useState("");
  const [autoRuleForm, setAutoRuleForm] = useState({ tipo:"despesa", catId:"", keywords:"" });

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
            <button onClick={()=>{ if(window.confirm(`Excluir "${cat.nome}"?`)) delCat(cat.id); }} style={ghost2({ color:C.coral })}>×</button>
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
                    <button onClick={()=>{ if(window.confirm("Excluir cartão?")){ setCards(p=>p.filter(x=>x.id!==c.id)); setEditCardId(null); }}} style={btn2(C.coral,{ flex:1 })}>Excluir</button>
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
                  <button onClick={()=>contas.length>1&&setContas(p=>p.filter(c=>c.id!==ct.id))} style={{ background:C.coral+"22", border:"none", borderRadius:5, color:C.coral, padding:"4px 9px", cursor:"pointer", fontSize:12 }}>Remover</button>
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

// ── Main App
export default function App() {
  const [tab,      setTab]      = useState("dashboard");
  const [trans,    setTrans]    = useLS("trans",  INIT_TRANS);
  const [contas,   setContas]   = useLS("contas", INIT_CONTAS);
  const [metas,    setMetas]    = useLS("metas",  INIT_METAS);
  const [pessoas,  setPessoas]  = useLS("pessoas", INIT_PESSOAS);
  const [dividas,  setDividas]  = useLS("dividas", INIT_DIVIDAS);
  const [despPess, setDespPess] = useLS("despPess",INIT_DESPESAS_PESSOAS);
  const [cards,    setCards]    = useLS("cards",  INIT_CARDS);
  const [cats,     setCats]     = useLS("cats",   INIT_CATS);
  const [params,   setParams]   = useLS("params", INIT_PARAMS);
  const [saldosIniciais, setSaldosIniciais] = useLS("saldosIniciais", {});
  const [faturas, setFaturas] = useLS("faturas", []);
  const [selMonth, setSelMonth] = useState(mKey(TODAY.toISOString()));
  const [modal,    setModal]    = useState(null);
  const [form,     setForm]     = useState({});
  const [sims,     setSims]     = useLS("simulacoes", []);
  const [simForm,  setSimForm]  = useState({ modoParc:"total", parcelas:1 });
  const [showContaForm, setShowContaForm] = useState(false);
  const [novaContaForm, setNovaContaForm] = useState({ nome:"", tipo:"corrente" });
  const [impStep,  setImpStep]  = useState("upload");
  const [impMode,  setImpMode]  = useState("cartao");
  const [impCId,   setImpCId]   = useState("");
  const [impContaId, setImpContaId] = useState("");
  const [impBanco, setImpBanco] = useState("auto");
  const [impValeYear, setImpValeYear] = useState(String(new Date().getFullYear()));
  const [impCompetencia, setImpCompetencia] = useState(selMonth);
  const [impRows,  setImpRows]  = useState([]);
  const [impTog,   setImpTog]   = useState({});
  const [impErr,   setImpErr]   = useState("");
  const [impFile,  setImpFile]  = useState("");
  const [impDups,  setImpDups]  = useState(new Set());
  const [impIgnored, setImpIgnored] = useState([]);
  const [lastImportReport, setLastImportReport] = useState(null);
  const [requiredModal, setRequiredModal] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  const [expandedAccounts, setExpandedAccounts] = useState({});
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [transactionFilters, setTransactionFilters] = useState({
    dataInicio: "",
    dataFim: "",
    rootCatId: "",
    origem: "",
    tipo: "",
    status: "",
  });

  useEffect(() => {
    const primeiraCC = contas.find(c => c.tipo === "corrente")?.id || contas[0]?.id || "cc1";
    const precisaMigrar = cards.some(c => !c.contaPagamentoId || !c.accountId);
    if (precisaMigrar) {
      setCards(prev => prev.map(c => {
        const contaAssociada = getCardPaymentAccountId(c, primeiraCC);
        return { ...c, contaPagamentoId: contaAssociada, accountId: contaAssociada };
      }));
    }
  }, [cards, contas, setCards]);

  const contasCorrentes = useMemo(() => contas.filter(c => c.tipo === "corrente"), [contas]);
  const primeiraContaCorrenteId = contasCorrentes[0]?.id || contas[0]?.id || "cc1";

  const simTrans = useMemo(()=>sims.flatMap(sim => expandSim(sim, cards, faturas)),[sims, cards, faturas]);
  const [selYear, selMon] = selMonth.split("-").map(Number);
  const monthTrans = useMemo(()=>trans.filter(t=>transMonthKey(t)===selMonth),[trans,selMonth]);

  // ── Saldos mensais, previstos e realizados ────────────────────────────────
  const movimentoContaMes = useCallback((ct, monthKey) => {
    return trans
      .filter(t => transMonthKey(t) === monthKey && t.contaId === ct.id && t.origem !== "cartao")
      .reduce((sum, t) => {
        const v = valorRealizado(t);
        return sum + (t.tipo === "receita" ? v : -v);
      }, 0);
  }, [trans]);

  const baseSaldoMonth = useMemo(() => {
    const keys = trans.map(t => transMonthKey(t)).filter(Boolean).sort();
    return keys[0] || selMonth;
  }, [trans, selMonth]);

  const getSaldoInicialConta = useCallback(function calc(ct, monthKey, depth = 0) {
    const manual = saldosIniciais?.[monthKey]?.[ct.id];
    if (manual !== undefined && manual !== null && manual !== "") return Number(manual) || 0;
    if (monthCompare(monthKey, baseSaldoMonth) <= 0 || depth > 72) return Number(ct.saldoInicial) || 0;
    const prevKey = monthOffset(monthKey, -1);
    return calc(ct, prevKey, depth + 1) + movimentoContaMes(ct, prevKey);
  }, [saldosIniciais, baseSaldoMonth, movimentoContaMes]);

  const setSaldoInicialContaMes = useCallback((contaId, monthKey, value) => {
    setSaldosIniciais(prev => ({
      ...prev,
      [monthKey]: { ...(prev?.[monthKey] || {}), [contaId]: moneyToNumber(value) }
    }));
  }, [setSaldosIniciais]);

  const calcularFaturaCartao = useCallback((card, monthKey = selMonth) => {
    const itens = trans.filter(t => t.cartaoId === card.id && t.origem === "cartao" && transMonthKey(t) === monthKey);
    const total = itens.reduce((sum, t) => sum + signedCardAmount(t), 0);
    const ajustes = itens.filter(t => t.natureza === "ajuste_fatura_cartao").reduce((sum, t) => sum + signedCardAmount(t), 0);
    return { itens, total: Math.max(0, Number(total.toFixed(2))), ajustes };
  }, [trans, selMonth]);

  // Receitas/despesas realizadas = valores pagos/baixados. Previstos não impactam saldo realizado.
  const receitaCorr  = useMemo(()=>monthTrans.filter(t=>t.tipo==="receita"&&t.origem==="corrente").reduce((s,t)=>s+valorRealizado(t),0),[monthTrans]);
  const receitaVales = useMemo(()=>monthTrans.filter(t=>t.tipo==="receita"&&(t.origem==="vale_alimentacao"||t.origem==="vale_refeicao")).reduce((s,t)=>s+valorRealizado(t),0),[monthTrans]);
  const receitas     = receitaCorr + receitaVales;

  const despCorr  = useMemo(()=>monthTrans.filter(t=>t.tipo==="despesa"&&t.origem==="corrente").reduce((s,t)=>s+valorRealizado(t),0),[monthTrans]);
  const despVales = useMemo(()=>monthTrans.filter(t=>t.tipo==="despesa"&&(t.origem==="vale_alimentacao"||t.origem==="vale_refeicao")).reduce((s,t)=>s+valorRealizado(t),0),[monthTrans]);
  const despCorrTotal = despCorr + despVales;

  const saldoInicialTotal = useMemo(()=>contas.reduce((s,c)=>s+getSaldoInicialConta(c, selMonth),0),[contas,getSaldoInicialConta,selMonth]);
  const saldoFinal = saldoInicialTotal + receitas - despCorrTotal;
  const saldo = saldoFinal;

  const saldoContaFinal = useCallback((ct)=>getSaldoInicialConta(ct, selMonth) + movimentoContaMes(ct, selMonth),[getSaldoInicialConta,movimentoContaMes,selMonth]);

  const faturasDoMes = useMemo(() => cards.map(c => ({ ...c, ...calcularFaturaCartao(c, selMonth) })), [cards, calcularFaturaCartao, selMonth]);
  const despCart = useMemo(()=>faturasDoMes.reduce((s,c)=>s+c.total,0),[faturasDoMes]);

  const flatCats = useMemo(()=>flattenCats(cats),[cats]);
  const getCatColor = useCallback((id)=>catColor(cats,id),[cats]);
  const getCatIcon  = useCallback((id)=>catIcon(cats,id),[cats]);
  const getCatLabel = useCallback((id)=>catLabel(cats,id),[cats]);

  const catBreakdown = useMemo(()=>{
    const map={};
    monthTrans.filter(t=>t.tipo==="despesa").forEach(t=>{ const root=findRootCat(cats,t.catId)?.nome||"Outros"; map[root]=(map[root]||0)+t.valor; });
    return Object.entries(map).map(([cat,val])=>({ cat,val, color:cats.find(c=>c.nome===cat)?.cor||"#B0BEC5" })).sort((a,b)=>b.val-a.val);
  },[monthTrans,cats]);

  const last6 = useMemo(()=>Array.from({length:6},(_,i)=>{ const dt=new Date(Y,M-5+i,1),k=dt.toISOString().slice(0,7); return { label:MONTHS[dt.getMonth()], value:trans.filter(t=>t.tipo==="despesa"&&transMonthKey(t)===k).reduce((s,t)=>s+t.valor,0) }; }),[trans]);

  const cardTotals = useMemo(()=>cards.map(c=>{
    const fat = calcularFaturaCartao(c, selMonth);
    const gastoSim = simTrans.filter(t=>t.cartaoId===c.id&&transMonthKey(t)===selMonth).reduce((s,t)=>s+t.valor,0);
    const contaPag = contas.find(ct => ct.id === getCardPaymentAccountId(c));
    const invoiceId = invoiceIdFor(c.id, selMonth);
    const invoiceRecord = getInvoiceRecordFor(faturas, c.id, selMonth) || faturas.find(f => f.id === invoiceId);
    const paymentRecord = invoiceRecord?.paymentTransactionId
      ? trans.find(t => t.id === invoiceRecord.paymentTransactionId)
      : trans.find(t => t.invoiceId === invoiceId && t.natureza === "fatura_cartao");
    const totalFatura = roundMoney(Number(invoiceRecord?.finalAmount) || fat.total);
    const valorPagoFatura = roundMoney(Number(paymentRecord?.valorPago) || Number(invoiceRecord?.paidAmount) || 0);
    const valorPendenteFatura = Math.max(0, roundMoney(totalFatura - valorPagoFatura));
    const fechamentoTipo = getInvoiceClosureStatusForMonth(faturas, c, selMonth);
    return {
      ...c,
      ...fat,
      gasto: fat.total,
      gastoSim,
      contaPagamentoNome: contaPag?.nome || "Conta não definida",
      invoiceRecord,
      paymentRecord,
      invoiceClosureStatus: fechamentoTipo,
      invoiceClosureLabel: invoiceClosureLabel(fechamentoTipo),
      invoicePaymentStatusLabel: invoicePaymentLabel(valorPagoFatura, totalFatura),
      invoiceTotal: totalFatura,
      invoicePaidAmount: valorPagoFatura,
      invoicePendingAmount: valorPendenteFatura,
      get disponivel(){ return c.limite-this.gasto; },
      get dispComSim(){ return c.limite-this.gasto-this.gastoSim; },
    };
  }),[cards,contas,calcularFaturaCartao,simTrans,selMonth,faturas,trans]);

  const projections = useMemo(()=>{ const fix=trans.filter(t=>t.fixo&&t.tipo==="despesa"); const fixM=[...new Set(fix.map(t=>transMonthKey(t)))]; const fixV=fixM.length?fix.reduce((s,t)=>s+t.valor,0)/fixM.length:0; const vari=trans.filter(t=>!t.fixo&&t.tipo==="despesa"); const varM=[...new Set(vari.map(t=>transMonthKey(t)))]; const varV=varM.length?vari.reduce((s,t)=>s+t.valor,0)/varM.length:0; return Array.from({length:params.mesesProjecao},(_,i)=>{ const dt=new Date(Y,M+1+i,1); return { label:`${MONTHS[dt.getMonth()]}/${dt.getFullYear()}`, value:fixV+varV, fixo:fixV, variavel:varV }; }); },[trans,params.mesesProjecao]);

  // Styles
  const card  = (x={})=>({ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:"18px 22px", ...x });
  const lbl   = { fontSize:11, color:C.soft, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 };
  const big   = (col=C.text)=>({ fontSize:24, fontWeight:800, color:col, lineHeight:1.1 });
  const inp   = { background:C.navy, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, padding:"8px 12px", fontSize:14, width:"100%", outline:"none" };
  const btn   = (bg,x={})=>({ background:bg, border:"none", borderRadius:8, color:"#fff", padding:"9px 18px", fontWeight:700, cursor:"pointer", fontSize:14, ...x });
  const ghost = (x={})=>({ background:"transparent", border:`1px solid ${C.border}`, borderRadius:8, color:C.soft, padding:"6px 12px", cursor:"pointer", fontSize:12, ...x });
  const requireField = (condition, nomeCampo, fieldKey) => {
    if (!condition) {
      setRequiredModal(requiredFieldInfo(nomeCampo, fieldKey));
      return false;
    }
    return true;
  };
  const inputStyle = (fieldKey, base = inp) => highlightIfRequired(base, requiredModal, fieldKey);
  const toggleCardAccordion = (id) => setExpandedCards(prev => ({ ...prev, [id]: !(prev[id] ?? true) }));
  const toggleAccountAccordion = (id) => setExpandedAccounts(prev => ({ ...prev, [id]: !(prev[id] ?? true) }));

  const prevMonth=()=>setSelMonth(new Date(selYear,selMon-2,1).toISOString().slice(0,7));
  const nextMonth=()=>setSelMonth(new Date(selYear,selMon,1).toISOString().slice(0,7));

  // Transaction
  const openAddTrans=()=>{
    const primeiraCC = contas.find(c=>c.tipo==="corrente");
    setModal("addTrans");
    setForm({ tipo:"despesa", origemTipo:"corrente", contaId:primeiraCC?.id||"", cartaoId:"",
              fixo:false, parcelado:false, modoParc:"total", parcelas:2,
              fixoDia:"", fixoMeses:12 });
  };
  const closeModal=()=>{ setModal(null); setForm({}); };

  const resolveCardCompetencia = useCallback((dateKey, cardId, manualMonth = "") => {
    if (manualMonth) return manualMonth;
    const card = cards.find(c => c.id === cardId);
    return getCardInvoiceCompetence(dateKey, card, faturas);
  }, [cards, faturas]);

  const assertCardInvoicesOpenForEntries = useCallback((entries) => {
    const closedEntry = entries.find(entry => {
      const card = cards.find(c => c.id === entry.cardId);
      return card && isInvoiceClosedForNewEntries(faturas, card, entry.competencia);
    });

    if (!closedEntry) return true;

    const card = cards.find(c => c.id === closedEntry.cardId);
    const closureStatus = getInvoiceClosureStatusForMonth(faturas, card, closedEntry.competencia);
    alert(`A fatura de ${card?.nome || "cartão"} em ${formatMonthBR(closedEntry.competencia)} está ${invoiceClosureLabel(closureStatus).toLowerCase()}. Para incluir lançamentos, reabra a fatura e depois feche novamente manualmente para atualizar o pagamento previsto.`);
    return false;
  }, [cards, faturas]);

  const parcPreview=useMemo(()=>{
    if(!form.parcelado||!form.data) return [];
    const n=parseInt(form.parcelas)||1;
    const vp=form.modoParc==="total"?moneyToNumber(form.valor)/n:moneyToNumber(form.valor);
    const firstCompetence = form.origemTipo === "cartao"
      ? resolveCardCompetencia(form.data, form.cartaoId, form.faturaCompetencia)
      : mKey(form.data);
    return Array.from({length:n},(_,i)=>{
      const dateKey = addMonthsToDate(form.data, i);
      return { data:dateKey, competencia:monthOffset(firstCompetence, i), valor:vp };
    });
  },[form.parcelado,form.data,form.parcelas,form.valor,form.modoParc,form.origemTipo,form.cartaoId,form.faturaCompetencia,resolveCardCompetencia]);

  const addTransaction=()=>{
    // Validação básica
    const isCartao = form.origemTipo==="cartao";
    if(!requireField(Boolean(form.descricao?.trim()), "Descrição", "descricao")) return;
    if(!requireField(moneyToNumber(form.valor)>0, "Valor", "valor")) return;
    if(!requireField(Boolean(form.catId), "Categoria", "catId")) return;
    if(isCartao&&!requireField(Boolean(form.cartaoId), "Cartão", "cartaoId")) return;
    if(!isCartao&&!requireField(Boolean(form.contaId), "Conta / Vale", "contaId")) return;
    if(!form.fixo&&!requireField(Boolean(form.data), "Data", "data")) return;
    if(form.fixo&&!requireField(Boolean(form.fixoDia) && parseInt(form.fixoDia)>=1 && parseInt(form.fixoDia)<=31, "Dia do mês", "fixoDia")) return;

    // Derivar campos de origem
    const conta = contas.find(c=>c.id===form.contaId);
    const origem = isCartao ? "cartao" : (conta?.tipo||"corrente");
    const cartaoId = isCartao ? form.cartaoId : null;
    const contaId  = isCartao ? null : form.contaId;
    const base = { tipo:form.tipo, origem, catId:form.catId, descricao:form.descricao, cartaoId, contaId };
    const primeiraCompetenciaCartao = isCartao && form.data ? resolveCardCompetencia(form.data, form.cartaoId, form.faturaCompetencia) : null;

    // Cartão parcelado
    if(isCartao&&form.parcelado){
      const n=parseInt(form.parcelas)||1;
      const vp=form.modoParc==="total"?moneyToNumber(form.valor)/n:moneyToNumber(form.valor);
      const grp=uid();
      const novosLancamentos = Array.from({length:n},(_,i)=>{
        const dateKey = addMonthsToDate(form.data, i);
        const competencia = monthOffset(primeiraCompetenciaCartao, i);
        return { ...base, id:uid(), valor:parseFloat(vp.toFixed(2)), data:dateKey, competencia, faturaCompetencia:competencia, parcela:i+1, totalParcelas:n, parcelaGrupo:grp, fixo:false, status:"pago", valorPago:parseFloat(vp.toFixed(2)) };
      });
      if(!assertCardInvoicesOpenForEntries(novosLancamentos)) return;
      setTrans(p=>[...p,...novosLancamentos]);
    }
    // Lançamento fixo/recorrente — gera N meses a partir do mês selecionado
    else if(form.fixo){
      const dia   = parseInt(form.fixoDia);
      const meses = Math.max(2, parseInt(form.fixoMeses)||12);
      const grp   = uid();
      // Mês de início = mês do seletor de mês (selMonth) do dashboard
      const [startY, startM] = selMonth.split("-").map(Number);
      const novosLancamentos = Array.from({length:meses},(_,i)=>{
        // Garante que o dia existe no mês (ex: dia 31 em fev → último dia)
        const dt = new Date(startY, startM-1+i, dia);
        // Se dia não existe no mês, JS avança automaticamente (ex: 31/fev→3/mar) — corrigi com clamp
        const maxDay = new Date(startY, startM+i, 0).getDate();
        const safeDay = Math.min(dia, maxDay);
        const dtSafe = new Date(startY, startM-1+i, safeDay);
        const dateKey = dtSafe.toISOString().slice(0,10);
        const competencia = isCartao ? resolveCardCompetencia(dateKey, form.cartaoId) : dateKey.slice(0,7);
        return { ...base, id:uid(), valor:parseFloat(moneyToNumber(form.valor).toFixed(2)),
                 data:dateKey, competencia, faturaCompetencia:isCartao ? competencia : undefined, fixo:true,
                 parcelaGrupo:grp, parcela:i+1, totalParcelas:meses, status:"previsto", valorPago:0 };
      });
      if(isCartao && !assertCardInvoicesOpenForEntries(novosLancamentos)) return;
      setTrans(p=>[...p,...novosLancamentos]);
    }
    // Lançamento simples
    else {
      const competencia = isCartao ? primeiraCompetenciaCartao : mKey(form.data);
      const novoLancamento = { ...base, id:uid(), valor:moneyToNumber(form.valor), data:form.data, competencia, faturaCompetencia:isCartao ? competencia : undefined, fixo:false, status:"pago", valorPago:moneyToNumber(form.valor) };
      if(isCartao && !assertCardInvoicesOpenForEntries([novoLancamento])) return;
      setTrans(p=>[...p,novoLancamento]);
    }
    closeModal();
  };
  const addCard=()=>{
    if(!requireField(Boolean(form.nome?.trim()), "Nome do cartão", "cardNome")) return;
    if(!requireField(Boolean(form.contaPagamentoId), "Conta corrente para pagamento da fatura", "cardContaPagamentoId")) return;
    setCards(p=>[...p,{ ...form, id:uid(), limite:moneyToNumber(form.limite)||1000, fechamento:parseInt(form.fechamento)||10, vencimento:parseInt(form.vencimento)||5, cor:form.cor||"#00A878", contaPagamentoId:form.contaPagamentoId, accountId:form.contaPagamentoId }]);
    closeModal();
  };
  const delTrans=(id)=>setTrans(p=>p.filter(t=>t.id!==id));

  const abrirEdicaoRecorrencia = (grupo) => {
    const ref = grupo.sample;
    const dia = parseInt((ref.data || "").slice(8, 10), 10) || 1;
    setModal("editRecorrencia");
    setForm({
      recorrenciaId: grupo.id,
      descricao: ref.descricao || "",
      valor: (Number(ref.valor) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      tipo: ref.tipo || "despesa",
      origemTipo: ref.origem === "cartao" ? "cartao" : "conta",
      contaId: ref.origem === "cartao" ? "" : (ref.contaId || contas[0]?.id || ""),
      cartaoId: ref.origem === "cartao" ? (ref.cartaoId || cards[0]?.id || "") : "",
      catId: ref.catId || "",
      fixoDia: dia,
      escopo: "futuros",
    });
  };

  const salvarEdicaoRecorrencia = () => {
    if (!form.recorrenciaId) return;
    if (!requireField(Boolean(form.descricao?.trim()), "Descrição", "descricao")) return;
    if (!requireField(moneyToNumber(form.valor) > 0, "Valor", "valor")) return;
    if (!requireField(Boolean(form.catId), "Categoria", "catId")) return;
    const isCartaoEdicao = form.origemTipo === "cartao";
    if (isCartaoEdicao && !requireField(Boolean(form.cartaoId), "Cartão", "cartaoId")) return;
    if (!isCartaoEdicao && !requireField(Boolean(form.contaId), "Conta / Vale", "contaId")) return;

    const dia = Math.min(Math.max(parseInt(form.fixoDia) || 1, 1), 31);
    const valor = parseFloat(moneyToNumber(form.valor).toFixed(2));
    const conta = contas.find(c => c.id === form.contaId);
    const origem = isCartaoEdicao ? "cartao" : (conta?.tipo || "corrente");

    setTrans(prev => prev.map(t => {
      const grupoId = t.parcelaGrupo || t.recorrenciaId || `single_${t.id}`;
      if (grupoId !== form.recorrenciaId) return t;

      const mes = transMonthKey(t);
      const dentroEscopo = form.escopo === "todos" || monthCompare(mes, selMonth) >= 0;
      const preservaHistorico = t.status === "pago" || t.status === "parcial";
      if (!dentroEscopo || preservaHistorico) return t;

      return {
        ...t,
        descricao: form.descricao.trim(),
        valor,
        tipo: form.tipo,
        origem,
        contaId: isCartaoEdicao ? null : form.contaId,
        cartaoId: isCartaoEdicao ? form.cartaoId : null,
        catId: form.catId,
        data: dateForMonthDay(mes, dia),
        competencia: mes,
        status: "previsto",
        valorPago: 0,
      };
    }));
    closeModal();
  };

  const excluirRecorrencia = (grupoId) => {
    const grupo = recorrenciasAgrupadas.find(g => g.id === grupoId);
    if (!grupo) return;
    const msg = `Excluir a recorrência "${grupo.sample.descricao}" e todos os seus ${grupo.lancamentos.length} lançamentos? Esta ação remove inclusive histórico pago.`;
    if (!window.confirm(msg)) return;
    const ids = new Set(grupo.lancamentos.map(t => t.id));
    setTrans(prev => prev.filter(t => !ids.has(t.id)));
  };

  const findarRecorrencia = (grupoId) => {
    const grupo = recorrenciasAgrupadas.find(g => g.id === grupoId);
    if (!grupo) return;
    const futuros = grupo.lancamentos.filter(t => {
      const mes = transMonthKey(t);
      const preservaHistorico = t.status === "pago" || t.status === "parcial";
      return monthCompare(mes, selMonth) > 0 && !preservaHistorico;
    });

    if (!futuros.length) {
      alert("Não há lançamentos previstos futuros para findar a partir do mês selecionado.");
      return;
    }

    if (!window.confirm(`Findar a recorrência "${grupo.sample.descricao}"? Serão removidos ${futuros.length} lançamentos previstos posteriores a ${selMonth}, preservando o histórico já pago/baixado.`)) return;
    const ids = new Set(futuros.map(t => t.id));
    setTrans(prev => prev.filter(t => !ids.has(t.id)));
  };

  const baixarTrans = (id, valor=null) => {
    const alvo = trans.find(t => t.id === id);
    if (!alvo) return;

    const invoiceAlvo = alvo.invoiceId ? faturas.find(f => f.id === alvo.invoiceId) : null;
    const total = roundMoney(Number(alvo.valor) || Number(invoiceAlvo?.finalAmount) || ((Number(alvo.valorPago) || 0) + (Number(alvo.pendingAmount) || 0)));
    const atual = roundMoney(Number(alvo.valorPago) || 0);
    const entrada = valor === null ? total - atual : moneyToNumber(valor);
    if (entrada <= 0 || total <= 0) return;

    const novoPago = Math.min(total, roundMoney(atual + entrada));
    const novoStatus = paymentStatusByPaidAmount(novoPago, total);

    setTrans(prev => prev.map(t => t.id === id ? {
      ...t,
      valor: total,
      valorPago: novoPago,
      pendingAmount: Math.max(0, roundMoney(total - novoPago)),
      status: novoStatus,
      updatedAt: new Date().toISOString()
    } : t));

    if (alvo.natureza === "fatura_cartao" && alvo.invoiceId) {
      setFaturas(prev => prev.map(f => f.id === alvo.invoiceId ? {
        ...f,
        finalAmount: total,
        paidAmount: novoPago,
        pendingAmount: Math.max(0, roundMoney(total - novoPago)),
        status: invoiceStatusByPayment(novoPago, total),
        paymentTransactionId: alvo.id,
        updatedAt: new Date().toISOString(),
      } : f));
    }
  };

  const baixarParcialTrans = (id) => {
    const t = trans.find(x => x.id === id);
    if (!t) return;
    const pend = saldoPendente(t);
    const valor = window.prompt(`Valor da baixa parcial. Pendente: ${fmtBRL(pend)}`, "");
    if (valor === null) return;
    baixarTrans(id, valor);
  };

  const adicionarAjusteFatura = (cardId, tipoAjuste) => {
    const card = cards.find(c => c.id === cardId);
    if (card && isInvoiceClosedForNewEntries(faturas, card, selMonth)) {
      const closureStatus = getInvoiceClosureStatusForMonth(faturas, card, selMonth);
      alert(`A fatura de ${card.nome} em ${formatMonthBR(selMonth)} está ${invoiceClosureLabel(closureStatus).toLowerCase()}. Para incluir ajuste, reabra a fatura e depois feche novamente manualmente para atualizar o pagamento previsto.`);
      return;
    }
    const valorRaw = window.prompt(tipoAjuste === "acrescimo" ? "Valor do acréscimo da fatura" : "Valor da redução da fatura", "");
    if (valorRaw === null) return;
    const valor = moneyToNumber(valorRaw);
    if (valor <= 0) { alert("Informe um valor válido."); return; }
    const descricao = window.prompt("Descrição do ajuste", tipoAjuste === "acrescimo" ? "Ajuste de acréscimo da fatura" : "Ajuste de redução da fatura");
    if (!descricao?.trim()) { alert("A descrição do ajuste é obrigatória."); return; }
    setTrans(prev => [...prev, {
      id: uid(),
      tipo: tipoAjuste === "reducao" ? "receita" : "despesa",
      origem: "cartao",
      natureza: "ajuste_fatura_cartao",
      ajusteFaturaTipo: tipoAjuste,
      catId: "cat10",
      descricao: descricao.trim(),
      valor,
      data: dateForMonthDay(selMonth, TODAY.getDate()),
      competencia: selMonth,
      cartaoId: cardId,
      contaId: null,
      fixo: false,
      status: "pago",
      valorPago: valor,
    }]);
  };

  const fecharFaturaCartao = (cardId) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    const contaPagamentoId = getCardPaymentAccountId(card, primeiraContaCorrenteId);
    if (!contaPagamentoId) { alert("Cartão sem conta corrente associada."); return; }
    const fat = calcularFaturaCartao(card, selMonth);
    const totalFatura = roundMoney(fat.total);
    if (totalFatura <= 0) { alert("Não há valor de fatura para fechar neste mês."); return; }

    const invoiceId = invoiceIdFor(cardId, selMonth);
    const paymentMonth = monthOffset(selMonth, 1);
    const paymentDate = dateForMonthDay(paymentMonth, card.vencimento);
    const existingPayment = trans.find(t => t.invoiceId === invoiceId && t.natureza === "fatura_cartao");
    const paymentTransactionId = existingPayment?.id || uid();

    if (existingPayment) {
      const atualizar = window.confirm("Esta fatura já possui pagamento previsto. Deseja atualizar o valor previsto mantendo as baixas já feitas?");
      if (!atualizar) return;
      setTrans(prev => prev.map(t => t.id === existingPayment.id ? {
        ...t,
        valor: totalFatura,
        data: paymentDate,
        competencia: paymentMonth,
        contaId: contaPagamentoId,
        accountId: contaPagamentoId,
        status: paymentStatusByPaidAmount(t.valorPago, totalFatura),
        pendingAmount: Math.max(0, roundMoney(totalFatura - (Number(t.valorPago) || 0))),
        updatedAt: new Date().toISOString(),
      } : t));
    } else {
      setTrans(prev => [...prev, {
        id: paymentTransactionId,
        tipo: "despesa",
        origem: "corrente",
        natureza: "fatura_cartao",
        catId: "cat10",
        descricao: `Pagamento fatura ${card.nome} - ${selMonth}`,
        valor: totalFatura,
        data: paymentDate,
        competencia: paymentMonth,
        contaId: contaPagamentoId,
        accountId: contaPagamentoId,
        cartaoId: cardId,
        invoiceId,
        faturaMes: selMonth,
        status: "previsto",
        valorPago: 0,
        pendingAmount: totalFatura,
        fixo: false,
      }]);
    }

    setFaturas(prev => {
      const valorPagoAtual = roundMoney(Number(existingPayment?.valorPago) || 0);
      const nova = {
        id: invoiceId,
        cardId,
        accountId: contaPagamentoId,
        contaPagamentoId,
        competenceMonth: selMonth,
        dueMonth: paymentMonth,
        status: invoiceStatusByPayment(valorPagoAtual, totalFatura),
        expensesTotal: roundMoney(totalFatura - fat.ajustes),
        adjustmentsTotal: roundMoney(fat.ajustes),
        finalAmount: totalFatura,
        paidAmount: valorPagoAtual,
        pendingAmount: Math.max(0, roundMoney(totalFatura - valorPagoAtual)),
        paymentTransactionId,
        closureType: "manual",
        fechamentoTipo: "manual",
        closedBy: "manual",
        closedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return prev.some(f => f.id === invoiceId) ? prev.map(f => f.id === invoiceId ? { ...f, ...nova } : f) : [...prev, nova];
    });
  };

  const abrirFaturaCartao = (cardId) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    const contaPagamentoId = getCardPaymentAccountId(card, primeiraContaCorrenteId);
    if (!contaPagamentoId) { alert("Cartão sem conta corrente associada."); return; }

    const invoiceId = invoiceIdFor(cardId, selMonth);
    const existingInvoice = getInvoiceRecordFor(faturas, cardId, selMonth) || faturas.find(f => f.id === invoiceId);
    const existingPayment = existingInvoice?.paymentTransactionId
      ? trans.find(t => t.id === existingInvoice.paymentTransactionId)
      : trans.find(t => t.invoiceId === invoiceId && t.natureza === "fatura_cartao");

    const fat = calcularFaturaCartao(card, selMonth);
    const totalFatura = roundMoney(fat.total);
    const valorPagoAtual = roundMoney(Number(existingPayment?.valorPago) || Number(existingInvoice?.paidAmount) || 0);
    const paymentMonth = monthOffset(selMonth, 1);
    const paymentDate = dateForMonthDay(paymentMonth, card.vencimento);

    if (existingPayment) {
      setTrans(prev => prev.map(t => t.id === existingPayment.id ? {
        ...t,
        valor: totalFatura,
        data: paymentDate,
        competencia: paymentMonth,
        contaId: contaPagamentoId,
        accountId: contaPagamentoId,
        status: paymentStatusByPaidAmount(t.valorPago, totalFatura),
        pendingAmount: Math.max(0, roundMoney(totalFatura - (Number(t.valorPago) || 0))),
        updatedAt: new Date().toISOString(),
      } : t));
    }

    setFaturas(prev => {
      const nova = {
        id: invoiceId,
        cardId,
        accountId: contaPagamentoId,
        contaPagamentoId,
        competenceMonth: selMonth,
        dueMonth: paymentMonth,
        status: "aberta",
        expensesTotal: roundMoney(totalFatura - fat.ajustes),
        adjustmentsTotal: roundMoney(fat.ajustes),
        finalAmount: totalFatura,
        paidAmount: valorPagoAtual,
        pendingAmount: Math.max(0, roundMoney(totalFatura - valorPagoAtual)),
        paymentTransactionId: existingPayment?.id || existingInvoice?.paymentTransactionId || null,
        closureType: "open",
        fechamentoTipo: "reaberta",
        closedBy: null,
        reopenedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return prev.some(f => f.id === invoiceId) ? prev.map(f => f.id === invoiceId ? { ...f, ...nova } : f) : [...prev, nova];
    });
  };

  // Simulation
  const addSim=()=>{
    if(!requireField(Boolean(simForm.descricao?.trim()), "Descrição", "simDescricao")) return;
    if(!requireField(moneyToNumber(simForm.valor)>0, "Valor", "simValor")) return;
    if(!requireField(Boolean(simForm.data), "Data da compra", "simData")) return;
    if(!requireField(Boolean(simForm.cartaoId), "Cartão", "simCartaoId")) return;
    if(!requireField(Boolean(simForm.catId), "Categoria", "simCatId")) return;
    const competencia = resolveCardCompetencia(simForm.data, simForm.cartaoId, simForm.faturaCompetencia);
    setSims(p=>[...p,{ ...simForm, id:"sim_"+uid(), valor:moneyToNumber(simForm.valor), parcelas:parseInt(simForm.parcelas)||1, faturaCompetencia:competencia }]);
    setSimForm(p=>({ modoParc:p.modoParc, parcelas:1, cartaoId:p.cartaoId, faturaCompetencia:"" }));
  };
  const delSim=(id)=>setSims(p=>p.filter(s=>s.id!==id));
  const refazerSim=(id)=>setSims(p=>p.map(s=>s.id===id?{...s, recalculatedAt:new Date().toISOString()}:s));
  const addContaFromForm=()=>{
    const nome=(novaContaForm.nome||"").trim();
    const tipo=novaContaForm.tipo||"corrente";
    if(!requireField(Boolean(nome), "Nome da conta", "novaContaNome")) return;
    const icons={corrente:"🏦",vale_alimentacao:"🛒",vale_refeicao:"🍽️"};
    const cors={corrente:"#0891B2",vale_alimentacao:"#84CC16",vale_refeicao:"#F97316"};
    setContas(p=>[...p,{ id:"ct"+uid(), nome, tipo, cor:cors[tipo], icon:icons[tipo] }]);
    setNovaContaForm({ nome:"", tipo:"corrente" });
    setShowContaForm(false);
  };

  // ── Backup / restore / reset ────────────────────────────────────────────────
  const handleExport = () => {
    const importBatchIds = Array.from(new Set(
      trans.filter(t => t.importado && t.importBatchId).map(t => t.importBatchId)
    ));
    const importReports = lastImportReport ? [lastImportReport] : [];
    const data = {
      trans,
      cards,
      contas,
      metas,
      pessoas,
      dividas,
      despPess,
      cats,
      params: {
        ...params,
        autoCategoryRules: Array.isArray(params?.autoCategoryRules) ? params.autoCategoryRules : [],
      },
      saldosIniciais,
      faturas,
      simulacoes: sims,
      sims, // compatibilidade com backups anteriores da própria aplicação
      importReports,
    };
    const payload = {
      app: "Financas PRO",
      version: LS_VERSION,
      backupSchemaVersion: BACKUP_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      summary: {
        transacoes: trans.length,
        contas: contas.length,
        cartoes: cards.length,
        pessoas: pessoas.length,
        simulacoes: sims.length,
        lotesImportados: importBatchIds.length,
      },
      data,
      rawLocalStorage: getFinancasProStorageSnapshot(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type:"application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `financas-pro-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        const data = normalizeBackupPayload(parsed);
        const confirmed = window.confirm(
          "A restauração substituirá os dados atuais do Finanças PRO neste navegador. Deseja continuar?"
        );
        if (!confirmed) return;

        setTrans(data.trans);
        setCards(data.cards);
        setContas(data.contas);
        setMetas(data.metas);
        setPessoas(data.pessoas);
        setDividas(data.dividas);
        setDespPess(data.despPess);
        setCats(data.cats);
        setParams(data.params);
        setSaldosIniciais(data.saldosIniciais);
        setFaturas(data.faturas);
        setSims(data.simulacoes);
        setLastImportReport(data.importReports[0] || null);
        resetImport();
        alert("✅ Backup importado com sucesso! Os dados foram restaurados.");
      } catch(err) {
        alert("❌ Erro ao importar: " + err.message + " Nenhum dado atual foi substituído.");
      }
    };
    reader.onerror = () => alert("❌ Erro ao ler o arquivo de backup. Nenhum dado atual foi substituído.");
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleReset = () => {
    const emptyState = {
      trans: [],
      cards: [],
      contas: [],
      metas,
      pessoas,
      dividas,
      despPess,
      cats,
      params,
      saldosIniciais: {},
      faturas: [],
    };

    // Remove chaves antigas/prefixed e grava explicitamente o estado financeiro zerado.
    // Configurações estruturais e Pessoas são preservadas conforme regra atual do projeto.
    clearFinancasProStorage();
    Object.entries(emptyState).forEach(([key, value]) => lsSave(key, value));

    setTrans(emptyState.trans);
    setCards(emptyState.cards);
    setContas(emptyState.contas);
    setMetas(emptyState.metas);
    setPessoas(emptyState.pessoas);
    setDividas(emptyState.dividas);
    setDespPess(emptyState.despPess);
    setCats(emptyState.cats);
    setParams(emptyState.params);
    setSaldosIniciais(emptyState.saldosIniciais);
    setFaturas(emptyState.faturas);
    setSims([]);
    setModal(null);
    setForm({});
    setSelMonth(mKey(TODAY.toISOString()));
    resetImport();
    setTab("dashboard");
  };

  // Category CRUD
  const addRootCat=(nome,cor,icon)=>setCats(p=>[...p,{ id:"cat"+uid(), nome, cor:cor||"#B0BEC5", icon:icon||"📦", subs:[] }]);
  const addSubCat=(parentId,nome)=>{ const ins=(list)=>list.map(c=>c.id===parentId?{ ...c, subs:[...(c.subs||[]),{ id:"sub"+uid(), nome, subs:[] }] }:{ ...c, subs:ins(c.subs||[]) }); setCats(ins); };
  const delCat=(id)=>{ const rem=(list)=>list.filter(c=>c.id!==id).map(c=>({ ...c, subs:rem(c.subs||[]) })); setCats(rem); };
  const renameCat=(id,nome)=>{ const upd=(list)=>list.map(c=>c.id===id?{ ...c,nome }:{ ...c, subs:upd(c.subs||[]) }); setCats(upd); };
  const recolorCat=(id,cor)=>setCats(p=>p.map(c=>c.id===id?{ ...c,cor }:c));

  // Import
  const categorizeImportRow=(desc,tipo="despesa")=>guessCategoryForTransaction({
    desc,
    tipo,
    params,
    trans,
    cats,
  });

  const extractPdfTextFromFile=async(file)=>{
    const buffer=await file.arrayBuffer();
    const pdf=await pdfjsLib.getDocument({ data:buffer }).promise;
    const pages=[];
    for(let pageNum=1;pageNum<=pdf.numPages;pageNum+=1){
      const page=await pdf.getPage(pageNum);
      const content=await page.getTextContent();
      const items=(content.items||[])
        .map(item=>({ text:String(item.str||"").trim(), x:item.transform?.[4]||0, y:item.transform?.[5]||0 }))
        .filter(item=>item.text);
      items.sort((a,b)=>Math.abs(b.y-a.y)>2?b.y-a.y:a.x-b.x);
      const lines=[];
      items.forEach(item=>{
        const last=lines[lines.length-1];
        if(last&&Math.abs(last.y-item.y)<=2) last.parts.push(item);
        else lines.push({ y:item.y, parts:[item] });
      });
      pages.push(lines.map(line=>line.parts.sort((a,b)=>a.x-b.x).map(part=>part.text).join(" ")).join("\n"));
    }
    return pages.join("\n");
  };

  const readFileAsText=(file,encoding="ISO-8859-1")=>new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=e=>resolve(String(e.target.result||""));
    reader.onerror=()=>reject(new Error("Não foi possível ler o arquivo."));
    reader.readAsText(file,encoding);
  });

  const handleFile=(file)=>{
    if(!file) return;
    if(impMode==="cartao"&&!impCId){ setImpErr("Selecione o cartão antes de carregar o arquivo."); return; }
    if(impMode==="cartao"&&!impCompetencia){ setImpErr("Informe a competência da fatura antes de carregar o arquivo."); return; }
    if(impMode==="cartao"){
      const card = cards.find(c => c.id === impCId);
      if(card && isInvoiceClosedForNewEntries(faturas, card, impCompetencia)){
        setImpErr(`A fatura de ${card.nome} em ${formatMonthBR(impCompetencia)} está ${invoiceClosureLabel(getInvoiceClosureStatusForMonth(faturas, card, impCompetencia)).toLowerCase()}. Reabra a fatura antes de importar lançamentos.`);
        return;
      }
    }
    if((impMode==="bancario"||impMode==="vale")&&!impContaId){ setImpErr("Selecione a conta de destino antes de carregar o arquivo."); return; }
    if(impMode==="vale"&&!impValeYear){ setImpErr("Informe o ano do extrato antes de carregar o arquivo."); return; }
    setImpErr(""); setImpFile(file.name); setImpIgnored([]); setLastImportReport(null);

    const processText=(t,ext)=>{
      let rows=[];
      const ignoredRows = extractIgnoredBankRows(t, { mode: impMode, createId: uid });
      setImpIgnored(ignoredRows);
      try{
        if(impMode==="vale") rows=parseValePluxeeText(t, { valeYear: impValeYear, contaId: impContaId, categorize: categorizeImportRow, createId: uid });
        else if(impMode==="bancario") rows=parseBankFile(t, ext, { bancoImportacao: impBanco, contaId: impContaId, categorize: categorizeImportRow, createId: uid });
        else if(ext==="ofx"||ext==="qfx"||t.includes("<STMTTRN>")) rows=parseOFX(t, { mode:"cartao", bancoImportacao: impBanco, categorize: categorizeImportRow, createId: uid });
        else rows=parseCardCSV(t, { categorize: categorizeImportRow, createId: uid });
      }catch(err){ setImpErr("Erro: "+err.message); return; }
      rows=expandImportedRows(rows, { impCompetencia, createId: uid });
      if(!rows.length){ setImpErr(ignoredRows.length ? `Nenhuma transação importável encontrada. ${ignoredRows.length} linha(s) foram ignoradas por regra de importação.` : "Nenhuma transação encontrada."); return; }
      const exactKeys=impMode!=="cartao"
        ? new Set(trans.filter(t2=>t2.contaId===impContaId&&t2.origem!=="cartao").map(t2=>buildImportKey({ ...t2, importTipo:impMode }, t2.contaId, mKey(t2.data), impMode)))
        : new Set(trans.filter(t2=>t2.cartaoId===impCId).map(t2=>buildImportKey({ ...t2, importTipo:"cartao" }, t2.cartaoId, transMonthKey(t2), "cartao")));
      const legacyKeys=impMode!=="cartao"
        ? new Set(trans.filter(t2=>t2.contaId===impContaId&&t2.origem!=="cartao").map(t2=>buildLegacyImportKey({ ...t2, importTipo:impMode }, t2.contaId, impMode)))
        : new Set(trans.filter(t2=>t2.cartaoId===impCId).map(t2=>buildLegacyImportKey({ ...t2, importTipo:"cartao" }, t2.cartaoId, "cartao")));
      const seen=new Set();
      const dups=new Set();
      rows.forEach(r2=>{
        const exact=buildImportKey(r2);
        const legacy=buildLegacyImportKey(r2);
        if(exactKeys.has(exact)||legacyKeys.has(legacy)||seen.has(exact)) dups.add(r2._id);
        seen.add(exact);
      });
      setImpDups(dups);
      setImpTog(Object.fromEntries(rows.map(r2=>[r2._id,!dups.has(r2._id)])));
      setImpRows(rows);
      setImpStep("review");
    };

    const ext=file.name.split(".").pop().toLowerCase();
    if(ext==="pdf"){
      if(impMode!=="vale"){ setImpErr("PDF está disponível nesta etapa apenas para extratos Pluxee de vales."); return; }
      extractPdfTextFromFile(file)
        .then(text=>processText(text,ext))
        .catch(err=>setImpErr("Erro ao ler PDF. Verifique se a dependência pdfjs-dist está instalada. Detalhe: "+err.message));
      return;
    }
    readFileAsText(file,"ISO-8859-1")
      .then(text=>processText(text,ext))
      .catch(err=>setImpErr("Erro: "+err.message));
  };
  const confirmImport=()=>{
    if(impMode==="cartao"&&!impCId){ setImpErr("Selecione o cartão."); return; }
    if(impMode==="cartao"&&!impCompetencia){ setImpErr("Informe a competência da fatura."); return; }
    if(impMode==="cartao"){
      const card = cards.find(c => c.id === impCId);
      if(card && isInvoiceClosedForNewEntries(faturas, card, impCompetencia)){
        setImpErr(`A fatura de ${card.nome} em ${formatMonthBR(impCompetencia)} está ${invoiceClosureLabel(getInvoiceClosureStatusForMonth(faturas, card, impCompetencia)).toLowerCase()}. Reabra a fatura antes de salvar a importação.`);
        return;
      }
    }
    if((impMode==="bancario"||impMode==="vale")&&!impContaId){ setImpErr("Selecione a conta de destino."); return; }
    const ok=impRows.filter(r=>impTog[r._id]);
    const importBatchId=`batch_${uid()}`;
    const duplicadas = impRows.filter(r=>impDups.has(r._id));
    const desmarcadas = impRows.filter(r=>!impTog[r._id]&&!impDups.has(r._id));
    const reportBase = {
      id:importBatchId,
      arquivo:impFile,
      data:new Date().toISOString(),
      modo:impMode,
      destino:impMode==="cartao"?(cards.find(c=>c.id===impCId)?.nome||"Cartão"):(contas.find(c=>c.id===impContaId)?.nome||"Conta"),
      competencia:impMode==="cartao"?impCompetencia:(impMode==="vale"?impValeYear:null),
      totalLidas:impRows.length + impIgnored.length,
      importadas:ok.length,
      duplicadas:duplicadas.length,
      ignoradas:impIgnored.length,
      desmarcadas:desmarcadas.length,
      valorLiquido:ok.reduce((s,r)=>s+(r.tipo==="receita"?r.valor:-r.valor),0),
      ignoradasDetalhe:impIgnored.slice(0,20),
      duplicadasDetalhe:duplicadas.slice(0,20).map(r=>({ data:r.data, descricao:r.descricao, valor:r.valor, tipo:r.tipo })),
    };
    if(impMode==="bancario"||impMode==="vale"){
      const conta=contas.find(c=>c.id===impContaId);
      setTrans(p=>[...p,...ok.map(r=>({
        id:uid(), tipo:r.tipo, origem:conta?.tipo||"corrente", cartaoId:null, contaId:impContaId,
        catId:r.catId, descricao:r.descricao, valor:r.valor, data:r.data,
        fixo:false, importado:true, importTipo:impMode, bancoImportacao:impMode==="bancario"?impBanco:null, fornecedorVale:r.fornecedorVale||null, carteiraVale:r.carteiraVale||null, hora:r.hora||null, importBatchId, status:"pago", valorPago:r.valor, competencia:mKey(r.data),
      }))]);
    } else {
      setTrans(p=>[...p,...ok.map(r=>({
        id:uid(), tipo:"despesa", origem:"cartao", cartaoId:impCId, contaId:null,
        catId:r.catId, descricao:r.descricao, valor:r.valor, data:r.data, dataCompra:r.dataCompra||r.data,
        competencia:r.competencia||impCompetencia, fixo:false, importado:true, importTipo:"cartao", importBatchId,
        parcela:r.parcela||null, totalParcelas:r.totalParcelas||null, parcelaGrupo:r.parcelaGrupo||null, status:"pago", valorPago:r.valor,
      }))]);
    }
    setLastImportReport(reportBase);
    setImpStep("done");
  };
  const resetImport=()=>{ setImpStep("upload"); setImpRows([]); setImpTog({}); setImpErr(""); setImpFile(""); setImpDups(new Set()); setImpIgnored([]); };

  const importBatches = useMemo(()=>{
    const map = new Map();
    trans.filter(t=>t.importado&&t.importBatchId).forEach(t=>{
      const key=t.importBatchId;
      const prev=map.get(key)||{ id:key, qtd:0, valorLiquido:0, primeiraData:t.data, ultimaData:t.data, tipo:t.importTipo||"importado", destinoId:t.cartaoId||t.contaId, destinoNome:"", createdAt:t.createdAt||"" };
      prev.qtd += 1;
      prev.valorLiquido += (t.tipo==="receita"?Number(t.valor)||0:-(Number(t.valor)||0));
      if(t.data && (!prev.primeiraData || t.data<prev.primeiraData)) prev.primeiraData=t.data;
      if(t.data && (!prev.ultimaData || t.data>prev.ultimaData)) prev.ultimaData=t.data;
      prev.createdAt = prev.createdAt || t.createdAt || "";
      map.set(key, prev);
    });
    return [...map.values()].map(b=>{
      const destino = b.tipo==="cartao" ? cards.find(c=>c.id===b.destinoId)?.nome : contas.find(c=>c.id===b.destinoId)?.nome;
      return { ...b, destinoNome:destino||b.destinoId||"—" };
    }).sort((a,b)=>(b.createdAt||b.ultimaData||"").localeCompare(a.createdAt||a.ultimaData||""));
  },[trans,cards,contas]);

  const undoImportBatch=(batchId)=>{
    const lote=importBatches.find(b=>b.id===batchId);
    if(!lote) return;
    if(!window.confirm(`Desfazer o lote ${batchId}? ${lote.qtd} lançamento(s) importado(s) serão removidos.`)) return;
    setTrans(prev=>prev.filter(t=>t.importBatchId!==batchId));
    if(lastImportReport?.id===batchId) setLastImportReport(null);
  };

  const exportCreditCardExpensesTxt=(cardId, monthKey=selMonth)=>{
    const card=cards.find(c=>c.id===cardId);
    if(!card) return;
    const rows=trans
      .filter(t=>t.origem==="cartao"&&t.cartaoId===cardId&&transMonthKey(t)===monthKey)
      .sort((a,b)=>(a.data||"").localeCompare(b.data||""));
    if(!rows.length){ alert("Não há despesas de cartão para exportar nesta competência."); return; }
    const header=["competencia","cartao","data_compra","descricao","categoria","parcela","total_parcelas","tipo","valor"].join(";");
    const esc=(v)=>`"${String(v??"").replace(/"/g,'""')}"`;
    const body=rows.map(t=>[
      monthKey,
      card.nome,
      t.dataCompra||t.data,
      t.descricao,
      catLabel(cats,t.catId),
      t.parcela||"",
      t.totalParcelas||"",
      t.natureza==="ajuste_fatura_cartao"?"ajuste_fatura":"despesa_cartao",
      signedCardAmount(t).toFixed(2).replace(".",",")
    ].map(esc).join(";")).join("\n");
    const total=rows.reduce((s,t)=>s+signedCardAmount(t),0);
    const footer=["TOTAL",esc(monthKey),esc(card.nome),esc(total.toFixed(2).replace(".",","))].join(";");
    const txt=[`Finanças PRO - Despesas do cartão`, `Gerado em: ${new Date().toLocaleString("pt-BR")}`, `Competência: ${monthKey}`, `Cartão: ${card.nome}`, "", header, body, "", footer].join("\n");
    const blob=new Blob([txt],{ type:"text/plain;charset=utf-8" });
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;
    a.download=`despesas-cartao-${normText(card.nome).replace(/[^a-z0-9]+/g,"-")}-${monthKey}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Derived data required by tabs/modals ───────────────────────────────────
  const rootCats = useMemo(() => cats, [cats]);

  const filteredTransactions = useMemo(() => filterTransactions({
    transactions: trans,
    monthTransactions: monthTrans,
    filters: transactionFilters,
    cats,
    findRootCat,
  }), [transactionFilters, trans, monthTrans, cats]);

  const updateTransactionCategory = useCallback((transactionId, catId) => {
    setTrans(prev => prev.map(t => t.id === transactionId ? { ...t, catId, updatedAt:new Date().toISOString() } : t));
  }, [setTrans]);

  const renderCategoryEditor = useCallback((t, compact = false) => {
    const editing = editingCategoryId === t.id;
    return (
      <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:compact?"nowrap":"wrap" }}>
        {editing ? (
          <>
            <CategorySelect
              cats={cats}
              value={t.catId}
              onChange={v=>updateTransactionCategory(t.id, v)}
              style={{ fontSize:compact?10:11, padding:compact?"4px 7px":"5px 8px", minWidth:compact?145:170 }}
            />
            <button onClick={()=>setEditingCategoryId(null)} style={ghost({ padding:compact?"3px 6px":"4px 8px", fontSize:compact?10:11, color:C.emerald })}>OK</button>
          </>
        ) : (
          <>
            <span style={{ fontSize:compact?10:11, background:getCatColor(t.catId)+"22", color:getCatColor(t.catId), padding:compact?"2px 5px":"2px 7px", borderRadius:20, fontWeight:600, whiteSpace:"nowrap" }}>
              {getCatIcon(t.catId)} {getCatLabel(t.catId)}
            </span>
            <button onClick={()=>setEditingCategoryId(t.id)} style={ghost({ padding:compact?"2px 5px":"3px 7px", fontSize:compact?10:11, color:C.gold })}>Editar</button>
          </>
        )}
      </div>
    );
  }, [editingCategoryId, cats, updateTransactionCategory, getCatColor, getCatIcon, getCatLabel]);

  const gastoCatMes = useMemo(() => {
    const map = {};
    monthTrans
      .filter(t =>
        t.tipo === "despesa" &&
        (t.origem === "corrente" ||
         t.origem === "vale_alimentacao" ||
         t.origem === "vale_refeicao")
      )
      .forEach(t => {
        const root = findRootCat(cats, t.catId);
        const nome = root?.nome || "Outros";
        map[nome] = (map[nome] || 0) + t.valor;
      });
    return map;
  }, [monthTrans, cats]);

  const nm = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const dt = new Date(selYear, selMon - 1 + i, 1);
      return {
        key: dt.toISOString().slice(0, 7),
        label: `${MONTHS[dt.getMonth()]}/${dt.getFullYear()}`
      };
    });
  }, [selYear, selMon]);

  const contasDisponiveis = useMemo(() => contas, [contas]);
  const isCartao = form.origemTipo === "cartao";

  const recPreview = useMemo(() => {
    if (!form.fixo || !form.fixoDia || !form.fixoMeses) return [];

    const meses = Math.min(4, parseInt(form.fixoMeses) || 0);
    const dia = parseInt(form.fixoDia) || 1;
    const [startY, startM] = selMonth.split("-").map(Number);

    return Array.from({ length: meses }, (_, i) => {
      const maxDay = new Date(startY, startM + i, 0).getDate();
      const safeDay = Math.min(dia, maxDay);
      const dt = new Date(startY, startM - 1 + i, safeDay);

      return {
        data: dt.toISOString().slice(0, 10),
        mes: `${MONTHS[dt.getMonth()]}/${dt.getFullYear()}`
      };
    });
  }, [form.fixo, form.fixoDia, form.fixoMeses, selMonth]);

  const recorrenciasAgrupadas = useMemo(() => {
    const grupos = new Map();

    trans.filter(t => t.fixo).forEach(t => {
      const id = t.parcelaGrupo || t.recorrenciaId || `single_${t.id}`;
      if (!grupos.has(id)) grupos.set(id, { id, lancamentos: [] });
      grupos.get(id).lancamentos.push(t);
    });

    return Array.from(grupos.values()).map(g => {
      const ordenados = [...g.lancamentos].sort((a, b) => (a.data || "").localeCompare(b.data || ""));
      const sample = ordenados[0] || {};
      const futurosPendentes = ordenados.filter(t => monthCompare(transMonthKey(t), selMonth) > 0 && t.status !== "pago" && t.status !== "parcial").length;
      const previstosEditaveis = ordenados.filter(t => t.status !== "pago" && t.status !== "parcial").length;
      const totalPrevisto = ordenados.reduce((s, t) => s + (Number(t.valor) || 0), 0);
      const totalRealizado = ordenados.reduce((s, t) => s + valorRealizado(t), 0);
      const totalPendente = ordenados.reduce((s, t) => s + saldoPendente(t), 0);

      return {
        ...g,
        lancamentos: ordenados,
        sample,
        inicio: transMonthKey(ordenados[0] || {}),
        fim: transMonthKey(ordenados[ordenados.length - 1] || {}),
        futurosPendentes,
        previstosEditaveis,
        totalPrevisto,
        totalRealizado,
        totalPendente,
      };
    }).sort((a, b) => {
      const byStatus = Number(b.futurosPendentes > 0) - Number(a.futurosPendentes > 0);
      if (byStatus) return byStatus;
      return (a.sample.descricao || "").localeCompare(b.sample.descricao || "");
    });
  }, [trans, selMonth]);

  const TABS=[
    { id:"dashboard",   label:"Dashboard" },
    { id:"lancamentos", label:"Lançamentos" },
    { id:"recorrencias",label:"🔁 Recorrências" },
    { id:"contas",      label:"🏦 Contas" },
    { id:"cartoes",     label:"💳 Cartões" },
    { id:"metas",       label:"🎯 Metas" },
    { id:"pessoas",     label:"👥 Pessoas" },
    { id:"projecoes",   label:"Projeções" },
    { id:"simulacoes",  label:"🔬 Simulações" },
    { id:"importacao",  label:"📥 Importar" },
    { id:"parametros",  label:"⚙️ Parâmetros" },
  ];

  // Tab icon map
  const TAB_ICONS = { dashboard:"◈", lancamentos:"≡", recorrencias:"🔁", contas:"🏦", cartoes:"💳", metas:"🎯", pessoas:"👥", projecoes:"↗", simulacoes:"🔬", importacao:"📥", parametros:"⚙️" };

  return (
    <div style={{ minHeight:"100vh", background:C.navy, color:C.text, fontFamily:"'Inter',system-ui,sans-serif", display:"flex" }}>

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
                <span title="Versão do aplicativo" style={{ fontSize:9, color:C.gold, background:C.gold+"22", border:`1px solid ${C.gold}44`, borderRadius:999, padding:"1px 6px", fontWeight:800 }}>v{APP_VERSION}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navegação */}
        <nav style={{ flex:1, padding:"10px 8px", display:"flex", flexDirection:"column", gap:2 }}>
          {TABS.map(t=>{
            const NAV_LABELS = { dashboard:"Dashboard", lancamentos:"Lançamentos", recorrencias:"Recorrências", contas:"Contas", cartoes:"Cartões", metas:"Metas", pessoas:"Pessoas", projecoes:"Projeções", simulacoes:"Simulações", importacao:"Importar", parametros:"Parâmetros" };
            return (
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
            );
          })}
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

        {/* DASHBOARD */}
        {tab==="dashboard"&&(
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

            {/* ── KPIs principais ── */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:12 }}>

              {/* Saldo Inicial */}
              <div style={card()}>
                <div style={lbl}>Saldo Inicial</div>
                <div style={big(C.text)}>{fmtBRL(saldoInicialTotal)}</div>
                <div style={{ marginTop:6, display:"flex", flexDirection:"column", gap:3 }}>
                  {contas.map(ct=>(
                    <div key={ct.id} style={{ display:"flex", justifyContent:"space-between", fontSize:11 }}>
                      <span style={{ color:C.soft }}>{ct.icon} {ct.nome}</span>
                      <span>{fmtBRL(getSaldoInicialConta(ct, selMonth))}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Entradas */}
              <div style={card()}>
                <div style={lbl}>Entradas do Mês</div>
                <div style={big(C.emerald)}>{fmtBRL(receitas)}</div>
                <div style={{ marginTop:6, display:"flex", flexDirection:"column", gap:3 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:11 }}><span style={{ color:C.soft }}>🏦 Corrente</span><span style={{ color:C.emerald }}>{fmtBRL(receitaCorr)}</span></div>
                  {receitaVales>0&&<div style={{ display:"flex", justifyContent:"space-between", fontSize:11 }}><span style={{ color:C.soft }}>🎫 Vales</span><span style={{ color:"#84CC16" }}>{fmtBRL(receitaVales)}</span></div>}
                </div>
              </div>

              {/* Despesas Correntes */}
              <div style={card()}>
                <div style={lbl}>Desp. Correntes</div>
                <div style={big(C.gold)}>{fmtBRL(despCorrTotal)}</div>
                <div style={{ marginTop:6, display:"flex", flexDirection:"column", gap:3 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:11 }}><span style={{ color:C.soft }}>🏦 Corrente</span><span style={{ color:C.gold }}>{fmtBRL(despCorr)}</span></div>
                  {despVales>0&&<div style={{ display:"flex", justifyContent:"space-between", fontSize:11 }}><span style={{ color:C.soft }}>🎫 Vales</span><span style={{ color:"#F97316" }}>{fmtBRL(despVales)}</span></div>}
                </div>
              </div>

              {/* Faturas do Cartão */}
              <div style={card()}>
                <div style={lbl}>Faturas do Mês</div>
                <div style={big("#CE93D8")}>{fmtBRL(despCart)}</div>
                <div style={{ marginTop:6, display:"flex", flexDirection:"column", gap:3 }}>
                  {cardTotals.filter(c=>c.gasto>0).map(c=>(
                    <div key={c.id} style={{ display:"flex", justifyContent:"space-between", fontSize:11 }}>
                      <span style={{ color:C.soft }}>💳 {c.nome}</span>
                      <span style={{ color:"#CE93D8" }}>{fmtBRL(c.gasto)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Saldo Final */}
              <div style={{ ...card(), border:`1px solid ${saldoFinal>=0?C.emerald+"66":C.coral+"66"}`, background:saldoFinal>=0?C.emerald+"0A":C.coral+"0A" }}>
                <div style={lbl}>Saldo Final</div>
                <div style={big(saldoFinal>=0?C.emerald:C.coral)}>{fmtBRL(saldoFinal)}</div>
                <div style={{ marginTop:6, display:"flex", flexDirection:"column", gap:3 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:11 }}>
                    <span style={{ color:C.soft }}>Inicial</span><span>{fmtBRL(saldoInicialTotal)}</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:11 }}>
                    <span style={{ color:C.soft }}>+ Entradas</span><span style={{ color:C.emerald }}>+{fmtBRL(receitas)}</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:11 }}>
                    <span style={{ color:C.soft }}>− Correntes</span><span style={{ color:C.gold }}>-{fmtBRL(despCorrTotal)}</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:11 }}>
                    <span style={{ color:C.soft }}>Faturas abertas</span><span style={{ color:"#CE93D8" }}>{fmtBRL(despCart)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Todas as contas / vales ── */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))", gap:12 }}>
              {contas.map(ct=>{
                const entradas  = monthTrans.filter(t=>t.contaId===ct.id&&t.tipo==="receita").reduce((s,t)=>s+valorRealizado(t),0);
                const saidas    = monthTrans.filter(t=>t.contaId===ct.id&&t.tipo==="despesa").reduce((s,t)=>s+valorRealizado(t),0);
                const saldoIni  = getSaldoInicialConta(ct, selMonth);
                const saldoFin  = saldoIni + entradas - saidas;
                const base      = saldoIni + entradas;
                const pct       = base>0 ? saidas/base : 0;
                const isVale    = ct.tipo!=="corrente";
                return (
                  <div key={ct.id} style={card()}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                        <span style={{ fontSize:18 }}>{ct.icon}</span>
                        <div>
                          <div style={{ fontWeight:700, fontSize:13 }}>{ct.nome}</div>
                          <div style={{ fontSize:10, color:C.soft }}>{ct.tipo==="corrente"?"Conta Corrente":ct.tipo==="vale_alimentacao"?"Vale Alimentação":"Vale Refeição"}</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:5, marginBottom:9 }}>
                      <div style={{ background:C.navy, borderRadius:6, padding:"7px 8px" }}>
                        <div style={{ fontSize:9, color:C.soft, marginBottom:2, textTransform:"uppercase", letterSpacing:"0.06em" }}>Inicial</div>
                        <div style={{ fontSize:12, fontWeight:700 }}>{fmtBRL(saldoIni)}</div>
                      </div>
                      <div style={{ background:C.navy, borderRadius:6, padding:"7px 8px" }}>
                        <div style={{ fontSize:9, color:C.soft, marginBottom:2, textTransform:"uppercase", letterSpacing:"0.06em" }}>{isVale?"Crédito":"Entradas"}</div>
                        <div style={{ fontSize:12, fontWeight:700, color:C.emerald }}>+{fmtBRL(entradas)}</div>
                      </div>
                      <div style={{ background:C.navy, borderRadius:6, padding:"7px 8px" }}>
                        <div style={{ fontSize:9, color:C.soft, marginBottom:2, textTransform:"uppercase", letterSpacing:"0.06em" }}>Saídas</div>
                        <div style={{ fontSize:12, fontWeight:700, color:C.coral }}>-{fmtBRL(saidas)}</div>
                      </div>
                    </div>
                    {isVale&&base>0&&(
                      <div style={{ marginBottom:7 }}>
                        <div style={{ background:C.border, borderRadius:4, height:5 }}>
                          <div style={{ height:5, borderRadius:4, width:`${Math.min(100,pct*100)}%`, background:pct>0.85?C.coral:ct.cor }}/>
                        </div>
                        <div style={{ fontSize:10, color:C.soft, marginTop:3 }}>{(pct*100).toFixed(0)}% utilizado</div>
                      </div>
                    )}
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:7, borderTop:`1px solid ${C.border}` }}>
                      <span style={{ fontSize:11, color:C.soft }}>Saldo final</span>
                      <span style={{ fontSize:15, fontWeight:800, color:saldoFin>=0?ct.cor:C.coral }}>{fmtBRL(saldoFin)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Gráficos ── */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <div style={card()}><div style={{ ...lbl, marginBottom:12 }}>Despesas — Últimos 6 meses</div><BarChart data={last6} color={C.emerald} height={100}/></div>
              <div style={card()}>
                <div style={{ ...lbl, marginBottom:10 }}>Por Categoria — {MONTHS[selMon-1]}</div>
                <div style={{ display:"flex", alignItems:"center", gap:18 }}>
                  {catBreakdown.length>0&&(<><DonutChart segments={catBreakdown.map(x=>({ value:x.val,color:x.color }))}/>
                    <div style={{ flex:1, display:"flex", flexDirection:"column", gap:5 }}>
                      {catBreakdown.slice(0,6).map(x=>(
                        <div key={x.cat} style={{ display:"flex", alignItems:"center", gap:7 }}>
                          <div style={{ width:7, height:7, borderRadius:2, background:x.color, flexShrink:0 }}/>
                          <span style={{ fontSize:12, flex:1 }}>{x.cat}</span>
                          <span style={{ fontSize:12, fontWeight:700 }}>{fmtBRL(x.val)}</span>
                        </div>
                      ))}
                    </div></>)}
                  {catBreakdown.length===0&&<span style={{ color:C.soft }}>Sem despesas</span>}
                </div>
              </div>
            </div>

            {/* ── Cartões de crédito ── */}
            <div>
              <div style={{ ...lbl, marginBottom:10 }}>Cartões de Crédito</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:12 }}>
                {cardTotals.map(c=>(
                  <div key={c.id} style={card()}>
                    <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:9 }}><div style={{ width:9,height:9,borderRadius:2,background:c.cor }}/><span style={{ fontWeight:700 }}>{c.nome}</span></div>
                    <div style={lbl}>Gasto / Limite</div>
                    <div style={{ fontSize:14, fontWeight:800, color:c.gasto/c.limite>params.alertaLimite/100?C.coral:C.text }}>{fmtBRL(c.gasto)} <span style={{ fontSize:11, fontWeight:400, color:C.soft }}>/ {fmtBRL(c.limite)}</span></div>
                    <div style={{ marginTop:7, background:C.border, borderRadius:4, height:5 }}><div style={{ height:5, borderRadius:4, width:`${Math.min(100,(c.gasto/c.limite)*100)}%`, background:c.gasto/c.limite>params.alertaLimite/100?C.coral:C.emerald }}/></div>
                    <div style={{ marginTop:4, fontSize:11, color:C.soft }}>Disponível: {fmtBRL(c.disponivel)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* LANÇAMENTOS */}
        {tab==="lancamentos"&&(
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", gap:12, alignItems:"center", flexWrap:"wrap" }}>
              <div style={{ color:C.soft, fontSize:12 }}>
                {transactionFilters.dataInicio || transactionFilters.dataFim
                  ? "Filtro por período ativo"
                  : `Exibindo mês selecionado: ${formatMonthBR(selMonth)}`}
              </div>
              <button onClick={openAddTrans} style={btn(C.emerald)}>+ Novo Lançamento</button>
            </div>

            <TransactionFiltersPanel
              filters={transactionFilters}
              onChange={setTransactionFilters}
              onClear={()=>setTransactionFilters(EMPTY_TRANSACTION_FILTERS)}
              rootCats={rootCats}
              card={card}
              lbl={lbl}
              inp={inp}
              ghost={ghost}
            />

            <div style={card({ padding:0, overflow:"hidden" })}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead><tr style={{ background:C.border }}>{["Data","Descrição","Categoria","Origem","Tipo","Status","Valor",""] .map(h=><th key={h} style={{ padding:"9px 13px", textAlign:"left", fontWeight:600, color:C.soft, fontSize:11 }}>{h}</th>)}</tr></thead>
                <tbody>
                  {filteredTransactions.length===0&&<tr><td colSpan={8} style={{ padding:28, textAlign:"center", color:C.soft }}>Nenhum lançamento encontrado para os filtros informados.</td></tr>}
                  {filteredTransactions.map(t=>(
                    <tr key={t.id} style={{ borderTop:`1px solid ${C.border}` }}>
                      <td style={{ padding:"9px 13px", color:C.soft }}>{fmtDate(t.data)}</td>
                      <td style={{ padding:"9px 13px" }}>
                        {t.descricao}
                        {t.fixo&&<span style={{ marginLeft:5, fontSize:10, background:C.border, padding:"2px 5px", borderRadius:4, color:C.soft }}>fixo</span>}
                        {t.totalParcelas&&<span style={{ marginLeft:5, fontSize:10, background:C.gold+"22", padding:"2px 5px", borderRadius:4, color:C.gold }}>{t.parcela}/{t.totalParcelas}×</span>}
                        {t.importado&&<span style={{ marginLeft:5, fontSize:10, background:C.emerald+"22", padding:"2px 5px", borderRadius:4, color:C.emerald }}>importado</span>}
                      </td>
                      <td style={{ padding:"9px 13px", minWidth:210 }}>
                        {renderCategoryEditor(t)}
                      </td>
                      <td style={{ padding:"9px 13px", color:C.soft, fontSize:12 }}>{t.origem==="cartao"?(cards.find(c=>c.id===t.cartaoId)?.nome||"Cartão"):t.origem==="vale_alimentacao"?"🛒 Vale Alim.":t.origem==="vale_refeicao"?"🍽️ Vale Ref.":"🏦 Corrente"}</td>
                      <td style={{ padding:"9px 13px" }}><span style={{ color:t.tipo==="receita"?C.emerald:C.coral, fontWeight:600, fontSize:12 }}>{t.tipo==="receita"?"↑ Receita":"↓ Despesa"}</span></td>
                      <td style={{ padding:"9px 13px" }}>
                        <span style={{ fontSize:11, fontWeight:700, padding:"2px 7px", borderRadius:20, background:(t.status==="previsto"?C.gold:t.status==="parcial"?"#CE93D8":C.emerald)+"22", color:t.status==="previsto"?C.gold:t.status==="parcial"?"#CE93D8":C.emerald }}>
                          {t.status==="previsto"?"Previsto":t.status==="parcial"?`Parcial (${fmtBRL(t.valorPago||0)})`:"Pago"}
                        </span>
                      </td>
                      <td style={{ padding:"9px 13px", fontWeight:700, color:t.tipo==="receita"?C.emerald:C.text }}>{t.tipo==="receita"?"+":"-"}{fmtBRL(valorRealizado(t))}</td>
                      <td style={{ padding:"9px 13px", display:"flex", gap:5, alignItems:"center" }}>
                        {(t.status==="previsto"||t.status==="parcial")&&<button onClick={()=>baixarTrans(t.id)} style={ghost({ padding:"3px 7px", fontSize:11, color:C.emerald })}>Baixar</button>}
                        {(t.status==="previsto"||t.status==="parcial")&&<button onClick={()=>baixarParcialTrans(t.id)} style={ghost({ padding:"3px 7px", fontSize:11, color:C.gold })}>Parcial</button>}
                        <button onClick={()=>delTrans(t.id)} style={{ background:"transparent", border:"none", color:C.coral, cursor:"pointer", fontSize:16 }}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* RECORRÊNCIAS */}
        {tab==="recorrencias"&&(
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={card()}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:14, flexWrap:"wrap" }}>
                <div>
                  <div style={{ fontWeight:800, fontSize:16, marginBottom:4 }}>Lançamentos recorrentes</div>
                  <div style={{ fontSize:13, color:C.soft }}>Visualize, edite, exclua ou finde séries criadas como lançamento fixo/recorrente. O mês selecionado define a partir de quando editar ou findar.</div>
                </div>
                <button onClick={openAddTrans} style={btn(C.emerald)}>+ Nova recorrência</button>
              </div>
            </div>

            {recorrenciasAgrupadas.length===0&&
              <div style={card({ textAlign:"center", padding:"34px 22px" })}>
                <div style={{ fontSize:32, marginBottom:8 }}>🔁</div>
                <div style={{ fontWeight:800, marginBottom:4 }}>Nenhuma recorrência cadastrada</div>
                <div style={{ fontSize:13, color:C.soft }}>Crie um lançamento e marque a opção “Lançamento fixo / recorrente”.</div>
              </div>
            }

            {recorrenciasAgrupadas.length>0&&
              <div style={card({ padding:0, overflow:"hidden" })}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                  <thead>
                    <tr style={{ background:C.border }}>
                      {["Recorrência","Categoria","Origem","Período","Status","Valores","Ações"].map(h=><th key={h} style={{ padding:"9px 13px", textAlign:"left", fontWeight:600, color:C.soft, fontSize:11 }}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {recorrenciasAgrupadas.map(g=>{
                      const t = g.sample;
                      const origemNome = t.origem === "cartao"
                        ? `💳 ${cards.find(c=>c.id===t.cartaoId)?.nome || "Cartão"}`
                        : `${contas.find(c=>c.id===t.contaId)?.icon || "🏦"} ${contas.find(c=>c.id===t.contaId)?.nome || "Conta"}`;
                      const ativa = g.futurosPendentes > 0;
                      return (
                        <tr key={g.id} style={{ borderTop:`1px solid ${C.border}` }}>
                          <td style={{ padding:"11px 13px" }}>
                            <div style={{ fontWeight:800 }}>{t.descricao || "Sem descrição"}</div>
                            <div style={{ fontSize:11, color:C.soft, marginTop:3 }}>
                              {t.tipo === "receita" ? "↑ Receita" : "↓ Despesa"} · {g.lancamentos.length} lançamentos · dia {(t.data || "").slice(8,10) || "—"}
                            </div>
                          </td>
                          <td style={{ padding:"11px 13px" }}>
                            <span style={{ fontSize:11, background:getCatColor(t.catId)+"22", color:getCatColor(t.catId), padding:"2px 8px", borderRadius:20, fontWeight:600, whiteSpace:"nowrap" }}>
                              {getCatIcon(t.catId)} {getCatLabel(t.catId)}
                            </span>
                          </td>
                          <td style={{ padding:"11px 13px", color:C.soft, fontSize:12 }}>{origemNome}</td>
                          <td style={{ padding:"11px 13px", color:C.soft, fontSize:12 }}>{g.inicio || "—"} até {g.fim || "—"}</td>
                          <td style={{ padding:"11px 13px" }}>
                            <span style={{ fontSize:11, fontWeight:800, padding:"3px 8px", borderRadius:20, background:ativa?C.emerald+"22":C.muted+"22", color:ativa?C.emerald:C.soft }}>
                              {ativa ? "Ativa" : "Sem futuros"}
                            </span>
                            <div style={{ fontSize:10, color:C.soft, marginTop:4 }}>{g.previstosEditaveis} previstos editáveis</div>
                          </td>
                          <td style={{ padding:"11px 13px" }}>
                            <div style={{ fontWeight:800, color:t.tipo==="receita"?C.emerald:C.text }}>{fmtBRL(t.valor)}</div>
                            <div style={{ fontSize:10, color:C.soft, marginTop:3 }}>Pendente total: {fmtBRL(g.totalPendente)}</div>
                          </td>
                          <td style={{ padding:"11px 13px" }}>
                            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                              <button onClick={()=>abrirEdicaoRecorrencia(g)} style={ghost({ padding:"4px 8px", fontSize:11, color:C.emerald })}>Editar</button>
                              <button onClick={()=>findarRecorrencia(g.id)} style={ghost({ padding:"4px 8px", fontSize:11, color:C.gold })}>Findar</button>
                              <button onClick={()=>excluirRecorrencia(g.id)} style={ghost({ padding:"4px 8px", fontSize:11, color:C.coral })}>Excluir</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            }
          </div>
        )}

        {/* CARTÕES */}
        {tab==="cartoes"&&(
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ display:"flex", justifyContent:"flex-end" }}><button onClick={()=>{ setModal("addCard"); setForm({ cor:"#00A878", contaPagamentoId:primeiraContaCorrenteId, accountId:primeiraContaCorrenteId }); }} style={btn(C.emerald)}>+ Adicionar Cartão</button></div>
            {cardTotals.map(c=>{ const fatura=dateForMonthDay(selMonth,c.fechamento); const venc=dateForMonthDay(monthOffset(selMonth,1),c.vencimento); const tc=monthTrans.filter(t=>t.cartaoId===c.id&&t.origem==="cartao"); const aberto = expandedCards[c.id] ?? true; return (
              <div key={c.id} style={card()}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                    <div style={{ width:38, height:24, borderRadius:6, background:c.cor, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700 }}>{c.nome.slice(0,2).toUpperCase()}</div>
                    <div><div style={{ fontWeight:800, fontSize:14 }}>{c.nome}</div><div style={{ fontSize:12, color:C.soft }}>Limite: {fmtBRL(c.limite)} · Fecha {c.fechamento} · Vence {c.vencimento} · Conta: {c.contaPagamentoNome}</div></div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ textAlign:"right" }}><div style={lbl}>Fatura atual</div><div style={{ fontSize:18, fontWeight:800, color:c.gasto/c.limite>params.alertaLimite/100?C.coral:C.text }}>{fmtBRL(c.gasto)}</div></div>
                    <button onClick={()=>toggleCardAccordion(c.id)} aria-expanded={aberto} style={ghost({ padding:"5px 10px", fontSize:13 })}>{aberto?"▲ Fechar":"▼ Abrir"}</button>
                  </div>
                </div>
                {aberto&&<>
                <div style={{ background:C.border, borderRadius:5, height:6, marginBottom:6 }}><div style={{ height:6, borderRadius:5, width:`${Math.min(100,(c.gasto/c.limite)*100)}%`, background:c.gasto/c.limite>params.alertaLimite/100?C.coral:c.cor }}/></div>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:C.soft, marginBottom:14 }}><span>{((c.gasto/c.limite)*100).toFixed(0)}% utilizado</span><span>Disponível: {fmtBRL(c.disponivel)}</span></div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))", gap:9, marginBottom:14 }}>
                  <div style={{ background:C.navy, borderRadius:7, padding:"9px 12px" }}><div style={lbl}>Fechamento</div><div style={{ fontWeight:700 }}>{fmtDate(fatura)}</div></div>
                  <div style={{ background:C.navy, borderRadius:7, padding:"9px 12px" }}><div style={lbl}>Vencimento previsto</div><div style={{ fontWeight:700 }}>{fmtDate(venc)}</div></div>
                  <div style={{ background:C.navy, borderRadius:7, padding:"9px 12px", border:`1px solid ${c.invoiceClosureStatus==="open"?C.emerald:C.gold}55` }}>
                    <div style={lbl}>Situação da fatura</div>
                    <div style={{ fontWeight:800, color:c.invoiceClosureStatus==="open"?C.emerald:C.gold }}>{c.invoiceClosureLabel}</div>
                  </div>
                  <div style={{ background:C.navy, borderRadius:7, padding:"9px 12px", border:`1px solid ${c.invoicePaidAmount>=c.invoiceTotal&&c.invoiceTotal>0?C.emerald:c.invoicePaidAmount>0?C.gold:C.coral}55` }}>
                    <div style={lbl}>Pagamento</div>
                    <div style={{ fontWeight:800, color:c.invoicePaidAmount>=c.invoiceTotal&&c.invoiceTotal>0?C.emerald:c.invoicePaidAmount>0?C.gold:C.coral }}>{c.invoicePaymentStatusLabel}</div>
                    <div style={{ fontSize:10, color:C.soft, marginTop:3 }}>Pago {fmtBRL(c.invoicePaidAmount)} · Pendente {fmtBRL(c.invoicePendingAmount)}</div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:14 }}>
                  <button onClick={()=>adicionarAjusteFatura(c.id,"acrescimo")} style={btn(C.gold,{ color:C.navy, fontSize:12, padding:"6px 12px" })}>+ Ajuste fatura</button>
                  <button onClick={()=>adicionarAjusteFatura(c.id,"reducao")} style={btn(C.border,{ fontSize:12, padding:"6px 12px" })}>− Ajuste fatura</button>
                  {c.invoiceClosureStatus!=="open"&&<button onClick={()=>abrirFaturaCartao(c.id)} style={btn(C.gold,{ color:C.navy, fontSize:12, padding:"6px 12px" })}>Reabrir fatura</button>}
                  <button onClick={()=>fecharFaturaCartao(c.id)} style={btn(C.emerald,{ fontSize:12, padding:"6px 12px" })}>Fechar fatura e lançar pagamento previsto</button>
                  <button onClick={()=>exportCreditCardExpensesTxt(c.id, selMonth)} style={btn(C.border,{ fontSize:12, padding:"6px 12px" })}>Exportar TXT</button>
                </div>
                {tc.length>0&&(
                  <table style={{ width:"100%", fontSize:12, borderCollapse:"collapse" }}>
                    <thead><tr>{["Data","Descrição","Categoria","Valor"].map(h=><th key={h} style={{ textAlign:"left", color:C.soft, fontSize:10, padding:"3px 7px", borderBottom:`1px solid ${C.border}` }}>{h}</th>)}</tr></thead>
                    <tbody>
                      {tc.map(t=>(
                        <tr key={t.id}>
                          <td style={{ padding:"6px 7px", color:C.soft }}>{fmtDate(t.data)}</td>
                          <td style={{ padding:"6px 7px" }}>{t.descricao}{t.natureza==="ajuste_fatura_cartao"&&<span style={{ marginLeft:3, fontSize:9, background:C.gold+"22", padding:"1px 4px", borderRadius:3, color:C.gold }}>ajuste</span>}{t.totalParcelas&&<span style={{ marginLeft:3, fontSize:9, background:C.gold+"22", padding:"1px 4px", borderRadius:3, color:C.gold }}>{t.parcela}/{t.totalParcelas}×</span>}</td>
                          <td style={{ padding:"6px 7px", minWidth:190 }}>{renderCategoryEditor(t, true)}</td>
                          <td style={{ padding:"6px 7px", fontWeight:700, color:signedCardAmount(t)<0?C.emerald:C.text }}>{signedCardAmount(t)<0?"-":""}{fmtBRL(Math.abs(signedCardAmount(t)))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                </>}
              </div>
            );})}
          </div>
        )}

        {/* CONTAS */}
        {tab==="contas"&&(
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={card()}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:15, marginBottom:3 }}>Contas</div>
                  <div style={{ fontSize:13, color:C.soft }}>Cadastre e acompanhe contas correntes, vale alimentação e vale refeição.</div>
                </div>
                <button onClick={()=>setShowContaForm(v=>!v)} style={btn(C.emerald)}>+ Nova Conta</button>
              </div>
              {showContaForm&&<div style={{ marginTop:14, background:C.navy, borderRadius:10, padding:"13px 15px", border:`1px dashed ${C.border}` }}>
                <div style={{ fontWeight:600, fontSize:13, marginBottom:10 }}>Nova conta</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 220px auto", gap:8, alignItems:"end" }}>
                  <div><div style={lbl}>Nome</div><input style={inputStyle("novaContaNome")} placeholder="Ex: Banco do Brasil" value={novaContaForm.nome} onChange={e=>setNovaContaForm(f=>({...f,nome:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addContaFromForm()}/></div>
                  <div><div style={lbl}>Tipo</div><select style={inp} value={novaContaForm.tipo} onChange={e=>setNovaContaForm(f=>({...f,tipo:e.target.value}))}><option value="corrente">Conta Corrente</option><option value="vale_alimentacao">Vale Alimentação</option><option value="vale_refeicao">Vale Refeição</option></select></div>
                  <div style={{ display:"flex", gap:8 }}><button onClick={addContaFromForm} style={btn(C.emerald,{ whiteSpace:"nowrap" })}>Salvar</button><button onClick={()=>setShowContaForm(false)} style={ghost()}>Cancelar</button></div>
                </div>
              </div>}
            </div>
            {contas.map(ct=>{
              const ctTrans = monthTrans.filter(t=>t.contaId===ct.id).sort((a,b)=>b.data.localeCompare(a.data));
              const entradas = ctTrans.filter(t=>t.tipo==="receita").reduce((s,t)=>s+valorRealizado(t),0);
              const saidas   = ctTrans.filter(t=>t.tipo==="despesa").reduce((s,t)=>s+valorRealizado(t),0);
              const saldoIni = getSaldoInicialConta(ct, selMonth);
              const saldoFin = saldoIni + entradas - saidas;
              const base     = saldoIni + entradas;
              const pct      = base>0?saidas/base:0;
              const aberto = expandedAccounts[ct.id] ?? true;
              return (
                <div key={ct.id} style={card()}>
                  {/* Header da conta */}
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:40, height:40, borderRadius:10, background:ct.cor+"22", border:`2px solid ${ct.cor}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{ct.icon}</div>
                      <div>
                        <div style={{ fontWeight:800, fontSize:16 }}>{ct.nome}</div>
                        <div style={{ fontSize:11, color:C.soft, textTransform:"uppercase", letterSpacing:"0.06em" }}>
                          {ct.tipo==="corrente"?"Conta Corrente":ct.tipo==="vale_alimentacao"?"Vale Alimentação":"Vale Refeição"}
                        </div>
                      </div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <div style={{ textAlign:"right" }}>
                        <div style={lbl}>Saldo do mês</div>
                        <div style={{ fontSize:20, fontWeight:800, color:saldoFin>=0?C.emerald:C.coral }}>{fmtBRL(saldoFin)}</div>
                      </div>
                      <button onClick={()=>toggleAccountAccordion(ct.id)} aria-expanded={aberto} style={ghost({ padding:"5px 10px", fontSize:13 })}>{aberto?"▲ Fechar":"▼ Abrir"}</button>
                    </div>
                  </div>

                  {aberto&&<>
                  {/* Barra de uso (só para vales) */}
                  {ct.tipo!=="corrente"&&entradas>0&&(
                    <div style={{ marginBottom:12 }}>
                      <div style={{ background:C.border, borderRadius:5, height:7 }}>
                        <div style={{ height:7, borderRadius:5, width:`${Math.min(100,pct*100)}%`, background:pct>0.85?C.coral:ct.cor }}/>
                      </div>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, marginTop:4, color:C.soft }}>
                        <span>Crédito: {fmtBRL(entradas)}</span>
                        <span>Usado: {(pct*100).toFixed(0)}% · Disponível: {fmtBRL(saldoFin)}</span>
                      </div>
                    </div>
                  )}

                  {/* Resumo: saldo inicial | entradas | saidas | saldo final */}
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:9, marginBottom:14 }}>
                    <div style={{ background:C.navy, borderRadius:8, padding:"10px 13px" }}>
                      <div style={lbl}>Saldo Inicial do Mês</div>
                      <MoneyInput style={{ ...inp, padding:"5px 8px", fontSize:12 }} value={String(saldoIni)} onChange={value=>setSaldoInicialContaMes(ct.id, selMonth, value)}/>
                    </div>
                    <div style={{ background:C.navy, borderRadius:8, padding:"10px 13px" }}>
                      <div style={lbl}>↑ Entradas</div>
                      <div style={{ fontSize:15, fontWeight:700, color:C.emerald }}>{fmtBRL(entradas)}</div>
                    </div>
                    <div style={{ background:C.navy, borderRadius:8, padding:"10px 13px" }}>
                      <div style={lbl}>↓ Saídas</div>
                      <div style={{ fontSize:15, fontWeight:700, color:C.coral }}>{fmtBRL(saidas)}</div>
                    </div>
                    <div style={{ background:saldoFin>=0?C.emerald+"11":C.coral+"11", border:`1px solid ${saldoFin>=0?C.emerald+"44":C.coral+"44"}`, borderRadius:8, padding:"10px 13px" }}>
                      <div style={lbl}>Saldo Final</div>
                      <div style={{ fontSize:15, fontWeight:800, color:saldoFin>=0?C.emerald:C.coral }}>{fmtBRL(saldoFin)}</div>
                    </div>
                  </div>

                  {/* Tabela de lançamentos */}
                  {ctTrans.length>0&&(
                    <table style={{ width:"100%", fontSize:12, borderCollapse:"collapse" }}>
                      <thead><tr style={{ borderBottom:`1px solid ${C.border}` }}>{["Data","Descrição","Categoria","Valor"].map((h,i)=><th key={h} style={{ padding:"6px 10px", textAlign:i===3?"right":"left", color:C.soft, fontSize:10, fontWeight:600 }}>{h}</th>)}</tr></thead>
                      <tbody>
                        {ctTrans.map(t=>(
                          <tr key={t.id} style={{ borderTop:`1px solid ${C.border}` }}>
                            <td style={{ padding:"8px 10px", color:C.soft, whiteSpace:"nowrap" }}>{fmtDate(t.data)}</td>
                            <td style={{ padding:"8px 10px" }}>
                              {t.descricao}
                              {t.fixo&&<span style={{ marginLeft:4, fontSize:9, background:C.border, padding:"1px 4px", borderRadius:3, color:C.soft }}>fixo</span>}
                              {t.status&&<span style={{ marginLeft:4, fontSize:9, background:(t.status==="previsto"?C.gold:C.emerald)+"22", padding:"1px 4px", borderRadius:3, color:t.status==="previsto"?C.gold:C.emerald }}>{t.status}</span>}
                            </td>
                            <td style={{ padding:"8px 10px", minWidth:190 }}>
                              {renderCategoryEditor(t, true)}
                            </td>
                            <td style={{ padding:"8px 10px", textAlign:"right", fontWeight:700, color:t.tipo==="receita"?C.emerald:C.coral }}>
                              {t.tipo==="receita"?"+":"-"}{fmtBRL(valorRealizado(t))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {ctTrans.length===0&&(
                    <div style={{ textAlign:"center", padding:"22px 0", color:C.soft, fontSize:13 }}>Nenhum lançamento neste mês.</div>
                  )}
                  </>}
                </div>
              );
            })}
          </div>
        )}

        {/* METAS */}
        {tab==="metas"&&(            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div style={card()}>
                <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>🎯 Metas Mensais por Categoria</div>
                <div style={{ fontSize:13, color:C.soft, marginBottom:4 }}>
                  Define um limite de gasto mensal por categoria. Considera gastos de <strong style={{ color:C.text }}>conta corrente e vales</strong> (não inclui cartão de crédito).
                </div>
                <div style={{ fontSize:12, color:C.gold, background:C.gold+"11", padding:"7px 11px", borderRadius:7, marginBottom:0 }}>
                  💡 Para editar, clique no valor de limite de qualquer categoria e pressione Enter para salvar.
                </div>
              </div>

              {/* Categorias com meta definida */}
              {rootCats.some(c=>metas[c.id]>0)&&(
                <div style={card()}>
                  <div style={{ fontWeight:700, fontSize:14, marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
                    Metas configuradas
                    <span style={{ fontSize:12, fontWeight:400, color:C.soft }}>— {MONTHS[selMon-1]} {selYear}</span>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {rootCats.filter(c=>metas[c.id]>0).map(cat=>{
                      const gasto  = gastoCatMes[cat.nome]||0;
                      const limite = metas[cat.id]||0;
                      const pct    = limite>0?Math.min(gasto/limite,1):0;
                      const over   = gasto>limite;
                      const warn   = !over && pct>=0.8;
                      const barCol = over?C.coral:warn?C.gold:cat.cor||C.emerald;
                      return (
                        <div key={cat.id}>
                          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:5 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                              <span style={{ fontSize:16 }}>{cat.icon}</span>
                              <span style={{ fontWeight:600 }}>{cat.nome}</span>
                              {over&&<span style={{ fontSize:10, background:C.coral+"22", color:C.coral, padding:"2px 7px", borderRadius:20, fontWeight:700 }}>⚠ Acima do limite</span>}
                              {warn&&<span style={{ fontSize:10, background:C.gold+"22", color:C.gold, padding:"2px 7px", borderRadius:20, fontWeight:700 }}>⚡ Atenção</span>}
                            </div>
                            <div style={{ display:"flex", alignItems:"center", gap:10, fontSize:13 }}>
                              <span style={{ color:over?C.coral:C.text, fontWeight:700 }}>{fmtBRL(gasto)}</span>
                              <span style={{ color:C.soft }}>/</span>
                              <MetaInput catId={cat.id} metas={metas} setMetas={setMetas}/>
                            </div>
                          </div>
                          <div style={{ background:C.border, borderRadius:4, height:8, overflow:"hidden" }}>
                            <div style={{ height:8, borderRadius:4, width:`${Math.min(100,pct*100)}%`, background:barCol, transition:"width .3s" }}/>
                          </div>
                          <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, marginTop:3, color:C.soft }}>
                            <span>{(pct*100).toFixed(0)}% utilizado</span>
                            <span>{over?`Excedido em ${fmtBRL(gasto-limite)}`:`Restam ${fmtBRL(limite-gasto)}`}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Todas as categorias para configurar */}
              <div style={card()}>
                <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>Configurar limites</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:10 }}>
                  {rootCats.map(cat=>{
                    const gasto  = gastoCatMes[cat.nome]||0;
                    const limite = metas[cat.id]||0;
                    const over   = limite>0 && gasto>limite;
                    return (
                      <div key={cat.id} style={{ display:"flex", alignItems:"center", gap:10, background:C.navy, borderRadius:9, padding:"10px 13px", border:`1px solid ${over?C.coral+"55":C.border}` }}>
                        <span style={{ fontSize:20, flexShrink:0 }}>{cat.icon}</span>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontWeight:600, fontSize:13, marginBottom:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{cat.nome}</div>
                          <div style={{ fontSize:11, color:C.soft }}>Gasto: <span style={{ color:over?C.coral:C.text, fontWeight:600 }}>{fmtBRL(gasto)}</span></div>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
                          <span style={{ fontSize:11, color:C.soft }}>Limite:</span>
                          <MetaInput catId={cat.id} metas={metas} setMetas={setMetas} compact/>
                          {limite>0&&<button onClick={()=>setMetas(p=>{const n={...p};delete n[cat.id];return n;})} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:14, padding:"0 2px" }}>×</button>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Resumo: categorias sem meta e total comprometido */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div style={card()}>
                  <div style={lbl}>Total com meta configurada</div>
                  <div style={{ fontSize:20, fontWeight:800, color:C.emerald }}>{fmtBRL(rootCats.filter(c=>metas[c.id]>0).reduce((s,c)=>s+(metas[c.id]||0),0))}</div>
                  <div style={{ fontSize:12, color:C.soft, marginTop:4 }}>limite total do mês</div>
                </div>
                <div style={card()}>
                  <div style={lbl}>Total gasto (corrente + vales)</div>
                  <div style={{ fontSize:20, fontWeight:800, color:C.gold }}>{fmtBRL(Object.values(gastoCatMes).reduce((s,v)=>s+v,0))}</div>
                  <div style={{ fontSize:12, color:C.soft, marginTop:4 }}>em {MONTHS[selMon-1]}</div>
                </div>
              </div>
            </div>
          )}

        {/* PESSOAS */}
        {tab==="pessoas"&&<PessoasTab
            pessoas={pessoas} setPessoas={setPessoas}
            dividas={dividas} setDividas={setDividas}
            despPess={despPess} setDespPess={setDespPess}
            cards={cards} cats={cats}
            getCatColor={getCatColor} getCatIcon={getCatIcon} getCatLabel={getCatLabel}
            fmtBRL={fmtBRL} fmtDate={fmtDate} lbl={lbl} big={big}
            card={card} btn={btn} inp={inp} ghost={ghost}
            C={C} uid={uid} selMonth={selMonth}
          />}

        {/* PROJEÇÕES */}
        {tab==="projecoes"&&(
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={card()}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:3 }}>Projeção — Próximos {params.mesesProjecao} meses</div>
              <div style={{ fontSize:13, color:C.soft, marginBottom:16 }}>Baseado em fixos + média de variáveis históricos</div>
              <div style={{ display:"grid", gridTemplateColumns:`repeat(${Math.min(params.mesesProjecao,4)},1fr)`, gap:12 }}>
                {projections.map(p=>(
                  <div key={p.label} style={{ background:C.navy, borderRadius:9, padding:"16px 14px" }}>
                    <div style={{ fontWeight:700, marginBottom:9 }}>{p.label}</div>
                    <div style={big(C.gold)}>{fmtBRL(p.value)}</div>
                    <div style={{ marginTop:9, display:"flex", flexDirection:"column", gap:4 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:12 }}><span style={{ color:C.soft }}>Fixos</span><span>{fmtBRL(p.fixo)}</span></div>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:12 }}><span style={{ color:C.soft }}>Variáveis</span><span>{fmtBRL(p.variavel)}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={card()}><div style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>Histórico</div><BarChart data={last6} color={C.gold} height={110}/></div>
          </div>
        )}

        {/* SIMULAÇÕES */}
        {tab==="simulacoes"&&(            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div style={card()}>
                <div style={{ fontWeight:700, fontSize:14, marginBottom:3 }}>Nova Simulação</div>
                <div style={{ fontSize:13, color:C.soft, marginBottom:14 }}>Simule uma compra sem afetar os lançamentos reais.</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(145px,1fr))", gap:9 }}>
                  <div><div style={lbl}>Cartão</div><select style={inputStyle("simCartaoId")} value={simForm.cartaoId||""} onChange={e=>setSimForm(f=>({...f,cartaoId:e.target.value}))}><option value="">Sel.</option>{cards.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}</select></div>
                  <div><div style={lbl}>Descrição</div><input style={inputStyle("simDescricao")} placeholder="Ex: MacBook" value={simForm.descricao||""} onChange={e=>setSimForm(f=>({...f,descricao:e.target.value}))}/></div>
                  <div><div style={lbl}>Categoria</div><CategorySelect cats={cats} value={simForm.catId} onChange={v=>setSimForm(f=>({...f,catId:v}))} validationInfo={requiredModal} fieldKey="simCatId"/></div>
                  <div><div style={lbl}>Modo</div><select style={inp} value={simForm.modoParc} onChange={e=>setSimForm(f=>({...f,modoParc:e.target.value}))}><option value="total">Valor total</option><option value="parcela">Vlr parcela</option></select></div>
                  <div><div style={lbl}>Valor (R$)</div><MoneyInput style={inputStyle("simValor")} value={simForm.valor||""} onChange={value=>setSimForm(f=>({...f,valor:value}))}/></div>
                  <div><div style={lbl}>Parcelas</div><input style={inp} type="number" min={1} max={48} value={simForm.parcelas||1} onChange={e=>setSimForm(f=>({...f,parcelas:e.target.value}))}/></div>
                  <div><div style={lbl}>Data 1ª</div><DateInput style={inputStyle("simData")} value={simForm.data||""} onChange={value=>setSimForm(f=>({...f,data:value}))}/></div>
                  <div><div style={lbl}>Competência 1ª fatura (opcional)</div><input style={inp} type="month" value={simForm.faturaCompetencia||""} onChange={e=>setSimForm(f=>({...f,faturaCompetencia:e.target.value}))}/><div style={{ fontSize:10, color:C.soft, marginTop:3 }}>{simForm.data&&simForm.cartaoId?`Automática: ${resolveCardCompetencia(simForm.data, simForm.cartaoId)}`:"Calculada pelo fechamento se vazio."}</div></div>
                </div>
                <div style={{ marginTop:11 }}><button onClick={addSim} style={btn(C.gold,{ color:C.navy })}>＋ Adicionar</button></div>
              </div>
              {sims.length>0&&<div style={card()}><div style={{ fontWeight:700, fontSize:13, marginBottom:10 }}>Simulações salvas</div>{sims.map(s=>{ const c=cards.find(c=>c.id===s.cartaoId); const n=parseInt(s.parcelas)||1; const vp=s.modoParc==="total"?moneyToNumber(s.valor)/n:moneyToNumber(s.valor); return (<div key={s.id} style={{ display:"flex", alignItems:"center", gap:9, background:C.navy, borderRadius:9, padding:"9px 13px", marginBottom:7, borderLeft:`3px solid ${C.gold}` }}><div style={{ flex:1 }}><div style={{ fontWeight:700 }}>{s.descricao}</div><div style={{ fontSize:12, color:C.soft }}>{c?.nome} · impacto em {n} parcela{n>1?"s":""} · {n}× de {fmtBRL(vp)} · 1ª compra em {fmtDate(s.data)} · 1ª fatura {s.faturaCompetencia || resolveCardCompetencia(s.data, s.cartaoId)}{s.recalculatedAt?` · refeita em ${fmtDate(s.recalculatedAt.slice(0,10))}`:""}</div></div><span style={{ fontSize:10, background:getCatColor(s.catId)+"22", color:getCatColor(s.catId), padding:"2px 7px", borderRadius:20 }}>{getCatIcon(s.catId)} {getCatLabel(s.catId)}</span><button onClick={()=>refazerSim(s.id)} style={{ background:C.gold+"22", border:`1px solid ${C.gold}44`, borderRadius:5, color:C.gold, padding:"3px 8px", cursor:"pointer", fontSize:12 }}>Refazer</button><button onClick={()=>delSim(s.id)} style={{ background:C.coral+"22", border:`1px solid ${C.coral}44`, borderRadius:5, color:C.coral, padding:"3px 8px", cursor:"pointer", fontSize:12 }}>Excluir</button></div>); })}</div>}
              {sims.length>0&&cards.map(c=>{ const sc=sims.filter(s=>s.cartaoId===c.id); if(!sc.length) return null; return (
                <div key={c.id} style={card()}>
                  <div style={{ fontWeight:700, fontSize:13, marginBottom:12 }}>{c.nome} — Impacto por competência de fatura</div>
                  <div style={{ overflowX:"auto" }}>
                    <table style={{ width:"100%", fontSize:12, borderCollapse:"collapse", minWidth:520 }}>
                      <thead><tr style={{ background:C.border }}>{["Mês","Real","+ Sim","Total","Restante","Status"].map((h,i)=><th key={h} style={{ padding:"7px 11px", textAlign:i>0?"right":"left", color:C.soft, fontSize:10 }}>{h}</th>)}</tr></thead>
                      <tbody>{Array.from(new Map(simTrans.filter(t=>t.cartaoId===c.id).sort((a,b)=>transMonthKey(a).localeCompare(transMonthKey(b))).map(t=>[transMonthKey(t),{ key:transMonthKey(t), label:`${MONTHS[parseInt(transMonthKey(t).slice(5,7),10)-1]} ${transMonthKey(t).slice(0,4)}` }])).values()).map(mo=>{ const real=trans.filter(t=>t.cartaoId===c.id&&t.tipo==="despesa"&&transMonthKey(t)===mo.key).reduce((s,t)=>s+signedCardAmount(t),0); const sv=simTrans.filter(t=>t.cartaoId===c.id&&transMonthKey(t)===mo.key).reduce((s,t)=>s+t.valor,0); const tot=real+sv; const rest=c.limite-tot; const pct=tot/c.limite; const status=pct>1?"🔴 Excede":pct>params.alertaLimite/100?"🟡 Atenção":"🟢 OK"; return (<tr key={mo.key} style={{ borderTop:`1px solid ${C.border}`, background:pct>1?C.coral+"11":pct>params.alertaLimite/100?C.gold+"0D":"transparent" }}><td style={{ padding:"8px 11px", fontWeight:600 }}>{mo.label}</td><td style={{ padding:"8px 11px", textAlign:"right", color:C.soft }}>{real>0?fmtBRL(real):"—"}</td><td style={{ padding:"8px 11px", textAlign:"right", color:sv>0?C.gold:C.soft, fontWeight:sv>0?700:400 }}>{sv>0?"+"+fmtBRL(sv):"—"}</td><td style={{ padding:"8px 11px", textAlign:"right", fontWeight:700 }}>{tot>0?fmtBRL(tot):"—"}</td><td style={{ padding:"8px 11px", textAlign:"right", color:rest<0?C.coral:rest<c.limite*0.15?C.gold:C.emerald, fontWeight:700 }}>{fmtBRL(rest)}</td><td style={{ padding:"8px 11px", textAlign:"right", fontSize:11 }}>{tot>0?status:"—"}</td></tr>); })}</tbody>
                    </table>
                  </div>
                </div>
              );})}
              {sims.length===0&&<div style={{ ...card(), textAlign:"center", padding:"44px 24px", color:C.soft }}><div style={{ fontSize:30, marginBottom:9 }}>🔬</div><div style={{ fontWeight:700, fontSize:14, marginBottom:5 }}>Nenhuma simulação ativa</div></div>}
            </div>
          )}

        {/* IMPORTAÇÃO */}
        {tab==="importacao"&&(
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={card()}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:3 }}>Importação de Extratos</div>
              <div style={{ fontSize:13, color:C.soft, marginBottom:12 }}>
                Importe fatura de cartão ou extrato bancário. Para extrato bancário, o sistema identifica receitas e despesas pelo sinal do valor e vincula tudo à conta selecionada.
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:9 }}>
                {[
                  {b:"💳 Cartão de crédito",f:"CSV · OFX · QFX · TXT",h:"Usa competência da fatura, preserva data da compra e expande parcelas."},
                  {b:"🟡 Banco do Brasil",f:"OFX · CSV · TXT",h:"Importa operações da conta corrente e ignora BB Rende Fácil para evitar duplicidade com poupança associada."},
                  {b:"🟠 Banco Itaú",f:"CSV · OFX · TXT",h:"Lê colunas de data, histórico/lançamento e valor/débito/crédito."},
                  {b:"🎫 Vales Pluxee",f:"PDF · TXT",h:"Importa extrato de vale alimentação/refeição: DISPONIBILIZACAO DE VALOR como crédito e demais movimentos como débito."},
                ].map(x=>(
                  <div key={x.b} style={{ background:C.navy, borderRadius:9, padding:"11px 13px" }}><div style={{ fontWeight:700, marginBottom:2 }}>{x.b}</div><div style={{ fontSize:11, color:C.gold, marginBottom:4 }}>{x.f}</div><div style={{ fontSize:11, color:C.soft, lineHeight:1.5 }}>{x.h}</div></div>
                ))}
              </div>
            </div>
            {importBatches.length>0&&<div style={card()}><div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, flexWrap:"wrap", marginBottom:10 }}><div><div style={{ fontWeight:800, fontSize:14 }}>Lotes importados</div><div style={{ fontSize:12, color:C.soft }}>Permite desfazer uma importação inteira sem remover manualmente lançamento por lançamento.</div></div></div><div style={{ display:"flex", flexDirection:"column", gap:7 }}>{importBatches.slice(0,6).map(b=><div key={b.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, flexWrap:"wrap", background:C.navy, borderRadius:8, padding:"8px 10px" }}><div style={{ fontSize:12 }}><strong>{b.tipo==="cartao"?"Cartão":b.tipo==="vale"?"Vale":"Conta"}</strong> · {b.destinoNome} · {b.qtd} lançamento(s) · {fmtBRL(b.valorLiquido)}<div style={{ color:C.soft, fontSize:11 }}>{fmtDate(b.primeiraData)} a {fmtDate(b.ultimaData)} · lote {b.id}</div></div><button onClick={()=>undoImportBatch(b.id)} style={ghost({ color:C.coral, borderColor:C.coral })}>Desfazer lote</button></div>)}</div></div>}
                        {impStep==="upload"&&<div style={card()}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>1 · Tipo, destino e arquivo</div>
              <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
                <div>
                  <div style={lbl}>Tipo de importação</div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))", gap:8 }}>
                    {[
                      { id:"cartao", label:"💳 Fatura de cartão", hint:"Exige cartão e competência" },
                      { id:"bancario", label:"🏦 Extrato bancário", hint:"Exige conta corrente/vale" },
                      { id:"vale", label:"🎫 Extrato de vale", hint:"PDF Pluxee com ano e conta de vale" },
                    ].map(opt=>(
                      <button key={opt.id} type="button" onClick={()=>{ setImpMode(opt.id); setImpErr(""); setImpRows([]); setImpTog({}); setImpDups(new Set()); }} style={{ ...ghost(), textAlign:"left", padding:"10px 12px", color:impMode===opt.id?C.text:C.soft, borderColor:impMode===opt.id?C.emerald:C.border, background:impMode===opt.id?C.emerald+"18":"transparent" }}>
                        <div style={{ fontWeight:700, fontSize:13 }}>{opt.label}</div>
                        <div style={{ fontSize:11, color:C.soft, marginTop:2 }}>{opt.hint}</div>
                      </button>
                    ))}
                  </div>
                </div>
                {impMode==="cartao"&&<>
                  <div><div style={lbl}>Cartão</div><select style={inp} value={impCId} onChange={e=>setImpCId(e.target.value)}><option value="">Selecione</option>{cards.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}</select></div>
                  <div><div style={lbl}>Competência da fatura</div><input style={inp} type="month" value={impCompetencia} onChange={e=>setImpCompetencia(e.target.value)}/><div style={{ fontSize:11, color:C.soft, marginTop:4 }}>A data da compra será preservada, mas a despesa será associada à competência informada.</div></div>
                </>}
                {impMode==="bancario"&&<>
                  <div><div style={lbl}>Banco de origem</div><select style={inp} value={impBanco} onChange={e=>setImpBanco(e.target.value)}><option value="auto">Detectar automaticamente</option><option value="bb">Banco do Brasil</option><option value="itau">Banco Itaú</option></select><div style={{ fontSize:11, color:C.soft, marginTop:4 }}>Use Banco do Brasil ou Itaú para rastreabilidade. A leitura aceita OFX, CSV e TXT. Movimentações BB Rende Fácil são ignoradas automaticamente para evitar duplicidade entre conta corrente e poupança associada.</div></div>
                  <div><div style={lbl}>Conta de destino</div><select style={inp} value={impContaId} onChange={e=>setImpContaId(e.target.value)}><option value="">Selecione</option>{contas.map(c=><option key={c.id} value={c.id}>{c.icon||"🏦"} {c.nome}</option>)}</select><div style={{ fontSize:11, color:C.soft, marginTop:4 }}>Receitas serão lançadas como entrada e débitos como despesas na conta selecionada.</div></div>
                </>}
                {impMode==="vale"&&<>
                  <div><div style={lbl}>Ano do extrato Pluxee</div><input style={inp} type="number" min="2000" max="2100" value={impValeYear} onChange={e=>setImpValeYear(e.target.value)}/><div style={{ fontSize:11, color:C.soft, marginTop:4 }}>O PDF da Pluxee informa dia e mês, mas não traz o ano em cada lançamento. O ano informado será usado na importação.</div></div>
                  <div><div style={lbl}>Conta de vale destino</div><select style={inp} value={impContaId} onChange={e=>setImpContaId(e.target.value)}><option value="">Selecione</option>{contas.filter(c=>String(c.tipo||"").startsWith("vale_")).map(c=><option key={c.id} value={c.id}>{c.icon||"🎫"} {c.nome}</option>)}{contas.filter(c=>String(c.tipo||"").startsWith("vale_")).length===0&&contas.map(c=><option key={c.id} value={c.id}>{c.icon||"🏦"} {c.nome}</option>)}</select><div style={{ fontSize:11, color:C.soft, marginTop:4 }}>Somente DISPONIBILIZACAO DE VALOR será importado como receita. Todos os demais movimentos serão importados como despesas na conta de vale selecionada.</div></div>
                </>}
                <div><div style={lbl}>Arquivo</div><label style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:9, border:`2px dashed ${C.border}`, borderRadius:11, padding:"28px 22px", cursor:"pointer", background:C.navy }} onDragOver={e=>e.preventDefault()} onDrop={e=>{ e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}><input type="file" accept={impMode==="vale"?".pdf,.txt":".csv,.ofx,.qfx,.txt"} style={{ display:"none" }} onChange={e=>handleFile(e.target.files[0])}/><div style={{ fontSize:26 }}>📂</div><div style={{ fontWeight:700, fontSize:13 }}>Arraste ou clique</div><div style={{ fontSize:11, color:C.soft }}>{impMode==="vale"?".pdf · .txt":".csv · .ofx · .qfx · .txt"}</div></label></div>
                {impErr&&<div style={{ color:C.coral, fontSize:13, padding:"9px 12px", background:C.coral+"11", borderRadius:7 }}>⚠️ {impErr}</div>}
              </div>
            </div>}
            {impStep==="review"&&(
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <div style={card()}><div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4, gap:12, flexWrap:"wrap" }}><div><div style={{ fontWeight:700, fontSize:14 }}>2 · Revise os lançamentos</div><div style={{ fontSize:12, color:C.soft }}><strong style={{ color:C.text }}>{impFile}</strong> · {impMode==="cartao"?<>competência <strong style={{ color:C.text }}>{impCompetencia}</strong></>:<>conta <strong style={{ color:C.text }}>{contas.find(c=>c.id===impContaId)?.nome||"—"}</strong></>} · {impRows.length} lançamentos · <span style={{ color:C.gold }}>{Object.values(impTog).filter(Boolean).length} selecionados</span>{(impDups.size>0||impIgnored.length>0)&&<span style={{ color:C.coral }}> · {impDups.size + impIgnored.length} duplicatas/ignorados</span>}</div></div><button onClick={resetImport} style={ghost()}>← Voltar</button></div><div style={{ display:"flex", gap:7, marginTop:10, flexWrap:"wrap" }}><button onClick={()=>setImpTog(Object.fromEntries(impRows.map(r=>[r._id,true])))} style={ghost()}>Sel. tudo</button><button onClick={()=>setImpTog(Object.fromEntries(impRows.map(r=>[r._id,false])))} style={ghost()}>Desmarcar</button></div>{(impDups.size>0||impIgnored.length>0)&&<div style={{ marginTop:10, display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:8 }}><div style={{ background:C.navy, borderRadius:8, padding:"8px 10px" }}><div style={lbl}>Duplicatas</div><div style={{ fontWeight:800, color:C.gold }}>{impDups.size}</div></div><div style={{ background:C.navy, borderRadius:8, padding:"8px 10px" }}><div style={lbl}>Ignorados por regra</div><div style={{ fontWeight:800, color:C.coral }}>{impIgnored.length}</div></div><div style={{ background:C.navy, borderRadius:8, padding:"8px 10px" }}><div style={lbl}>Selecionados</div><div style={{ fontWeight:800, color:C.emerald }}>{Object.values(impTog).filter(Boolean).length}</div></div></div>}{impIgnored.length>0&&<div style={{ marginTop:10, fontSize:11, color:C.soft }}>Ignorados automaticamente: {impIgnored.slice(0,3).map(i=>i.motivo).join(", ")}{impIgnored.length>3?` e mais ${impIgnored.length-3}`:""}.</div>}</div>
                <div style={card({ padding:0, overflow:"hidden" })}>
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                    <thead><tr style={{ background:C.border }}>{["","Data",impMode==="cartao"?"Competência":"Tipo","Descrição","Categoria","Parcela","Valor",""] .map((h,i)=><th key={i} style={{ padding:"8px 11px", textAlign:i===6?"right":"left", color:C.soft, fontSize:10 }}>{h}</th>)}</tr></thead>
                    <tbody>
                      {impRows.map(r=>{ const ck=!!impTog[r._id], isDup=impDups.has(r._id); return (
                        <tr key={r._id} style={{ borderTop:`1px solid ${C.border}`, background:!ck?C.navy+"60":isDup?C.gold+"0A":"transparent", opacity:ck?1:0.45 }}>
                          <td style={{ padding:"8px 11px", width:30 }}><input type="checkbox" checked={ck} onChange={e=>setImpTog(p=>({...p,[r._id]:e.target.checked}))}/></td>
                          <td style={{ padding:"8px 11px", color:C.soft, whiteSpace:"nowrap" }}>{fmtDate(r.data)}</td>
                          <td style={{ padding:"8px 11px", color:r.tipo==="receita"?C.emerald:C.soft, whiteSpace:"nowrap", fontWeight:impMode!=="cartao"?700:400 }}>{impMode==="cartao"?r.competencia:(r.tipo==="receita"?"Receita":"Despesa")}</td>
                          <td style={{ padding:"8px 11px" }}><div>{r.descricao}</div>{r.importadoFuturo&&<div style={{ fontSize:10, color:C.soft }}>gerado automaticamente para parcela futura</div>}{isDup&&<div style={{ fontSize:10, color:C.gold }}>⚠ duplicata desprezada por padrão</div>}</td>
                          <td style={{ padding:"8px 11px" }}><CategorySelect cats={cats} value={r.catId} onChange={v=>setImpRows(p=>p.map(x=>x._id===r._id?{...x,catId:v}:x))} style={{ fontSize:11, padding:"3px 7px", width:"auto" }}/></td>
                          <td style={{ padding:"8px 11px", color:C.soft, whiteSpace:"nowrap" }}>{r.parcela?`${r.parcela}/${r.totalParcelas}`:"—"}</td>
                          <td style={{ padding:"8px 11px", textAlign:"right", fontWeight:700, color:r.tipo==="receita"?C.emerald:C.coral }}>{r.tipo==="receita"?"+":"-"}{fmtBRL(r.valor)}</td>
                          <td style={{ padding:"8px 11px" }}><button onClick={()=>setImpRows(p=>p.filter(x=>x._id!==r._id))} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer" }}>×</button></td>
                        </tr>
                      );})}
                    </tbody>
                  </table>
                </div>
                <div style={card()}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
                    <div><div style={lbl}>Total selecionado</div><div style={{ fontSize:18, fontWeight:800, color:impRows.filter(r=>impTog[r._id]).reduce((s,r)=>s+(r.tipo==="receita"?r.valor:-r.valor),0)>=0?C.emerald:C.coral }}>{fmtBRL(impRows.filter(r=>impTog[r._id]).reduce((s,r)=>s+(r.tipo==="receita"?r.valor:-r.valor),0))}</div><div style={{ fontSize:11, color:C.soft }}>{Object.values(impTog).filter(Boolean).length} lançamentos → {impMode==="cartao"?(cards.find(c=>c.id===impCId)?.nome||"—"):(contas.find(c=>c.id===impContaId)?.nome||"—")}</div></div>
                    <div style={{ display:"flex", gap:9 }}><button onClick={resetImport} style={btn(C.border)}>Cancelar</button><button onClick={confirmImport} style={btn(C.emerald)}>✓ Importar {Object.values(impTog).filter(Boolean).length}</button></div>
                  </div>
                  {impErr&&<div style={{ color:C.coral, fontSize:12, marginTop:7 }}>⚠️ {impErr}</div>}
                </div>
              </div>
            )}
            {impStep==="done"&&<div style={{ display:"flex", flexDirection:"column", gap:12 }}><div style={{ ...card(), textAlign:"center", padding:"34px 24px" }}><div style={{ fontSize:36, marginBottom:9 }}>✅</div><div style={{ fontWeight:800, fontSize:16, marginBottom:5 }}>Importação concluída!</div><div style={{ fontSize:13, color:C.soft, marginBottom:20 }}>Lançamentos adicionados {impMode==="cartao"?<>ao {cards.find(c=>c.id===impCId)?.nome} na competência {impCompetencia}</>:<>à conta {contas.find(c=>c.id===impContaId)?.nome}</>}.</div><div style={{ display:"flex", gap:9, justifyContent:"center", flexWrap:"wrap" }}><button onClick={resetImport} style={btn(C.emerald)}>Importar outro</button><button onClick={()=>{ setTab("lancamentos"); resetImport(); }} style={btn(C.border)}>Ver lançamentos</button>{lastImportReport?.id&&<button onClick={()=>undoImportBatch(lastImportReport.id)} style={btn(C.coral)}>Desfazer este lote</button>}</div></div>{lastImportReport&&<div style={card()}><div style={{ fontWeight:800, fontSize:14, marginBottom:10 }}>Relatório da importação</div><div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:8 }}><div style={{ background:C.navy, borderRadius:8, padding:"9px 11px" }}><div style={lbl}>Importados</div><div style={{ fontWeight:800, color:C.emerald }}>{lastImportReport.importadas}</div></div><div style={{ background:C.navy, borderRadius:8, padding:"9px 11px" }}><div style={lbl}>Duplicados</div><div style={{ fontWeight:800, color:C.gold }}>{lastImportReport.duplicadas}</div></div><div style={{ background:C.navy, borderRadius:8, padding:"9px 11px" }}><div style={lbl}>Ignorados</div><div style={{ fontWeight:800, color:C.coral }}>{lastImportReport.ignoradas}</div></div><div style={{ background:C.navy, borderRadius:8, padding:"9px 11px" }}><div style={lbl}>Valor líquido</div><div style={{ fontWeight:800, color:lastImportReport.valorLiquido>=0?C.emerald:C.coral }}>{fmtBRL(lastImportReport.valorLiquido)}</div></div></div>{lastImportReport.ignoradasDetalhe?.length>0&&<div style={{ marginTop:12 }}><div style={{ fontWeight:700, fontSize:12, marginBottom:6 }}>Ignorados por regra</div>{lastImportReport.ignoradasDetalhe.map(i=><div key={i.id} style={{ fontSize:11, color:C.soft, borderTop:`1px solid ${C.border}`, padding:"5px 0" }}>Linha {i.linha}: {i.motivo} — {i.descricao.slice(0,120)}</div>)}</div>}{lastImportReport.duplicadasDetalhe?.length>0&&<div style={{ marginTop:12 }}><div style={{ fontWeight:700, fontSize:12, marginBottom:6 }}>Duplicatas identificadas</div>{lastImportReport.duplicadasDetalhe.map((d,i)=><div key={i} style={{ fontSize:11, color:C.soft, borderTop:`1px solid ${C.border}`, padding:"5px 0" }}>{fmtDate(d.data)} · {d.descricao} · {fmtBRL(d.valor)}</div>)}</div>}</div>}</div>}
          </div>
        )}

        {/* PARÂMETROS */}
        {tab==="parametros"&&<ParamsTab cats={cats} params={params} setParams={setParams} flatCats={flatCats} addRootCat={addRootCat} addSubCat={addSubCat} delCat={delCat} renameCat={renameCat} recolorCat={recolorCat} cards={cards} setCards={setCards} contas={contas} setContas={setContas} onExport={handleExport} onImport={handleImport} onReset={handleReset}/>}

        </div>
      </div>

      <RequiredFieldModal info={requiredModal} onClose={()=>setRequiredModal(null)} />

      {/* MODAL */}
      {modal&&(
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.72)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 }} onClick={e=>e.target===e.currentTarget&&closeModal()}>
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:26, width:420, maxWidth:"92vw" }}>
            {modal==="addTrans"&&(
              <>
                <h3 style={{ margin:"0 0 14px", fontWeight:800 }}>Novo Lançamento</h3>
                <div style={{ display:"flex", flexDirection:"column", gap:10, maxHeight:"75vh", overflowY:"auto", paddingRight:2 }}>

                  {/* Tipo: Despesa / Receita */}
                  <div>
                    <div style={lbl}>Tipo</div>
                    <div style={{ display:"flex", gap:7 }}>
                      {[{v:"despesa",l:"↓ Despesa"},{v:"receita",l:"↑ Receita"}].map(o=>(
                        <button key={o.v} onClick={()=>setForm(f=>({...f,tipo:o.v,parcelado:false,fixo:false}))}
                          style={{ flex:1, border:`2px solid ${form.tipo===o.v?(o.v==="despesa"?C.coral:C.emerald):C.border}`, borderRadius:8,
                                   background:form.tipo===o.v?(o.v==="despesa"?C.coral+"22":C.emerald+"22"):"transparent",
                                   color:form.tipo===o.v?(o.v==="despesa"?C.coral:C.emerald):C.soft,
                                   padding:"8px 5px", fontSize:13, fontWeight:700, cursor:"pointer" }}>{o.l}</button>
                      ))}
                    </div>
                  </div>

                  {/* Origem: Conta/Vale ou Cartão */}
                  <div>
                    <div style={lbl}>Origem</div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                      {contasDisponiveis.map(ct=>(
                        <button key={ct.id}
                          onClick={()=>setForm(f=>({...f,origemTipo:"conta",contaId:ct.id,cartaoId:"",parcelado:false}))}
                          style={{ border:`2px solid ${form.contaId===ct.id&&!isCartao?ct.cor:C.border}`, borderRadius:8,
                                   background:form.contaId===ct.id&&!isCartao?ct.cor+"22":"transparent",
                                   color:form.contaId===ct.id&&!isCartao?ct.cor:C.soft,
                                   padding:"7px 11px", fontSize:12, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
                          {ct.icon} {ct.nome}
                        </button>
                      ))}
                      <button
                        onClick={()=>setForm(f=>({...f,origemTipo:"cartao",contaId:"",cartaoId:cards[0]?.id||"",parcelado:false}))}
                        style={{ border:`2px solid ${isCartao?"#CE93D8":C.border}`, borderRadius:8,
                                 background:isCartao?"#CE93D8"+"22":"transparent",
                                 color:isCartao?"#CE93D8":C.soft,
                                 padding:"7px 11px", fontSize:12, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
                        💳 Cartão
                      </button>
                    </div>
                  </div>

                  {/* Seletor de cartão (só quando cartão selecionado) */}
                  {isCartao&&(
                    <div>
                      <div style={lbl}>Cartão</div>
                      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                        {cards.map(c=>(
                          <button key={c.id} onClick={()=>setForm(f=>({...f,cartaoId:c.id}))}
                            style={{ border:`2px solid ${form.cartaoId===c.id?c.cor:C.border}`, borderRadius:8,
                                     background:form.cartaoId===c.id?c.cor+"22":"transparent",
                                     color:form.cartaoId===c.id?c.cor:C.soft,
                                     padding:"7px 11px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
                            <span style={{ display:"inline-block", width:8, height:8, borderRadius:2, background:c.cor, marginRight:5 }}/>
                            {c.nome}
                          </button>
                        ))}
                      </div>
                      <div style={{ marginTop:9 }}>
                        <div style={lbl}>Competência da fatura {form.parcelado?"da 1ª parcela":""} (opcional)</div>
                        <input style={inp} type="month" value={form.faturaCompetencia||""} onChange={e=>setForm(f=>({...f,faturaCompetencia:e.target.value}))}/>
                        <div style={{ fontSize:10, color:C.soft, marginTop:4 }}>
                          {form.data && form.cartaoId
                            ? `Automática se vazio: ${resolveCardCompetencia(form.data, form.cartaoId)}`
                            : "Se vazio, o sistema usa a fatura aberta conforme fechamento do cartão."}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Descrição + Categoria */}
                  <div><div style={lbl}>Descrição</div><input style={inputStyle("descricao")} placeholder="Ex: Supermercado" value={form.descricao||""} onChange={e=>setForm(f=>({...f,descricao:e.target.value}))}/></div>
                  <div><div style={lbl}>Categoria</div><CategorySelect cats={cats} value={form.catId} onChange={v=>setForm(f=>({...f,catId:v}))} validationInfo={requiredModal} fieldKey="catId"/></div>

                  {/* Valor */}
                  <div><div style={lbl}>Valor (R$)</div><MoneyInput style={inputStyle("valor")} value={form.valor||""} onChange={value=>setForm(f=>({...f,valor:value}))}/></div>

                  {/* ── CARTÃO: parcelamento ── */}
                  {isCartao&&form.tipo==="despesa"&&(
                    <div style={{ background:C.navy, borderRadius:9, padding:"11px 13px" }}>
                      <label style={{ display:"flex", alignItems:"center", gap:7, fontSize:13, cursor:"pointer", marginBottom:form.parcelado?11:0 }}>
                        <input type="checkbox" checked={!!form.parcelado} onChange={e=>setForm(f=>({...f,parcelado:e.target.checked}))}/>
                        <span style={{ fontWeight:600 }}>Compra parcelada</span>
                      </label>
                      {form.parcelado&&(
                        <>
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7, marginBottom:9 }}>
                            {[{v:"total",l:"Valor total"},{v:"parcela",l:"Vlr parcela"}].map(o=>(
                              <button key={o.v} onClick={()=>setForm(f=>({...f,modoParc:o.v}))}
                                style={{ border:`2px solid ${form.modoParc===o.v?C.emerald:C.border}`, borderRadius:7,
                                         background:form.modoParc===o.v?C.emerald+"22":"transparent",
                                         color:form.modoParc===o.v?C.emerald:C.soft,
                                         padding:"6px 5px", fontSize:12, fontWeight:700, cursor:"pointer" }}>{o.l}</button>
                            ))}
                          </div>
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
                            <div><div style={lbl}>Parcelas</div><input style={inp} type="number" min={2} max={48} value={form.parcelas||2} onChange={e=>setForm(f=>({...f,parcelas:e.target.value}))}/></div>
                            <div><div style={lbl}>Data 1ª parcela</div><DateInput style={inputStyle("data")} value={form.data||""} onChange={value=>setForm(f=>({...f,data:value}))}/></div>
                          </div>
                          {form.valor&&form.parcelas&&(
                            <div style={{ marginTop:7, fontSize:12, color:C.soft }}>
                              {form.modoParc==="total"
                                ?`${form.parcelas}× de ${fmtBRL(moneyToNumber(form.valor)/parseInt(form.parcelas))}`
                                :`${form.parcelas}× de ${fmtBRL(moneyToNumber(form.valor))} = ${fmtBRL(moneyToNumber(form.valor)*parseInt(form.parcelas))}`}
                            </div>
                          )}
                          {parcPreview.length>0&&(
                            <div style={{ background:C.surface, borderRadius:8, padding:"9px 11px", marginTop:7 }}>
                              <div style={{ ...lbl, marginBottom:6 }}>Prévia</div>
                              <div style={{ display:"flex", flexDirection:"column", gap:2, maxHeight:110, overflowY:"auto" }}>
                                {parcPreview.map((p,i)=><div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:11 }}><span style={{ color:C.soft }}>{i+1}ª · compra {fmtDate(p.data)} · fatura {p.competencia}</span><span style={{ fontWeight:700, color:C.gold }}>{fmtBRL(p.valor)}</span></div>)}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* ── NÃO é parcelado: data ou recorrente ── */}
                  {!form.parcelado&&(
                    <>
                      {/* Toggle fixo/recorrente */}
                      <div style={{ background:C.navy, borderRadius:9, padding:"11px 13px" }}>
                        <label style={{ display:"flex", alignItems:"center", gap:7, fontSize:13, cursor:"pointer", marginBottom:form.fixo?12:0 }}>
                          <input type="checkbox" checked={!!form.fixo} onChange={e=>setForm(f=>({...f,fixo:e.target.checked,data:""}))}/>
                          <span style={{ fontWeight:600 }}>Lançamento fixo / recorrente</span>
                        </label>

                        {form.fixo&&(
                          <>
                            <div style={{ fontSize:12, color:C.soft, marginBottom:10 }}>
                              Será registrado todo mês no dia informado, a partir de <strong style={{ color:C.text }}>{MONTHS[selMon-1]}/{selYear}</strong>.
                            </div>
                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
                              <div>
                                <div style={lbl}>Dia do mês</div>
                                <input style={inputStyle("fixoDia")} type="number" min={1} max={31} placeholder="Ex: 5"
                                  value={form.fixoDia||""} onChange={e=>setForm(f=>({...f,fixoDia:e.target.value}))}/>
                                <div style={{ fontSize:10, color:C.soft, marginTop:3 }}>Dia do vencimento todo mês</div>
                              </div>
                              <div>
                                <div style={lbl}>Nº de meses</div>
                                <input style={inp} type="number" min={2} max={60} placeholder="Ex: 12"
                                  value={form.fixoMeses||""} onChange={e=>setForm(f=>({...f,fixoMeses:e.target.value}))}/>
                                <div style={{ fontSize:10, color:C.soft, marginTop:3 }}>Mínimo 2 meses</div>
                              </div>
                            </div>
                            {/* Prévia dos próximos meses */}
                            {recPreview.length>0&&(
                              <div style={{ marginTop:10, background:C.surface, borderRadius:8, padding:"9px 11px" }}>
                                <div style={{ ...lbl, marginBottom:6 }}>Prévia (primeiros lançamentos)</div>
                                {recPreview.map((p,i)=>(
                                  <div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:11, marginBottom:2 }}>
                                    <span style={{ color:C.soft }}>{i+1}º · {p.mes}</span>
                                    <span style={{ fontWeight:700, color:C.gold }}>dia {form.fixoDia} · {fmtBRL(moneyToNumber(form.valor))}</span>
                                  </div>
                                ))}
                                {parseInt(form.fixoMeses)>4&&<div style={{ fontSize:10, color:C.muted, marginTop:3 }}>... e mais {parseInt(form.fixoMeses)-4} meses</div>}
                              </div>
                            )}
                          </>
                        )}
                        {!form.fixo&&(
                          <div style={{ marginTop:0 }}>
                            <div style={lbl}>Data</div>
                            <DateInput style={inputStyle("data")} value={form.data||""} onChange={value=>setForm(f=>({...f,data:value}))}/>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Data para cartão NÃO parcelado */}
                  {isCartao&&!form.parcelado&&(
                    <div><div style={lbl}>Data</div><DateInput style={inputStyle("data")} value={form.data||""} onChange={value=>setForm(f=>({...f,data:value}))}/></div>
                  )}

                </div>
                <div style={{ display:"flex", gap:9, marginTop:16 }}>
                  <button onClick={closeModal} style={btn(C.border,{ flex:1 })}>Cancelar</button>
                  <button onClick={addTransaction} style={btn(C.emerald,{ flex:1 })}>
                    {form.parcelado?`Salvar ${form.parcelas||""}× parcelas`:form.fixo?`Registrar ${form.fixoMeses||""}× meses`:"Salvar"}
                  </button>
                </div>
              </>
            )}
            {modal==="editRecorrencia"&&(
              <>
                <h3 style={{ margin:"0 0 8px", fontWeight:800 }}>Editar recorrência</h3>
                <div style={{ fontSize:12, color:C.soft, marginBottom:14 }}>A edição altera apenas lançamentos previstos, preservando lançamentos pagos ou parciais para não distorcer o histórico.</div>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  <div>
                    <div style={lbl}>Escopo</div>
                    <select style={inp} value={form.escopo||"futuros"} onChange={e=>setForm(f=>({...f,escopo:e.target.value}))}>
                      <option value="futuros">A partir do mês selecionado ({selMonth})</option>
                      <option value="todos">Toda a série, exceto pagos/parciais</option>
                    </select>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
                    <div><div style={lbl}>Tipo</div><select style={inp} value={form.tipo||"despesa"} onChange={e=>setForm(f=>({...f,tipo:e.target.value}))}><option value="despesa">Despesa</option><option value="receita">Receita</option></select></div>
                    <div><div style={lbl}>Dia do mês</div><input style={inputStyle("fixoDia")} type="number" min={1} max={31} value={form.fixoDia||""} onChange={e=>setForm(f=>({...f,fixoDia:e.target.value}))}/></div>
                  </div>
                  <div><div style={lbl}>Descrição</div><input style={inputStyle("descricao")} value={form.descricao||""} onChange={e=>setForm(f=>({...f,descricao:e.target.value}))}/></div>
                  <div><div style={lbl}>Valor (R$)</div><MoneyInput style={inputStyle("valor")} value={form.valor||""} onChange={value=>setForm(f=>({...f,valor:value}))}/></div>
                  <div><div style={lbl}>Categoria</div><CategorySelect cats={cats} value={form.catId} onChange={v=>setForm(f=>({...f,catId:v}))} style={inp} validationInfo={requiredModal} fieldKey="catId"/></div>
                  <div>
                    <div style={lbl}>Origem</div>
                    <select style={inp} value={form.origemTipo||"conta"} onChange={e=>setForm(f=>({...f,origemTipo:e.target.value, contaId:e.target.value==="cartao"?"":(f.contaId||contas[0]?.id||""), cartaoId:e.target.value==="cartao"?(f.cartaoId||cards[0]?.id||""):""}))}>
                      <option value="conta">Conta / Vale</option>
                      <option value="cartao">Cartão de crédito</option>
                    </select>
                  </div>
                  {form.origemTipo==="cartao"?
                    <div><div style={lbl}>Cartão</div><select style={inputStyle("cartaoId")} value={form.cartaoId||""} onChange={e=>setForm(f=>({...f,cartaoId:e.target.value}))}><option value="">Selecione</option>{cards.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}</select></div>
                    :<div><div style={lbl}>Conta / Vale</div><select style={inputStyle("contaId")} value={form.contaId||""} onChange={e=>setForm(f=>({...f,contaId:e.target.value}))}><option value="">Selecione</option>{contas.map(ct=><option key={ct.id} value={ct.id}>{ct.nome}</option>)}</select></div>
                  }
                </div>
                <div style={{ display:"flex", gap:9, marginTop:16 }}>
                  <button onClick={closeModal} style={btn(C.border,{ flex:1 })}>Cancelar</button>
                  <button onClick={salvarEdicaoRecorrencia} style={btn(C.emerald,{ flex:1 })}>Salvar alterações</button>
                </div>
              </>
            )}
            {modal==="addCard"&&(
              <>
                <h3 style={{ margin:"0 0 16px", fontWeight:800 }}>Adicionar Cartão</h3>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  <div><div style={lbl}>Nome</div><input style={inputStyle("cardNome")} placeholder="Ex: Bradesco Visa" value={form.nome||""} onChange={e=>setForm(f=>({...f,nome:e.target.value}))}/></div>
                  <div><div style={lbl}>Limite (R$)</div><MoneyInput style={inp} value={form.limite||""} onChange={value=>setForm(f=>({...f,limite:value}))}/></div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
                    <div><div style={lbl}>Dia Fechamento</div><input style={inp} type="number" min={1} max={31} value={form.fechamento||""} onChange={e=>setForm(f=>({...f,fechamento:e.target.value}))}/></div>
                    <div><div style={lbl}>Dia Vencimento</div><input style={inp} type="number" min={1} max={31} value={form.vencimento||""} onChange={e=>setForm(f=>({...f,vencimento:e.target.value}))}/></div>
                  </div>
                  <div><div style={lbl}>Conta corrente para pagamento da fatura</div><select style={inputStyle("cardContaPagamentoId")} value={form.contaPagamentoId||""} onChange={e=>setForm(f=>({...f,contaPagamentoId:e.target.value,accountId:e.target.value}))}><option value="">Selecione a conta</option>{contasCorrentes.map(ct=><option key={ct.id} value={ct.id}>{ct.nome}</option>)}</select></div>
                  <div><div style={lbl}>Cor</div><div style={{ display:"flex", gap:7, flexWrap:"wrap", marginTop:4 }}>{["#7C3AED","#E8504A","#00A878","#F5B700","#0891B2","#DB2777","#6366F1","#F97316","#84CC16","#B0BEC5"].map(cor=><div key={cor} onClick={()=>setForm(f=>({...f,cor}))} style={{ width:24, height:24, borderRadius:5, background:cor, cursor:"pointer", border:form.cor===cor?"2px solid #fff":"2px solid transparent" }}/>)}</div></div>
                </div>
                <div style={{ display:"flex", gap:9, marginTop:16 }}>
                  <button onClick={closeModal} style={btn(C.border,{ flex:1 })}>Cancelar</button>
                  <button onClick={addCard} style={btn(C.emerald,{ flex:1 })}>Salvar</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
